# openwrt-um310r-feed

OpenWrt package feed for the **NEC uM310R** LTE router (Atheros AR9344, AM Telecom
AMM570 LTE module). These packages are device-specific helpers used by the
[nec-um310r branch of nunnun/openwrt-nec-um310r](https://github.com/nunnun/openwrt-nec-um310r/tree/nec-um310r);
they are not meant for upstream OpenWrt.

Unofficial and not affiliated with NEC or AM Telecom.

## Packages

### um310r-modem

Helper next to **ModemManager**, which owns the data connection (MBIM, netifd
`proto modemmanager`) and SMS.

- Daemon on the card's AT port (ModemManager is told to ignore the card's
  serial ports by `77-mm-um310r.rules`):
  - LTE details for LuCI and the ANT LED: band, EARFCN, PCI, TAC/cell, RSRP/RSRQ
  - the card's IMEI (the MBIM device id reports a wrong check digit)
  - SIM SMS storage usage (a full SIM rejects new messages)
  - recovery: wwan left down by netifd → `ifup`; ModemManager without the modem
    or stuck on a closed MBIM channel → reset ModemManager (with a clean MBIM
    open/close); card not answering → power cycle (needs `um310r-lte-power`
    from the image)
- `20-amm570` hotplug: the stock firmware puts the card into ACM mode on every
  boot; when it shows up in ACM mode (USB 1ecb:0202) it is switched once to MBIM
  mode (1ecb:0209) over ttyACM0 (plain cdc_acm).
- Front panel LEDs (ANT / COM / ALM) like the stock firmware.
- ubus object `um310r` (rpcd plugin): `status`, `sms_list`, `sms_delete`,
  `sms_send`.
- CLI: `um310r-modem status | sms-list | sms-del <id|all> | sms-send <number> <text>`

### luci-app-um310r

LuCI page *Network → LTE*: signal details, SMS list / delete / send. Uses only
the `um310r` ubus object. Japanese translation included
(`luci-i18n-um310r-ja`).

## Use

In an OpenWrt tree:

    echo "src-git um310r https://github.com/nunnun/openwrt-um310r-feed.git" >> feeds.conf
    ./scripts/feeds update um310r
    ./scripts/feeds install -p um310r um310r-modem luci-app-um310r

then select `um310r-modem` and `luci-app-um310r` (and `CONFIG_LUCI_LANG_ja=y`
for the translation). The network interface is set up by the image
(`network.wwan`, `proto modemmanager`).

## License

- um310r-modem: GPL-2.0-only (`LICENSE.GPL-2.0`)
- luci-app-um310r: Apache-2.0 (`LICENSE.Apache-2.0`)
