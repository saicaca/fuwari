---
title: Mihomo 设置指南
published: 2025-10-05
description: 记录我平时在 Android、macOS 上折腾 Mihomo 的配置推送、内核托管方式，以及一次 macOS TUN 模式与 DNS 劫持失效的完整排查。
tags: [mihomo, proxy, clash, env-setup]
category: 环境与系统
draft: false
device: Windows
---

平时跨设备折腾 Mihomo 时攒下了一些零散但高频的实操记录，涵盖 Android 推送配置、macOS 直接托管内核，以及一次让我排查了半天的 macOS TUN + DNS 故障，趁着有空整理成一篇方便回头查阅。

## Android：用 ADB 推送配置

在电脑上改完规则模块后，如果懒得在手机上倒腾文件传输，直接用 `adb push` 把新配置推到 Mihomo 的 Android 配置目录最省事：

```shell
adb push "$HOME/Downloads/TT/Clash配置.yaml" /sdcard/Android/Clash
```

## macOS：直接用 LaunchDaemons 跑 Mihomo 内核

macOS 版的 Clash Verge Rev 在我这台设备上跑得不太稳，后来索性绕开 GUI 客户端，直接把 Mihomo 内核做成 `LaunchDaemons` 系统服务放后台跑。部署和日常启停常用到的几条命令都记在这里：

```shell
macOS sudo mv mihomo.plist /Library/LaunchDaemons
# 加载服务
sudo launchctl load /Library/LaunchDaemons/mihomo.plist
# 查看服务
sudo launchctl list | grep mihomo
# 卸载停止服务
sudo launchctl unload /Library/LaunchDaemons/mihomo.plist

# 启动服务
sudo launchctl start mihomo
# 停止服务
sudo launchctl stop mihomo


```

## macOS TUN 与 DNS 排查复盘

> 记录日期：2026-08-12

那次在 macOS 上开 Mihomo TUN 模式时，遇到了一个挺诡异的现象：抖音、百度这类国内网站明显卡顿，Google 直接打不开；但只要关掉 TUN，国内站立马顺滑，而手动挂上系统 SOCKS 代理后 Google 又能正常访问。

### 排错过程

一开始我怀疑是代理节点或分流规则出了岔子，但测完发现压根不是这回事——哪怕把模式切到全局 `DIRECT`，所有流量依然得经过 TUN 的入站协议栈，只要 TUN 路径本身有异常，连接照样受影响。

顺着 TUN 协议栈的思路，我挨个调了一轮参数：把 `stack` 从 `gvisor` 换成 `system`、删掉配置里无效的 `device: wlan9`、关掉 `strict-route` 和 IPv6，还把 MTU 降到了 1380。一通折腾下来，Google 还是打不开。

### 定位根因

最后顺着 DNS 解析链路查下去，才算真正抓到元凶：**macOS 的局域网 DNS 请求根本没被 Mihomo 劫持到**。

来看当时生效的核心配置片段：

```yaml
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false
  dns-hijack:
    - any:53
    - tcp://any:53
  strict-route: false
  mtu: 1380
  route-exclude-address:
    - 192.168.0.0/16
    - fc00::/7

interface-name: en0
ipv6: false
```

问题就出在路由排除和系统 DNS 的“撞车”上：macOS 当时的系统 DNS 指向局域网路由器（例如 `192.168.x.1`），而 `route-exclude-address` 又把整个 `192.168.0.0/16` 给排除了。结果发往路由器 53 端口的 DNS 查询压根不会拐进 TUN 网卡，`dns-hijack` 自然形同虚设。

雪上加霜的是，路由器当时给 `www.google.com` 返回的是一个错误的公网地址，而 Mihomo 自己的 DNS 返回的才是正常的 Fake-IP（`198.18.x.x`）。这也顺带解释了为什么之前切系统 SOCKS 代理就能上 Google——走显式 SOCKS 代理时，域名会直接交给 Mihomo 去解析，绕开了系统那套查路由器的逻辑。

### 解决方法与验证

搞清原理后，解法就很干脆了：把 macOS Wi-Fi 的普通 DNS 改成公网 DNS（不再落在 `192.168.0.0/16` 里），这样 53 端口的查询流量就会乖乖进入 TUN，交给 Mihomo 的 `dns-hijack` 接管，改完顺手清一下本地 DNS 缓存：

```shell
sudo networksetup -setdnsservers Wi-Fi 223.5.5.5 119.29.29.29
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

接着跑一条解析测试验明正身：

```shell
dscacheutil -q host -a name www.google.com
```

在开启 Fake-IP TUN 的情况下，如果返回的是 `198.18.x.x` 而不是之前路由器给的错误公网 IP，就说明劫持已经生效了。

### 顺带确认：改普通 DNS 会弄坏 AirDrop 或局域网发现吗？

动手前我也担心过改了系统 DNS 会不会把 Bonjour/mDNS 搞挂，实测下来完全不用慌。mDNS 走的是 UDP 5353 端口和组播地址 `224.0.0.251`/`FF02::FB`，跟走 53 端口的普通 DNS 是两条路，所以 `.local` 设备发现、AirPlay、AirDrop 和 Bonjour 打印机全都能正常用。

唯一可能受影响的，只是那些依赖路由器普通 DNS 提供的 `nas`、`router.lan` 这类内部域名（而非 `设备名.local`）。如果你还是不放心，直接跑一句 `dns-sd -G v4v6 设备名.local` 测一下 mDNS 就清楚了。
