---
title: Redux 源码解读（长文慎入）
category: 技术
date: 2017-08-18 00:07:34
tags:
  - Redux
  - SourceCode
---

Redux 的源码非常的精炼，短短几百行代码，确提供了强大的功能。今天，我们就来一探究竟。

看源码最简单的方式，就是从入口文件来看，看它依赖哪些模块，然后在依次看这些模块的内容，最后也就对整个代码有个清晰的认识了。

所以我们就从入口文件开始来看：

```js
import applyMiddleware from "./applyMiddleware"
import bindActionCreators from "./bindActionCreators"
import combineReducers from "./combineReducers"
import compose from "./compose"
import createStore from "./createStore"
import warning from "./utils/warning"

/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */
function isCrushed() {}
// 就是根据 isCrushed 是否被压缩了，来警告开发者正在非生产环境使用一个压缩过的代码。
if (
  process.env.NODE_ENV !== "production" &&
  typeof isCrushed.name === "string" &&
  isCrushed.name !== "isCrushed"
) {
  warning(
    "You are currently using minified code outside of NODE_ENV === 'production'. " +
      "This means that you are running a slower development build of Redux. " +
      "You can use looseenvify (https://github.com/zertosh/looseenvify) for browserify " +
      "or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) " +
      "to ensure you have the correct code for your production build."
  )
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
}
```

可以看到它依赖了下面这几个模块：

- createStore
- combineReducers
- bindActionCreators
- applyMiddleware
- compose
- warning

其他没什么说的，就是把一些 API 暴露出去。那我们就先按照这个模块依赖顺序，依次进行解读。

## createStore

<!-- more -->

首先是`createStore`， 用来创建整个应用的 store .
它的依赖模块，都是些工具函数。

- isPlainObject
- $$observable

```js
export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
```

这里逻辑很简单：

第一个 if 语句的意思就是说，如果只传入了两个参数，且第二个参数 preloadedState 为函数，那么就认为第二个参数为 enhancer .

第二个 if 语句确保 enhancer 是一个函数，并且当 enhancer 作为参数传入的时候，返回 enhancer(createStore)(reucer, preloadedState) 作为 createStore 的返回，也就是我们要的 store.

第三个 if 语句确保 reducer 是一个函数。

接着往下看：

```js
let currentReducer = reducer
let currentState = preloadedState
let currentListeners = []
let nextListeners = currentListeners
let isDispatching = false

function ensureCanMutateNextListeners() {
  if (nextListeners === currentListeners) {
    nextListeners = currentListeners.slice()
  }
}

/**
 * Reads the state tree managed by the store.
 *
 * @returns {any} The current state tree of your application.
 */
function getState() {
  return currentState
}
```

这里，把 `preloadState` 赋值给 `currentState` ，可以使应用直接重现某一个状态，也可以用来做服务端渲染时直接由后台计算出来作为应用的初始状态。

`ensureCanMutateNextListeners` 这个函数在 `nextListeners === currentListeners` 成立时把 `currentListeners` 复制了一份赋值给了 `nextListeners` . 用来做什么还不太清楚，先放着。

然后定义了一个获取当前 state 的方法。

### `subscribe`

接下来是一个`subscribe` 方法。

```js
/**
 * Adds a change listener. It will be called any time an action is dispatched,
 * and some part of the state tree may potentially have changed. You may then
 * call `getState()` to read the current state tree inside the callback.
 *
 * You may call `dispatch()` from a change listener, with the following
 * caveats:
 *
 * 1. The subscriptions are snapshotted just before every `dispatch()` call.
 * If you subscribe or unsubscribe while the listeners are being invoked, this
 * will not have any effect on the `dispatch()` that is currently in progress.
 * However, the next `dispatch()` call, whether nested or not, will use a more
 * recent snapshot of the subscription list.
 *
 * 2. The listener should not expect to see all state changes, as the state
 * might have been updated multiple times during a nested `dispatch()` before
 * the listener is called. It is, however, guaranteed that all subscribers
 * registered before the `dispatch()` started will be called with the latest
 * state by the time it exits.
 *
 * @param {Function} listener A callback to be invoked on every dispatch.
 * @returns {Function} A function to remove this change listener.
 */
function subscribe(listener) {
  if (typeof listener !== "function") {
    throw new Error("Expected listener to be a function.")
  }

  let isSubscribed = true

  ensureCanMutateNextListeners()
  nextListeners.push(listener)

  return function unsubscribe() {
    if (!isSubscribed) {
      return
    }

    isSubscribed = false

    ensureCanMutateNextListeners()
    const index = nextListeners.indexOf(listener)
    nextListeners.splice(index, 1)
  }
}
```

