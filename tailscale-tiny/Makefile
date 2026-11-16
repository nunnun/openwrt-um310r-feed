# Tailscale built with a reduced feature set (Tailscale feature tags) for
# small-flash routers such as the NEC uM310R. Same source, Go toolchain,
# init script and config as packages/net/tailscale; only the build tags
# differ. Kept as a separate package name so that "apk upgrade" never
# replaces it with the full (about 30 MB) upstream package.
#
# Features kept: osrouter, nattraversal, useroutes, advertiseroutes,
# useexitnode, advertiseexitnode, dns, portmapper, bakedroots, ipnbus
# (and what they depend on). The ts_omit_* list below is the output of
#   go run ./cmd/featuretags --min --add=<features above>
# for this version; regenerate it when PKG_VERSION changes.

include $(TOPDIR)/rules.mk

PKG_NAME:=tailscale-tiny
PKG_VERSION:=1.104.4
PKG_RELEASE:=1

PKG_SOURCE:=tailscale-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/tailscale/tailscale/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=862f12b3177d5e961f2a86cf82fb1ff3551786afcaf95f2dc9a8318889f98732

PKG_MAINTAINER:=Hirotaka Nakajima <584070+nunnun@users.noreply.github.com>
PKG_LICENSE:=BSD-3-Clause
PKG_LICENSE_FILES:=LICENSE

PKG_BUILD_DIR:=$(BUILD_DIR)/tailscale-tiny-$(PKG_VERSION)
PKG_UNPACK=$(HOST_TAR) -C $(PKG_BUILD_DIR) --strip-components=1 -xzf $(DL_DIR)/$(PKG_SOURCE)
PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

TS_FEATURES_OMIT:= \
	ace acme androidbin androiddns appconnectors aws bird cachenetmap \
	captiveportal capture cliconndiag clientmetrics clientupdate cloud \
	colorable completion completion_scripts conn25 connreject dbus debug \
	debugeventbus debugportmapper desktop_sessions dnsresolvecache doctor \
	drive favorites flashappliance gro health hujsonconf identityfederation \
	iptables kube linkspeed linuxdnsfight listenrawdisco logtail netlog \
	netstack networkmanager oauthkey outboundproxy portlist posture qrcodes \
	relayserver remoteconfig resolved routecheck runtimemetrics sdnotify \
	serve serviceclientprefs ssh synology syslog syspolicy systray taildrop \
	tailnetlock tap tpm tundevstats unixsocketidentity useproxy usermetrics \
	wakeonlan webbrowser webclient

GO_PKG:=tailscale.com/cmd/tailscaled
GO_PKG_LDFLAGS:=-X 'tailscale.com/version.longStamp=$(PKG_VERSION)-$(PKG_RELEASE) (OpenWrt tiny)'
GO_PKG_LDFLAGS_X:=tailscale.com/version.shortStamp=$(PKG_VERSION)
GO_PKG_TAGS:=ts_include_cli,$(subst $(space),$(comma),$(addprefix ts_omit_,$(strip $(TS_FEATURES_OMIT))))

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/tailscale-tiny
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=Zero config VPN (reduced feature set)
  URL:=https://tailscale.com
  DEPENDS:=$(GO_ARCH_DEPENDS) +ca-bundle +kmod-tun
  PROVIDES:=tailscale tailscaled
endef

define Package/tailscale-tiny/description
  Tailscale (tailscaled with the CLI built in) with only the features a
  small router needs: kernel TUN routing (nftables), NAT traversal, subnet
  routes and exit nodes (use and advertise), MagicDNS, UPnP/NAT-PMP port
  mapping. Left out among others: Tailscale SSH, Serve/Funnel, Taildrop,
  netstack (userspace networking), Tailnet Lock, the web client and log upload.
endef

define Package/tailscale-tiny/conffiles
/etc/config/tailscale
/etc/tailscale/
endef

define Package/tailscale-tiny/install
	$(INSTALL_DIR) $(1)/usr/sbin $(1)/etc/init.d $(1)/etc/config
	$(INSTALL_BIN) $(GO_PKG_BUILD_BIN_DIR)/tailscaled $(1)/usr/sbin
	$(LN) tailscaled $(1)/usr/sbin/tailscale
	$(INSTALL_BIN) ./files/tailscale.init $(1)/etc/init.d/tailscale
	$(INSTALL_DATA) ./files/tailscale.conf $(1)/etc/config/tailscale
endef

$(eval $(call BuildPackage,tailscale-tiny))
