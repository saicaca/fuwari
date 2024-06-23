---
title: css3选择器整理
published: 2015-01-22 04:16:33
tags:
  - CSS3
  - 学习笔记
category: 技术
---

## 属性选择器

- `E[att^="val"]`：选择`att`属性值以`val`**开头**的 E 元素。
- `E[att$="val"]`：选择`att`属性值以`val`**结尾**的 E 元素。
- `E[att*="val"]`：选择`att`属性值**包含**`val`的 E 元素。

<!-- more -->

## 结构性伪类选择器

**:root:** 根选择器，匹配元素所在文档的根元素。在`HTML`中，根元素始终为`<html>`。
**:not :** 否定选择器，选择某元素以外的所有元素。下面的代码，最终会为`type=button`的元素设置红色的背景。

    <style>
    	input:not([type="text"]){background-color: red};
    </style>
    <body>
    	<input type='text'>
    	<input type='text'>
    	<input type='button'>
    </body>

**:empty**: 空选择器，选择内容为空的元素。空元素为里面什么都没有的元素，包括空格。
**:target**: 目标选择器，匹配文档的 url 的某个标志符的目标元素。下面的代码可以给每个 a 添加点击事件，当点击 a1 时，id='a1'元素的背景会变成红色，其他同理。

    <style>
    	#a1:target{background-color: red}
    	#a2:target{background-color: blue}
    	#a3:target{background-color: yellow}
    </style>
    <body>
    	<a href="#a1">a1</a>
    	<a href="#a2">a2</a>
    	<a href="#a3">a3</a>
    	<div id="a1">a1</div>
    	<div id="a2">a2</div>
    	<div id="a3">a3</div>
    </body>

**:first-child**: 选择父元素的第一个子元素,`ul li:first-child`，选择 ul 下的第一个 li 元素。
**:last-child**: 与上一个选择相反，选择最后一个子元素。
**nth-child(n)**: 选择父元素下的一个或多个指定的子元素。其实 n 是一个参数，可以是一个数字，也可以是一个表达式。
选择 ul 下序号为偶数（即第二个和第四个，n 从零算起）的 li，并将其字体设置为黄色。

    li:nth-child(2n){color:yellow;}
    <ul>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    </ul>

**nth-last-child(n)**: 和上一个选择器相反，从父元素的最后一个子元素开始算起，来选择指定的元素。
**first-of-type**: 选择父元素下第一个指定 tpye 的元素，`div p:first-of-type`,选择一个 div 里的第一个 p 元素。
**nth-of-type(n)**: 与`nth-child(n)`类似，选择父元素中指定 type 的指定位置的元素。`div p:nth-of-type(3)`,选择 div 下第 3 个 p 元素。
**last-of-type**: 与`first-of-type`类似，不过选择是父元素下最后指定 type 的元素。
**nth-last-of-type(n)**: 与`nth-of-type(n)`类似，不同的是从父元素的后面开始选择。
**only-child**: `div p:only-child`当有多个 div 时，选择仅有一个元素的 div 下的 p 元素。
仅第一个 ul 下的 li 的颜色会变成橘色，其他 li 的不变。

    li:only-child{color: orange}
    <ul>
    	<li>你好</li>
    </ul>
    <ul>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    	<li>Hello World</li>
    </ul>

**only-of-type**: 与上一个类似，不同之处为选择父级下只有一个指定 type 的元素的子元素。

## 其他选择器

**:enable**: 表单中，有可用（“:enabled”）和不可用（“:disabled”）两种状态。此选择其选择可用状态的元素。
**:disbale**: 与上一个选择器类似，选择不可用状态的元素。
**checked**: 单选按钮和复选按钮都具有选中和未选中状态。此选择器选择选中状态下的按钮。
**selection**: 伪元素是用来匹配突出显示的文本(即用鼠标选则文本时的文本)。浏览器默认情况下，用鼠标选择网页文本是以“蓝色背景，白色字体”显示。`::selection{color:black;}`,将选中的文本夜色变为黑色。
**read-only**: 选择只读状态的元素。即设置了"readonly='readonly'",(在 html5 中为直接设置 readonly 的元素)。
**read-write**: 与 read-only 相反，选择处于可读写状态的元素。
**before**: 用来给元素前面插入内容。
**after**: 给元素后面插入内容。