注释已经说的非常明白了，注册一个 `listener` 监听函数，把他 push 到当前的监听里列表 `nextListener` 里面，并返回一个 `unsubscribe` 方法用来注销当前这个监听函数。

### dispatch

```js
function dispatch(action) {
  if (!isPlainObject(action)) {
    throw new Error(
      "Actions must be plain objects. " +
        "Use custom middleware for async actions."
    )
  }

  if (typeof action.type === "undefined") {
    throw new Error(
      'Actions may not have an undefined "type" property. ' +
        "Have you misspelled a constant?"
    )
  }

  if (isDispatching) {
    throw new Error("Reducers may not dispatch actions.")
  }

  try {
    isDispatching = true
    currentState = currentReducer(currentState, action)
  } finally {
    isDispatching = false
  }

  const listeners = (currentListeners = nextListeners)
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i]
    listener()
  }

  return action
}
```

 <!-- TODO: -->

用来分发一个 `action` 来改变当前的 **state** . 也是唯一的改变 **state** 的方法。接受一个用来描述动作的 `action` 为参数，并且把这个 `action` 作为函数的返回值。

从代码前面的判断可以看到，action 必须是一个字面量对象，并且必须包含一个 `type` 的属性。

```js
if (isDispatching) {
  throw new Error("Reducers may not dispatch actions.")
}
```

从这里可以看到，如果当前正处于上一个 `action` 的分发阶段，那么当前这个 `action` 有可能会分发失败。

后面进行当前 **state** 的计算，并且按顺序去触发 `nextListeners` 里面的监听函数。

### replaceReducer

```js
/**
 * Replaces the reducer currently used by the store to calculate the state.
 *
 * You might need this if your app implements code splitting and you want to
 * load some of the reducers dynamically. You might also need this if you
 * implement a hot reloading mechanism for Redux.
 *
 * @param {Function} nextReducer The reducer for the store to use instead.
 * @returns {void}
 */
function replaceReducer(nextReducer) {
  if (typeof nextReducer !== "function") {
    throw new Error("Expected the nextReducer to be a function.")
  }

  currentReducer = nextReducer
  dispatch({ type: ActionTypes.INIT })
}
```

替换掉当前的 reducer 并且分发一个用来初始化的内部 action.

```js
export const ActionTypes = {
  INIT: "@@redux/INIT",
}
```

### observable

```js
/**
 * Interoperability point for observable/reactive libraries.
 * @returns {observable} A minimal observable of state changes.
 * For more information, see the observable proposal:
 * https://github.com/tc39/proposalobservable
 */
function observable() {
  const outerSubscribe = subscribe
  return {
    /**
     * The minimal observable subscription method.
     * @param {Object} observer Any object that can be used as an observer.
     * The observer object should have a `next` method.
     * @returns {subscription} An object with an `unsubscribe` method that can
     * be used to unsubscribe the observable from the store, and prevent further
     * emission of values from the observable.
     */
    subscribe(observer) {
      if (typeof observer !== "object") {
        throw new TypeError("Expected the observer to be an object.")
      }

      function observeState() {
        if (observer.next) {
          observer.next(getState())
        }
      }

      observeState()
      const unsubscribe = outerSubscribe(observeState)
      return { unsubscribe }
    },

    [$$observable]() {
      return this
    },
  }
}
```

用来把一个对象变成可 observe 的方法，一般情况下用不到。

### 最后

```js
// When a store is created, an "INIT" action is dispatched so that every
// reducer returns their initial state. This effectively populates
// the initial state tree.
dispatch({ type: ActionTypes.INIT });

return {
  dispatch,
  subscribe,
  getState,
  replaceReducer,
  [$$observable]: observable,
};
```

