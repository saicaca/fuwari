---
title: ECMAScript6学习简记（一）-变量声明·字符串扩展·数值扩展
published: 2015-08-21 18:19:59
tags:
  - 学习笔记
  - es6
category: 技术
---

# let 和 const 命令

## let 命令

let 声明的变量，只存在与所声明的代码块内。

```javascript
{
  let a = 10
  var b = 11
}
console.log(a) //ReferenceError: a is not defined
console.log(b) //11
```

可以看到，在代码块外面，是不能访问到用 let 声明的变量，也就是说 let 声明的变量是基于块级作用域的。这样就可以避免一些变量声明的问题。

```javascript
var arr = [1, 2, 3]
for (let i = 0; i < arr.length; i++) {}
console.log(i) //ReferenceError: a is not defined
```

可见上面的的代码 for 循环外面是不能访问到变量 i 的。

<!-- more -->

而下面的代码用 var 声明，最后会输出 10。

```javascript
var a = []
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]() // 10
```

而如果使用 let，则会输出 6。而以前要做到这样，可能会需要使用立即执行函数才行。

```javascript
var a = []
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]() // 6
```

而且 let 不会像 var 一样发生‘变量提升’现象。

```javascript
function a(){
    console.log(b)  //ReferenceError
    let b = 2;
}
function c(){
    console.log(d); //undefined
    var d = 2;
```

在块级作用域内，使用 let 声明的变量，会当定在这个区域，不会受到外部的影响。

```javascript
var temp = 123
let temp1 = 222
var temp2 = 555
if (true) {
  let temp = 333
  let temp1 = 444
  console.log(temp) //333
  console.log(temp1) //444
  console.log(temp2) //ReferenceError
  let temp2 = 555
}
```

let 在一个作用域内不允许重复声明同一个变量

```javascript
function(){
    let a = 10;
    var a = 1;
}
function(){
    let a = 11;
    let a = 212;
}
```

## const 命令

const 同 let 类似，只是用 const 声明的变量是常量，一旦声明就不可更改。

```javascript
const a = 1;
a; //1
a = 3;
a; //1
const a = 12;
a; //1
```

需要注意的是，const 命令只是指向变量所在的地址，所以将对象声明为常量时需要注意。

```javascript
const foo = {}
foo.prop = 1
foo.prop //1
const a = []
a.push("Hello") // 可执行
a.length = 0 // 可执行
a = ["Dave"] // 报错
```

> 上面代码中，常量 foo 储存的是一个地址，这个地址指向一个对象。不可变的只是这个地址，即不能把 foo 指向另一个地址，但对象本身是可变的，所以依然可以为其添加新属性。

也就是说将一个对象或数组声明为常量时，它本身是不可赋值的，但是可以给它添加方法。因为不变的只是它本身的地址。

## 全局对象的属性

> ES6 规定，var 命令和 function 命令声明的全局变量，属于全局对象的属性；let 命令、const 命令、class 命令声明的全局变量，不属于全局对象的属性。

```javascript
var a = 1
// 如果在node环境，可以写成global.a
// 或者采用通用方法，写成this.a
window.a // 1
let b = 1
window.b // undefined
```

# 变量的解构赋值

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构。感觉这里跟 python 挺像的。

## 数组的解构赋值

```javascript
var [a, b] = [1, 2]
console.log(a, b)
//1 2
let [c, d] = [3, 4]
console.log(c, d)
//3 4
```

实际上，它属于‘模式匹配’，也就是说，只要等号两边的模式相同，那么左边的变量就会被赋予相应的值。

```javascript
var [a, b, [c, d]] = [1, 2, [3, 4]]
//a = 1,b = 2,c = 3,d = 4
var [aa, bb, cc] = [, , 3]
//aa = undefined,bb = undefined,cc = 3;
let [one, ...more] = [1, 2, 3, 4, 5, 6]
//one = 1,more = [2,3,4,5,6]
```

可以看到上面的代码，只要他们的结构相同，那么左边相应位置的变量就会被赋值为右边的对应的值。如果没有对应的值，那么就是 `undefined`.
以下情况属于解构不成功，都会报 TypeError 的错，然后变量的值会等于 undefined.

> 以上几种情况都属于解构不成功，foo 的值都会等于 undefined。这是因为原始类型的值，会自动转为对象，比如数值 1 转为 new Number(1)，从而导致 foo 取到 undefined。

