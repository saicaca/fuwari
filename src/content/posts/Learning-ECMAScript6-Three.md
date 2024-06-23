---
title: ECMAScript6学习简记（三）- 函数扩展
date: 2015-09-09 05:24:03
tags:
  - 学习笔记
  - es6
category: 技术
---

# 1.函数参数默认值

以前我们经常会些下面的代码

```javascript
function doS(e) {
  e = e | window.e
  //doSomeThing with e
}
```

通过这样的方法来给函数设置默认值，这样有一个缺点就是，如果传进来的参数对应的布尔值为`false`，比如空字符串或者 0，那就尴尬了。

所以如果我们还想上面的代码得到正确的结果，就需要对 e 在做一个判断，判断它是否被赋值了。

这样会很麻烦，所以 ES6 有了新的方法，如下

```javascript
function doS(e = window.e) {
  //doSomeThing with e
}
```

这样不尽代码简短了很多，而且可读性大大提高，看代码的人可以一样看到那些参数是有默认值的。

<!--more-->

同时，默认值的设置也非常人性化

```javascript
function get(url,{body='',method='GET'){
    console.log(method);
}
```

上面的代码中，传入第二个参数是一个对象，我们可以给对象的属性设置默认值。

> 甚至还可以设置双重默认值。

```javascript
fetch(url, { method = 'GET' } = {}){
  console.log(method);
}
```

上面代码中，调用函数 fetch 时，如果不含第二个参数，则默认值为一个空对象；如果包含第二个参数，则它的 method 属性默认值为 GET。

参数的默认值设置同样支持解构赋值，

```javascript
function ha({ x, y = 5 }) {
  console.log(x, y)
}
ha() //TypeError: Cannot read property 'x' of undefined
ha({}) //undefined 5
ha({ x: 1 }) //1 5
ha({ x: 1, y: 2 }) //1 2
```

定义默认值的参数，必须在参数的尾部，因为有了默认之后参数可以被省略，而只有位于尾部，函数才能判断到底省略了那个参数。

如果给设置默认值的参数传入`undefined`和`null`,前者该函数会触发默认值，而后者不会。

```javascript
function a(b = 1, c = 2) {
  console.log(b, c)
}
a(undefined, null)
//1 null
```

需要注意的是，如果设置了默认值，那么函数的`length`属性会失真

```javascript
> (function a(a,b){}).length
2
> (function b(a,b,c){}).length
3
> (function c(a,b,c=1){}).length
2
> (function e(a,b=1,c=1){}).length
1
```

可以看到，没设置默认值的时候，函数的`length`等于它的参数个数，而设置了默认值之后，它的`length`值等于没有设置默认值的参数的个数。

# 2.rest 参数

rest 参数用于获取函数的多余变量，这样可以避免使用 arguments 对象。

```javascript
function add(...values) {
  let sum = 0;
  values.forEach(function(value){
    sum += value;
    });
  return sum;
}
> add(1,2,3,4,5)
15
```

可以看到，该函数可以返回传入参数的和。同时，注意到 rest 参数其实是一个数组，所以数组的方法它都可以使用，所以上面代码中的`forEach`是可以使用的。

需要注意的是，rest 参数同参数的默认值一样，必须在参数的最后。而函数的`length`属性是不包括 rest 参数的。

```javascript
;(function (a) {})
  .length(
    // 1
    function (...a) {}
  )
  .length(
    // 0
    function (a, ...b) {}
  ).length // 1
```

# 3.扩展运算符

扩展运算符，符号三个点（...），它可以看作是 rest 参数的你运算，可以讲一个数组转为用逗号分割的参数序列。

```javascript
> let array = [1,2,34];
> console.log(...array)
1 2 34
> console.log(11,22,...array,4)
11 22 1 2 34 4
```

该运算符主要用于函数的调用。

```javascript
function push(array, ...items) {
  array.push(...items)
}
function add(x, y) {
  return x + y
}
var numbers = [4, 38]
add(...numbers) // 42
```

