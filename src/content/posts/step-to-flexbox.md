---
title: Flex 布局
category: 技术
date: 2016-05-05 00:10:43
tags:
  - flexbox
  - 学习笔记
---

第一次接触 flex 是在去年，当时是我第一次做手机项目，结果却因为兼容性问题给掉坑了。查了 can I use 发现它只支持到安卓 4.1, 然而我们的要求是要兼容到 4.0 才行的。
所以之后一直都没敢用，昨天听到有人说 flex 是可以支持到安卓 2.1 以上的。我不信，难道是我当时看错了？！
今天又去查了一下，发现确实是 4.1 啊。盯着屏幕想了半天，突然发现 Can I Use 上一个浏览器浏览器使用率，想着该不会直接把使用率低的浏览器给忽略掉了吧。打开设置一看，果真如此，于是把数据源改成中国，浏览器最小使用率 0.03% 果真 2.3 出来了。

![Can I USE](/imgs/step-to-flexbox/can-i-use.png)

既然如此，说明 flex 还是可以在生产环境中使用了。那么就好好在过一下它的用法吧。
Flex 就是弹性布局，任何一个元素都可以设置为 flex 布局，当一个元素被设置为 flex 布局后，它的子元素上 float, vertical-align 都会失效。

```css
div {
  display: flex;
}
```

# 基本概念

![base](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)

<!--more-->

