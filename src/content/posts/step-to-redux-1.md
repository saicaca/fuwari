---
title: 【翻译向】走进 Redux 之基础篇(一)
date: 2016-04-27 06:17:16
tags:
  - Redux
  - 学习笔记
category: 技术
---

# Redux 的三个原则

- 整个应用的状态都以一个对象树的形式保存在一个单一的 store 中
- 唯一去改变这个对象树的方法就是通过去触发 action,一个用来描述发生了什么事情的对象
- 通过编写纯函数 reducers，去描述这个 action 如何改变了整个对象树

# Action

Action 就是承载了要从你的应用传送给 store 的信息。它们只是 store 的信息数据来源。可以通过 `store.dispatch()` 来传递 action.
action 可能长这个样子：

```javascript
const ADD_TODO = 'ADD_TODO'
{
    type: ADD_TODO,
    text: 'Bulid my first Redux App'
}
```

Actions 就是普通的 JavaScript 对象，但是必须有 `type` 属性，用来指定是发生了哪种类型的操作。 Types 应该被定义为字符串常量。当你的项目变的庞大起来时，你可能需要把它们移动到一个单独隔离的模块里面。

```javascript
import { ADD_TODO, REMOVE_TODO } from "../actionTypes"
```

与 `type` 不同的是，整个 action 的结构完全由你来决定。不过可以参考 [Flux Standard Action](https://github.com/acdlite/flux-standard-action) 里面的指南来了解如何更好的组织 action 的结构。

## Action Creators

Action Creators 就是用来生成 action 的函数。
在 Redux 中 action creators 简单的返回一个 action 对象就可以了：

```javascript
function addTodo(text) {
  return {
    type: ADD_TODO,
    text: "Some text",
  }
}
```

这样可以更加容易的创建一类 action, 而且更易于测试。

## Dispatch

实际的初始化一个 dispatch 可以通过把结果传递给 `diapatch()` 函数：

<!-- more -->

```javascript
store.dispatch(addTodo(text))
```

或者，你可以通过创建个一个被的绑定 action creator 用来自动 dispatches：

```javascript
const boundAddTodo = (text) => dispatch(addTodo(text))
```

现在你能够直接调用它们了：

```javascript
boundAddTodo(text)
```

`dispatch()` 函数可以直接访问 store 通过 `store.dispatch()`，但你可能更喜欢通过使用一个像 react-redux 的 `connect()` 这样辅助函数来访问。可以通过 `bindActionCreators()` 来自动绑定很多 action creators 到 `dispatch()` 函数上。

# Reducers

Actions 描述一个发生了什么事情的事实，但是没有指定如何去改变应用的 state. 这个就是 reducer 要做的。

## 设计 State 结构

在 Redux 里面，应用的所有状态都被存储在一个单一的对象中。所以在写代码之前考虑一下如何设计 state 是很重要的。如何用最简单的方法来把应用状态描述为一个对象。
对于一个 todo 应用来说，我们想要存储俩个不同的事情：

- 当前选中的显示过滤条件
- 实际的 todos 列表

简单的 state 就是下面这个样子

```javascript
{
   visibilityFilter: 'SHOW_ALL',
   todos: [
       {
           text: 'Consider using Redux',
           completed: true
       },{
           text: 'Keep all state in a single tree',
           completed: false
       }
   ]
}
```

## 处理 Actions

Reducer 是一个纯函数，接受之前的 state 和 action 做为参数，返回下一个 state.

```javascript
;(previousState, action) => newState
```

之所以叫做 reducer 是因为它要被传递给 `Array.prototype.reduce(reducer,?initialValue)` 这个函数。所以保持 reduce 的纯净非常重要。永远不要在 reducer 里面做下面的事情：

- 转换它的函数参数
- 做一些带有副作用的操作，比如 API 的调用和路由的跳转
- 调用不纯净的函数，比如 `Date.now()` 和 `Math.random()`

了解了这些以后，我们来开始 reducer 函数。通过指明初始 state 来开始。 Redux 将会在第一次调用 reducer 时传递一个 `undefined` state. 这时我们需要返回一个初始化的 state：

```javascript
import { VisibilityFilters } from "./actions"

const initialState = {
  visibilityFilter: VisibilityFilters.SHOW_ALL,
  todo: [],
}

function todoApp(state = initialState, action) {
  //采用 ES2015 写法，当 state 传递为 undefined 时，会被赋值为 initialState
  return state
}
```

接下来处理 `SET_VISIBILITY_FILTER`. 需要做的就是在 state 上改变 `visibilityFilter`.

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.SET_VISIBILITY_FILTER,
      })
    default:
      return state
  }
}
```

需要注意的是：

1. 我们不修改原有的 state. 通过 `Object.assign()` 创建一个原有 state 和 要改变内容合并后的副本。
2. 当找不到状况也就是 default 时，必须返回之前的 state

## 处理更多的 Actions

还有一些 action 需要去处理，我们也都一一加上。

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter,
      })
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false,
          },
        ],
      })
    default:
      return state
  }
}
```

