# NEC uM310R: AMM570 LTE card helper next to ModemManager (LTE details,
# IMEI, SIM SMS usage, ACM -> MBIM switch, connection and card recovery)
# and front panel LEDs.
# Device-specific; meant for a local feed, not for upstream.

include $(TOPDIR)/rules.mk

PKG_NAME:=um310r-modem
PKG_VERSION:=2026.11.08
PKG_RELEASE:=3

PKG_MAINTAINER:=Hirotaka Nakajima <hiro@skyblue.me.uk>
PKG_LICENSE:=GPL-2.0-only

include $(INCLUDE_DIR)/package.mk

define Package/um310r-modem
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=WWAN
  TITLE:=NEC uM310R LTE card (AMM570) helper and LEDs
  DEPENDS:=@TARGET_ath79 +modemmanager +umbim +kmod-usb-net-cdc-mbim +kmod-usb-serial-option +jsonfilter
  PKGARCH:=all
endef

define Package/um310r-modem/description
  Helper for the AM Telecom AMM570 on the NEC uM310R, next to ModemManager
  (which owns the MBIM data connection and SMS). It owns the card's AT port
  (ModemManager is told to ignore the serial ports): LTE details (band,
  EARFCN, PCI, cell), the correct IMEI, SIM SMS usage, the ANT/COM/ALM LEDs
  like the stock firmware, switching a card in ACM mode to MBIM mode, and
  recovery (wwan left down, ModemManager stuck on a closed MBIM channel,
  card not answering -> power cycle). Provides the ubus object "um310r"
  (rpcd plugin) used by luci-app-um310r.
  Card power itself (um310r-lte-power) is not part of this package.
endef

define Build/Compile
endef

define Package/um310r-modem/install
	$(INSTALL_DIR) $(1)/usr/sbin $(1)/etc/init.d $(1)/etc/hotplug.d/usb $(1)/lib/udev/rules.d
	$(INSTALL_BIN) ./files/usr/sbin/um310r-modem ./files/usr/sbin/um310r-leds $(1)/usr/sbin/
	$(INSTALL_BIN) ./files/etc/init.d/um310r-modem ./files/etc/init.d/um310r-leds $(1)/etc/init.d/
	$(INSTALL_DATA) ./files/etc/hotplug.d/usb/20-amm570 $(1)/etc/hotplug.d/usb/
	$(INSTALL_DATA) ./files/lib/udev/rules.d/77-mm-um310r.rules $(1)/lib/udev/rules.d/
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./files/usr/libexec/rpcd/um310r $(1)/usr/libexec/rpcd/
endef

define Package/um310r-modem/postinst
#!/bin/sh
# rpcd picks up the ubus plugin (ubus object "um310r") on reload
[ -n "$$IPKG_INSTROOT" ] || /etc/init.d/rpcd reload 2>/dev/null
exit 0
endef

$(eval $(call BuildPackage,um310r-modem))