分发一个 `INIT` 的初始化 action ，用来让所有的 reducer 来返回默认的初始化 **state**.

然后把上面的函数返回出来，作为通过 `createStore` 创建出来的 **store** 的 api.

## combineReducers

这个模块用来合并多个 reducers 到一个 reducer，它的依赖模块：

- ActionTypes
- isPlainObject
- warning

我们依次来看看 combineReducers 里面的内容。

### getUndefinedStateErrorMessage

```js
function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type
  const actionName = (actionType && `"${actionType.toString()}"`) || "an action"

  return (
    `Given action ${actionName}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}
```

定义一个用来生成当 reducer 返回 `undefined` 时错误内容的函数，没什么好说的。

### getUnexpectedStateShapeWarningMessage

```js
function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? "preloadedState argument passed to createStore"
      : "previous state received by the reducer"

  if (reducerKeys.length === 0) {
    return (
      "Store does not have a valid reducer. Make sure the argument passed " +
      "to combineReducers is an object whose values are reducers."
    )
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([az|AZ]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  const unexpectedKeys = Object.keys(inputState).filter(
    (key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach((key) => {
    unexpectedKeyCache[key] = true
  })

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}
```

从函数名 “获取未期望 State 结构错误信息” 可以看出这个函数用来生成当传入的 `inputState` 组成结构错误时的错误信息。

Reducer 必须有 key 值（这不废话），`inputState` 必须是一个字面量对象。且` inputState` 的 key 都应该在 reducer 的自身属性（OwnProperty, 非原型链上的）中，并且不能在传入的 `unexpectedKeyCache` 中。

### assertReducerShape

```js
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key]
    const initialState = reducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === "undefined") {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      )
    }

    const type =
      "@@redux/PROBE_UNKNOWN_ACTION_" +
      Math.random().toString(36).substring(7).split("").join(".")
    if (typeof reducer(undefined, { type }) === "undefined") {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}
```

用来保证传入的 `reducers` 的结构正确，也就说说每个 `reducer` 都必须在收到 INIT action 后返回一个不为 `undefined` 的 `initState` ，并且这个 `action` 不能在 `reducer` 中专门去处理。这也是为什么我们在 reducer 里面一定要指定默认返回的 state 的原因.

### combineReducers

```js
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== "production") {
      if (typeof reducers[key] === "undefined") {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== "production") {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== "production") {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === "undefined") {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state
  }
}
```

`combineReducer` 接收一个用来合并成一个 `reducer` 的对象，执行后返回一个函数，也即是我们的 rootReducer .

首先把传入的 `reducers` 按 `key` 遍历后赋值给 `finalReducers` . 然后进行一堆错误判断，最后返回一个函数 `combination`. 也就是合并后的 reducer :

```js
let hasChanged = false
const nextState = {}
// 遍历 finalReducerKeys
for (let i = 0; i < finalReducerKeys.length; i++) {
// 拿到当前的 reducer key
    const key = finalReducerKeys[i]
// 根据 reducer key 拿到具体的 reducer 函数
      const reducer = finalReducers[key]
// 获取之前的 key 对应的 state
      const previousStateForKey = state[key]
// 计算下一个当前 key 对应的 state
      const nextStateForKey = reducer(previousStateForKey, action)
// 如果计算出来的 state 为 undefined 那么报错
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
// 把当前 key 对应的 state 赋值到下一个全局 state
      nextState[key] = nextStateForKey
// 只要有一个 key 对应的 state 发生了变化，那么就认为整个 state 发生了变化
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
}
// 根据 state 是否发生变化，返回下一个 state 或者上一个 state
    return hasChanged ? nextState : state
  }
```

## bindActionCreators

这个函数非常简单，是一个辅助函数。用来把 dispatch 绑定到一个 actionCreator 上，这样当就可以通过直接调用绑定后的函数来分发一个 action ，而不需要 `dispatch(actionCreator(…))` 了。

## applyMiddleware

这里是重点，也是一般初学者难以理解的地方，我们仔细看看。

```js
import compose from "./compose"

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `reduxthunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    }
    chain = middlewares.map((middleware) => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch,
    }
  }
}
```

