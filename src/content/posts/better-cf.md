---
title: Cloudflare 加速实践
published: 2025-08-20
description: 记录一次折腾 Cloudflare 国内直连加速的测试过程、排查细节，以及为什么这次没能得出预期结论。
tags: [cloudflare, cdn, web]
category: Web 与工具
draft: false
device: MacBook Pro
---

前阵子拿自己的博客域名 `blog.pinellia.uk` 做了一次测试，想看看能不能改善 Cloudflare 在国内网络环境下的直连表现。具体做法参考的是 [BestWorkers](https://cmliussss.com/p/BestWorkers/) 这篇方案。先说结果：这次折腾并没有得到可复现的加速结论，但排查过程中踩到的现象还是挺值得记一笔的。

## 测试结果

### ITDOG TCPing 看起来全绿

配置完先跑了一轮 ITDOG 的 TCPing，结果非常好看，节点几乎全绿：

![1755619518954](https://ipfs.pinellia.uk/ipfs/QmYaCGNTTrshP8FbKaCkbfCfpqWMBE3aVE3G8UtmNF2s2U)

可真正切回自己的电脑和平板直连时，体验却完全不是那么回事——站点依然经常打不开，命令行和浏览器分别报了下面的错：

```text
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to blog.pinellia.uk
浏览器：ERR_CONNECTION_CLOSED
```

### 排查是不是 DNS 解析背锅

看到连接直接被关，我的第一反应是本地和测速点的 DNS 解析结果不一致。于是抓了一下 Clash 的 DNS 解析结果去和 ITDOG 对比，发现两边解析出来的 IP 其实完全一致：

<div style="display: flex; gap: 16px;">
    <img src="https://ipfs.pinellia.uk/ipfs/QmfHVxTswG6Yr3B4ZJVjTMzkSzg5BszYAiLabQH6UN3iXt" alt="1755619893625" style="width: 49%;">
    <img src="https://ipfs.pinellia.uk/ipfs/QmQ1x4uCyp56m4X7q65sS3DJbACVn79DnKv87b2JpjMbpM" alt="1755619405601" style="width: 49%;">
</div>

进一步试了一下，解析出来的 IP 本身是能 Ping 通的，而且挂上代理之后也能正常访问，基本可以排除单纯的 DNS 解析错误。可惜整个测试期间一直没能抓到可以稳定复现的根因，更玄学的是，放着等了一段时间之后，电脑和平板自己又恢复了直连。

## 一点复盘

所以这次调整算不上成功，没有形成可以验证的加速结论。但至少留下一个很实在的教训：以后再排查类似问题，不能光看 TCPing 全绿就以为站点稳了，还是得老老实实把 DNS 解析结果、TLS 握手过程、路由走向以及不同运营商网络下的表现分开记录，才好定位真正卡在哪一环。
