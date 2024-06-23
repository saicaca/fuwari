---
title: JavaScript 中的类和继承
date: 2016-03-22 03:38:13
tags:
  - JavaScript
  - inherit
category: 技术
---

我们都知道 JavaScript 是一门基于原型的语言。当我们调用一个对象本身没有的属性时，JavaScript 就会从对象的原型对象上去找该属性，如果原型上也没有该属性，那就去找原型的原型，一直找原型链的末端也就是 `Object.prototype` 的原型 `null`。这种属性查找的方式我们称之为原型链。

# 类的实现

由于 JavaScript 本身是没有的类的感念的。所以我们如果要实现一个类，一般是通过构造函数来模拟类的实现：

```javascript
function Person(name, age) {
  //实现一个类
  this.name = name
  this.age = age
}
var you = new Person("you", 23) //通过 new 来新建实例
```

首先新建一个 `Person` 的构造函数，为了和一般的函数区别，我们会使用 CamelCase 方式来命名构造函数。
然后通过 `new` 操作符来创建实例，`new` 操作符其实干了这么几件事：

1. 创建一个继承自 `Person.prototype` 的新对象
2. 构造函数 `Person` 执行时，相应的参数传入，同时上下文被指定为这个新建的对象。
3. 如果构造函数返回了一个对象，那么这个对象会取代 `new` 的结果。如果构造函数返回的不是对象，则会忽略这个返回值。

```javascript
返回值不是对象;
function Person(name) {
  this.name = name;
  return "person";
}
var you = new Person("you");
//  you 的值: Person {name: "you"}
返回值是对象;
function Person(name) {
  this.name = name;
  return [1, 2, 3];
}
var you = new Person("you");
//  you的值: [1,2,3]
```

如果类的实例需要共享类的方法，那么就需要给构造函数的 `prototype` 属性添加方法了。因为 `new` 操作符创建的对象都继承自构造函数的 `prototype` 属性。他们可以共享定义在类 `prototype` 上的方法和属性。

```javascript
function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype = {
  sayName: function () {
    console.log("My name is", this.name)
  },
}
var you = new Person("you", 23)
var me = new Person("me", 23)
you.sayName() // My name is you.
me.sayName() // My name is me.
```

# 继承的实现

<!-- more -->

JavaScript 中常用的继承方式是组合继承，也就是通过构造函数和原型链继承同时来模拟继承的实现。

```javascript
//Person 构造函数如上
function Student(name, age, clas) {
  Person.call(this, name, age)
  this.clas = clas
}
Student.prototype = Object.create(Person.prototype) // Mark 1
Student.prototype.constructor = Student //如果不指明，则 Student 的 constructor 是 Person
Student.prototype.study = function () {
  console.log("I study in class", this.clas)
}
var liming = new Student("liming", 23, 7)
liming instanceof Person //true
liming instanceof Student //true
liming.sayName() // My name is liming
liming.study() // I study in class 7
```

代码中 Mark 1 用到了 `Object.create` 方法。这个是 ES5 中新增的方法，用来创建一个拥有指定原型的对象。如果环境不兼容，可以用下面这个 Polyfill 来实现（仅实现第一个参数）。

```javascript
if (!Object.create) {
  Object.create = function (obj) {
    function F() {}
    F.prototype = obj
    return new F()
  }
}
```

其实就是把 `obj` 赋值给临时函数 `F` ，然后返回一个 `F` 的实例。这样通过代码 Mark 1 `Student` 就得到了 `Person.prototype` 上的所有属性。有人会问了，那么为什么不干脆把 `Person.prototype` 直接赋值给 `Student.prototype` 呢？

是的，直接赋值是可以达到子类共享父类 `prototype` 的目的，但是它破坏了原型链。即：子类和父类共用了同一个 `prototype`,这样当某一个子类修改 `prototype` 的时候，其实同时也修改了父类的 `prototype`,那么就会影响到所有基于这个父类创建的子类，这并不是我们想要的结果。看例子：

