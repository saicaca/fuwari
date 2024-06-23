---
title: React 源码浅析之 - ReactBaseClasses
category: 技术
published: 2017-09-21 00:19:00
tags:
  - React
  - SourceCode
---

# 引入的模块

```js
var ReactNoopUpdateQueue = require("ReactNoopUpdateQueue")

var emptyObject = require("fbjs/lib/emptyObject")
var invariant = require("fbjs/lib/invariant")
var lowPriorityWarning = require("lowPriorityWarning")
```

其中， `ReactNoopUpdateQueue` 是默认的 updater ，用来提供 `update`, `replaceState`, `setState` 的入队操作，但可能是由于是默认 `updater` 的原因，只提供了 API 和对入参的校验，但没有提供实际的功能。比如：

<!-- more -->

```js
enqueueSetState: function(
  // 需要 render 的实例
  publicInstance,
  // 接下来要 merge 的 state
  partialState,
  // 可选参数，setState 组件 update 后的回调
  callback,
  // 可选参数，调用函数的的名字
  callerName,
) {
  warnNoop(publicInstance, 'setState');
},
```

其余几个模块是一些通用辅助模块，就不细说了。

# Export 的对象

```js
module.exports = {
  Component: ReactComponent,
  PureComponent: ReactPureComponent,
  AsyncComponent: ReactAsyncComponent,
}
```

我们依次来看这几个 Component .

## ReactComponent

```js
/**
 * Base class helpers for the updating state of a component.
 */
function ReactComponent(props, context, updater) {
  this.props = props
  this.context = context
  this.refs = emptyObject
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue
}
ReactComponent.prototype.isReactComponent = {}
```

用来创建基础组件的构造函数，其中 `refs` 默认是一个空对象，而 `updater` 默认就是我们上面说的 `ReactNoopUpdateQueue`.

### setState

```js
ReactComponent.prototype.setState = function (partialState, callback) {
  invariant(
    typeof partialState === "object" ||
      typeof partialState === "function" ||
      partialState == null,
    "setState(...): takes an object of state variables to update or a " +
      "function which returns an object of state variables."
  )
  this.updater.enqueueSetState(this, partialState, callback, "setState")
}
```

给它添加 `setState` 方法，实际操作就是把下一个要设置的 state 放入到更新队列里面。注释中提到：

- 永远使用 setState 这个方法去更改 state ，你应该认为 this.state 是不可变的
- 不保证 this.state 会及时更新，也就是说调用 this.state 可能拿到的还是旧的 state
- 不保证 setState 会同步调用，有可能会把几个 setState 的调用一次性批量更新掉，一定要在某个 setState 的调用完成后执行-操作，可以提供可选的 callback 函数。
- 当一个 callback 函数传入给 setState 的时候，它会在未来的某个时机调用。会用最新的组件参数 (state, props, context). 而这些参数和此时组件本身的 this.\* 上的参数值可能会不一样，应为 callback 函数有可能在 receiveProps 之后 shouldComponentUpdate 之前调用，而此时这个新的 state, props 和 context 还没有赋值给 this.

其核心思想就是说， setState 的调用是异步的，从代码 `this.updater.enqueueSetState(this, partialState, callback, 'setState');` 中可以看到，只是把要更新的 state 放入到了更新队列里面，而不是直接进行 state 的更新。

### forceUpdate

```js
ReactComponent.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate")
}
```

一个强制更新的方法，这个方法不会触发 `shoudleComponentUpdate` ，但是会正常调用 `componentWillUpdate` 和 `componentDidUpdate` .
要确保调用这个方法的时候，所有的 DOM 事务操作已经完成。
只有在当你知道一个组件的深层次的 state 变化了，但是并没有调用 setState 的时候才需要调用这个方法。

### 不推荐的方法

