---
title: ECMAScript6学习简记（二）- 数组扩展
category: 技术
date: 2015-09-02 21:39:20
tags:
  - 学习笔记
  - es6
---

# Array.from()

将类数组或可迭代对象转换为真正的数组。

## 可转换的类别

### Dom 集合

```js
let ps = document.querySelectAll("p") //通过Array.from 转换后可以使用forEach方法
Array.from(ps).forEach(function (p, index) {
  "use strict"
  console.log(p, index)
})
```

### arguments 对象

```js
function foo() {
  "use strict"
  var args = Array.from(arguments) //可以替代以前下面这种方式来转换
  var argvs = Array.prototype.slice.call(arguments)
  console.log(argvs, args)
}
foo(1, 2, 3, 4) //[ 1, 2, 3, 4 ] [ 1, 2, 3, 4 ]
```

<!-- more -->

### 拥有`length`属性的对象

```js
var obj = {
  0: "a",
  1: "b",
  2: "c",
  length: 3,
}
var obj1 = {
  0: "a",
  1: "b",
  2: "c",
}
console.log(Array.from(obj)) //['a','b','c']
console.log(Array.from(obj1)) //[] 没有length属性，无法转换
```

注意，对象的属性值必须是数字，否则转换的数组内容都是`undefined`

```js
let obj2 = {
  a: 1,
  b: 2,
  c: 3,
  length: 3,
}
console.log(Array.from(obj2)) //[ undefined, undefined, undefined ]
```

## 同时 Array.from()接受第二个参数，作用类似于 map 方法

```js
console.log(Array.from(obj, (x) => x + "1")) //[ 'a1', 'b1', 'c1' ]  类似于map方法
```

#Array.of()
可将一组值转换为数组

```js
Array.of(3, 12, 2, 3, 24, 2) //[ 3, 12, 2, 3, 24, 2 ]    将一组值转换为数组
Array.of(3, "12", [2], 3, 24, 2) //[ 3, '12', [ 2 ], 3, 24, 2 ]
```

这个方法的目的是为了弥补数组构造函数的 Array()的不足，因为当参数个数不同时，它会产生不同的效果

```js
Array(8) // [ , , , , , , ,  ]
Array(3, 11) // [3, 11]
```

# find()和 findIndex()

> 数组实例的 find 方法，用于找出第一个符合条件的数组成员。它的参数是一个回调函数，所有数组成员依次执行该回调函数，直到找出第一个返回值为 true 的成员，然后返回该成员。如果没有符合条件的成员，则返回 undefined。

```js
var found = [1, 2, 3, 4, -1].find((n) => n < 0) //find 找出第一个返回值为true的成员
var founded = [1, 2, 3, 4, -1].find(function (b) {
  return b > 3
})
console.log("result:", found, founded) //result: -1 4
```

findIndex 返回第一个符合条件的值的`index`,如果没找到则返回 -1.

```js
var foundIndex = [1, 2, 324, 5, 34].findIndex(function (value, index, arr) {
  "use strict"
  return value > 100
})
console.log(foundIndex) //2
```

这两个方法都可以发现`NaN`，而`IndexOf`是不能发现的。

```js
console.log([2, 3, 4, NaN].indexOf(NaN)) //-1
console.log([1, 2, NaN].find((value) => Object.is(NaN, value))) //NaN
console.log([1, 2, 3, 4, NaN].findIndex((value) => Object.is(NaN, value))) //4
```

# Array.fill()

使用给定值，填充一个数组

```js
;[1, 2, 3, 4].fill("a") //[ 'a', 'a', 'a', 'a' ]
new Array(6).fill(3) //[ 3, 3, 3, 3, 3, 3 ]
```

fill()还可以接受第二个和第三个参数，用于指定填充的起始位置和结束位置。

```js
;[1, 2, 3, 4]
  .fill(8, 1, 2) //[1,8,3,4]
  [(1, 2, 3, 4)].fill(8, 1, 3) //[ 1, 8, 8, 4 ]
```

# entries()，keys()和 values()

这三个方法都是用来遍历数组，可以使用`for...of`来进行遍历，`keys()`用来遍历键名，`values()`用来遍历键值，`entries()`对键值对遍历。

```js
for (let index of ["a", "b"].keys()) {
  console.log(index)
}
// 0
// 1

for (let elem of ["a", "b"].values()) {
  console.log(elem)
}
// 'a'
// 'b'

for (let [index, elem] of ["a", "b"].entries()) {
  console.log(index, elem)
}
// 0 "a"
// 1 "b"
```

个人感觉意义不大，和以前的`forEach`是一样的功能，有个不同的地方是如果不适用`for...of`遍历的话，可以使用`next`来手动遍历。

```js
let word = ["h", "e", "l", "l", "o"]
let entries = word.entries()
console.log(entries.next().value)
;[0, "h"]
console.log(entries.next().value)
;[1, "e"]
```

# 其他方法

这些都属于 ES7 要实现的内容

## include

判断一个数组是否包含给定的值，返回的是一个布尔值。

## 数组推导

感觉这里跟`python`越来越像了。

```js
var a1 = [1, 2, 3, 4];
var a2 = [for (i of a1) i * 2];
a2 // [2, 4, 6, 8]
```

for...of 后面还可以附加 if 语句，用来设定循环的限制条件。

```js
var years = [ 1954, 1974, 1990, 2006, 2010, 2014 ];

[for (year of years) if (year > 2000) year];
// [ 2006, 2010, 2014 ]

[for (year of years) if (year > 2000) if(year < 2010) year];
// [ 2006]

[for (year of years) if (year > 2000 && year < 2010) year];
// [ 2006]
```

## Array.observe()，Array.unobserve()

用于监听和数组的变化，制定回调函数。
比较期待这个方法，作用会很大。

#版权
文章中所有代码皆来自或演变自：

[阮一峰-ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/),
本文同样遵循[署名-非商用许可证](http://creativecommons.org/licenses/by-nc/4.0/).
