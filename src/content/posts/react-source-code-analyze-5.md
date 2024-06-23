---
title: React 源码浅析之 - onlyChildren
category: 技术
published: 2017-09-21 00:27:39
tags:
  - React
  - SourceCode
---

这个模块的代码非常简单，短短十几行。

```js
var ReactElement = require("ReactElement")

var invariant = require("fbjs/lib/invariant")
function onlyChild(children) {
  invariant(
    ReactElement.isValidElement(children),
    "React.Children.only expected to receive a single React element child."
  )
  return children
}

module.exports = onlyChild
```

就是判断传入的 children 是不是一个合法的 React 元素，否则就抛错出来。判断的逻辑就在 ReactElement 模块里面：

```js
ReactElement.isValidElement = function (object) {
  return (
    typeof object === "object" &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  )
}
```

<!-- more -->

# 总结

那么到这里为止，所有 React 本身提供的 API 和模块就算是看完了。但是光看 React 本身的这些代码，其实并不能解决什么问题，比如 React Component 的生命周期是怎么实现的， setState 是怎么运作的，以及是如何把 React Component 渲染到浏览器中的，还有很多问题。
有机会我会继续寻找这些答案。

# 相关文章

- {% post_link react-source-code-analyze-1 React 源码浅析之 - 入口文件 %}
- {% post_link react-source-code-analyze-2 React 源码浅析之 - ReactBaseClasses %}
- {% post_link react-source-code-analyze-3 React 源码浅析之 - ReactChildren %}
- {% post_link react-source-code-analyze-4 React 源码浅析之 - ReactElement %}
- {% post_link react-source-code-analyze-5 React 源码浅析之 - onlyChildren %}