```js
/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
if (__DEV__) {
  var deprecatedAPIs = {
    isMounted: [
      "isMounted",
      "Instead, make sure to clean up subscriptions and pending requests in " +
        "componentWillUnmount to prevent memory leaks.",
    ],
    replaceState: [
      "replaceState",
      "Refactor your code to use setState instead (see " +
        "https://github.com/facebook/react/issues/3236).",
    ],
  }
  var defineDeprecationWarning = function (methodName, info) {
    Object.defineProperty(ReactComponent.prototype, methodName, {
      get: function () {
        lowPriorityWarning(
          false,
          "%s(...) is deprecated in plain JavaScript React classes. %s",
          info[0],
          info[1]
        )
        return undefined
      },
    })
  }
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName])
    }
  }
}
```

这里可以看到 `isMounted` 和 `replaceState` 这两个方法，已经被官方认为将要废弃的 API ，在开发过程中应该尽量避免使用它们。

## PureComponent

```js
function ReactPureComponent(props, context, updater) {
  // Duplicated from ReactComponent.
  this.props = props
  this.context = context
  this.refs = emptyObject
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue
}

function ComponentDummy() {}
ComponentDummy.prototype = ReactComponent.prototype
var pureComponentPrototype = (ReactPureComponent.prototype =
  new ComponentDummy())
pureComponentPrototype.constructor = ReactPureComponent
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, ReactComponent.prototype)
pureComponentPrototype.isPureReactComponent = true
```

一个典型 js 实现继承的方式，可以看到 PureComponent 继承自 ReactComponent ，PureComponent 拥有 ReactComponent 的所有属性和方法，并在此基础上多了一个属性：

```js
pureComponentPrototype.isPureReactComponent = true
```

后面在组件更新部分会用到这个属性。

## AsyncComponent

这个组件在我实际开发过程中还没有用到过，我们来看一下：

```js
function ReactAsyncComponent(props, context, updater) {
  // Duplicated from ReactComponent.
  this.props = props
  this.context = context
  this.refs = emptyObject
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue
}

var asyncComponentPrototype = (ReactAsyncComponent.prototype =
  new ComponentDummy())
asyncComponentPrototype.constructor = ReactAsyncComponent
// Avoid an extra prototype jump for these methods.
Object.assign(asyncComponentPrototype, ReactComponent.prototype)
asyncComponentPrototype.unstable_isAsyncReactComponent = true
asyncComponentPrototype.render = function () {
  return this.props.children
}
```

和 PureComponent 一样，同样继承自 ReactComponent. 再次基础上添加了
unstable_isAsyncReactComponent 属性，并设置了 render 方法为直接返回它的 children. 从新添加的属性名可以看到，这是一个还没有稳定下来的特性组件。从名字和内容初步判断是用来创建异步的组件，先用一个 React 组件占位，当 props 传入 children 的时候，在进行渲染，从 render 方法直接 return 可以猜到这样可以实现无多余嵌套 html 标签的组件。

# 总结

这个模块定义了 React 中会用到的三个基础组件类，需要注意的是： 1. State 应该被看作是 immutable 的，所有的对 state 的修改只能通过 setState 来完成，不能使用 `this.state = **` 来进行 state 的更新 2. setState 是一个异步的操作，所以在调用 setState 后从 this.state 上直接取值可能不是你期望的结果，读取的结果有可能依旧是老的 state
而组件内部的 updater 逻辑，这个模块里面并没有定义具体的执行逻辑。比如调用 setState 后会对要更新的 state 进行入队操作，那么这个操作过程中发生了什么，究竟是如何进行批量的更新的，以及什么时候 state 才会更新完毕，那就需要从其他的模块里来寻找答案了。

# 相关文章

- {% post_link react-source-code-analyze-1 React 源码浅析之 - 入口文件 %}
- {% post_link react-source-code-analyze-2 React 源码浅析之 - ReactBaseClasses %}
- {% post_link react-source-code-analyze-3 React 源码浅析之 - ReactChildren %}
- {% post_link react-source-code-analyze-4 React 源码浅析之 - ReactElement %}
- {% post_link react-source-code-analyze-5 React 源码浅析之 - onlyChildren %}