```javascript
//Person 同上
//Student 同上
Student.prototype = Person.prototype
Student.prototype.sayName = function () {
  console.log("My name is", this.name, "my class is", this.clas)
}
var liming = new Student("liming", 23, 7)
liming.sayName() //My name is liming,my class is 7;
//另一个子类
function Employee(name, age, salary) {
  Person.call(name, age)
  this.salary = salary
}
Employee.prototype = Person.prototype
var emp = new Employee("emp", 23, 10000)
emp.sayName() //Mark 2
```

你们猜 Mark 2 会输出什么？

我们期望的 Mark 2 应该会输出 "My name is emp". 但实际上报错，为什么呢？因为我们改写 `Student.prototype` 的时候，也同时修改了 `Person.prototype`，最终导致 `emp` 继承的 `prototype` 是我们所不期望的，它的 sayName 方法是 `My name is',this.name,'my class is',this.clas`，这样自然是会报错的。

## ES6 的继承

随着 ECMAScript 6 的发布，我们有了新的方法来实现继承。也就是通过 `class` 关键字。

### 类的实现

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  sayHello() {
    console.log(`My name is ${this.name},i'm ${this.age} years old`)
  }
}
var you = new Person("you", 23)
you.sayHello() //My name is you,i'm 23 years old.
```

### 继承

ES6 里面的继承也很方便，通过 `extends` 关键字来实现。

```javascript
class Student extends Person {
  constructor(name, age, cla) {
    super(name, age)
    this.class = cla
  }
  study() {
    console.log(`I'm study in class ${this.class}`)
  }
}
var liming = new Student("liming", 23, 7)
liming.study() // I'm study in class 7.
```

这个继承相比上面的 ES5 里面实现的继承要方便了很多，但其实原理是一样的，提供的这些关键字方法只是语法糖而已，并没有改变 Js 是基于原型这么一个事实。不过 `extends` 这样实现的继承有一个限制，就是不能定义属性，只能定义方法。要新添属性，还是得通过修改 `prototype` 来达到目的。

```javascript
Student.prototype.teacher = "Mr.Li"
var liming = new Student("liming", 23, 7)
var hanmeimei = new Student("hanmeimei", 23, 7)
liming.teacher //Mr.Li
hanmeimei.teacher //Mr.Li
```

### 静态方法

ES6 还提供了 `static` 关键字，来实现静态方法。静态方法可以继承，但只能由类本身调用，不能被实例调用。

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  static say() {
    console.log("Static")
  }
}
class Student extends Person {}
Person.say() // Static
Student.say() // Static
var you = new Person("you", 23)
you.say() // TypeError: liming.say is not a function
```

可以看到，在实例上调用的时候会直接报错。

### Super 关键字

在子类中可以通过 `super` 来调用父类，根据调用位置的不同，行为也不同。在 `constructor` 中调用，相当于调用父类的 `constructor` 方法，而在普通方法里面调用则相当与调用父类本身。

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  sayHello() {
    console.log(`My name is ${this.name},i'm ${this.age} years old`)
  }
}
class Student extends Person {
  constructor(name, age, cla) {
    super(name, age) // 必须在子类调用 this 前执行，调用了父类的 constructor
    this.class = cla
  }
  sayHello() {
    super.sayHello // 调用父类方法
    console.log("Student say")
  }
}
var liming = new Student("liming", 23, 7)
liming.say() // My name is liming,i'm 23 years old.\n Student say.
```

# 总结

至此，我们可以看到：在 ES6 发布以后，JavaScript 中实现继承有了一个标准的方法。虽然它们只是语法糖，背后的本质还是通过原型链以及构造函数实现的，不过在写法上更易于我们理解而且也更加清晰。

参考：

- [JavaScript 继承方式详解](https://segmentfault.com/a/1190000002440502#articleHeader7)
- [JavaScript 原型系统的变迁，以及 ES6 class](https://ruby-china.org/topics/27499)
