---
title: 【翻译向】走进 Redux 之基础篇(二)
published: 2016-05-03 18:02:50
tags:
  - Redux
  - 学习笔记
category: 技术
---

紧接上一篇[走进 Redux 之基础篇(一)](https://www.kisnows.com/2016/04/26/step-to-redux-1/),接下来会跟着文档从下面三个点开始。

- 数据流
- 与 React 配合
- 实例：TodoList

# 数据流

Redux 的架构围绕与如何搭建一个**严格的单向数据流**。

这意味着所有的数据都有遵循一个同样的生命周期模式，可以让整个应用变得可预测也更加易于理解。在 Redux 应用中，所有的数据生命周期分为如下四个步骤：

## 1 你主动调用 `store.dispatch(action)`

Action 是一个用来描述发生了事情的对象。比如：

```javascript
{type:'ADD_TODO',text:'todo\'s content'}
{type: 'FETCH_USER_SUCCESS', response: {id: 3, name: 'Mary'}}
```

可以认为 action 是一个事件的简短片段描述。你可以在任何地方调用 `store.dispatch(action)` ，包括组件和 XHR 中，甚至可以在定时器中调用。

## 2 Redux store 调用你提供的 reducer 函数

store 会传递俩个参数给 reducer：当前的 state 和 action. 比如，在一个 todo 应用中，根 reducer 会收到类似下面这样的参数：

<!--more-->

```javascript
let previousState = {
  visibleTodoFilter: "SHOW_ALL",
  todos: [
    {
      text: "Read the docs",
      complete: false,
    },
  ],
}
let action = {
  type: "ADD_TODO",
  text: "Understand the flow",
}
// nextState 由 todoApp 这个根 reducer 来生成
let nextState = todoApp(previousState, action)
```

需要注意的是 reducer 是一个纯函数，没有副作用的，仅仅是计算下一个 state . 他应该是可以完全预测的，对于同样的参数，无论调用多少次都应该返回一个同样值。类似于 API 调用或者路由的变化都应该**在 action 被 dispatch 之前**。

## 3 根 reducer 可以合并多个子 reducer 的输出来生成一个单一的 state 树。

如何组合根 reducer 完全由你来决定。 Redux 提供了 combineRedux() 这个帮助函数，在把根 reducer 分离成独立的函数去管理整个 state 树的一个分支时很有帮助。
我们来看一下 combineRedusers() 这个函数怎么工作。假设你有俩个 reducer ， 一个用来管理 todo 列表，另一个用来管理当前选中的过滤状态：

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

当触发一个 action 的时候， 通过 `combineRedusers` 返回的 `todoApp` 将会调用**所有** reducer：

```
let nextTodos = todos(state.todos, action)
let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action)
```

它会把每个 reducer 返回的 state 合并成一个单独的 state 树

```
return {
   todos: nextTodos,
   visibleTodoFilter: nextVisibleTodoFilter
 }
```

你也可以选择不用 `combineRedusers` ，毕竟他只是好用的辅助工具，你可以自己来实现你的跟 reducer.

## 4 Redux store 会保存由根 reducer 返回的整个 state 树

现在这个新的 state 树就是当前应用的下一个 state 。所有通过 `store.subscribe(listener)` 注册了监听事件的监听函数都会被调用； 监听对象可能会调用 `store.getState()` 来获取当前的 state .
现在，整个视图都可以通过新的 state 来更新。如果你使用 React Redux 做为视图绑定工具，那么这就是 component.setState(newState) 调用的节点。

# 和 React 配合使用

虽然 Redux 和 React 之间没有联系，但是 Redux 确实和类似于 React 和 Deku 这类可以用数据状态俩描述 UI 的框架配合的很好。我们将会使用 React 来搭建一个简单的 Todo 应用。

## 安装 React Redux

React bindings 并没有默认包括在 Redux 中，我们需要单独的安装：

```bash
npm install --save react-redux
```

## 展示型组件 (Presentational Components) 和容器型组件 (Container Components)

Redux 的 React bindings 信奉 **展示型组件和容器型组件分离**

| ---          | 展示型组件                     | 容器型组件                             |
| ------------ | ------------------------------ | -------------------------------------- |
| 目的         | 界面看起来的样子（标记，样式） | 事情是怎样工作的（数据获取，状态更新） |
| 意识到 Redux | No                             | Yes                                    |
| 读取数据     | 从父 props 中读取              | 顶 Redux state 中订阅获取              |
| 修改数据     | 从 props 中调用回调函数        | 分发 (dispatch) Redux actions          |
| Are written  | 手写                           | 通常由 React Redux 生成                |

大多数组件都应该被写成展示型组件，但是我们也需要生成一些容器型组件类把它们和 Redux store 连接起来。

技术上说，你可一通过使用 `store.subscribe()` 来手写容器型组件。但是我们不建议这样做，因为 React Redux 做了很多你很难直接手写出来的性能优化。所以，比起手写容器型组件，我们更建议通过 React Redux 提供的 `connetc()` 函数来生成它。

## 设计组件层级

我们的设计很简单。我们想要展示一个 todo 内容列表。一个按钮，用来标记一个 todo 内容是否完成。一个用来添加新 todo 的地方。在页脚部，我们需要一个切换键来展示所有的、完成的或者未完成的 todos.

### 展示型组件

通过下面这些展示型组件，我们可以概括出一个 props 层级。

- `TodoList` 是一个用来展示可用 Todos 的列表
  - `todos: Array` 一个内容为 { id, text, completed } 样子的列表
  - `onTodoClick(id: number)` 一个回调函数，当一个 todo 被点击的时候
- `Todo` 一个单独的 todo 项目
  - `text: string` 要展示的文字
  - `completed: boolean` todo 是否被完成的状态
  - `onClick` 一个回调函数，当一个 todo 被点击时调用
- `Link` 一个用回调的链接
  - `onClick` 这个链接被点击时的回调
- `Footer` 用来改变当前显示 todo 内容的地方
- `App` 跟组件，用来渲染所有其它的东西

它们描述这个应用看起来的样子，但是不知道数据从哪里来，也不知道如何改变他们。只是渲染我们给它的数据。如果你要从 Redux 迁移到其它框架，这些组件几乎都是可以不用改动的。它们和 Redux 之间没有联系。

### 容器型组件

我们同样需要一些容器型组件来把展示型组件连接到 Redux. 比如，`TodoList` 组件需要一个容器 `VisibleTodoList` 用来从 Redux 去订阅数据来知道如何使用当前的可视性筛选条件 (visibility filter). 为了更改可视性筛选条件，我们提供一个 `FilterLink` 容器来渲染 `Link` 用来 dispatches 一个合适的 action 在点击的时候：

- `VisibleTodoList` 通过当前的可视性筛选条件来过滤要展示的内容并渲染一个 `TodoList`
- `FilterLink` 获得当前的可视性筛选条件并渲染 `Link`
  - `filter: string` 表示一个可视性筛选条件

### 其它组件

有时，我们难以去区分一个组件是展示型还是容器型的。比如，有时表单和函数是互相依赖的， 就像这个小型的组件：

- `AddTodo` 一个有 ‘添加’ 按钮的输入框

技术上说，我没呢可以把它分离成俩个组件，但是这样明显太繁琐了。当项目变得负责和庞大的时候，我们可以把它分离开，但是现在的话，就这样让他们混合在一起吧。

### 实现组件

#### 展示型组件

就是普通的 React 组件，就不详细介绍了。

```
TodoList.js
```

```javascript
import React, { PropTypes } from "react"

import Todo from "./Todo"

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map((todo) => (
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    ))}
  </ul>
)
TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  onTodoClick: PropTypes.func.isRequired,
}
export default TodoList
```

#### 容器型组件

接下来我们通过生成容器型组件来把展示型组件和 Redux 链接起来。技术上说，一个容器型组件只是一个 React 组件，通过使用 `store.subscribe()` 来读取一部分 Redux state tree 并且提供 props 给一个展示型组件用来渲染。你可以手写这个组件，但是我们建议使用 Redux 提供的 `connect()` 函数来生成这些容器型组件，它提供了很多有用的优化去阻止一些不必要重新渲染。

为了使用它 `connect()` , 你需要顶一个叫做 `mapStateToProps` 的特殊函数，用来指明如何转换当前的 Redux store state 成为你想要传递给展示型组件的 props. 比如， `VisibleTodoList` 需要去计算 `todos` 来传递给 `TodoList`, 所以我们定义一个函数通过 `state.visibilityFilter` 用来过滤 `state.todos`, 并且在 `mapStateToProps` 中使用它：

```javascript
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos
    case "SHOW_COMPLETED":
      return todos.filter((t) => t.completed)
    case "SHOW_ACTIVE":
      return todos.filter((t) => !t.completed)
  }
}
const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter),
  }
}
```

除了读取 state 之外， 容器型组件可以 dispatch actions. 通过同样的方式，你可以定义一个名为 `mapDispatchToProps()` 的函数去接收 `dispatch()` 方法，并返回一个回调 props 用来注入到你想要的展示型组件中。比如，我们想要 `VisibleTodoList` 去注入一个名为 `onTodoClisk` 的 prop 到 `TodoList` 组件中，而且我们想要 `onTodoClick` 去 dispatch 一个 `TOGGLE_TODO' action:

```javascript
const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id))
    },
  }
}
```

最后，我们通过调用 `connect()` 来生成一个 `VisibleTodoList` 并传递这两个函数：

```javascript
import { connect } from "react-redux"

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)
export default VisibleTodoList
```

这些都是 React Redux 的基础 API, 但是这有一些快捷方式和强大的选项，所以我们鼓励你去仔细查看 [这个文档](https://github.com/reactjs/react-redux). 如果你担心 `mapStateToProps` 创建新对象的过程，你可能需要去了解 [computing derived data](http://redux.js.org/docs/recipes/ComputingDerivedData.html) with [reselect](https://github.com/rackt/reselect)

#### 传递到 Store

所有的容器型组件需要连接到 Redux store 这样它们才能订阅它。一个方式是把它做为一个 prop 传递给每一个容器型组件。然而那样过于繁琐，
我们推荐的方式是通过使用特定的 React Redux 组件 `<Provider>` 去黑魔法般的使 store 可用给应用中的所有容器型组件而不用专门去传递它。你只需要在渲染跟组件的时候调用它一次。

```
Index.js
```

```javascript
import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"
import { createStore } from "redux"

