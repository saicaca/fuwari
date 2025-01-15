---
title: 飞牛NAS玩机体验
published: 2024-10-14
description: '飞牛NAS系统是一个现代的开源的NAS系统。影视刮削在国内属于TOP1，并且刚需的Docker软件也功能全面易用，博主本人也在使用'
image: "https://oss.onani.cn/fuwari-blog/img/QmUBuX9qmsNP1NHeEeUmuPNdS5ctvk4LchcSsFARDC4vZJ.webp"
tags: [飞牛NAS]
category: 'NAS'
draft: false 
lang: ''
---

### 吸引我的东西

1. 影视刮削：飞快，薄纱Plex几条街。通过[AutoBangumi](/autobangumi)可以完美自动追番+刮削一条龙服务。偶尔会有不准，但可以手动匹配，数据源来自[TMDB](https://www.themoviedb.org/)和[IMDB](https://www.imdb.com/)
   ![QmbNXd4FJ8FM8mwkKxJNdBoNbvhawJ2HdSvW5tFUt3o4ub.webp](https://oss.onani.cn/fuwari-blog/img/f1bd7089efdf00097d5474ef967a62dcfca42e98.webp)

2. 相册：可以通过手机APP自动备份，支持仅备份图片，可以多用户使用，存储互不干扰，也可以设置要共享的图片
   ![QmeLJ7in4xcokPWUgkkSobDLUTrFrXep2o38qUXQ1njQR9.webp](https://oss.onani.cn/fuwari-blog/img/2f9981f8397cc1278807ed28f8a2e15954868fec.webp)

### 注意事项

1. 飞牛NAS在安装的时候会叫你选择安装盘，然后会将安装盘的一部分空间（默认为64GB）作为系统分区，其余空间可用于创建存储空间（但是系统盘不能和别的盘组存储池，只能单独建存储池） 
   ![QmNfRbvHu1fuYoincACcP2MG4yV4pgRni3rb4Y9J7uw4FW.webp](https://oss.onani.cn/fuwari-blog/img/6403ef19d941abdc93d8c7da01364a8983c98109.webp)

2. 应用商店安装的软件需要先授予目录访问权限应用才能读取目录（无论是原生还是Docker应用）
   ![QmP4unAVra1zy7gkjEzSCYEDAJMMe1BVWPKoVyjYv8b9Ho.webp](https://oss.onani.cn/fuwari-blog/img/79af3b25d8b677b2718c953c0d431ead2f137e1d.webp)

3. 发行版为Debian 12。根目录为系统分区的空间，/vol1 为存储空间1的空间 /vol2 为存储空间2的空间。推荐使用[RaiDrive](https://onani.cn/RaiDrive)或[SSHFS](/SSHFS)挂载Linux目录到Windows
   ![QmWMQHNpJUUPg9B1Hdw2zmwLx9q6bcS52nUFiB3P9iYvU9.webp](https://oss.onani.cn/fuwari-blog/img/d4ec6f87893f4af5d7eedb2e2a19a784fd6c6f92.webp)

4. SSH需要自己开，账密为NAS管理员账密，建议登上之后改为仅密钥登录，参见：[设置 SSH 通过密钥登录](https://www.runoob.com/w3cnote/set-ssh-login-key.html)
   ![QmTk3va2NCbYTcVewVjuqjGx6MwMwiUnManrNwxvEq4SBR.webp](https://oss.onani.cn/fuwari-blog/img/9f92130465ab62e912b7404266febc7212e2125b.webp)

5. 各网卡测试
   
   | 名称                         | 类型  | 品牌          | 是否免驱       |
   |:--------------------------:|:---:|:-----------:|:----------:|
   | Realtek GBE Family （r8168） | 有线  | Realtek（瑞昱） | 否，需要自行安装驱动 |
   | Realtek 8852BE             | 无线  | Realtek（瑞昱） | 否，需要自行安装驱动 |
   | Intel AC3160               | 无线  | Intel（英特尔）  | 是          |
   | USB有线网卡                    | 有线  | Realtek（瑞昱） | 是          |

6. 各存储模式区别
   
   | 模式     | 作用                                   | 是否能扩容 | 是否能换盘 | 容灾  | 是否能热备 | 是否能修改存储模式 |
   |:------:|:------------------------------------:|:-----:|:-----:|:---:|:-----:|:---------:|
   | Basic  | 将物理硬盘的一部分或者全部作为一个存储池，不可扩容，仅能单盘创建这个模式 | 否     | 否     | 无   | 否     | 是，可转为RAID |
   | Linear | 将一个或多个物理硬盘的一部分或者全部作为一个存储池，可扩容        | 是     | 否     | 无   | 否     | 否         |
   | RAID类  | 自行使用搜索引擎搜索，更详细                       | 未测试   | 未测试   | 未测试 | 未测试   | 未测试       |
   
   7. NAS迅雷内测码：迅雷牛通
