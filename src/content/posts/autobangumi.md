---
title: 教你搭建自己的番剧库，实现自动追番！
published: 2024-10-08
description: '使用AutuBangumi连接qBittorrent下载番剧，然后使用刮削软件刮削，设置一遍，享受终身'
image: "https://oss.onani.cn/fuwari-blog/img/QmXYf2u6BZMseAzjPUhcHsdfdhQpc3XkdjuEi4VvE1BkTn.webp"
tags: [AutoBangumi]
category: 'NAS'
draft: false 
lang: 'zh_CN'
---

# 实现流程：

1. 每当新番更新时AutoBangumi自动向qb推送种子下载并且重命名
2. 刮削软件（如Plex，飞牛影视设置定时搜索媒体库）
3. 你只需要选番，然后等待下载和看就行了 ~~实际并非~~

### 安装qbittorrent

> 用于下载番剧

各系统安装方法各有不同。如果你安装的是非nox版本，记得在设置打开WebUI，并监听0.0.0.0:8080

Windows：[SourceForge](https://sourceforge.net/projects/qbittorrent/files/qbittorrent-win32)
  Linux：`apt/yum install qbittorrent-nox`
  Docker：https://github.com/linuxserver/docker-qbittorrent

![8938ee430e5f74109c34c8c6d48e0e4f619cbeff.webp](https://oss.onani.cn/fuwari-blog/img/29e0e4c26c15463ff692aabcee747950e2d029d3.webp)

### 安装AutoBangumi

> 用于获取你订阅的番剧并在更新时自动发起下载任务

1. 安装Docker，各系统安装方式各有不同

2. 找一个你喜欢的文件夹创建`docker-compose.yaml` ，并写入内容：

```yaml
services:
AutoBangumi:
  image: "ghcr.io/estrellaxd/auto_bangumi:latest"
  container_name: AutoBangumi
  volumes:
    - ./config:/app/config
    - ./data:/app/data
  ports:
    - "7892:7892"
  network_mode: bridge
  restart: unless-stopped
  dns:
    - 223.5.5.5
  environment:
    - TZ=Asia/Shanghai
    - PGID=$(id -g)
    - PUID=$(id -u)
    - UMASK=022
```

3. 运行命令：docker compose up -d

4. 进入localhost:7892 ，默认账号：admin，默认密码：adminadmin

5. 点左边的设置图标 -> 下载设置，填入下载器信息，然后点击右下角的应用，直到右上角亮绿灯

![QmbVcrgZ2C2FTt6QdfKsUkVQz9SCiQiyq1WCbphDiGW2mM.webp](https://oss.onani.cn/fuwari-blog/img/94f407121de7816ee2dff78f948dcc2ded27b28f.webp)

6. 前往蜜柑计划，注册账号，并订阅你想要的番剧（复制）
   ![QmXq7DcBkA4EecJikQE4snvPkNU2NQLy1EXUpAructteah.webp](https://oss.onani.cn/fuwari-blog/img/0e22eab8db6ed2441f3d3be0b10d51944867df0a.webp)

7. 回到 AutoBangumi，点击右上角的 +，添加 RSS（粘贴）

8. 静静等待，不出意外 AutoBangumi 会自动下载你订阅的番剧了（如果没有可以查看AutoBangumi的日志，或者尝试重启容器）

### 下载旧集或已完结番剧

首先推荐几个资源网（梯子自备）：

1. [ACG.RIP](https://acg.rip)
2. [末日动漫资源网](https://share.acgnx.se)
3. 蜜柑计划 国内直连：1. https://mikanime.tv 2. https://hadestian.cn 3. https://mk.misakaae.com 4. https://mikan.yujiangqaq.com 5. RSS镜像站：https://mikanani.longc.top
4. 蜜柑计划 需翻墙：https://mikanani.me
   然后找你想要的番剧下载

#### 规范重命名

> 为了让软件能正确刮削元数据和剧集，我们需要规范重命名。

注意！你只需要确保番剧名正确就可以了！子目录可以通过后面的脚本自动重命名！如果你不确定番剧名请前往TMDB搜索：[The Movie Database (TMDB) ](themoviedb.org)

> 一级目录（qb 设置的下载目录）：不需要重命名

> 二级目录（番剧名，必须正确）：总之就是非常可爱

> 三级目录：（番剧的哪一季）：Season 1

> 四级目录：（番剧的哪一季的哪一集）：S01E01.MP4

1. ~~前往Episode-ReName，克隆仓库~~（已被删库，可尝试[Episode-ReName.zip | Onani-AList](https://alist.onani.cn/Episode-ReName.zip) )

2. Win 可以通过右键菜单自动获取路径版.bat 通过右键一级目录选择自动剧集命名 。若使用.py 脚本则只能通过`python3 EpisodeReName.py "D:/qbdownloads/bangumi"`

**小贴士：** 可以使用[RaiDrive](https://onani.cn/RaiDrive)或[SSHFS](/SSHFS)将远程的Linux文件映射到Windows上，管理番剧更方便
![QmY7KM2MjudNksqvSkkFmwFgjjdD7ZQKLDaVPXR3jnXoxw.webp](https://oss.onani.cn/fuwari-blog/img/5cf6dfe73164f6a869a59817df53f939e936ab00.webp)

### 安装 Plex（或者安装飞牛云NAS）

> 用于观看番剧

1. 下载Plex Media Server

2. 启动。默认端口 32400（如果进去是一堆乱码，添加/web后缀。例如：192.168.124.25:32400/web）

3. 选择你的媒体库文件夹

4. 开启远程访问，右上角设置 -> 远程访问

图为飞牛影视

![Qmf8Q1D9fUoFbu9MQsQHvaz13p3YV2XguR3RqUAse2KBEa.webp](https://oss.onani.cn/fuwari-blog/img/acbde8bfd7395a8b5c744b9f1c550f3caac6c342.webp)

爽看
