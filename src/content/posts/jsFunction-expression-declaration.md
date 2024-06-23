---
title: js函数表达式和函数声明的区别
published: 2015-02-09 07:01:09
tags:
  - JavaScript
category: 技术
---

`JavaScript`中的两种函数定义方式：

#### 函数表达式：

    var foo = function(){
    	conlose.log('Message');
    };

#### 函数声明：

    function foo(){
    	console.log('Message');
    };

两种方法都可以定义一个相同的函数，但是却有一些区别：

### 函数表达式中：

`var foo`和一般的`var`定义的变量一样被提到了函数或脚本顶部，但是函数体却还是在原来的地方。所以必须在函数体后调用函数。

    var foo = function(){
    	console.log('Message');
    };
    foo() 	// 输出结果为'Message'

    foo();
    var foo = function(){
    	console.log('Message');
    };		// 会报错TypeError: Property 'test' of object #<Object> is not a function

    上面的第二段代码其实和下面的是一样，所以会报错

    var foo;
    foo();
    var foo = function(){
    	console.log('Message');
    };

### 函数声明中：

`foo()`函数的整个函数块都被提到了整个函数或脚本的顶部，在整个函数或脚本中都是可见的。也就是说可以在函数定义之前调用函数。

    foo()
    function foo(){
    	console.log('Message')
    }			//输出结果为'Message'

以后在实际使用中，要特别注意两者的区别。