代码量非常短，依赖了模块 `compose` .

`applyMiddleware` 函数接受一系列中间件函数作为参数，返回了一个拥有 `createStore` 方法的闭包函数。这个函数，接收 `reducer` ，`preloadedState` 和 `enhancer` 为参数。
配合 createStore 函数来看：

```js
export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }
```

当我们这样创建 store 的时候：

```js
const store = createStore(reducer, applyMiddleware(...middleware))
```

createStore 的第二个参数是个函数，所以就会走到

```js
return enhancer(createStore)(reducer, preloadedState);
```

也就是由 applyMiddleware(...middleware) 的结果接管了 createStore ,实际的 store 是在 applyMiddleware 里面再次调用 createStore 创建的，此时传入的 preloadedState, enhancer 都是 undefined.

```js
// applyMiddleware
const store = createStore(reducer, preloadedState, enhancer)
```

回过头来继续往下看，

```js
//applyMiddleware
dispatch = compose(...chain)(store.dispatch)
```

这里需要先看一下 `compose` 这个模块，它的作用就是达到 `compose(f, g, h) > (...args) => f(g(h(...args)))` 这么一个目的。

那么这里的 `dispatch` 就是在 `store.dispatch` 基础上经过 `middleware` 加强封装后的 `dispatch`.

```js
const middlewareAPI = {
  getState: store.getState,
  dispatch: (action) => dispatch(action),
}
// 把 middlewareAPI 传入到每个中间件中
chain = middlewares.map((middleware) => middleware(middlewareAPI))
```

这里的 `dispatch: (action) => dispatch(action)` ，说明每个中间件中的 `dispatch` 都是独立互不影响的，以免某个中间件中修改了 `dispatch` 的行为。然后给每个中间件都传入 getState 和 dispatch 作为他们的参数。

```js
return {
  ...store,
  dispatch,
};
```

最后用加强后的 `dispatch` 覆盖掉原有 store 中的 `dispatch`.

整个中间件的代码看下来，可能比较抽象，我们结合一个例子来看一下：

**errorMiddleware**

```js
export default ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    const { error, payload } = action
    if (error) {
      dispatch(showToast(payload.message || payload.toString()))
    }
    return next(action)
  }
```

这是我们的一个错误处理中间件。它也是一个高阶函数，首先接受 `dispatch`, `getState` 为参数，返回一个接受 `next` 为参数的函数。`dispatch`, `getState` 就是在上面代码里通过 middlewareAPI 传入了中间件中。

然后我们继续看 errorMiddleware 执行后返回的接受 `next` 为参数的函数，而 `next` 其实就是下一个要执行的 `middleware` .

然后我们需要了解一下中间件的执行顺序，那么为了更清楚的描述一个 action 在中间件中的传播过程，我们假设有以下三个中间件：

```js
const mid1 = () => (next) => (action) => {
  console.log("mid1 before")
  next(action)
  console.log("mid1 after")
}
const mid2 = () => (next) => (action) => {
  console.log("mid2 before")
  next(action)
  console.log("mid2 after")
}
const mid3 = () => (next) => (action) => {
  console.log("mid3 before")
  next(action)
  console.log("mid3 after")
}
```

执行 `applyMiddleware( mid1, mid2, mid3 )`, 那么经过下面代码后

```js
dispatch = compose(...chain)(store.dispatch)
```

就可以得到：

```js
dispatch = (store.dispatch) => mid1(mid2(mid3(store.dispatch)))
```

其中的 **midx** 都是已经执行了 `middleware(middlewareAPI)` 后返回的结果。所以 `mid3` 的 `next` 的值就是 `store.dispatch` 。而 `mid2` 的 `next` 则是 `mid3(store.dispatch)` ，以此类推，`mid1` 的 next 就是 ` mid2(mid3(store.dispatch))` , 这也就是在 **middleware** 调用 `next` 能够让 `action` 转到下一个 **middleware** 的原因。

当我们分发一个 action 时，控制台打印出来的顺序是这样的：

```js
mid1 before
mid2 before
mid3 before
mid3 after
mid2 after
mid1 after
```

