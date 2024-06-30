---
title: "AI是否会带来编程范式上的改变?"
description: 未来AI是否会带来编程范式上的改变?
published: 2023-03-26
tags: [思考]
category: 技术
draft: false
---

## AI是否会带来编程范式上的改变?
### 开篇
这篇短文是我最近一些想法的总合与扩展，讨论关于 Ai 对未来编程范式的一些改变。许多观点只是一个大概的逻辑，希望能和大家一起讨论。

### 编程语言上的改变

我前几天在写Flutter，其中把数据类转换成json。我抄了一段

```dart
    factory HistoryPomodoro.fromJson(Map<String, dynamic> json) => HistoryPomodoro(
        DateTime.parse(json["startTime"]),
        DateTime.parse(json["endTime"]),
        json["time"],
        json["note"],
        json["status"],
    );
    
    // a function toJson covert itself all the data to json
    Map<String, dynamic> toJson() => {
        "startTime": startTime.toIso8601String(),
        "endTime": endTime.toIso8601String(),
        "time": time,
        "note": note,
        "status": status,
    };
```

这种写法确实让我觉得太奇怪了，居然要把属性成员名与json字段名一一对应。这也太累了吧。我之前在写其它语言中从来没有这种体验。但是我想或者是因为Dart中没有Java的反射机制这样导致的。


这是Dart语言的缺陷，但是在Ai的帮助下，我可以快速的生成这些代码，其实写起来并不累。也就是AI弥补了语言本身的缺陷。
过去程序员写C++时需要进行内存管理会有很重的心智负担。所以人们创造像Java之类的语言来降低人们的心智担负。但是随着未来AI的发展，由AI来生产安全的代码。会不会让C++这种效率更高的语言渐渐被使用的更多。甚至汇编语言。


### 编程工具上的改变

Flutter、Electron给大家带来许多生产力的提升，只要编写一次代码就能在不同平台上运行。但是用起来并没有Native应用舒服。随着AI的发展，编写代码的更加的容易，编写应用的成本更低。写不同平台的Native应用的成本也会降低，那么Native应用是否有可能更也会有更多起来。


### 编程范式的改变

平时我们常常要求代码的可读性、就算降低一点性能也是可以接受了。像最近的Copilt X甚至可以帮人们重构现有代码。我认为未来会有一些代码是完全由AI编写的，维护也是由AI维护。比如假设一个函数做了xxx功能，然后公司要求加个yyy功能。程序员可以直接让AI进行重写这个函数。这些代码可能可读性很低，但是AI能看的懂也能继续在上面加功能。这些代码没有什么设计模式、也没有什么开闭原则，但是因为没有这些抽象反而运行效率更高。