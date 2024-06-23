---
title: 初试chrome应用
date: 2015-01-12 05:01:28
tags:
  - chrome
  - onedrive
category: 技术
---

众所周知，onedrive 是微软提供的一款个人网络硬盘，对老用户提供 25GB 的免费空间，新注册用户提供 7GB 的空间，要是这个空间可以用来做博客的图床就太好不过了。毕竟微软这么一个财大气粗的公司，而且在国内也不会随随便便就被墙掉，所以稳定性有保证。但是 onedrive 提供的公开链接并不能直接插入博客，需要做一定的格式转换才可以。在网上找到了转换连接的办法，但是要是手动转换，太麻烦了，于是想着做一个 chrome 扩展，毕竟方便嘛。

<!-- more -->

粗略的看了一下 chrome 提供的 api，发现如果只是做一个简单的应用其实很简单。那么说干就干，下面是做好的效果图。
![onedrive](/imgs/2015-01-11_210833.png)
我也直接将内容嵌入进来，可以直接在这转换：

<link rel="stylesheet" href="/css-my/popup.css">
<script src="/js-my/popup.js"></script>
<div id="driver">
	<span>公开链接：</span><input id="one_before" type="text" value="请在此输入文件公开连接">
	<span>文件类型：</span><input id="one_type" type="text" value="请在此输入文件类型">
	<span>转换后地址：</span><input id="one_after" type="text">
	<p><input id="chage" class="btn" type="button" value="获取" /> <input id="clean" class="btn" type="button" value="清除" /></p>
</div>

它的功能：输入从 onedrive 获取的公开链接和文件的类型，就可以得到这个文件的可直接访问的地址。
它由四个基本文件组成，分别为：

- manifest.json
- popup.html
- popup.css
- popup.js

其中第一个文件是应用的描述信息，后面的三个文件分别是应用的内容、样式以及逻辑，其实就和一个网页是一样的。

<hr>
因为暂时没有开通开发者账号，所以不能提交到应用商店。不过可以在这里下载：
[点这里](http://pan.baidu.com/s/1kTtE7EB),下载后不能直接安装，需要手动拖动到插件管理处，然后就可以尽情使用了。

如果你对源码感兴趣，那么：
[点这里](https://github.com/kisnows/chrome_onedriveChanger)
