---
title: elefixed
published: 2015-01-22 04:02:45
tags:
  - JavaScript
  - jQuery
  - 插件
category: 技术
---

写了一款`js`插件，可以让一个元素在随着页面向下滚动到达浏览器顶部时，固定在那，向上滚动时又回到原来的状态。
具体介绍可以点击这里查看：[eleFixed](http://kisnows.com/eleFixed/#)
本插件提供原生`js`和`jQuery`两个版本：
使用方法:

- 原生 js 版：首先在 html 中引入 elefixed.js 文件，然后这样调用它:`elefixed("ele");`，其中的`"ele"`可以换为你要设置元素的 id。
- jQuery 版：直接在元素后面调用该方法即可，像这样`$("ele").elefixed()`,这里的`"ele"`不再像原生版一样需要 id 值了，只要能选中该元素即可。

[下载地址：](https://github.com/kisnows/eleFixed)
