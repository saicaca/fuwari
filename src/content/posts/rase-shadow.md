---
title: 翘边阴影制作方法
published: 2015-01-26 05:36:08
tags:
  - CSS3
category: 技术
---

一些特殊阴影的制作方法，其实就是将多个图形叠加在一起，然后通过`z-index`调整前后顺序，最后[实现效果](http://kisnows.com/Front-end-practice/boxshadow/)。
![翘边阴影](/imgs/2015-01-25_214045.png)

<!-- more -->

HTML：

```html
<li><img src="img/1.gif" alt="img" /></li>
```

CSS：

```css
li::after {
  content: "";
  width: 90%;
  height: 80%;
  left: 1.6%;
  bottom: 4.6%;
  position: absolute;
  background-color: transparent;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
  -webkit-transform: rotate(-4deg) skew(-8deg);
  -moz-transform: rotate(-4deg) skew(-8deg);
  -ms-transform: rotate(-4deg) skew(-8deg);
  -o-transform: rotate(-4deg) skew(-8deg);
  transform: rotate(-4deg) skew(-8deg);
  z-index: -1;
}
li::before {
  content: "";
  width: 90%;
  height: 80%;
  right: 1.6%;
  bottom: 4.6%;
  position: absolute;
  background-color: transparent;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
  -webkit-transform: rotate(4deg) skew(8deg);
  -moz-transform: rotate(4deg) skew(8deg);
  -ms-transform: rotate(4deg) skew(8deg);
  -o-transform: rotate(4deg) skew(8deg);
  transform: rotate(4deg) skew(8deg);
  z-index: -1;
}
```

其实就是将两个平行四边形分别左右旋转后放在原图的下面（如下示意图），并给它设置阴影，最后就会实现图片中阴影效果。
![示意图](/imgs/boxshadow.png)
[可以点击这里查看 DEMO](http://kisnows.com/F2E-practice/boxshadow/index.html)
