---
title: jQuery插件-changeBg
published: 2015-02-08 04:36:04
tags:
  - JavaScript
  - jQuery
category: 技术
---

把上篇博客中写的 jQuery 题改进了一下，做成了一个新插件`ChangeBg`。
可以给某标签下的所有奇数行的子元素(注意：是*子元素*，而非*后代元素*)设置背景颜色，同时给所有子元素添加鼠标移入移出时更改背景和字体颜色的事件。

<iframe width="100%" height="300" src="http://jsfiddle.net/cherryoung/5d9ckxLk/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
调用方法：`$('select').ChangeBg(bgCol, chBgCl, chCol);`或直接`$('select').ChangeBg();`
函数有三个参数，分别为：

- `bgCol` 奇数行要设置的背景颜色,默认为`'#EEE'`
- `chBgCl` 鼠标移入时背景颜色，默认为`'#0066CC'`
- `chCol` 鼠标移入时的字体颜色，默认为`'#FFF'`

[下载请点我](http://pan.baidu.com/s/1sjqeEBF)
