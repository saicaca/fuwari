---
title: 教你把AList的前端部署到CF Pages！让你的AList秒加载！
published: 2024-10-15
description: '将AList Web部署到CF Pages可以显著提升访问者的浏览体验，因为静态资源都在CF的边缘节点，而后端使用API交互，而不是由源服务器路由所有流量，既能减轻源服务器的负载，又能使用CF Pages的不回源优势，一箭双雕'
image: "https://oss.onani.cn/fuwari-blog/img/QmSmcktDEJaWdDvFQeuNTJ9ps8R3PcLWyhSrbxoLEq2b2x.webp"
tags: [AList, Cloudflare Pages]
category: '运维'
draft: false 
lang: ''
---

## 前情提要[#](https://afo.im/shen-me-Cloudflare-dai-li-AList-tai-man--jiao-ni-bu-shu-qian-duan-dao-Pages-ju-jue-hui-yuan-#user-content-%E5%89%8D%E6%83%85%E6%8F%90%E8%A6%81)

本教程**不是 AList 的无服务器部署**，仅将前端页面部署到 Cloudflare Pages，这样用户就能很快从 cf 的边缘节点拉取前端文件，而不用 cf 回源，提高浏览体验，后端仍然需要一台开放到公网的服务器部署 AList（无公网服务器可使用 Cloudflare Tunnels）

### 首先，保证你的后端服务器支持v4v6双栈访问

1. 使用Cloudflare Tunnel，套cf

2. 分别设置A和AAAA解析，麻烦，如果你的IP很快，那其实可以不用前后端分离，暴露源站的前后端分离也不能避免被DDoS，因为你的源站会在HTTP报文中暴露

### 然后，开始正式将AList前端部署到Cloudflare Pages

1. Fork仓库：
   
   ::github{repo="alist-org/alist-web"}

2. 更改项目根目录的`env.production`文件为你的后端服务器地址  
   ![QmduQJq3TydzvLzBn47zLxp2MR1iD2sxm67EzFUFuEBvQa.webp](https://oss.onani.cn/fuwari-blog/img/6f2871ca5d35e1e974d89611835f3a2c7fd205e7.webp)

3. 将仓库克隆到本地，需要安装[Git](https://git-scm.com/)：

```
使用SSH（需要持有你的Github SSH私钥）：
git clone git@github.com:你的用户名/你Fork的仓库

使用HTTPS（Not Use Magic有概率SSL握手失败）：
git clone git@github.com:你的用户名/你Fork的仓库
```

5. 下载汉化包：[AcoFork 的网盘](https://alist.onani.cn/guest/alist_Zh-CN)或[Crowdin - 需要登录](https://crowdin.com/project/alist/zh-CN)  
   ![QmXVpMc7BqbXv9EaAbeptsrnhYLinvQQsu1btBE3VvDixa.webp](https://oss.onani.cn/fuwari-blog/img/68d31e9797edfc3c1d8a72386ebf3a643d117ce6.webp)
6. 解压，将`alist (zh-CN)\src\lang`里面的`Zh-CN`文件夹复制到仓库下`src/lang`下
7. 编辑根目录的`.gitignore`，添加一行`!/src/lang/zh-CN/`确保文件不被忽略
8. 下载[Nodejs](https://nodejs.org/zh-cn)。在根目录打开终端，生成中文需要的文件：

```
安装cnpm：
npm install -g cnpm --registry=https://registry.npmmirror.com

安装依赖：
cnpm install --legacy-peer-deps

生成中文需要的文件：
node .\scripts\i18n.mjs
```

9. 将更改提交到暂存区并提交到远程仓库，在根目录打开终端

```
git add .   //将更改提交到暂存区
git commit -m 添加中文   //发布提交
git push -f   //强制将更改提交到远程仓库
```

10. 进入[Cloudflare 仪表盘](https://dash.cloudflare.com/)，进入 Workers 和 Pages 页面  
    ![QmW5UaUap8T2R37u5dzmKGLmUgk4qKnSMFwHBVHqvVbkVA.webp](https://oss.onani.cn/fuwari-blog/img/49ccd51771082fdc94eecb270caf987d257cd987.webp)
11. 创建一个 Pages，选择连接 Git 存储库  
    ![QmZXerKv9PVxxscAe4w4LEfAaKfiScPQEKh1UroXnCeAUr.webp](https://oss.onani.cn/fuwari-blog/img/9c4b9ff38d3c8810007ffe33c1a0f98cdd84b92e.webp)
12. 选择你的存储库，开始设置  
    ![QmNdSGQrJtoqDnBx8pgDrtcfmUUfVBS9xdrN4xLgyPjyXE.webp](https://oss.onani.cn/fuwari-blog/img/fb97b5148c3811590609a0b85c6c1ee3c451853d.webp)
13. 构建命令输入：`pnpm install && pnpm build`，构建输出目录选择`/dist`  
    ![QmbhPdbE8f1zLKvWA6aEGJtZhmecRMVZiQbx6Zx1Lecp7J.webp](https://oss.onani.cn/fuwari-blog/img/c4300a94ccb16fe1383c721cbc83d1a71420e340.webp)
14. 等待 Cloudflare 构建结束，为 Pages 绑定自定义域  
    ![QmTMphu61uUF9XefBAVDVf19Jm1vLVUhhXQ9PXABy7hUpK.webp](https://oss.onani.cn/fuwari-blog/img/d27136b31d759898fe06041f12e7a07f07bd06b0.webp)
15. 访问自定义域，查看 AList 是否正常  
    ![QmT8GLcaxtabhifKNL8kczEtozmNvdyhzJ823RfBrcFdpm.webp](https://oss.onani.cn/fuwari-blog/img/345df496620a9d3faf0eceeb773813bc9ac98375.webp)

### 定制 AList[#](https://afo.im/shen-me-Cloudflare-dai-li-AList-tai-man--jiao-ni-bu-shu-qian-duan-dao-Pages-ju-jue-hui-yuan-#user-content-%E5%AE%9A%E5%88%B6-alist)

> 我们都知道 AList 支持自定义头部和内容，但是因为 Cloudflare Pages 是一个静态页面，所以我们采用硬编码方式，直接将需要自定义的内容写入仓库根目录的`index.html`  
> ![Qmd47pgFsyh28NjhkLiCPPbf7iasXMWvAvZDupH8QspG64.webp](https://oss.onani.cn/fuwari-blog/img/c3ff113558b368da9a7aeb70f70b978f49d0eb7a.webp)

1. 编辑根目录的`index.html`
2. 将更改提交到暂存区并提交到远程仓库，在根目录打开终端

```
git add .   //将更改提交到暂存区
git commit -m 你的提交摘要   //发布提交
git push -f   //强制将更改提交到远程仓库
```

3. Cloudflare Pages 会自动重新构建，等待新网页构建完成即可  
   ![QmNZemsDHz5QLxW3V2eANghmVkfBccEpe5vMAWUCLik4o6.webp](https://oss.onani.cn/fuwari-blog/img/863e5bb3ef65ec2a0af03303dd3afe13fb8dd8d4.webp)

### 疑难解答

1. 如果你遇到构建错误（找不到solid-route/src）的情况，可以尝试查看你fork的仓库通过本地拉取下来后根目录的 `solid-route` 文件夹是不是空的，如果是，请前往 https://github.com/alist-org/alist-web 手动将 `solid-route` 文件夹的目录搬到你的仓库中，然后尝试重新构建