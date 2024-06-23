---
title: 轻量级fullPage整屏滚动框架V1.3发布
date: 2015-10-14 04:23:40
tags:
  - JavaScript
  - project
category: 技术
---

# 项目初衷

前段时间接到一个新的项目，是一个整屏滚动的单页应用。

本来打算完全自己写的，但是由于项目时间吃紧，就用了[fullpage](https://github.com/alvarotrigo/fullPage.js)这个框架。这个框架确实很强大，几乎你想要的 API 它都有，所以用起来也很方便。

但是它也有几个缺点，第一它必须依赖 `jQuery`,而且文件体积也比较庞大，对于移动端来说不是很友好。于是自己就抽出业余时间，写了这个项目。

[项目地址](https://github.com/kisnows/fullpage-light.js)

[一个简单的 DEMO](http://kisnows.com/fullpage-light.js/)

# changeList

V1.3.0

- 修复对 firefox 的支持
- 添加页面导航控制
- 解决一些 bug

V1.1.0

- 添加自动播放
- 添加循环播放

V1.0.0

- 支持移动端触摸控制
- 添加 slide 水平滑动
- 添加 PC 端键盘控制和鼠标滚轮控制
- 提供实用的 API 方便开发

# 简介

一个轻巧的`fullpage`框架，不依赖其他任何库，主要针对移动端设备（同时也支持桌面端），压缩后不到 4kb。
轻松创建炫酷的单页滑动网站。

<!--more-->

# 兼容性

| Android 4.1+ | Safari 7.1+ | IE Edge | Opera | Chrome |
| ------------ | ----------- | ------- | ----- | ------ |

# 使用方法

- 引入 JavaScript 文件 `fullpage.js`
- 引入 css 文件 `fullpage.css`（如果你使用`less`，则可以在 less 主文件中引入`fullpage.less`）
- 按照下面格式书写`html`代码（其中 id 为 `sectionContent` 的为包裹层，你可以自定义修改其 id）

```
<div id="sectionContent" class="fp-section-content">
        <div class="fp-section">
            <div class="fp-slide-wrap">
              <div class="fp-slide">1</div>
              <div class="fp-slide">2</div>
              <div class="fp-slide">3</div>
              <div class="fp-slide">4</div>
              <div class="fp-slide">5</div>
            </div>
          </div>
        <div class="fp-section">2</div>
        <div class="fp-section">3</div>
    </div>
```

# 初始化

简单使用，只要在页面加载完成后执行：

```
fullpage.init('#sectionContent');
```

如果需要定制化，则需要如下方法：

```
 fullpage.init('#sectionContent',{
        threshold: 10,              //触发滚动事件的阈值，越小越灵敏
        pageSpeed: 600,             //滚屏速度，单位为毫秒 ms
        afterLoad: null,            //页面载入事件，具体查看下面的 afterLoad 函数
        beforeLeave: null           //页面离开事件，具体查看下面的 beforeLeave 函数
    });
```

##beforeLeave(leaveIndex,nowIndex)
离开当前页面时触发的事件，函数中 `this` 指向当前页面的 `section`,`leaveIndex`为要离开页面的 `index` ，`nowIndex` 为要载入页面的 `Index`
##afterLoad(afterIndex)
载入下一张页面后触发的事件，函数中 `this` 指向将要载入页面的 `section`, `afterIndex` 为要载入页面的 `index`

```javascript
fullpage.init("#sectionContent", {
  beforeLeave: function (leaveIndex, nowIndex) {
    //如果现在在第1个页面，向下滚动后
    if (nowIndex === 2) {
      //leaveIndex = 1,nowIndex = 2
      console.log("You will leave page 2") //这条语句会执行
    }
    console.log(this, leaveIndex, nowIndex) //这里的 this 指向将要离开的页面元素，即第一个页面
  },
  afterLoad: function (afterIndex) {
    //afterIndex = 2
    if (afterIndex === 2) {
      console.log("You will go to page 2") //这条语句会执行
    }
    console.log(this, afterIndex) //此处 this 指向当前载入的页面，即第二个页面
  },
})
```

# 方法

##init(el,options)
页面初始化，`el`为最外包裹层选择器，`options`是要定制的参数。具体同[初始化](#初始化)
##moveTo(index,slideIndex)
滚动到指定页面,`index` 为必选参数，`slideIndex`为可选参数

```javascript
fullpage.moveTo(1) //滚动到第一个页面
fullpage.moveTo(3, 2) //滚动到第三个页面的第二个slider
```

##moveToNext(callback)
垂直滚动到下一个页面,`callback`为回掉函数，可选。

```javascript
    fullpage.moveToNext();            //滚动到下一个页面
    fullpage.moveToNext(callback)     //滚动到下一个页面后，执行 callback
    fullpage.moveToNext(callback,params...)   //滚动到下一个页面后，执行 callback,params为callback的参数，根据情况传入
    function foo(a,b){
        console.log(a,b)
    }
    fullpage.moveToNext(foo,1,2)              //滚动到下一个页面，并输出 1，2
```

## moveToPre(callback)

垂直滚动到上一个页面，用法同 `moveToNext(callback)`

## slideToNext()

水平滚动到下一个页面（页面向左滚动）

## slideToPre()

水平滚动到上一个页面（页面向右滚动）

# TODO

- ~~添加滚动到指定页面方法~~
- ~~页面滚动时，页面载入或离开时添加自定义事件~~
- ~~横屏滚动支持~~
- ~~添加鼠标滚轮控制~~
- ~~添加键盘控制~~