> 上面代码中，array.push(...items)和 add(...numbers)这两行，都是函数的调用，它们的都使用了扩展运算符。该运算符将一个数组，变为参数序列。

> 由于扩展运算符可以展开数组，所以不再需要 apply 方法，将数组转为函数的参数了。

```javascript
// ES5的写法
function f(x, y, z) {}
var args = [0, 1, 2];
f.apply(null, args);
// ES6的写法
function f(x, y, z) {}
var args = [0, 1, 2];
f(...args);
```

一个实际的例子：

```javascript
> let a=[1,23,12,31,23,12,31,23,123,12,31,24,]
'use strict'
> Math.max(...a)
123
//ES5要实现同样的功能则需要
Math.max.apply(null,a);
```

扩展运算符可以简化很多种 ES5 的写法

    ```javascript
    // ES5
    [1, 2].concat(more)
    // ES6
    [1, 2, ...more]

    // ES5
    list.push.apply(list, [3, 4])
    // ES6
    list.push(...[3, 4])

    // ES5
    list = [1,2,3,4]
    var a = list[0], rest = list.slice(1)
    a = 1,rest = [2,3,4]
    // ES6  这里是用到了解构赋值
    var [a, ...rest] = list
    a = 1,rest = [2,3,4]
    // ES5
    new (Date.bind.apply(Date, [null, 2015, 1, 1]))
    // ES6
    new Date(...[2015, 1, 1]);
    ```

需要注意的是，如果将扩展运算符用于数组赋值，只能放在参数的最后，否则会报错。（这是肯定的嘛，否则程序怎么知道扩展运算符的长度是多少）。

扩展运算符可以将字符串转为数组(Array.from()也可以)。

```javascript
> [...'hello']
[ 'h', 'e', 'l', 'l', 'o' ]
```

# 4.箭头函数

## 基本用法

使用‘箭头’来快速定义函数

```javascript
let fn = (f) => f
```

相当于

```javascript
let fn = function (f) {
  return f
}
```

当不需要参数的时候，或参数大于一个的时候，用括号代表参数部分：

    ```javascript
    var f = () => 5;
    //等于
    var f = function(){return 5};

    var sum =(sum1,sum2) => num1 + num2;
    //等于
    var sum = function(sum1,sum2){
        return sum1+sum2;
    }
    ```

总之箭头后面就是函数要`return`的内容。
当箭头函数的代码块部分多余一条语句的时候，需要用大括号括起来，并且使用`return`返回。而由于大括号被解释为代码块，所以如果箭头函数需要返回对象的时候，必须在对象外面加上括号，否则会被解释为代码块。

```javascript
var sum = (num1, num2) => {
  return num1 + num2
}
var sum1 = (sumI) => ({ su1: "1", su2: "2" })
```

同样，箭头函数可以配合变量的解构赋值。

```javascript
let person = ({you,i}) => you + 'love' + i;
> person({you:'y',i:'i'})
'ylovei'
//等于
var person = function(obj){
    return obj.you +'love'+obj.i;
}
```

> 使用注意点
> 箭头函数有几个使用注意点。

> （1）函数体内的 this 对象，绑定定义时所在的对象，而不是使用时所在的对象。

> （2）不可以当作构造函数，也就是说，不可以使用 new 命令，否则会抛出一个错误。

> （3）不可以使用 arguments 对象，该对象在函数体内不存在。如果要用，可以用 Rest 参数代替。

> （4）不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。

> 上面四点中，第一点尤其值得注意。this 对象的指向是可变的，但是在箭头函数中，它是固定的。下面的代码是一个例子，将 this 对象绑定定义时所在的对象。

# 版权

文章中所有代码皆来自或演变自：

[阮一峰-ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/),
本文同样遵循[署名-非商用许可证](http://creativecommons.org/licenses/by-nc/4.0/).
