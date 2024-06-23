---
title: React 单页面初始化渲染优化
category: 技术
date: 2017-04-20 23:16:05
tags:
  - React
  - react-router
  - Redux
---

由于项目使用 React, React-Router, Redux 来开发项目，采取了前端渲染的方式（如果采用 ssr 就不会有这个问题）。

## 问题

所以每到一个页面，需要发一个初始化的请求来获取页面数据，然后重新渲染页面，所以之前一个页面从请求到加载完毕的流程是这样的：

```
Route match -> ComponentWillMount ->  render -> ComponentDidMount -> dispatch(init())->  render -> componentDidUpdate
```

首先是路由匹配，然后准备加载组件，使用通过 `Reducer` 里面的初始化 `state` 进行 `render`, 然后触发 `ComponentDidMount` 事件，在这个事件里面去 `dispatch` 一个执行页面初始化的请求的 `Action`，请求成功过以后触发组件的重新渲染。

可以看到，展示最终的页面需要组件重新渲染两次。一次是使用写死在前端的`reducer` 里面的 `initialState` 数据来渲染，一次是在拿到后端数据进行的渲染。

所以有的时候会出现闪屏的情况，用户体验很不好。

我们的要求是进页面以后就是用从后台获取的最新数据渲染的页面，整个页面只会 `render` 一次。

那么怎么解决这个问题呢？

## 解决方案

要解决这个问题，那么必然是加载好数据后，再去挂载页面组件，那么加载数据的时机就显得尤为重要。

<!--more-->

借鉴传统服务端渲染页面的方式，这个时机肯定是放在路由里面去做比较合适。

具体到项目里面，就是在 `react-route` 里面的 `onEnter` 事件里面去做页面的初始化请求，当所有数据请求成功以后，在去加载这个页面。

整个页面加载的流程就变成了这样：

```
Route match -> dispatch(init()) -> ComponentWillMount ->  render -> ComponentDidMount
```

### 具体代码如下：

**HomeAction.js**

```js
import { createAction } from "redux-actions"

import { HOME_INDEX } from "../../config/apis.js"
import createAsyncAction from "../../utils/createAsyncAction.js"
import initAPI from "../../utils/initAPI.js"

export const InitActionList = createAsyncAction("home/init")
export const FormChange = "home/formChange"
export const FormFieldChange = "home/formFieldChange"

export function init() {
  return initAPI(InitActionList, HOME_INDEX, "get")
}
```

**HomeReducer.js**

```js
import {
  BillStatus,
  CreditStatus,
  InstallmentStatus,
} from "../../config/constant"
import { InitActionList } from "./HomeAction.js"

const initState = {
  foo: 1,
  bar: 10,
}

export default function (state = initState, action) {
  const type = action.type
  const payload = action.payload
  const meta = action.meta
  switch (type) {
    case InitActionList.start:
      return state
    case InitActionList.success:
      const currentStatus = getCurrentStatus(payload)
      return {
        ...state,
        foo: currentStatus,
      }
    case InitActionList.failure:
      return state
    default:
      return state
  }
}
```

**Router.js**

```js
import { init as initHome } from "./homeAction"

export default function createRoutes(store) {
  function initHome(store) {
    return (nextState, replace, next) => {
      // dispatch 页面加载的 Action，在数据加载完成后在执行 next() 以挂载组件
      store.dispatch(homeInit()).then(() => next())
    }
  }

  return {
    component: App,
    path: "/",
    childRoutes: [
      require("./activate"),
      {
        path: "test",
        getComponent(nextState, cb) {
          require.ensure(
            [],
            (require) => {
              cb(null, require("../views/Test").default)
            },
            "Test"
          )
        },
      },
    ],
    indexRoute: {
      getComponent(nextState, cb) {
        require.ensure(
          [],
          (require) => {
            cb(null, require("../views/Home").default)
          },
          "Home"
        )
      },
      onEnter: initHome(store),
    },
  }
}
```

**Index.js**

```js
import React from "react"
import { render } from "react-dom"
import { AppContainer } from "react-hot-loader"
import { Provider } from "react-redux"
import { hashHistory, Router } from "react-router"
import { syncHistoryWithStore } from "react-router-redux"

import "react-hot-loader/patch"

import createRoutes from "./routes"
import configureStore from "./store"

import "./style/app.scss"

export const store = configureStore(hashHistory, {})
const history = syncHistoryWithStore(hashHistory, store)
const root = document.getElementById("root")
const routers = createRoutes(store)

const renderRoot = () => {
  render(
    <AppContainer>
      <Provider store={store} key="provider">
        <Router routes={routers} history={history} key={Math.random()} />
      </Provider>
    </AppContainer>,
    root
  )
}

if (module.hot) {
  module.hot.accept("./routes", () => {
    renderRoot()
  })
}

renderRoot()
```