import App from "./components/App"
import todoApp from "./reducers"

let store = createStore(todoApp)
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
)
```

# 实例：TodoList

直接看文档，虽然了解到很多专有名次和方法，但还是看不出个所以然来。所以还是得看代码，这里是官方的 [TodoList](http://redux.js.org/docs/basics/ExampleTodoList.html) 源码，结合这两篇文章应该就能很好的理解了。
我在这里遇到了几个问题

1.  webpack 一直报错找不到入口文件 './index' , 最后发现 babel 的坑。 Babel 升级到 6.0 以后需要在 .babelrc 这个文件中指明要编译 js 的文件类型，否则编译会报错。

    ```javascript
    {
    "presets": ["es2015", "react"]
    }
    ```

2.  页面渲染出来后，点击添加什么都是可以正常运行的。但是点击筛选的时候老师报错，而且报的错莫名其妙。于是一步一步打断点来看，最后发现是 `Footer.js` 里面 filter 对应的 action 拼写错误导致后面的组件找不到对应的 action

    ```javascript
    import React from "react"

    import FilterLink from "../containers/FilterLink"

    const Footer = () => (
      <p>
        Show: <FilterLink filter="SHOW_ALL">All</FilterLink>
        {", "}
        <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
        {", "}
        <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
      </p>
    )
    export default Footer
    ```

    可见应用的 action 还是需要专门单独维护一个文件，将所有的 action 都定义为变量然后暴露出来，这样如果后面有拼写错误的话，那么在编译阶段就可以发现问题了。

### 参考

[Basics|Redux](http://redux.js.org/docs/basics)