[图片出自](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

就是说一个 flex 容器有两个轴，一个主轴一个交叉轴。每个轴都有自己对应的起始位置，主轴的起始分别为 main start 和 main end, 交叉轴的起始分别为 cross start 和 cross end.
容器内的项目会默认沿着主轴排列，从 main start 到 main end .

# felx 容器

容器上可以 6 个属性，分别为：

- flex-direction
- flex-wrap
- flex-flow
- justify-content
- align-items
- align-content

## flex-direction

决定主轴方向，也就是项目的排列方向。

### MDN 上的语法解释：

> ```css
> /* The direction text is laid out in a line */
> flex-direction: row;
> /* Like <row>, but reversed */
> flex-direction: row-reverse;
> /* The direction in which lines of text are stacked */
> flex-direction: column;
> /* Like <column>, but reversed */
> flex-direction: column-reverse;
> /* Global values */
> flex-direction: inherit;
> flex-direction: initial;
> flex-direction: unset;
> ```

### 实例

下面从左到右分别是 row, row-reverse, colum, colum-reverse. 可以明显的看出他们之间的区别。

<div><script async src="https://jsfiddle.net/kisnows/1ryjp43c/embed/result,html,css/"></script></div>

## flex-wrap

flex-wrap 定义内部的 item 是排列在一行还是说当超出时可以换行的属性。如果允许换行，这个属性也能让你控制堆叠的方向。

### 语法

> ```css
> flex-wrap: nowrap;
> flex-wrap: wrap;
> flex-wrap: wrap-reverse;
> ```

### 实例：

<script async src="https://jsfiddle.net/kisnows/3f7odnc6/embed/result,html,css/"></script>

## flex-flow

flex-flow 是 flex-direction 和 flex-wrap 的简写。
初始值：

- flex-directoin: row
- flex-wrap: nowrap

### 语法：

> ```css
> /* flex-flow: <'flex-direction'> */
> flex-flow: row;
> flex-flow: row-reverse;
> flex-flow: column;
> flex-flow: column-reverse;
> /* flex-flow: <'flex-wrap'> */
> flex-flow: nowrap;
> flex-flow: wrap;
> flex-flow: wrap-reverse;
> /* flex-flow: <'flex-direction'> and <'flex-wrap'> */
> flex-flow: row nowrap;
> flex-flow: column wrap;
> flex-flow: column-reverse wrap-reverse;
> ```

## justify-content

justify-content 用来定义浏览器如何计算主轴上 (main-axis) flex 内部的 item 之间的空隙。
对齐的过程会在长度和自动外编剧计算后进行，也就是说只要有一个设置了 flex-grow 不为 0 的弹性 (flexible) 元素，那么 justify-content 就不会起作用了。初始值为 flex-start.

### 语法：

> ```css
> /* Pack flex items from the start */
> justify-content: flex-start;
> /* Pack items from the end */
> justify-content: flex-end;
> /* Pack items around the center */
> justify-content: center;
> /* Distribute items evenly
> The first item at the start, the last at the end */
> justify-content: space-between;
> /* Distribute items evenly
> Items have equal space around them */
> justify-content: space-around;
> ```

### 实例：

<script async src="https://jsfiddle.net/kisnows/2etbfr66/embed/result,html,css/"></script>

## align-item

align-item 属性用来对齐当前 flex line 上的 flex 元素，和 justify-content 一样，不过是是在主轴的垂直方向上作用。初始值为 stretch.

### 语法

> ```css
> /* Align to cross-start */
> align-items: flex-start;
> /* Align to cross-end */
> align-items: flex-end;
> /* Center items in the cross-axis */
> align-items: center;
> /* Align the items' baselines */
> align-items: baseline;
> /* Stretch the items to fit */
> align-items: stretch;
> ```

###　实例

<script async src="https://jsfiddle.net/kisnows/jxbgepc2/embed/result,html,css/"></script>

## align-content

align-content 属性定义当交叉轴上有空间时，flex 元素在交叉轴上的对齐方式。对于单行的 flex 元素，这个属性没有作用。默认值为： stretch.

### 语法

> ```css
> /* Pack lines from the cross-axis start */
> align-content: flex-start;
> /* Pack lines to the cross-axis end */
> align-content: flex-end;
> /* Pack lines around the cross-axis center */
> align-content: center;
> /* Distribute lines along the cross-axis, start to end */
> align-content: space-between;
> /* Distribute lines along the cross-axis, equally spaced */
> align-content: space-around;
> /* Stretch lines to occupy the whole cross-axis */
> align-content: stretch;
> ```

### 实例

<script async src="https://jsfiddle.net/kisnows/dhjrbm1o/1/embed/result,html,css/"></script>

# flex 项目（子元素）

flex 项目上同样可以设置 6 个属性：

- order
- flex-grow
- flex-shrink
- flex-basis
- align-self
- flex

## order

定义项目在主轴上的优先级，越小越靠前。默认为 0.

## flex-grow

定义项目的拉伸因子，就是计算这个项目如何来占据剩余的空间。默认为 1.

## flex-shrink

定义项目的因子。默认为 1.

### order,flex-grow,flex-shrink 实例

<script async src="https://jsfiddle.net/kisnows/Lxz9wj7n/4/embed/result,html,css/"></script>

## flex-basis

flex-basis 定义在初试阶段 flex 占据主轴空间的基础。这个属性决定了 content-box 的尺寸，除非你修改了 box-sizing. 初始值为 auto.

### 语法

> ```css
> /* Specify <'width'> */
> flex-basis: 10em;
> flex-basis: 3px;
> flex-basis: auto;
> /* Intrinsic sizing keywords */
> flex-basis: fill;
> flex-basis: max-content;
> flex-basis: min-content;
> flex-basis: fit-content;
> /* Automatically size based on the flex item’s content */
> flex-basis: content;
> ```

### 实例

<script async src="https://jsfiddle.net/kisnows/3zmppe13/embed/result,html,css/"></script>

## flex

flex 是一个定义项目改变尺寸能力的一个缩写属性。
默认值：

- flex-grow: 0
- flex-shrink: 1
- flex-basis: auto

### 语法

> ```css
> /* 0 0 auto */
> flex: none;
> /* One value, unitless number: flex-grow */
> flex: 2;
> /* One value, width/height: flex-basis */
> flex: 10em;
> flex: 30px;
> flex: auto;
> flex: content;
> /* Two values: flex-grow | flex-basis */
> flex: 1 30px;
> /* Two values: flex-grow | flex-shrink */
> flex: 2 2;
> /* Three values: flex-grow | flex-shrink | flex-basis */
> flex: 2 2 10%;
> ```

## align-self

定义项目的对齐方式，会覆盖 align-items 属性。如果只要有一个项目的交叉轴外边距设置为 auto, 那么 align-self 就会被忽略。默认值为 auto.

### 语法

和 align-items 相同

### 实例

<script async src="https://jsfiddle.net/kisnows/raagzpbz/embed/result,html,css/"></script>
<style>
	iframe {
		min-height: 300px;
	}
</style>
