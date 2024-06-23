---
title: 借助Hexo和Github搭建一个博客
date: 2015-01-09 00:34:46
tags:
  - 网站建设
  - hexo
  - Github
category: 技术
---

花了两天时间，总算把博客搭起来了。期间碰到了很多问题，还好有伟大的 Google，也都一一化解。现将其间过程写下来，也好帮助像我一样需要帮助的人。

<!-- more -->

## 框架选择

一开始打算搭建博客，先要思考你要搭建那种类型的网站：`动态网站`还是`静态网站`。
考虑到我只是想有一个可以记录自己想法的空间，所以就选择了静态网站。而静态网站也有很多框架可供选择，`github`推荐的`jekyll`，基于 jekyll 开发的`octopress`，以及使用·node·编写的`hexo`。

### jekyll

> Jekyll 是一个简单的博客形态的静态站点生产机器。它有一个模版目录，其中包含原始文本格式的文档，通过 Markdown（或者 Textile 以及 Liquid 转化成一个完整的可发布的静态网站，你可以发布在任何你喜爱的服务器上。Jekyll 也可以运行在 GitHub Page 上，也就是说，你可以使用 GitHub 的服务来搭建你的项目页面、博客或者网站，而且是完全免费的。

本来打算用`jekyll`，但是在配置过程中出现了一些问题，windows 下安装`jekyll`各种失败，百般不得求解，最终放弃。

### octopress

> Octopress 是利用 Jekyll 博客引擎开发的一个博客系统，生成的静态页面能够很好的在 github page 上展现。号称是 hacker 专属的一个博客系统(Ablogging framework for hackers.)

### hexo

> hexo 是由 Node.js 驱动的一款快速、简单且功能强大的博客框架。它和 jekyll 相比，更快，更轻量。其出自台湾大学生 tommy351 之手，编译上百篇文字只需要几秒。hexo 生成的静态网页可以直接放到 GitHub Pages，BAE，SAE 等平台上。

因为它的小巧轻便，易于配置，而且功能同样强大，最终选择了`hexo`。

## 环境准备

需要安装`nods.js`，`git`，和一款编辑器。这些直接找相应的官网，一路安装就行了。

### 安装 HEXO

以上软件安装好后，直接执行以下代码：

    npm install -g hexo

### 初始化

执行`init`命令初始化`hexo`到你指定的目录,比如我是在`D`盘的`blog`文件夹下(以下默认都在这个路径下)：

    D:\blog>hexo init

安装过程就完了，是不是很简单呢？

### 生成页面

    D:\blog>hexo generate

### 本地启动

    D:\blog>hexo server

在浏览器中输入[http://localhost:4000](http://localhost:4000)就可以看到你自己的博客了。

## 写博客

执行`new`命令

    D:\blog>hexo new [layout] "postName"#其中layout为模版类型，默认为post，“postName”为你的文章名

接下来在`hexo\source\_posts\`中就可以找到相应的文件，接下来就可书写文章了。

### 部署

可以选择 github page，免费 300m 的空间，而且不限流量。方法也很简单，在你的 github 下，新建一个`username.github.io`的仓库，然后在`hexo`目录下名为的`_config.yml`的配置文件里：

    deploy:
    deploy:
      type: github
      repository: https://github.com/kisnows/kisnows.github.io.git
      branch: master
      #此处将kisnows替换为你的github账号名

一切就 ok 了。

### 常用命令

    hexo new "postName" #新建文章
    hexo new page "pageName" #新建页面
    hexo generate #生成静态页面至public目录 简写：hexo g
    hexo server #开启预览访问端口（默认端口4000，'ctrl + c'关闭server） 简写：hexo s
    hexo deploy #将.deploy目录部署到GitHub 简写：hexo d
    hexo d -g #组合命令，先生成页面，后部署到Github
