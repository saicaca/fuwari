---
title: React-Redux 源码粗读
category: 技术
date: 2017-08-04 03:54:30
tags:
  - React
  - Redux
---

# Overview

首先看一张图：

![React-Redux](/imgs/react-redux-source-code-read/react-redux.png)

可以看到入口文件里面引入了这几个模块：

- Provider
- connectAdvanced
- connect

我们就来依次看一下这几个模块

## Provider

将 `store` 挂在在了 context 上面，给予了子组件访问 `store` 的能力。

<!-- more -->

## connectAdvanced

一个用来生成 `connect` 的高阶函数,引用了以下模块:

```js
import { Component, createElement } from "react"
import hoistStatics from "hoist-non-react-statics"
import invariant from "invariant"

import { storeShape, subscriptionShape } from "../utils/PropTypes"
import Subscription from "../utils/Subscription"
```

### Subscription

首先看一下 `Subscription` 模块。

#### createListenerCollection

实现一个订阅发布模式，提供 `clear`，`notify`，`subscribe` 方法。分别用来清除当前队列，触发事件，订阅方法。

#### Subscription

订阅类，订阅 `onStateChange` 事件，同时确保当父级也有事件订阅时，事件触发时，先触发父级事件，然后再触发当前组件事件。

### makeSelectorStateful(sourceSelector,store):selector

```js
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  const selector = {
    run: function runComponentSelector(props) {
      try {
        const nextProps = sourceSelector(store.getState(), props)
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true
          selector.props = nextProps
          selector.error = null
        }
      } catch (error) {
        selector.shouldComponentUpdate = true
        selector.error = error
      }
    },
  }

  return selector
}
```

`selector` 用来通过 `state` 和 `prop` 来计算出下一个状态的 `props`，然后传递给连接的组件。
此函数是对 `selector` 的封装，在计算 `props` 的基础上，并记录上一次计算的结果。

### connectAdvanced(selectorFactory,{options}):wrapWithConnect(WrappedComponent)

`connectAdvanced` 的功能主要是根据传入的 `selectorFactory`, `options` 返回用于生成 `Connect` 组件一个高阶组件。

### connect

```js
    class Connect extends Component {
      constructor(props, context) {
        super(props, context)
        ...
        this.initSelector()
        this.initSubscription()
      }
      ...
      initSelector() {
        const sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions)
        this.selector = makeSelectorStateful(sourceSelector, this.store)
        this.selector.run(this.props)
      }

      initSubscription() {
        if (!shouldHandleStateChanges) return

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        const parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey]
        this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this))

        // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription)
      }
      ...
      render() {
        const selector = this.selector
        selector.shouldComponentUpdate = false

        if (selector.error) {
          throw selector.error
        } else {
          return createElement(WrappedComponent, this.addExtraProps(selector.props))
        }
      }
    }
```

定义在 `connectAdvanced` 内部的组件，通过 `context` 获取 `store` 中数据，通过 `initSelector` 方法初始化一个包含初始 `store` 的 `selector`, 并通过 `initSubscription` 方法订阅 `store` 的变化。
此组件的 `render` 方法只是一个代理，用来把通过 `selector` 计算出来的 `props` 传递给需要包裹的组件。

## connect

`connect` 引入了以下模块：

```js
import connectAdvanced from "../components/connectAdvanced"
import shallowEqual from "../utils/shallowEqual"
import defaultMapDispatchToPropsFactories from "./mapDispatchToProps"
import defaultMapStateToPropsFactories from "./mapStateToProps"
import defaultMergePropsFactories from "./mergeProps"
import defaultSelectorFactory from "./selectorFactory"
```

只是在 `connectAdvanced` 的基础上，传入了 `selectorFactory` 和 `mapStateToPropsFactories`, `mapDispatchToProps`, `mapDispatchToPropsFactories` 作为 `connectAdvanced` 的 `options` 参数。

### defaultSelectorFactory

定义了默认 `selector` 的行为，用来从传入的 `state` 中计算下一个状态的 `props`.

### defaultMap xxx To xxx Factories

这类模块用来生成映射到 props 方法的工厂函数，它们的代码如下形式：

```js
import { bindActionCreators } from "redux"

import { wrapMapToPropsConstant, wrapMapToPropsFunc } from "./wrapMapToProps"

export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === "function"
    ? wrapMapToPropsFunc(mapDispatchToProps, "mapDispatchToProps")
    : undefined
}

export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps
    ? wrapMapToPropsConstant((dispatch) => ({ dispatch }))
    : undefined
}

export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === "object"
    ? wrapMapToPropsConstant((dispatch) =>
        bindActionCreators(mapDispatchToProps, dispatch)
      )
    : undefined
}
```

可以看到，主要引用了 `wrapMapToProps` 这个模块。

#### wrapMapToProps

##### wrapMapToPropsFunc

这个方法是一个通过把 `mapToProps` 函数包裹起来作为一个代理函数,用来做一下几件事情：

- 检测 `mapToProps` 函数的调用是否依赖与 `props`, 用来供 `selectorFactory` 来决定在 `props` 变化的时候是否需要重新调用。
- 在第一次调用的时候，如果 `mapToProp` 执行后返回另一个函数，那么处理它，并且把这个返回的函数作为新的 `mapToProps` 用来处理后续的调用。
- 当第一次调用的时候，验证调用的结果是否是一个字面量对象。为了能够警告开发者，他们的 `mapToProps` 函数没有返回一个合法的结果。

# 总结

react-redux 就是一个用来绑定 redux 到 react 的一个库。如果不用 react-redux 的话，直接在 react 里面去用 redux 也是可以的，只是过于麻烦。需要手动监听 `store` 的变化，并手动执行组件的 `render` 方法。
react-redux 提供了一个高阶组件 `connect` 来帮我们做这件事情，而且帮我们做了一些优化。我们需要的只是，提供 `mapDispatchToProps` 和 `mapStateToProps` 给需要监听 `store` 的组件就可以了。
