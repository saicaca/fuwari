---
title: 利用阿里云云函数 FC 搭建AList后端，每月仅需5毛！
published: 2025-01-13
description: '阿里云云函数 FC是一个弹性的计算平台，可托管多种服务。搭配AList的前后端分离部署，实现比VPS更低的价格，得到更好的体验'
image: "https://oss.onani.cn/fuwari-blog/img/47518d4403328a0fcb716f0e06fc7f608e6c65b7.webp"
tags: [阿里云云函数 FC]
category: '开发'
draft: false 
lang: ''
---

# 还是建议购买一个便宜的云服务器来部署或者用家里云，这种方法很灵车
推荐Akile：https://akile.io/register?aff_code=503fe5ea-e7c5-4d68-ae05-6de99513680e

---

# 原理
1. AList前端有一个专门的项目：https://github.com/AlistGo/alist-web 。可前往[AList-Web部署教程](/alist-web)。教程使用了Cloudflare Page进行前端部署，我们更建议你使用 https://vercel.com 来进行前端部署，因为更快。这些都完全免费
2. 部署完毕前端后，我们就需要一个后端，它需要能够执行AList的二进制文件，并且能开放端口（默认为5244）来让前端可以和后端相互通信。在传统情况下我们会选择购买一台云服务器，或者用自己的电脑/家里云+Cloudflare Tunnel又或者是Serv00这种免费的托管。本篇我们使用阿里云FC函数计算，它虽然可以运行二进制文件，但是和传统架构大相径庭，我们要深入了解。
3. FC函数是一个实例性服务。用户可以创建函数部署服务，当一定条件被触发（比如HTTP触发器）则创建新的实例开始运行用户的服务。也就是说这个实例是无状态的，如果直接拿来部署AList就会导致第一次配置完毕后过一段时间再访问就会变为初始状态。就算你一开始就使用一个全量包来部署，在部署后也无法对其进行更改，所以我们需要绑定一个NAS文件系统，用于数据持久化。但是NAS文件系统并不能直接绑定到代码的运行时 /code/xxx 目录，我们可以使用AList的指定配置文件参数，将NAS绑定到 /mnt/AList 然后指定配置文件到 /mnt/AList 。也就是通过 **./alist server --data /mnt/AList** 命令来启动，这样就做到了数据持久化。

# 关于计费
1. FC函数通过CU数来收费
2. NAS通过存储空间来收费

# 实操
1. 我们假设你已经部署完毕了前端。前端和后端的通信地址在根目录的 env.production 文件定义
2. 我们目前并不知道这个后端URL如何填写，因为这个URL是由阿里云在FC函数创建完毕的时候才会展示，所以我们暂且搁置到一遍
3. 接下来我们前往阿里云-函数计算FC官网 https://fcnext.console.aliyun.com/overview 
4. 依次点击 左侧边栏的 函数 -> 创建函数 -> Web函数。进入到创建Web函数的页面
5. 函数名称填写AList，运行环境选择Debian 10或Debian 11，代码上传方式选择从文件夹上传代码，启动命令填写：**./alist server --data /mnt/AList**，监听端口填写5244
6. 我们需要上传代码到函数，也就是AList的二进制文件，我们前往 https://github.com/AlistGo/alist/releases/latest 下载最新的Linux AMD64架构的二进制文件，也就是 **alist-linux-amd64.tar.gz**。将其解压，你会得到一个名为 **alist**的二进制文件，创建一个空文件夹将其放进去，然后上传这个文件夹到函数

![image](https://oss.onani.cn/fuwari-blog/img/QmdajYeRyt1u3BSmRdGx8uUHKamGDkwoRe4TmEFZsJsaqS)

7. 然后点击左下角的创建
8. 然后你会进入到函数的控制面板，依次点击 配置 -> 网络 -> 网络 编辑 -> 允许访问VPC:是 -> 自动配置。依次点击 配置 -> 存储 -> NAS文件存储 编辑 -> 挂载 NAS 文件系统:启用 -> 自动配置。依次点击 日志 -> 开通日志服务
9. 现在回到 代码 界面，点击部署代码。稍等片刻会提示部署成功，然后点击 函数详情内的 HTTP触发器 ，复制公网访问地址。这个就是我们前文提到的要写到前端根目录的 env.production 文件的URL，将其填写进去，例如
```shell
VITE_API_URL = "https://aliyun-fc-alist.run"
```
10. 提交你的新更改，前端会自动重新构建
11. 尝试直接访问你的AList前端URL，它应该会顺利进入到AList的登录页面
12. 此时查看控制面板的 实例 是否有一条新的实例正在工作，如果有，再前往日志查看该实例日志，你会看到AList初始化时生成的管理员密码，拿这个密码到前端URL登录AList，然后就可以正常使用了

---

# 疑难解答
1. 如果出现正在加载储存：
![9aa460cd2dc84e1debe43e9df2d342fc](https://oss.onani.cn/fuwari-blog/img/QmZVewYnKwCJzcShnkGTTVZJiTSUUSQi9u6pZ5rXRDK3rK)
查看你的日志，是否有存储加载失败，如果有可以尝试：
    1. 反复重新部署，直到能进后台然后删除那些加载失败的存储
    2. https://github.com/AlistGo/alist/discussions/3976