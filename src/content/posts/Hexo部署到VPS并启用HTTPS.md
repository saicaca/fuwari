---
title: Hexo部署到VPS并启用HTTPS
published: 2016-03-11 05:12:49
tags:
  - 网站建设
  - hexo
category: 技术
---

上周买了个 VPS 玩 ，从板瓦工买的，一年的 19 刀。性价比还算合适，这是配置：

```
10 GB SSD RAID-10 Disk Space
256 MB RAM
500 GB Transfer
Gigabit port
Multiple locations
```

这是[购买链接](https://bandwagonhost.com/aff.php?aff=7249)。

买过来，先是搭了个 SS 解决科学上网的问题。然后想想要不要把博客也迁移过去算了,一个 ss 又用不了多少流量。于是说干就干，一番搜索查询后，达成成就。

简单的记录下操作的步骤：

# 客户端：

1. 配置 ssh
2. 本地部署 hexo

# 服务器：

1. 安装所需软件
   a. Git
   b. Nginx
2. 为了安全与方便，新建专用与部署 hexo 的用户 git，并给予相应权限。
3. 配置 ssh，与客户端达成通道
4. 配置 git hooks，这样本地在 hexo 部署到服务器 git 用户的对应仓库后就不用在把它复制到用以访问的网站的文件夹了。

```bash
#!/bin/bash
GIT_REPO=/home/git/hexo.git #git仓库
TMP_GIT_CLONE=/tmp/hexo
PUBLIC_WWW=/var/www/hexo #网站目录
rm -rf ${TMP_GIT_CLONE}
git clone ${GIT_REPO} ${TMP_GIT_CLONE}
rm -rf ${PUBLIC_WWW}/*
cp -rf ${TMP_GIT_CLONE}/* ${PUBLIC_WWW}
```

5. 配置 nginx，并启动 nginx 服务

## 遇到的问题

<!-- more -->

1. 访问 vps 地址，直接显示 403 forbidden，以为是权限问题，网上查了半天也没解决。最后发现用于网站的目录下是空的。
2. 由问题 1 推断出，Git hooks 压根没起作用。因为用于放网站文件夹下一直都是空的，于是手动试 git hooks 下面的命令，执行到 rm -rf ${PUBLIC_WWW}的时候，系统提示操作被拒绝，发现是权限问题，赋予 git 用户用于放网站的 `www/hexo` 的权限。
3. ssh 在服务器重启后出现问题，多方排查后发现也是权限问题，赋予 git 用户.ssh 文件 700 权限

输入 www.kisnows.com ，访问成功，哈哈，好开心。而且国内访问速度比原来快了一点点，虽然就那么一点点。

想想也上个 SSL 吧，不然太落后了，毕竟最近电信劫持很严重。因为不想投入过大成本，就打算用 cloudFlare 提供的免费 SSL。虽然只是浏览器到 cloudFlare 之间是加密的，但是有总比没有强嘛。
于是把 DNS 服务从 DNSPod 切换到了 cloudFlare，并借助 cloudFlare 全站启用了 HTTPS，同时将顶级域名重定向到了 www 下的二级域名。方法如下：

## 启用 HTTPS

进入 cloudFlare 管理中心，Crypto 下
![ssl](/imgs/Hexo部署到VPS并启用HTTPS/ssl.png)

## 强制非 HTTPS 访问跳转到 HTTPS

位于 Page Rules 模块下
![ssl](/imgs/Hexo部署到VPS并启用HTTPS/pagerules.png)
上图 1，选 always use https，然后如图第一条规则，

```
http://*.kisnows.com/*
```

这样所有匹配的所有访问，都会走 https 了。

## 顶级域名重定向到带 www 的二级域名下

也是用 Page Rules，如上图 2。选 Forwarding，然后匹配如下填写就 OK 了：
![redirect](/imgs/Hexo部署到VPS并启用HTTPS/redirect.png)
Forwarding 中的 `$1` 就是 `kisnows.com/*` 中 `*` 匹配到元素。

至此，为期两天的折腾完毕，全站迁移到了 VPS，并全程启用 HTTPS。
真是生命不息，折腾不止啊！

参考文章：
http://tiktoking.github.io/2016/01/26/hexo/
http://www.hansoncoder.com/2016/03/02/VPS%20building%20Hexo/
http://hejun.me/2015/01/05/deploy-hexo-on-cloud/
