---
title: 基于 React 的前端项目开发总结
category: 技术
date: 2017-05-12 23:00:52
tags:
  - React
  - Redux
  - react-router
---

# 技术选型

我们的项目主要选用以下技术开发，再配合一些其它辅助工具。

- react
- react-router
- redux
- react-redux

# 开发及线上环境

## 开发环境

由于项目是前后端分离的，所以我们需要一套完整的开发环境，需要包括以下功能：

- 数据 Mock
- Webpack 实施编译刷新
- 方便前后端联调

基于这些需求，我们基于 Express, Webpack,Webpack-dev-middleware 搭建了这套完整的开发环境。

![开发环境](/imgs/react-base-project-summary/dev-env.png)

可以看到，浏览器所有的请求都被本地的 Node.js 服务拦截。对于静态资源请求，都委托给 `webpack-dev-middleware` 来处理，对于接口请求根据不同的环境来决定要做的操作。

### 本地开发

当 `ENV = 'development'` 时，也就是开发环境，那么就直接读取本地的 mock 数据来渲染页面。

### 前后端联调

当 `ENV = 'api'` 时，也就是我们认为的联调环境，这个时候对于接口请求由 node.js 转发到需要联调的真实后端服务地址上，从而避免直接调用所产生的跨域问题。

这样就可以直接用本地开发代码和后端联调，能大大提高效率，省去了每次需要往服务器上构建部署的步骤。

## 线上环境

<!--more-->

前后端是分开部署的，所有的静态资源都放在 CDN (example.cdn.com)上面。

也就是说我们的页面在 example.cdn/index.html 这里，但是请求的接口在 example.163.com/api/xxx,我们肯定不能让用户去直接去访问 example.cdn.com/index.html,这样不合理，而且由跨域问题存在

那么访问 example.dai.163.com 的时候，怎么拿到我们的 html 页面呢？
看下图：

![线上环境](/imgs/react-base-project-summary/online.png)

在客户端和后台服务之间架设一台 nginx, 我们访问的 example.dai.163.com 有两种请求：

- html 页面资源
- 接口请求

这两种请求都先经过 nginx，在这里做判断，如果是页面请求那么由 nginx 转发到 CDN， 否则交给后端服务来响应接口请求。

拿到页面以后，其它所有的 css, js 等静态资源都是直接请求到 CDN ，这里没什么说的。

# 数据流转

借助 redux 来管理数据流，我们来看这张图。

![数据流转](/imgs/react-base-project-summary/data-flow.png)

首先，通过 `middleware` 和 `reducer` 生成 `store`, 然后获得项目的初始 `state`,通过初始 `state` 去渲染页面的初始状态。

以 `Home` 页面为例，首先 `Home` 通过 `react-redux` 提供的 `connect` 方法拿到初始 `state` 作为 `Home` 的 `prop` 传递给 `Home`. 而 `Home` 由多个不同的子组件组成，这些组件的需要数据再由 Home 通过 props 传递给自己的子组件。

当 `Home` 的初始状态加载完毕后，我们需要向后端请求去拿去一些用户数据。这时，我们分发一个下面这种格式的 `action`:

```js
{
  types: ['home/start','home/success','home/failure'],
  payload: {
    api:
    ...
  },
  meta: {
    isApi: true
  }
}
```

所有的 `action` 都会按照我们制定的循序通过一个个 `middleware`.

在这里，我们的 `action` 会被 `callApiMiddleware` 通过 `meta` 里面的 `isApi` 标识命中，并去做相应的事情。

比如在这个中间件里面，我们去做了真实的接口请求，在请求成功或失败的时候分发对应的 `action`，以及做一些统一的业务逻辑。比如我们对后端返回的接口中 `code` 值有统一的约定，假设 1 为成功， 2 为失败， 3 为未登录。那么我们就可以在中间件中去处理这些业务逻辑。

当请求成功，并渲染页面后，假设用户点击了一个按钮，这个按钮需要唤起 `native` 的一些功能，比如说拍照。那么我们分发一个唤起拍照功能的 `camera/start` 的`action`:

```js
{
  types: ['sdk/start','sdk/success','sdk/failure'],
  payload: {
    command:
    ...
  },
  meta: {
    isSDK: true
  }
}
```

同样的道理，这个 `action` 会被 `EpaySDKMiddleware` 所识别并处理，在调起 native 的时候， 为了保证安全性，我们需要向后发起一个请求去拿签名，这个时候就可以在 `EpaySDKMiddleware` 里面分发一个接口请求的 `action`，那么这个 `action` 同样需要走一遍所有的 `middleware`. 那么这个接口请求的 `action` 就会像上面的流程一样，通过 `callApiMiddleware` 去处理。

中间件的存在，使整个流程变得非常清晰，接口的请求的中间件就只做接口请求，调用 native 接口的中间件就只做对 native 的调用，当对 native 接口的调用需要做后端接口请求的时候，去分发一个 `action` 走接口请求的中间件。

每个中间件只专注于自己的事情，既方便后续的维护，同时也提供了一个很好的拓展方式。而 `View` 层需要做的就只是做出分发 action，然后拿数据渲染页面就可以了，其他的逻辑都不用关心。

# 一个例子

![整体流程](/imgs/react-base-project-summary/overall-process.png)

假设我们由如下的一个路由配置。

```js
{
    component: App,
    path: '/',
    onEnter: initLogin(store),
    indexRoute: {
      getComponent(nextState, cb) {
        require.ensure([], require => {
          cb(null, require('../views/Home').default)
        }, 'Home')
      },
      onEnter: initHome(store)
    },
    childRoutes: [
      createActivateRoute(store),
      {
        path: 'test',
        indexRoute: {
          getComponent(nextState, cb) {
            require.ensure([], require => {
              cb(null, require('../views/Test').default)
            }, 'Test')
          }
        }
      },
      ...
    ]
}
```

那结合 `react-route` 我们来看一个完整的流程。当我们浏览器里面输入 example.dai.163.com/index.html/#/ 的时候。

首先，通过最上面 线上环境 一节提到的内容，拿到页面需要 html,css,js.

然后渲染 `Provide` 和 `Router` 组件，分别提供 `store` 的注入和路由的控制。

此时触发根路径的路由匹配，然后加载根组件 `APP`, 然后根据路由匹配规则匹配到 `IndexRouter`, 加载 `Home` 组件。

后面的事情就和前面数据流转一节讲的是一样的了。

# 总结

在前后端完全分离的基础上，借助一套完善的开发环境，可以大大提高的我们的开发效率，降低前后端联调的成本。

同时借助于 Redux 思想，实现单向数据流，让我们可以实现一个非常清晰的数据流向。并且，借助于中间件，我们可以更加有效的控制数据流转的过程。为后面项目的扩展提供无限的想象空间。