```javascript
var [foo] = [];
var [foo] = 1;
var [foo] = false;
var [foo] = NaN;
var [bar, foo] = [1];
let [foo] = undefined;
let [foo] = null;
```

解构赋值允许指定默认值。当数组成员严格等于 undefined 时，默认值就会生效。

```javascript
var [foo = true] = []
foo[(x, (y = "b"))] = // true
  ["a"][(x, (y = "b"))] = // x='a', y='b'
  ["a", undefined][(x, (y = "b"))] =
    // x='a', y='b'
    [1, null] // x= 1,y=null
```

## 对象的解构赋值

结构同样作用于对象,于数组不同的地方在于：数组的元素的取值由它的位置决定；对象属性因为没有顺序，所以变量名需要与属性同名，才能取到正确的值。

```javascript
var { foo, bar } = { foo: "aaa", bar: "bbb" }
foo // "aaa"
bar // "bbb"
//注意两者区别
var { foo, bar } = { bar: "aaa", foo: "bbb" }
foo // "bbb"
bar // "aaa"
var { fos } = { foo: "aaa" }
fos // undefined
```

可以看到上面的代码，赋值只与属性名有关，与顺序无关。如果属性名对不上，就会等于 `undefined`.
而如果需要在变量名与属性名不一致情况下赋值，需要用下面的方法。

```javascript
var { foo: abs } = { foo: "sss" }
abs // 'sss'
```

同样也可以对有嵌套结构的对象解构

```javascript
let obj = {
  p: ["Hello", { y: "World" }],
}
let {
  p: [x, { y }],
} = obj
console.log(x, y)
//Hello World
```

和数组一样，对象的解构也可以指定默认值，只要对要赋值对象相对应的对象属性严格等于 `undefined`，默认值就会成立。

```javascript
var { a = 3 } = {}
a //3
var { b = 4, y } = { y: 4 }
b, y //4,4
```

对象的解构赋值给我们提供了较大的方便。

```javascript
var obj = {
  method1: function () {},
  method2: function () {},
}
var { method1, method2 } = obj
//以前的写法
var method1 = obj.method1
var method2 = obj.method2
```

## 字符串的解构赋值

字符串同样可以进行解构，在进行解构的时候，字符串会被转换成类数组对象。

```javascript
let [f, g, h] = "length"
console.log(f, g, h)
//l,e,n
let { length: len } = "length"
console.log(len)
//6
```

## 函数参数的解构赋值

函数参数是一个类数组对象，同样可以解构赋值

```javascript
function a([x, y]) {
  return x + y
}
add([1, 2]) //3
```

也同样可以设置默认值

```javascript
function move({x=0,y=0}={}){
    "use strict";
    console.log([x,y]);
}
move({x:3,y:4});        //[3,4]
move({x:3});            //[3,0]
move({});               //[0,0]
move();                 //[0,0]
function remove({x,y}={x:0,y:0}){
    "use strict";
    console.log(x,y);
}
remove({x:1,y:2});      //1,2
remove({x,y});          //Hello World
remove({});             //undefined undefined
remove();               // 0 0
```

函数参数的解构方法会根据参数类型来自动选择，数组就按照数组解构，对象就按照对象解构。

```javascript
function fc([x,y,z]){
    "use strict";
    console.log(x,y,z);
}
fc([1,2,3]);     //1,2,3
function nf({x,y,z}){
    "use strict";
    console.log(x,y,z);
}
nf({y:1,z:2,x:3});    //3,1,2
```

## 用途

### 提取 JSON 数据

```javascript
var jsonDate = {
  id: 42,
  status: "notOK",
  data: [12, 32],
}
let { id, status, data } = jsonDate
console.log(id, status, data) //42 'notOK' [12,32]
```

###遍历 Map 结构

```javascript
var map = new Map()
map.set("first", "HELLO")
map.set("second", "WORLD")
for (let [key, value] of map) {
  console.log(key + " is " + value)
}
// first is HELLO
// second is WORLD
for (let key of map) {
  console.log(key)
}
//['first','HELLO']
//[ 'second', 'WORLD' ]
```

# 版权

文章中所有代码皆来自或演变自：

[阮一峰-ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/),
本文同样遵循[署名-非商用许可证](http://creativecommons.org/licenses/by-nc/4.0/).
