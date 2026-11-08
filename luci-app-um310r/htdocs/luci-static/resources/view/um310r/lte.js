'use strict';
'require view';
'require rpc';
'require ui';
'require poll';

/* NEC uM310R / AM Telecom AMM570: LTE signal, band lock and SMS.
 * Data comes from the ubus object "um310r" (rpcd plugin of um310r-modem,
 * the only user of the AT port). */

var callStatus = rpc.declare({ object: 'um310r', method: 'status' });
var callSmsList = rpc.declare({ object: 'um310r', method: 'sms_list' });
var callSmsDelete = rpc.declare({ object: 'um310r', method: 'sms_delete', params: [ 'index' ] });
var callSmsSend = rpc.declare({ object: 'um310r', method: 'sms_send', params: [ 'number', 'text' ] });

/* replies are { ... } or { error: "<message>" } */
function checked(res) {
	if (res && res.error)
		throw new Error(res.error);
	return res;
}

function getStatus() {
	return L.resolveDefault(callStatus(), {});
}

function getSms() {
	return L.resolveDefault(callSmsList(), {});
}

/* modal yes/no dialog, resolves to true / false */
function ask(title, text, yesLabel) {
	return new Promise(function(resolve) {
		ui.showModal(title, [
			E('p', {}, text),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': function() { ui.hideModal(); resolve(false); } }, _('Cancel')),
				' ',
				E('button', { 'class': 'btn cbi-button-negative', 'click': function() { ui.hideModal(); resolve(true); } }, yesLabel)
			])
		]);
	});
}

function levelText(lvl) {
	var names = [ _('No service / very weak'), _('Very weak'), _('Weak'),
	              _('Fair'), _('Good'), _('Excellent') ];
	return (lvl in names) ? '%s (%d/5)'.format(names[lvl], lvl) : '-';
}

