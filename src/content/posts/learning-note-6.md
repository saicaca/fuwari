---
title: 前端开发学习笔记六
date: 2015-01-13 20:05:27
tags:
  - 学习笔记
  - JavaScript
category: 技术
---

## 前言

终于搞定了一个电商整站临摹，共四张页面，实现了基本的交互功能，同时也应用了`less`这个新学的`css`预处理语言。之前也做过一个电商首页[点这儿](http://kisnows.com/F2E-practice/shopping/index.html)。但是因为只是单页面，处理起来比较简单。但是在制作这个整站的过程中，更加深刻的理解一些之前学过的内容：比如样式结构的分离，`js`设计时的分层思想等。[点击这里](http://kisnows.com/F2E-practice/shopping-page/home.html)查看网页效果，或者下面有效果图(图好丑)：

<!-- more -->

![效果图](/imgs/F2ELearnNote/whole.gif)

### 结构

首先说结构，拿到设计图时，先要进行分析。比如这四张页面，是典型的上中下结构，其除了中间正文部分，头部和脚部都是完全一样的，而且除了商品详细页面外，其他的正文部分都分为左右结构，可先将这部分相同的结构写好后作为模版，在写其他页面时只需要在模版的基础上填充内容就可以了。

```html
<body>
  <div id="head"><!-- 完全一样的 --></div>
  <div id="content"><!-- 部分一样 --></div>
  <div id="footer"><!-- 完全一样 --></div>
</body>
```

### 样式

因为在写样式过程中用了`less`这个 css 高级语言，写起来方便了许多，不用再去将一些重复的东西写上一遍又一遍，省去诸多麻烦。我对 Css 也惊醒了分层，先针对模版写一份样式名为`mian.js`，接下在针对不同的页面写不同的样式，最后在页面中同时引入进来就可以了。其实还可以再进一步细分，比如针对头部和页脚的，banner 部分的，页码部分的等等。

### 逻辑

最后是`js`，在分析中发现，不同的页面中用的许多的逻辑都是一样的、比如几个 banner 部分的自动切换、模拟下拉菜单等。这时，将整个`js`代码分为以下三个层来写：

#### 工具层

这里是一些最基础的东西，比如获取元素的 class

    shop.tools = {};
    shop.tools.getByClass = function(par, cla) {};//获取相应class元素
    shop.tools.onmouseover = function(ele,eles,select){};//参数为子元素，和父元素，最终为当前元素添加active状态
    shop.tools.onclick = function(ele,eles){};

#### 用户界面层

这里写一下会多处用到的 UI 层：

    shop.ui = {};
    shop.ui.fadeIn = function(ele, time, opacity) {};
    shop.ui.fadeOut = function(ele, time, opacity) {};

#### 应用层

这里就是页面会直接用的交互层：

    shop.app = {};
    shop.app.tip = function() {};
    shop.app.banner = function() {};
    shop.app.chose = function(){
    	var specification = document.getElementById('specification');
    	var color = document.getElementById('color');
    	var speSpans = specification.getElementsByTagName('span');
    	var colorSpans = color.getElementsByTagName('span')
    	for (var i = speSpans.length - 1; i >= 0; i--) {
    		shop.tools.onmouseover(speSpans[i],speSpans);
    		shop.tools.onclick(speSpans[i],speSpans);
    	}
    	for (var j = colorSpans.length - 1; j >= 0; j--) {
    		shop.tools.onmouseover(colorSpans[j],colorSpans);
    		shop.tools.onclick(colorSpans[j],colorSpans);
    	};
    }
    shop.app.chose_screen = function(){
    	var top = document.getElementById('top');
    	var a = top.getElementsByTagName('a');
    	for (var i = a.length - 1; i >= 0; i--) {
    		if (a[i].innerHTML == "更多") {continue}
    		else{
    			shop.tools.onmouseover(a[i],a,"active");
    		}
    	};
    };

代码太多就不全贴了，可以看到在这里会多次用到之前 tools 和 ui 里面的函数，这样就提高了代码的利用率，使结构看起来清晰，易于他人理解和维护。最后在页面中，哪里用到，哪里直接引用就可以了。

## 总结

在这个过程中也认识到自己很多方面还是不够熟练，需要继续加油啊。
