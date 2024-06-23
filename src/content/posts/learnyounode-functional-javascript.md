---
title: learnyounode-functional-javascript
date: 2015-09-24 03:53:33
tags:
  - JavaScript
category: 技术
---

![fun](/imgs/learnyounode-functional-javascript.png)
坑爹的 CMD 不知怎么回事，在做到倒数第三道题后突然罢工了，不能选择题目，公司和自己的电脑都是这样。
于是最后三道题还是放弃了，也没精力去找那三道题到底是什么了，就这样吧。

做题的过程中有个需要注意的地方，也是在 js 中一个很常用的方法。
那就是被 setTimeout 延迟的函数会等前面函数彻底执行完以后，才会执行,也就是说可以阻塞 js 的进程。如下：

```javascript
function repeat(operation, num) {
  // modify this so it can be interrupted
  if (num <= 0) return
  operation()
  setTimeout(function () {
    return repeat(operation, --num)
  }, 0)
}
module.exports = repeat
```

Operation 是一个操作很费时间的函数，如果不用 setTimeout 延迟后面的递归调用的话，就会造成 repeat 函数已经执行完了，但是含有很多个 operation 没有执行完的情况。

其它的到没有什么了，所有代码都放在[这里](https://github.com/kisnows/nodeschool/tree/master/functional-javascript)
