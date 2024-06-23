---
title: 【翻译向】走进 Redux 之高级篇
category: 技术
published: 2016-05-22 04:14:46
tags:
  - Redux
  - 学习笔记
---

# 异步的 Actions

前几篇的教程里面，我们搭建了一个 todo 应用。这是一个完全同步的，每次一个 action 被 dispatched, state 都会即时更新。
解析来，我们要搭建一个不同的，异步的应用。它使用 Reddit API 来展示一个选中栏目的头条。

## Actions

当你调用一个异步的 API 时，有两个至关重要的时刻：你开始调用的时刻，和你收到答复的时刻。

这两个时刻通常都会需要对应用的 state 做出变化；为此，你需要 dispatch 普通的将会被 reducers 同步处理的 actions. 通常，对于任意 API 请求，你将需要 dispatch 至少三次不同的 actions:

- 一个通知 reducers 请求开始的 action
  reducers 可能通过切换一个 state 中的 `isFetching` flag 来处理这个 action. 用来告诉 UI 是时候显示一个等待标识了。
- 一个通知 reducers 请求已经成功完成的 action
  reducers 可能通过把新数据合并到它控制的 state 中并重置 `isFetching` 来处理这个 action. UI 会隐藏等待标识，并展示获取到的数据。
- 一个通知 reducers 请求失败的 action
  reducers 可能通过重置 `isFetching` 来处理这个 action. 另外，有些 reducers 可能想要存储这个错误信息，这样可以让 UI 展示出来。

可能需要在 actions 添加一个专用的 `status` 字段：

<!--more-->

```javascript
{type: 'FETCH_POSTS'}
{type: 'FETCH_POSTS', status: 'error', error: 'Oops'}
{typs: 'FETCH_POSTS', status: 'success', response: { ... }}
```

或者为它们定义单独的 types：

```javascript
{ type: 'FETCH_POSTS_REQUEST' }
{ type: 'FETCH_POSTS_FAILURE', error: 'Oops' }
{ type: 'FETCH_POSTS_SUCCESS', response: { ... } }
```

选择一个拥有 flags 的单独的 action type, 或者多个 actions types, 这都取决与你。多个 types 会有更少的犯错空间，但这不是一个问题，如果你使用 [redux-actions](https://github.com/acdlite/redux-actions) 这样的辅助库来生成 action creator 和 reducers 的话。

# 异步的数据流

不使用 middlerware, Redux store 只提供同步的数据流。这是你通过 createStore() 得到的默认结果。

可以使用 applyMiddleware() 来增强 createStore(). 这不是必须的，但它可以让你通过一个便利的方法描述异步的 action 。

异步的 middleware 比如 redux-thunk 或 redux-promise 都包装了 store 的 dispatch() 方法，允许你 dispatch 除了 action 以外的内容，比如函数或者 Promise。你所使用的 middleware 可以以自己的方式解析你 dispatch 的任何内容，并继续传递 actions 给下一个 middleware。比如，支持 Promise 的 middleware 能够拦截 Promise，然后为每个 Promise 异步地 dispatch 一对 begin/end actions。

当数据流上最后一个 middleware dispatches 一个 actions 时，它必须是一个普通的对象。这是同步的 Redux 数据流开始的地方。

# 中间件（Middleware）

中间件提供一个第三方的扩展点，在 dispatching 一个 action 和 它到达 reducer 的中间时刻。人们使用中间件来打印日志，记录崩溃报告，调用一个异步的 API, 路由……
这里有[一些例子](http://redux.js.org/docs/advanced/Middleware.html#seven-examples)来展示中间件的强大作用

## 理解中间件

中间件可以做很多事情，理解它是从哪来的非常重要。我们通过使用 logging 和 crash reporting 这俩个例子来展示一个使用中间件的思维过程。

### 问题: 日志记录

#### 尝试#1：手动记录

最原始的解决方案就是每次在调用 `store.dispatch(action)` 时记录 action 和 下一个 state. 代码可能就是下面的样子：

```javascript
let action = addTodo("Use Redux")

console.log("dispatching", action)
store.dispatch(action)
console.log("next state", store.getState())
```

这真的是一种很搓的办法。

#### 尝试#2：包装 Dispatch

把 logging 提取到一个函数里面：

```javascript
function dispatchAndLog(store, action) {
  console.log("dispatching", action)
  store.dispatch(action)
  console.log("next state", store.getState())
}
```

这样每次调用的时候通过使用这个函数来替换 `store.dispatch()`

```javascript
dispatchAndLog(store, addTOdo("USe Redux"))
```

这样已经能解问题了，但是这样并不优雅。

#### 尝试#3： Monkeypatching Dispatch

如果我们只在 store 里面替换 `dispatch` 函数呢？ Redux 的 store 只是一个拥有几个方法的普通对象，所以我们可以改写 `dispatch`

```javascript
let next = store.dispatch
store.dispath = fucntion dispatchAndLog (action){
    console.log('dispatching',action)
    let result = next(action)
    console.log('next state',soter.getState())
    return reslut
}
```

这样基本上已经达到了我们的妖要求，不论你在哪里 dispatch 一个 action, 它都保证会被记录下来。虽然我们通过 Monkeypatching 改写了 store 内部的方法，但暂时先这样。
