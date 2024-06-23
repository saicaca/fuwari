---
title: 知乎前端面试题解答
published: 2015-01-15 07:33:06
tags:
  - 前端
  - JavaScript
  - 面试题
category: 技术
---

### 第一题：请使用 Javascript 实现以下动态效果

> 可以使用任何你喜欢的方式和库，尽量使用你认为优雅的实现，并在代码完成说简要说明此方案的优点和不足。
> 这是我用原生`js`实现的，用到了`input`标签的`readonly`属性，实现如下：

<!-- more -->

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>第一题</title>
    <style>
      body {
        width: 900px;
        margin: 0 auto;
        line-height: 30px;
      }
      a {
        text-decoration: none;
      }
      .head {
        background-color: #059ed3;
      }
      .row {
        height: 30px;
        border-bottom: 1px solid #888;
      }
      input {
        margin-left: 10px;
        margin-top: 6px;
        border: none;
        outline: none;
        float: left;
      }
      .title {
        border: 1px solid #999;
      }
      a {
        float: right;
      }
      ###add {
        background-color: #cccccc;
        width: 100%;
        height: 30px;
      }
      ###add a {
        display: block;
        text-align: right;
        font-size: 14px;
        font-weight: bolder;
        color: #008000;
        margin-right: 10px;
      }
    </style>
  </head>
  <body>
    <div class="head">现在共有:<strong>4</strong> 个条目</div>
    <div id="list">
      <div class="row">
        <input type="text" value="标题" /><a href="javascript:;" class="change"
          >修改</a
        >
      </div>
      <div class="row">
        <input type="text" value="标题" /><a href="javascript:;" class="change"
          >修改</a
        >
      </div>
      <div class="row">
        <input type="text" value="标题" /><a href="javascript:;" class="change"
          >修改</a
        >
      </div>
      <div class="row">
        <input type="text" value="标题" /><a href="javascript:;" class="change"
          >修改</a
        >
      </div>
    </div>
    <div id="add"><a href="javascript:;">新增条目</a></div>
    <script>
      window.onload = function () {
        change()
        add()
      }
      change = function () {
        var list = document.getElementById("list")
        var titles = list.getElementsByTagName("input")
        var changes = list.getElementsByTagName("a")
        for (var i = titles.length - 1; i >= 0; i--) {
          titles[i].readOnly = "readonly"
        }
        for (var j = changes.length - 1; j >= 0; j--) {
          changes[j].index = j
          changes[j].onclick = function () {
            if (this.text == "修改") {
              this.text = "保存"
              titles[this.index].readOnly = ""
              titles[this.index].className = "title"
            } else {
              this.text = "修改"
              titles[this.index].readOnly = "readonly"
              titles[this.index].className = ""
            }
          }
        }
      }
      add = function () {
        var addBtn = document.getElementById("add").getElementsByTagName("a")[0]
        addBtn.onclick = function () {
          var newRow = document.createElement("div")
          newRow.className = "row"
          newRow.innerHTML =
            '<input type="text" value="未命名" /><a href="javascript:;" class="change">修改</a>'
          var list = document.getElementById("list")
          // console.log("click",list);
          // e = e || window.event;
          list.appendChild(newRow)
          change()
          // e.cancelBubble = true;
          update()
        }
      }
      update = function () {
        var list = document.getElementById("list")
        var lth = list.getElementsByTagName("div").length
        var count = document.getElementsByTagName("strong")[0]
        count.innerHTML = lth
      }
    </script>
  </body>
</html>
```

### 第二题：请说明要输出正确的 myName 的值要如何修改程序?并解释原因

```js
foo = function () {
  this.myName = "Foo function."
}
foo.prototype.sayHello = function () {
  alert(this.myName)
}
foo.prototype.bar = function () {
  setTimeout(this.sayHello, 1000)
}
var f = new foo()
f.bar()
```

因为`this`指向的是当前调用这个方法的对象,代码中`setTimeout`是一个全局函数,全写是`window.setTimeout`，所以`setTimeout(func,time)`中的 func 参数中的 this 应该指向 window。可以用如下的修改方法：

```js
foo.prototype.bar = function () {
  var That = this
  setTimeout(function () {
    That.sayHello()
  }, 1000)
}
```

### 第三题：请按下列要求写出相应的 Html 和 CSS

现有并列的三列布局结构，从左至右依次为 A, B, C, 宽度分别为 180px, 600px, 180px。要求在不改变 Html 结构的情况下用 CSS 实现：ABC，CBA，BAC 三种布局及在 CBA 排列下使 B 宽度自适应（三列总宽度 100%），不能使用针对浏览器的 CSS Hack.

```html
<!doctype html>
<html lang="zh-cn">
  <head>
    <meta charset="UTF-8" />
    <title>第三题</title>
    <style>
      .content {
        width: auto;
        margin: 0 auto;
        position: relative;
        height: 50px;
        overflow: auto;
      }
      .a {
        background-color: red;
        width: 160px;
      }
      .b {
        background-color: blue;
        width: 600px;
      }
      .c {
        background-color: yellow;
        width: 160px;
      }
      .a,
      .b,
      .c {
        height: 50px;
      }
      /*		ABC*/
      .a1,
      .b1,
      .c1 {
        float: left;
      }
      /*		CBA*/
      .c2 {
        position: absolute;
        top: 0;
        left: 0;
      }
      .a2 {
        float: right;
      }
      .b2 {
        margin-left: 160px;
        width: auto;
      }
      /*		BAC*/
      .b3 {
        float: left;
      }
      .a3 {
        position: absolute;
        top: 0;
        left: 600px;
      }
      .c3 {
        float: right;
      }
    </style>
  </head>
  <body>
    <p>
      从左至右依次为 A, B, C, 宽度分别为180px, 600px,
      180px。用CSS实现：ABC，CBA，BAC
      三种布局及在CBA排列下使B宽度自适应（三列总宽度100%）.
    </p>
    <p>ABC，结构</p>
    <div class="content">
      <div class="a a1">A</div>
      <div class="b b1">B</div>
      <div class="c c1">C</div>
    </div>
    <p>CBA,B宽度自适应</p>
    <div class="content">
      <div class="a a2">A</div>
      <div class="b b2">B</div>
      <div class="c c2">C</div>
    </div>
    <p>BAC结构</p>
    <div class="content">
      <div class="a a3">A</div>
      <div class="b b3">B</div>
      <div class="c c3">C</div>
    </div>
  </body>
</html>
```

### 总结

第一题中，因为用到了 readonly 属性，实现起来比较简单。但是根据原题目的演示，猜测到他的实现方法是动态的添加 input 标签，同时控制 input 的 display 属性来实现，感觉太麻烦就没有用那种方法。
第二题中，关于 js 中 this 的指向问题，我的理解还是不够深刻，需要继续深入了解。
第三题，很轻松的就解决了。
