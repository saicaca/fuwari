---
title: "『逃离』iCloud记"
description: 23dsf
published: 2022-06-01
category: 技术
draft: false
tags: [] 
---

## 起因

在5月26号，我发现我的 iCloud 不能正常的上传文件了，我在电脑上记的笔记，在手机上还是旧的版本。打开`finder`一看，原来是卡在上传。我本来以为是我的 Mac 日常性抽风，所以也没有太在意。

不过随着一天的等待，我发现问题还是没有被解决。我打开`v2ex`一看，[发现居然也有别人遇到一样的问题!说明应该是云上贵州导致的问题。](https://www.v2ex.com/t/855822#reply38)

加上我之前经常遇到iCloud抽风的情况终于在这次做出决定，我要『逃离』iCloud。

## 技术选型

其实之前遇到 iCloud 问题就想着替代品，比如[这位老兄的博文](https://tonsky.me/blog/syncthing/)，用`syncthing`代替 iCloud 。所以我之前尝试用`syncthing`在Mac和Linux之间同步 Logseq 笔记。

这次我梳理一下我的需要，我平时需要用 iCloud 同步logseq笔记、电子书。而可选软件有`resilio sync`和`syncthing`。后者的话，两者不在同一局域网的连接有点慢。并且后者也没有`IOS`端。而前者主要是非开源软件，所以最终我还是选择了`resilio sync`。

计划在自己的笔记本、PC、iPad、iPhone和一台服务器上都安装`resilio sync`。进行文件同步。

## 遇到的困难

### docker里的resilio sync不能正常启动

**服务器环境：Centos8**
​在服务器上我通过`docker`安装`resilio sync`。使用`linuxserver/resilio-sync`镜像。按官方教程启动却发现不能正常访问GUI。用`docker logs sync`看日志，发现是没有权限创建`config`文件。官方启动命令如下：
​		

``` shell
docker run -d \
--name=resilio-sync \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Europe/London \
-p 8888:8888 \
-p 55555:55555 \
-v /path/to/config:/config \
-v /path/to/downloads:/downloads \
-v /path/to/data:/sync \
--restart unless-stopped \
lscr.io/linuxserver/resilio-sync:latest
		
```

​	

所以我把`/path/to`目录改成`777`，重启容器，不行，删除容器之后再run，不行，重启 docker ，依然不行。只能作罢，放弃目录映射。改成这样

``` shell
docker run -d \
--name=resilio-sync \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Europe/London \
-p 8888:8888 \
-p 55555:55555 \
--restart unless-stopped \
lscr.io/linuxserver/resilio-sync:latest
```

跑是能跑了，尽管不能在实体机直接访问文件，不过也无所谓了，只是想把服务器当成一个中转而已。

### 	linux上的resilio sync同步过来的文件无法被logseq编辑。

**环境：Manjaro**
​通过`rslsync`启动的`resilio sync`同步的文件的所有者是正常用户，无论读写都没有问题。但是通过`systemctl enable rslsync`启动的rslsync，同步到本地的文件所有者是`rslsync`。权限为`711`，当我使用Logseq时，无法编辑这些文件。
​我尝试把权限改成`777`，依然无法写入。只能通过`chown`去改成文件所有者之后，Logseq才恢复正常。

### 	非公网与非局域网同步慢

当我的iPhone在外，通过数据流量访问在另外没有公网IP的三台电脑上的文件时下载、上传速度大概只有100kb-200kb左右。
​目前并没有找一到一个好的解决方案，计划哪天有优惠的时候买一台便宜的有公网的云服务器。