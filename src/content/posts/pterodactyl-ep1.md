---
title: 【翼龙面板搭建 EP1】后端 Wings 的安装
published: 2023-07-19
description: ''
image: ''
tags: [Pterodactyl Panel,不再更新]
category: '教程'
draft: false 
---
## 前言

实际上我这个人对翼龙面板的探索，仅仅是了解前端，后端以及中间的连接，因为没有多余的机子就没得尝试，这不发现自己还有个华为云账号，甚至还能试用服务器，果断搞下，顺便试试看华为云的性能。

## 用到的东西

一台香港服务器，用于前端搭建好让我以后真想用的时候只需要重新启用就好，配置是 2c4g30m

华为云试用机子，他给的是 2c4g1m，勉强能接受

一个域名，我就用刚买没多久的 akio.top 吧

以及足够的时间

## EP0：华为云

华为云试用机给我的第一个感觉在于，他没有默认安装监控软件（是的就是那个腾讯阿里都默认安装的探针），而是让你选装。

![wSaV.png](https://img.yiair.cc/images/wSaV.png)

除此之外，我感觉……和腾讯阿里啥的没区别啊，而且还贵得很……

## EP1：翼龙后端 Wings 安装

为什么先搞后端？等你后面看到的时候你就知道了

为了保证能安装成功，尽可能使用翼龙文档里面的 url，这不是说只能用文档里面的，如果你有更好的也可以，但是该安装的一定要安装了

### 配置 Docker

先 SSH 连接到刚开的华为云试用机，配置一下 Docker

然后……我终于想起来国内机连不上 Docker 了（懂得都懂的原因），官方安装脚本没法拉取

索性直接安上 [1panel](https://www.1panel.cn/)，到时候也好盯着运作情况

```
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```

显示如下，安装完成

![wmfg.png](https://img.yiair.cc/images/wmfg.png)

但是接下来不是登录 1panel，而是接着我们的翼龙后端安装

### 启用虚拟内存（选配）

正如 翼龙中文文档 所说的，在大多数系统上，默认情况下 Docker 将无法设置交换空间，如果运行`docker info`后能在最底部看到`WARNING: No swap limit support`，那就一定没有启用了

我因为确实要这样干（给亲朋好友），所以搞了下这方面的配置

以 root 用户身份打开 /etc/default/grub 并找到以 GRUB_CMDLINE_LINUX_DEFAULT 为开头的一行。

确保该行在双引号内的某处包含 swapaccount=1，如果没有任何内容，就补上，大致如下：

```
GRUB_CMDLINE_LINUX_DEFAULT="swapaccount=1"
```

### 安装 Wings

Wings 及配置文件路径已写死（我不是很理解），只能照着他文档来做了

安装 Wings 的第一步是确保我们已经设置了所需的目录结构。为此，请运行以下命令，这将创建基本目录并下载 wings 可执行文件。

先创建一下相关目录

```
mkdir -p /etc/pterodactyl
```

然后下载 wings 可执行文件

```
curl -L -o /usr/local/bin/wings "https://github.com/pterodactyl-china/wings/releases/latest/download/wings_linux_$([[ "$(uname -m)" == "x86_64" ]] && echo "amd64" || echo "arm64")"
#国内服务器请优先考虑以下命令
curl -L -o /usr/local/bin/wings "https://hub.fastgit.xyz/pterodactyl/wings/releases/latest/download/wings_linux_$([[ "$(uname -m)" == "x86_64" ]] && echo "amd64" || echo "arm64")""
```

然后设置下权限

```
chmod u+x /usr/local/bin/wings
```

到这一步就结束 wings 的安装了，接下来就是前端的部署了