我们可以通过分离 reducer 函数来使它更加容易理解，毕竟把 todos 相关的处理逻辑和 visibilityFilter 的处理逻辑放在一块不是很清晰。分离 reducer 也是很简单的。

```javascript
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false,
        },
      ]
    default:
      return state
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action),
  }
}
```

可以看到，每个 reducer 都管理着整个 state 中属于自己的部分。每个 reducer 的 `state` 参数都不同，分别对应他们自己管理部分的 state.
当应用变得庞大时，我们可以把 reducer 分离到多个不同的文件中，保持独立性并管理不同的数据源。
最后，Redux 提供了一个 `combineReducers()` 函数来做和上面 todoApp 同样逻辑的事情，合并多个 reducer, 这样可以省略很多样板代码。

```javascript
import { combineReducers } from "redux"

const todoApp = combineReducers({
  visibilityFilter,
  todos,
})

export default todoApp
```

它和下面的写法是完全等价的：

```javascript
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action),
  }
}
```

`combineReducers()` 所做的就是生成一个函数，并给每个 reducer 函数并传入对应的 state，并把它们合并成一个单独的对象。这并不是[黑魔法](https://github.com/reactjs/redux/issues/428#issuecomment-129223274)。

### combineReducers 原理

15 年看 Redux 时，没有读文档，这里一直没能理解，不知道 `combineReducers()` 到底是怎么做的，以为他就是个黑魔法。而且还能通过 `combineReducers()` 后的函数生成初始化的 store.

今天重新读了文档和 [黑魔法](https://github.com/reactjs/redux/issues/428#issuecomment-129223274) 这个 issue 后理解了。
其实 `combineReducers()` 是这样工作的。假设你有俩个 reducer ， 一个用来管理 todo 列表，另一个用来管理当前选中的过滤状态：

```
 function todos(state = [], action) {
   // Somehow calculate it...
   return nextState
 }
function visibleTodoFilter(state = 'SHOW_ALL', action) {
   // Somehow calculate it...
   return nextState
 }
let todoApp = combineReducers({
   todos,
   visibleTodoFilter
 })
```

可以看到，每个 reducer 中都定义了默认的 state:
`todos` 中为 `[]`, 而 `visibleTodoFilter` 中为 `SHOW_ALL`。
当触发一个 action 的时候， 通过 combineReduser 返回的 todoApp 将会调用**整个** reducer：

```javascript
let nextTodos = todos(state.todos, action)
let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action)
```

最终它会把每个 reducer 返回的 state 合并成一个单独的 state 树

```javascript
return {
  todos: nextTodos,
  visibleTodoFilter: nextVisibleTodoFilter,
};
```

这样就可以理解 combineReducer 的工作原理了。当然你也可以选择不用 combineReduser ，毕竟他只是一个官方提供的辅助工具，你可以自己来实现你的根 reducer.

# Store

Store 是一个对象，用来把它们联系起来。Store 的职责如下：

- 保存整个应用的 state
- 可以通过 `getState()` 来获取 state
- 可以通过 `dispatch(action)` 来更新 state
- 通过 `subscribe(listener)` 来注册监听器
- 通过 `subscribe(listener)` 返回的值来处理没有注册的监听器

需要注意的只能有一个 store 在 Redux 应用中。当你想要分离数据逻辑时，你可以通过创建更多的 reducer 来代替更多的 store.
当你拥有一个 reducer 时，创建 store 是很容易的。我们可以通过 `combineReducers()` 后创建的根 reducer 来创建 store.

```javascript
import { createStore } from "redux"

import todoApp from "./reducers"

let store = createStore(todoApp)
```

也可以通过传递可选参数来初始化 state. 当你开发一个通过应用时着很有用，可以把服务端传来的 state 做为客户端初始化 state.

```javascript
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```

# 总结

理解了这些内容，就大概可以知道 Redux 是怎么运作的了。可见读文档还是很有用的，不像去年直接去看官方例子里的源码，结果看的一愣一愣的，最后也不明白是个怎么回事。
接下来，要继续学习数据流以及和 React 的配合，并动手写一个 TodoList 实例来加深理解。

### 参考

[Basics|Redux](http://redux.js.org/docs/basics)