可以看到它的流程是这样的：

1. 执行 mid1 中 next 方法调用之前的代码
2. 执行 mid2 中 next 方法调用之前的代码
3. 执行 mid3 中 next 方法调用之前的代码
4. 执行 dispatch 来分发 action
5. 执行 mid3 中 next 方法调用之后的代码
6. 执行 mid2 中 next 方法调用之后的代码
7. 执行 mid1 中 next 方法调用之后的代码

看一张图，会更明白一点：

![reduxmiddleware](/imgs/redux-source-code-read/redux-middleware.png)

其中红色的路径就是我们刚才描述的流程。可以看到其中还有一条黑色路径，也就是如果我们直接在 mid2 中调用 dispatch 会怎么样？我们来改一下 mid2

```js
const mid2 =
  ({ dispatch, getStore }) =>
  (next) =>
  (action) => {
    console.log("mid2 before")
    dispatch(action)
    console.log("mid2 after")
  }
```

改成这样，猜猜会怎样？

答案是，会一直在 mid1 before 和 mid2 before 中死循环，因为调用的 `dispatch` 会让这个 `action` 重新走一遍所有的中间件，也就是图中的黑色路径。那么当我们需要在一个中间件中调用 `dispatch` 的时候，是要对 action 做判断的，只有满足某个条件的时候才调用 `dispatch` 以免出现死循环。改造一下 mid2

```js
const mid2 = ({ dispatch, getStore }) => next => action => {
  console.log('mid2 before')
  if(action.isApi) {
    dispatch({
      isApi: false,
      ...
    })
  }
  dispatch(action)
  console.log('mid2 after')
}
```

这样，就只有在 action 满足 isApi 条件的时候才会取分发一个不满足 isApi 条件的 action ，这样就不会死循环。一般在异步分发 action 的时候会经常用这个方法。比如我们生产环境用来请求数据的 callAPIMiddleware :

```js
export default ({dispatch, getState}) => {
return next => action => {
  const {
    types,
    api,
    callType,
    meta,
    body,
    shouldCallAPI
  } = action
  const state = getState()
  const callTypeList = ['get', 'post']
  if (!api) {
    return next(action)
  }
  if (!(types.start && types.success && types.failure)) {
    throw new Error('Expected types has start && success && failure keys.')
  }
  if (callTypeList.indexOf(callType) === 1) {
    throw new Error(`API callType Must be one of ${callTypeList}`)
  }

  const {start, success, failure} = types
  if (!shouldCallAPI(state)) {
    return false
  }

  dispatch({
    type: start,
    payload: {
      ...body
    },
    meta
  })
  const mapCallTypeToFetch = {
      post: () => fetch(api, {
        method: 'post',
        // credentials 设置为每次请求都带上 cookie
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyWithSource)
      }),
      get: () => {
        const toString = Object.keys(bodyWithSource).map(function (key, index) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(bodyWithSource[key])
        }).join('&')
        return fetch(`${api}?${toString}`, {
          method: 'get',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        })
      }
    }
    const fetching = mapCallTypeToFetch[callType]()
... 省略一堆业务逻辑
  return fetching.then(res => {
    clearTimeout(loadingTimer)
    dispatch(hideLoading())
    if (res.ok) {
      try {
        return res.json()
      } catch (err) {
        throw new Error(err)
      }
    } else {
      dispatch(showToast('请求出错'))
      return Promise.reject(res.text())
    }
  })
    .then(res => resBehaviour(res))
    .then(res => {
      dispatch({
        type: success,
        meta,
        payload: {
          ...res.data
        }
      })
      return Promise.resolve(res)
    })
    .catch(err => {
      console.error(`接口请求出错,${err}`)
      return Promise.reject(err)
    })
}

```

关于中间件就说这么多，大家应该也能理解了。

# 总结

总体上看， Redux 的源码非常短，但是各种实现都非常的精巧。

而且作者非常重视对开发者的体验，注释非常的详细，整体上读起来比较轻松。错误处理也非常详细，可以帮助开发者更容易的定位错误。

最后，由于本人能力有限，文中如果有错误的地方，还请指出一起讨论。
