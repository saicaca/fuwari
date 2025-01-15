---
title: 干翻GFW的SNI阻断，还我们一个不受限制的互联网！
published: 2024-10-28
description: '使用Accesser代理HTTP连接，通过不发送ServerName来绕过GFW的SNI阻断'
image: "https://oss.onani.cn/fuwari-blog/img/6d0a5793fe6b1f11cba9a4912fba4392be5004c2.webp"
tags: [Accesser]
category: '开发'
draft: false 
lang: ''
---

# Accesser是什么？

::github{repo="URenko/Accesser"}

Accesser是一个HTTP代理。它通过中间人的身份处理终端的HTTP出口流量，以绕过SNI阻断。我们正常访问网站时，客户端会发送Client Hello，而这个报文是明文，并且通常会携带ServerName，这个时候GFW就能通过检测ServerName来进行阻断，代替网站向客户端发送一个RST报文重置连接，做到网站被“墙”的效果

而通过Accesser代理后，它会抹掉ServerName然后发送Client Hello。这个时候，如果服务端支持域前置，则会返回客户端一个默认的SSL证书（公钥），然后客户端就能使用这个公钥再次发送一个加密的Client Hello，此时携带上ServerName就不会被GFW阻断了。但是，如果客户端在第一次我们拿公钥的时候拒绝了空ServerName的Client Hello，那这个办法就失效了，不过大部分网站是支持这样做的

### Windows

- 前往开头的的Github仓库

- 下载最新的Release。一般有一个`accesser.exe`

- 直接打开这个软件，看到这个画面即可![](https://oss.onani.cn/fuwari-blog/img/c2eed28c-6e5d-43a3-a016-8f1a38a53cbd.webp)

- 它的原理是自动设置系统代理，如果你使用了一些别的代理软件，会被覆盖![](https://oss.onani.cn/fuwari-blog/img/d0d8fac1-a2e5-4db2-8e25-ca5e04eb9951.webp)

### Linux（以Debian12为例）

- 安装Python：`apt install python3`

- （可选）创建虚拟环境：`python -m venv venv`

- （可选）进入虚拟环境：`source venv/bin/activate`

- 安装Accesser：`python3 -m pip install -U accesser`

- 运行：`accesser`

- 它会提示你需要信任 `root.crt` 。关闭Accesser

- 我的证书文件在 `/root/Accesser/venv/lib/python3.11/site-packages/accesser/CERT/root.crt` 

- cd到你的证书目录：`cd /root/Accesser/venv/lib/python3.11/site-packages/accesser/CERT`

- 信任证书：`sudo cp root.crt /usr/local/share/ca-certificates/`

- 更新证书存储：`sudo update-ca-certificates`

- 设置全局代理：`sudo nano /etc/environment`

- ```
  http_proxy="http://127.0.0.1:7654"
  https_proxy="http://127.0.0.1:7654"
  no_proxy="localhost,127.0.0.1"
  ```

- 重启即可

- 测试连通性：`curl -x https://discord.com`
