---
title: Canvas 基础
published: 2015-10-20 06:41:38
tags:
  - canvas
category: 技术
---

首先引用 `MDN` 上对于 `canvas` 的定义：

> `<canvas>` 是 HTML5 新增的元素，可使用 JavaScript 脚本来绘制图形。例如：画图，合成照片，创建动画甚至实时视频处理与渲染。

也就是说这是浏览器提供给我们的一个画布和丰富的接口，可以用来制作各种复杂的效果。
`<canvas>` 元素创造了一个固定大小的画布，它公开了一个或多个渲染上下文。其可以用来绘制和处理被现实的页面。
![Canvas坐标](https://mdn.mozillademos.org/files/224/Canvas_default_grid.png)
这是 canvas 2d 的坐标，可以看到左上角为原点，横轴为 x 轴，纵轴为 y 轴。我们所有的 canvas2d 的功能实现都是在这个坐标系中。

# 基本用法

本文只简单介绍一下矩形、线段和圆弧的画法。

## 矩形

通过一个简单的例子来了解一下基本的 API：

### HTML:

```html
<canvas id="canvas" style="height:100%">
  当前浏览器不支持Canvas，请更换浏览器后再试
</canvas>
```

### JavaScript:

```js
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var WINDOW_WIDTH = window.screen.availWidth
var WINDOW_HEIGHT = window.screen.availHeight
ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
ctx.beginPath()
ctx.fillStyle = "#000"
ctx.fillRect(10, 10, 55, 50)
ctx.fillStyle = "rgba(0,0,200,0.5)"
ctx.fillRect(30, 30, 55, 50)
```

页面上会如下显示：

<iframe width="100%" height="300" src="//jsfiddle.net/kisnows/v5Lhnf8k/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

首先获取到 canvas 元素，并通过 getContext('2d') 获取到它的渲染上下文。

<!--more-->

### clearRect(x, y, width, height)

清空指定区域，如果需要做动画的话，每次重新渲染前都需要调用这个函数来清除前一帧的内容。

### beginPath()

新建一条路径

### fillStyle

用来设置要填充的颜色

### ctx.fillRect(10, 10, 55, 50);

以 x 轴等于 10，y 轴等于 10 为起点，绘制一个宽 55 高 50 的矩形。

### strokeRect(x,y,width,height)

跟 fillRect 不同的地方在于，strokeRect 会绘制一个矩形的边框，如下：

<iframe width="100%" height="300" src="//jsfiddle.net/kisnows/87jtz89q/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 线段

绘制一个三角形

```javascript
ctx.beginPath()
ctx.moveTo(75, 50)
ctx.lineTo(100, 75)
ctx.lineTo(100, 25)
ctx.closePath()
ctx.stroke()
```

<iframe width="100%" height="300" src="//jsfiddle.net/kisnows/6n0emmf3/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### moveTo(x,y)

定义一个起点，从这个点开始绘制

### lineTo(x,y)

绘制一条从当前位置到指定 x 以及 y 位置的直线

### closePath()

闭合当前路径，也可以用 lineTo 到起点来代替

### storke()

根据已有路径的来绘制线段，也就是说如果不执行 stroke(),那么画布上什么都没有。

## 圆弧

### arc(x, y, radius, startAngle, endAngle, anticlockwise)

该方法有五个参数： x,y 为绘制圆弧所在圆上的圆心坐标。radius 为半径。startAngle 以及 endAngle 参数用弧度定义了开始以及结束的弧度。这些都是以 x 轴为基准。参数 anticlockwise 为一个布尔值。为 true 时，是逆时针方向，否则顺时针方向。
看个直观的例子：

```javascript
ctx.beginPath()
ctx.arc(75, 75, 50, 0, Math.PI * 2, true)
ctx.moveTo(110, 75)
ctx.arc(75, 75, 35, 0, Math.PI, false)
ctx.moveTo(65, 65)
ctx.arc(60, 65, 5, 0, Math.PI * 2, true)
ctx.moveTo(95, 65)
ctx.arc(90, 65, 5, 0, Math.PI * 2, true)
ctx.stroke()
ctx.clearRect(0, 0, 500, 500)
for (var i = 0; i < 4; i++) {
  for (var j = 0; j < 3; j++) {
    ctx.beginPath()
    var x = 20 + j * 40
    var y = 20 + i * 40
    var radisu = 20
    var startAngle = 0
    var endAngle = Math.PI + (Math.PI * j) / 2
    var anticlockwise = i % 2 == 0 ? true : false
    ctx.arc(x, y, radisu, startAngle, endAngle, anticlockwise)
    if (i > 1) {
      ctx.fill()
    } else {
      ctx.stroke()
    }
  }
}
```

<iframe width="100%" height="300" src="//jsfiddle.net/kisnows/z6ywoj8g/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
通过这个例子可以看清楚的看到 fill 和 stroke 这个两个函数的区别，前者渲染边框，后者填充整个指定区域。同时可以区分，anticlockwise 分别 true 和 false 时渲染的机制，前者为逆时针，后者为顺时针。

# 总结

仅仅通过这三个基础的用法，就可以制作出很多漂亮的动画了。我这里做了一个简单运动的小球，同时做了边界判定。

<iframe width="100%" height="400" src="//jsfiddle.net/kisnows/jkLgatsm/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

参考文章： [MDN-Canvas](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
