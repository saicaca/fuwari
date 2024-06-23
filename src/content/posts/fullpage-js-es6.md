---
title: 用ES6重构fullPage
published: 2016-02-22 06:18:09
tags:
  - JavaScript
category: 技术
---

用 ES6 重写了 [fullpage-light.js](https://github.com/kisnows/fullpage)。
主要做了一下修改：

- 模块化：将整个文件问个成多个独立的模块，每个模块负责一个功能
- 新语法：替换一些新的语法，比如变量声明的 let,const,Object.assign 等
- 转码：因为目前浏览器还并不支持 ES2015,所以还需要用 Babel 做一下转码

## 模块化

根据功能，将整个文件分割成为了五个模块。

```
-bootstrap.js   //方法和功能
-constant.js    //一些常量
-event.js       //绑定的事件
-index.js       //入口
-utils.js       //工具函数
```

这样原来一个很大文件就被分割成为了五个独立的模块，每个模块只负责自己的功能就好，维护起来会方便很多。

## 新语法

除了用了 let,const 这个声明变量的关键字外，最主要还用 Object.assign 这个方法替换了下面这个函数

```javascript
/**
 * 扩展 Option 对象
 * @param {Object} Default 默认设置
 * @param {Object} Customize 自定义设置
 * @returns {Object} Default 扩展后的设置
 */
function extendOption(Default, Customize) {
  if (typeof Customize !== "object") {
    Customize = {}
  }
  for (var i in Customize) {
    if (Default.hasOwnProperty(i)) {
      Default[i] = Customize[i]
    }
  }
  return Default
}

options = extendOption(defaults, Customize)

//现在
options = Object.assign({}, defaults, Customize)
```

既然用到了 Object.assign，就来说说它吧。参考 MDN 上的定义：

<!--more-->

> Object.assign() 方法可以把任意多个的源对象所拥有的自身可枚举属性拷贝给目标对象，然后返回目标对象。
> Object.assign(target, ...sources)

也就是说，它可以把...sources 包含对象上所有可枚举的属性，复制到目标对象。这样浅拷贝一个对象就很容易了。

```javascript
var obj = { a: 1, b: 2 }
var copy = Object.assign({}, obj)
//
console.log(copy) //Object {a: 1, b: 2}
```

同时也可以用来合并若干的对象

```javascript
var a = {a:1}
var b = {b:1}
var c = {c:1}
var copy = Object.assign({},a,b,c)
copy
Object {a: 1, b: 1, c: 1}
```

但是需要注意的是继承属性和不可枚举属性是不能拷贝的，如果你尝试这么做，会发现虽然语句不会报错，但是继承属性和不可枚举的属性并没有拷贝成功。
兼容性上，目前 chrome 已经支持这个属性了，上面的例子都是在 chrome 控制台上实验过的。

## 转码

因为现在浏览器大多还不支持 ES2015 的语法，所以 webpack+Babel 来将代码转换为 ES5 的语法。这样，就可以直接在现代浏览器里面使用了。

# 总结

ES6 带来了很大的改进。比如 let 和 const 的块级作用域可以避免一些坑，合理使用箭头函数也可提高代码的可读性，以及 class,promise,module 等新特性，可以大大提高编程的快感。
虽然目前兼容性上还是有很多问题，但是有 babel 转码器的存在，也算是可以逐步从 ES3 和 ES5 过渡到 ES2015 了，尤其是最近在尝试用 React，发现用 ES2015 简直爽的飞起。
