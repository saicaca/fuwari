---
title: 哪吒面板搭建
published: 2024-12-19
description: ''
image: "https://oss.onani.cn/fuwari-blog/img/QmXCNqtUh761g3rYS3dNeysiZTEBgk1ozamWUNy3bHXnvC"
tags: [哪吒面板]
category: '运维'
draft: false 
lang: ''
---

# 本文不如这个项目，它直接用CF当API
https://github.com/yumusb/nezha-new

---

# 配置Zerotier
将你的面板（Dashboard）服务器，后端（Agent）服务器全部加入同一个Zerotier网络组，并且保证互相通信正常

# 安装哪吒面板（Dashboard）
前往Release下载你作业系统的可执行文件：https://github.com/nezhahq/nezha/releases/latest

启动，进入WebUI：http://localhost:8008

右上角选择登录，默认账密为admin

右上头像 -> 系统设置 -> 用户 -> +
创建新用户，然后以新用户登录，最后删除默认的admin用户

再次前往系统设置，更改Agent上报地址为 你的Dashboard的Zerotier IP:8008（如：10.147.17.1:8008）。不开启TLS

回到管理后台首页，选择 服务器 -> 安装命令。然后依次将命令在Agent上执行。如果正常，稍后将会在后台看到新服务器上线

# 配置Cloudflare Tunnel
在DashBoard服务器安装Cloudflared，创建一个新Tunnel，指向localhost:8008，并绑定你托管在Cloudflare的域名

# 成品展示
https://k.onani.cn



![9b391b622b29e6a0b148dc1123e78994](https://oss.onani.cn/fuwari-blog/img/QmXCNqtUh761g3rYS3dNeysiZTEBgk1ozamWUNy3bHXnvC)
