# LuCI page for the NEC uM310R LTE card: signal, band lock, SMS.
# Local feed: luci.mk is taken from the luci feed.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for the NEC uM310R LTE card
LUCI_DEPENDS:=+luci-base +um310r-modem
LUCI_PKGARCH:=all

PKG_VERSION:=2026.11.08
PKG_RELEASE:=1
PKG_MAINTAINER:=Hirotaka Nakajima <584070+nunnun@users.noreply.github.com>
PKG_LICENSE:=Apache-2.0

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