return view.extend({
	load: function() {
		return Promise.all([ getStatus(), getSms() ]);
	},

	renderStatus: function(st) {
		var v = function(k, unit) { return (st[k] != null && st[k] !== '') ? st[k] + (unit || '') : '-'; };
		var reg = { '1': _('Registered (home)'), '5': _('Registered (roaming)'),
		            '2': _('Searching'), '3': _('Denied'), '0': _('Not registered') };
		var rows = [
			[ _('Registration'), reg[st.registered] || '-' ],
			[ _('Operator'), v('operator') ],
			[ _('Signal level'), levelText(+st.level) ],
			[ _('RSRP'), v('rsrp', ' dBm') ],
			[ _('RSRQ'), v('rsrq', ' dB') ],
			[ _('RSSI'), v('rssi', ' dBm') ],
			[ _('Band'), st.band ? 'B' + st.band + ' (EARFCN ' + v('earfcn') + ')' : v('earfcn') ],
			[ _('PCI / TAC / Cell ID'), '%s / %s / %s'.format(v('pci'), v('tac'), v('cell')) ],
			[ _('IMEI'), v('imei') ],
			[ _('Modem firmware'), v('revision') ]
		];
		return E('table', { 'class': 'table' }, rows.map(function(r) {
			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td left', 'width': '33%' }, r[0]),
				E('td', { 'class': 'td left' }, r[1])
			]);
		}));
	},

	renderSms: function(sms) {
		var self = this, list = (sms && sms.messages) || [], head = [];

		if (sms && sms.total != null) {
			head.push(E('p', {}, _('SIM message storage: %d of %d used.').format(sms.used, sms.total)));
			if (sms.total && sms.used >= sms.total - 2)
				head.push(E('div', { 'class': 'alert-message warning' },
					_('The SIM message storage is (almost) full. New messages cannot be received until some are deleted.')));
		}

		if (!list.length)
			return E([], head.concat([ E('p', {}, E('em', {}, _('No messages on the modem.'))) ]));

		return E([], head.concat([ E('table', { 'class': 'table' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th' }, _('Received')),
				E('th', { 'class': 'th' }, _('Sender')),
				E('th', { 'class': 'th' }, _('Message')),
				E('th', { 'class': 'th' }, '')
			])
		].concat(list.map(function(m) {
			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td' }, m.time),
				E('td', { 'class': 'td' }, m.from),
				E('td', { 'class': 'td', 'style': 'white-space:pre-wrap' }, m.text),
				E('td', { 'class': 'td right' }, E('button', {
					'class': 'btn cbi-button cbi-button-remove',
					'click': ui.createHandlerFn(self, 'handleDelete', m.index)
				}, _('Delete')))
			]);
		})))]));
	},

	refreshSms: function() {
		var self = this;
		return getSms().then(function(sms) {
			var box = document.getElementById('um310r-sms');
			if (box)
				box.replaceChildren(self.renderSms(sms));
		});
	},

	handleDelete: function(index) {
		var self = this;
		return callSmsDelete(String(index)).then(checked).then(function() {
			return self.refreshSms();
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Deleting the message failed: %s').format(e.message)), 'error');
		});
	},

	handleDeleteAll: function() {
		var self = this;
		return ask(_('Delete all messages'), _('Delete all messages stored on the modem?'), _('Delete all')).then(function(yes) {
			if (!yes)
				return;
			return callSmsDelete('all').then(checked).then(function() {
				return self.refreshSms();
			});
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Deleting the messages failed: %s').format(e.message)), 'error');
		});
	},

	handleSend: function() {
		var num = document.getElementById('um310r-sms-to').value.trim(),
		    text = document.getElementById('um310r-sms-text').value;

		if (!/^\+?[0-9]{3,20}$/.test(num)) {
			ui.addNotification(null, E('p', _('Enter a phone number (digits, optional leading +).')), 'warning');
			return;
		}
		if (!text.length || text.length > 70) {
			ui.addNotification(null, E('p', _('The message must be 1 to 70 characters.')), 'warning');
			return;
		}
		var self = this;
		return ask(_('Send SMS'), _('Send this SMS to %s? Sending an SMS may be charged by the carrier.').format(num), _('Send')).then(function(yes) {
			if (!yes)
				return;
			return callSmsSend(num, text).then(checked).then(function() {
				document.getElementById('um310r-sms-text').value = '';
				ui.addNotification(null, E('p', _('SMS sent to %s.').format(num)), 'info');
			});
		}).catch(function(e) {
			ui.addNotification(null, E('p', _('Sending the SMS failed: %s').format(e.message)), 'error');
		});
	},

	render: function(data) {
		var self = this;

		var statusBox = E('div', { 'id': 'um310r-status' }, self.renderStatus(data[0]));

		poll.add(function() {
			return getStatus().then(function(st) {
				statusBox.replaceChildren(self.renderStatus(st));
			});
		}, 10);
		poll.add(L.bind(self.refreshSms, self), 60);

		return E([], [
			E('h2', {}, _('LTE')),
			E('div', { 'class': 'cbi-map-descr' },
				_('AM Telecom AMM570 LTE module. The connection itself is managed by ModemManager (Network > Interfaces > WWAN). Signal values are refreshed every 10 seconds; messages every minute.')),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Signal')),
				statusBox
			]),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('SMS')),
				E('div', { 'id': 'um310r-sms' }, self.renderSms(data[1])),
				E('div', { 'class': 'right' }, E('button', {
					'class': 'btn cbi-button cbi-button-remove',
					'click': ui.createHandlerFn(self, 'handleDeleteAll')
				}, _('Delete all'))),
				E('h4', {}, _('Send SMS')),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title', 'for': 'um310r-sms-to' }, _('Recipient')),
					E('div', { 'class': 'cbi-value-field' },
						E('input', { 'id': 'um310r-sms-to', 'type': 'text', 'class': 'cbi-input-text', 'placeholder': '09012345678' }))
				]),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title', 'for': 'um310r-sms-text' }, _('Message')),
					E('div', { 'class': 'cbi-value-field' },
						E('textarea', { 'id': 'um310r-sms-text', 'rows': 3, 'maxlength': 70, 'style': 'width:100%' }))
				]),
				E('div', { 'class': 'right' }, E('button', {
					'class': 'btn cbi-button cbi-button-action',
					'click': ui.createHandlerFn(self, 'handleSend')
				}, _('Send')))
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
