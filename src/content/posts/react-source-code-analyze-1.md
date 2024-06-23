---
title: React 源码浅析之 - 入口文件
category: 技术
date: 2017-09-21 00:10:41
tags:
  - React
  - SourceCode
---

本系列文章以 react 最新的版本： 16.0.0-beta.5 为准。
首先我们入口文件 ReactEntry.js 来看，

```js
var ReactBaseClasses = require("ReactBaseClasses")
var ReactChildren = require("ReactChildren")
var ReactElement = require("ReactElement")
var ReactVersion = require("ReactVersion")

var onlyChild = require("onlyChild")
```

依赖模块：
• ReactBaseClasses
• ReactChildren
• ReactElement
• onlyChild
• ReactElementValidator
接着:

<!-- more -->

```js
var createElement = ReactElement.createElement
var createFactory = ReactElement.createFactory
var cloneElement = ReactElement.cloneElement

if (__DEV__) {
  var ReactElementValidator = require("ReactElementValidator")
  createElement = ReactElementValidator.createElement
  createFactory = ReactElementValidator.createFactory
  cloneElement = ReactElementValidator.cloneElement
}
```

可以看到在开发环境下提供了对组件的验证。

```js
var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild,
  },

  Component: ReactBaseClasses.Component,
  PureComponent: ReactBaseClasses.PureComponent,
  unstable_AsyncComponent: ReactBaseClasses.AsyncComponent,

  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,

  createFactory: createFactory,

  version: ReactVersion,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: require("ReactCurrentOwner"),
  },
}
```

上面这些就是 React 提供的所有 API 了。
我会在后续的文章依次对这些 API 的实现进行解读。

# 相关文章

- {% post_link react-source-code-analyze-1 React 源码浅析之 - 入口文件 %}
- {% post_link react-source-code-analyze-2 React 源码浅析之 - ReactBaseClasses %}
- {% post_link react-source-code-analyze-3 React 源码浅析之 - ReactChildren %}
- {% post_link react-source-code-analyze-4 React 源码浅析之 - ReactElement %}
- {% post_link react-source-code-analyze-5 React 源码浅析之 - onlyChildren %}
