---
title: 使用基于IPFS的Fleek部署静态网站、托管图床、部署服务
published: 2024-10-17
description: 'IPFS是一个多节点的文件托管系统，你可以在上面共享文件、发布网站、而Fleek自动化了这个过程，并且可以链接你的Git存储库'
image: "https://oss.onani.cn/fuwari-blog/img/2024-10-17-09-55-55-image.webp"
tags: [Fleek, IPFS]
category: '运维'
draft: false 
lang: ''
---

### 什么是IPFS？

> IPFS，是点到点的超媒体协议，它让网络更快、更安全、更开放。说简单一点，它就是一个去中心化互联网。说技术一点，它是一个基于分布式哈希表DHT进行内容寻址的，基于git模型版本管理的，基于默克尔对象关联的，基于点对点技术的，基于全球化命名空间IPNS的，基于各种技术的，一种分布式文件系统。

用人话说，你可以把它看成一个共享网盘，你可以尝试下载[IPFS - Desktop（适用于有图形界面的系统）](https://github.com/ipfs/ipfs-desktop)或[kubo - ipfs（适用于CLI）](https://github.com/ipfs/kubo)。然后启动IPFS，你的设备将成为IPFS网络中的一个节点，如图![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-10-47-08-image.webp)

### 使用IPFS能做什么？

当你连接到IPFS网络后，IPFS会自动将你的设备作为一个本地IPFS节点并且寻找其他IPFS节点，你将能够帮助其他用户建立连接、提供文件。同时你也可以将你的文件上传到你的IPFS节点，等待分发，让网络上的其他用户可以访问你的文件。在IPFS网络中，访问文件通过IPFS网关，如：`https://ipfs.io/ipfs/` + `CID（文件哈希）` 实现访问。比如： https://ipfs.crossbell.io/ipfs/bafybeifbn36zmdb37ov6id3toy6bve47264hjk2yob6rm4bhw7ooawncf4

（这里使用 `ipfs.crossbell.io` 这个CrossBell托管的IPFS网关来规避GFW封禁）

### 这项技术真的有这么理想吗？

这项技术确实很理想，但是实际应用下来会遇到以下问题

1. 通过本地IPFS节点上传的文件迟迟无法通过IPFS网关+CID实现访问

2. 发现的节点太少

3. 可能会大量占用你的带宽

这些问题大部分原因都是因为这个网络太过于庞大，而单个IPFS节点的权重很低，尽管IPFS的分发一般在几小时内可以完成。但对于个人来说，我们应当寻找一些服务商帮我们完成这些需求，它们往往在IPFS网络中的权重更大，进行文件更新的效率也很高，同时也提供一些扩展服务，比如自动化Git部署。而这篇文章使用的则是**Fleek**

### 关于Fleek

你可以简单理解为它权重很大，有很多的IPFS节点，经由Fleek上传到IPFS网络上的文件可以在几秒内完成广播，并且支持连接Git存储库部署项目和绑定你的域名

### Fleek是否值得信赖？

本人仅接触此服务2天。观察到Fleek在成功部署网站后提供了三类访问方式

1. `xxx-xxx.fleek.app`：这个域名使用了Cloudflare CDN，实测解析IP的数量为2，不建议使用

2. ![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-11-01-49-image.webp)：这种方法是原生的IPFS访问方式。通过IPFS网关+CID来访问。但由于CID为哈希值，当你的网站改动后你的CID会发生变化

3. 绑定自定义域名来访问，这将会使用亚马逊的CDN并且自动映射CID，实测解析IP数量超过30，并且速度很快
   
   > [!WARNING]
   > 注意，任何使用HTTP协议的类ipfs技术都需要一个中心化服务器代理访问IPFS网络。只有当访问者连接上IPFS网络后才会使用去中心化的连接方式）
- ![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-11-07-40-image.webp)

- 尽管显示了IPFS的文件浏览界面，但实际上这个页面是由HTTP请求到亚马逊 CDN反代IPFS网络实现的，实际上仍为中心化网络

- ![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-11-08-44-image.webp)

- 当你的设备已经连上IPFS网络后，所有流量将使用P2P（去中心化），所以你看到的访问地址实际上是本机地址

### 梳理一下思路，我们可以用Fleek做到什么

让Fleek连接你的Git存储库，通过构建命令构建静态网站，并发布到IPFS，同时兼容HTTP访问

#### 正式开始

1. 前往fleek.xyz，通过MetaMask登录

2. 连接你的Git存储库，输入构建命令等相关信息

3. 部署网站

4. 绑定域名

5. 最终访问

效果图：

![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-11-31-33-image.webp)

#### 拓展一下，我们还可以通过IPFS技术做什么？（域名已弃用）

1. 创建一个巨大的图床，已经投入使用，参见： https://pic.onani.cn （原理：请求 https://ipfs-pic.onani.cn ，获取图片列表，随机选择使用JS展示）![](https://oss.onani.cn/fuwari-blog/img/2024-10-17-11-34-44-image.webp)

2. 无需再自托管任何图片，已经投入使用，本博客所有图片都使用IPFS存储

3. 理论上，你可以将任何占用存储的服务上传到IPFS，实现存算分离
