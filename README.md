# openwrt-um310r-feed

OpenWrt package feed for the **NEC uM310R** LTE router (Atheros AR9344, AM Telecom
AMM570 LTE module). These packages are device-specific helpers used by the
[nec-um310r branch of nunnun/openwrt-nec-um310r](https://github.com/nunnun/openwrt-nec-um310r/tree/nec-um310r);
they are not meant for upstream OpenWrt.

Unofficial and not affiliated with NEC or AM Telecom.

[日本語の説明は下にあります。](#日本語)

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

## 日本語

**NEC uM310R**（Atheros AR9344、LTE モジュール AM Telecom AMM570）用の OpenWrt パッケージフィードです。[nunnun/openwrt-nec-um310r の nec-um310r ブランチ](https://github.com/nunnun/openwrt-nec-um310r/tree/nec-um310r)で使う、この機種専用の補助パッケージで、OpenWrt 本家に入れるものではありません。イメージのダウンロードとインストール手順は [wiki](https://github.com/nunnun/openwrt-nec-um310r/wiki/Japanese-Guide) を見てください。

非公式で、NEC、AM Telecom とは関係ありません。

### um310r-modem

データ通信（MBIM、netifd の `proto modemmanager`）と SMS は **ModemManager** が担当し、このパッケージはその横で次のことをします。

- カードの AT ポートを使うデーモン（ModemManager がカードのシリアルポートを使わないよう、`77-mm-um310r.rules` で除外しています）
  - LuCI と ANT LED 用の LTE 情報：バンド、EARFCN、PCI、TAC / セル、RSRP / RSRQ
  - カードの IMEI（MBIM が返す値はチェックディジットが誤っているため）
  - SIM の SMS 保存領域の使用量（いっぱいになると新しい SMS を受け取れません）
  - 復旧：netifd が wwan を落としたままなら `ifup`、ModemManager がモデムを見失ったり MBIM が閉じたまま固まったりしたら ModemManager を再起動（MBIM をきれいに開け閉めしてから）、カードが応答しなければ電源を入れ直す（イメージ側の `um310r-lte-power` が必要）
- `20-amm570` hotplug：純正ファームウェアは起動のたびにカードを ACM モードにします。ACM モード（USB 1ecb:0202）で見つかったら、ttyACM0（通常の cdc_acm）から一度だけ MBIM モード（1ecb:0209）に切り替えます。
- 前面 LED（ANT / COM / ALM）を純正ファームウェアと同じように点灯
- ubus オブジェクト `um310r`（rpcd プラグイン）：`status`、`sms_list`、`sms_delete`、`sms_send`
- コマンド：`um310r-modem status | sms-list | sms-del <id|all> | sms-send <番号> <本文>`

### luci-app-um310r

LuCI の「ネットワーク → LTE」ページです。電波の詳しい状態と、SMS の一覧・削除・送信ができます。使うのは ubus の `um310r` オブジェクトだけです。日本語訳（`luci-i18n-um310r-ja`）付き。

### 使い方

OpenWrt のソースツリーで：

    echo "src-git um310r https://github.com/nunnun/openwrt-um310r-feed.git" >> feeds.conf
    ./scripts/feeds update um310r
    ./scripts/feeds install -p um310r um310r-modem luci-app-um310r

`um310r-modem` と `luci-app-um310r` を選び、日本語訳が要るなら `CONFIG_LUCI_LANG_ja=y` も設定します。ネットワークインターフェース（`network.wwan`、`proto modemmanager`）はイメージ側で設定します。

### ライセンス

- um310r-modem：GPL-2.0-only（`LICENSE.GPL-2.0`）
- luci-app-um310r：Apache-2.0（`LICENSE.Apache-2.0`）
