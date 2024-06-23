---
title: 前端开发学习笔记一
published: 2014-12-11 21:29:41
tags:
  - 学习笔记
category: 技术
---

刚刚花了点时间学完 html 和 css，同时粗略的看了一点 javascript。于是看了一遍教程后，就动手做了下面这个页面。（这是原效果图）

<!-- more -->

![1-1](/imgs/F2ELearnNote/1-1.png)
其中有些问题，比如教程中的一些圆角按钮，是用一个三层嵌套然类似`<ahref=''><strong><span>HOME</span></strong></a>`后分别给每个标签设置背景图片来实现。
感觉有点得不偿失，其实完全可以用`border-radius`加上一个平铺背景来实现，即简单代码看起来又清爽，而且符合 html 的语义化:
`<a>HOME</a>`，然后只需要在 css 中设置`a{border-radius:5px}`，就可以了。
实现图如下：
![1-2](/imgs/F2ELearnNote/1-2.png)

还有一个问题，就是整个页面的主题部分的背景，是一个圆角的有阴影效果的白色图片。教程中同样是用切三张图加上 html 的三层嵌套来实现。其实这里也可以不那么麻烦，用一个圆角边框加上背景白色，再设置一个阴影效果就可以了。

    #Content{
    background:#fff;
    box-shadow:0 3px 5px#e4e4e4;
    border-radius:25px25px 0 0;
    }

效果图如下：
![1-3](/imgs/F2ELearnNote/1-3.png)

不过上面的这些解决方法有一个问题，就是都用到了 css3 中的新特性，在较老的浏览器中效果会大打折扣，要考虑到需求在决定用那种方法。
最后放上整体做好后的页面图，和最上面那张比一下，感觉还是不错的。
![1-4](/imgs/F2ELearnNote/1-4.png)
