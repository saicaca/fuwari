---
title: 初试 react-router
date: 2015-10-09 05:58:24
tags:
  - JavaScript
  - React
  - react-router
category: 技术
---

react-router 提供简单有强大 API 来方便我们在`React`搭建的单页面中实现路由功能。
首先看一个简单的例子：

```javascript
import React from "react"
import { findDOMNode, render } from "react-dom"
import { Link, Route, Router } from "react-router"

let Page1 = React.createClass({
  render() {
    return (
      <div>
        <h1>Page1</h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Ab accusantium animi dicta dignissimos earum eos esse impedit ipsum iste
        laboriosam numquam odio perspiciatis porro, quas sequi tempore vero
        vitae voluptates?
      </div>
    )
  },
})

let Page2 = React.createClass({
  render() {
    return (
      <div>
        <h1>Page2</h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Fuga porro voluptas voluptatum. Corporis debitis deleniti, doloremque et
        eum ex id iste magni nobis nostrum quae, reiciendis rem repellendus
        similique tempora.
      </div>
    )
  },
})

let App = React.createClass({
  render() {
    return (
      <div>
        <Link to="/page1">Page1</Link>
        <Link to="/page2">Page2</Link>
      </div>
    )
  },
})

render(
  <Router>
    <Route path="/" component={App}>
      <Route path="page1" component={Page1} />
      <Route path="page2" component={Page2} />
    </Route>
  </Router>,
  document.body
)
```

只需要在 `<Link>` 标签中的 to 属性中定义路径，那么在渲染出的页面中点击 Page1 或 Page2 标签，就会显示相应的 Components，而且 url 也会跟着路径进行变化。
我们来简单分析一个这段代码，这里我们定义了三个路由，一个指向根目录即 '/',一个指向 'page/',一个指向 'page/2'.
路由定义必须包裹在 `<Router></Router>` 中。
`<Route></Route>`为每一个路由要定义的路径，并处理它的行为。其中 path 为路径， component 为要渲染的组件。并且还可以提供相应的 handle，用来处理控制路由的行为。
接下来我们来模拟一个拦截登陆的行为。

<!--more-->

```javascript
import React from "react"
import TransitionGroup from "react-addons-transition-group"
import { findDOMNode, render } from "react-dom"
import { History, Link, Route, Router } from "react-router"

require("./index.css")

let goLogin = {
  isLogin: true,
  login() {
    this.isLogin ? this.onChange(false) : this.onChange(true)
    this.isLogin = !this.isLogin
  },
  onChange() {},
}

let App = React.createClass({
  getInitialState() {
    return {
      login: goLogin.isLogin,
    }
  },
  updateAuth(logged) {
    this.setState({
      login: logged,
    })
  },
  componentWillMount() {
    goLogin.onChange = this.updateAuth
  },
  render() {
    return (
      <div>
        <nav className="nav">
          {this.state.login ? (
            <Link to="/logout">Log out</Link>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
        <ul>
          <li>
            <Link to="/page1" activeClassName="active">
              Page1
            </Link>
          </li>
          <li>
            <Link to="/page2" activeClassName="active">
              Page2
            </Link>
          </li>
        </ul>
        {this.props.children}
      </div>
    )
  },
})
```

```javascript
let Login = React.createClass({
  mixins: [History],
  handleClick(event) {
    event.preventDefault()
    goLogin.login()
    var { location } = this.props
    if (location.state && location.state.nextPathname) {
      this.history.replaceState(null, location.state.nextPathname)
    } else {
      this.history.replaceState(null, "/about")
    }
    console.log(this.history)
  },
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Login</button>
      </div>
    )
  },
})

let Logout = React.createClass({
  componentDidMount() {
    goLogin.login()
  },
  render() {
    return (
      <div>
        <p>You are now logged out</p>
      </div>
    )
  },
})

let About = React.createClass({
  render() {
    return (
      <div>
        <h1>登录成功</h1>
      </div>
    )
  },
})

let Page1 = React.createClass({
  render() {
    return (
      <div className="page">
        <h1>Page1</h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Ab accusantium animi dicta dignissimos earum eos esse impedit ipsum iste
        laboriosam numquam odio perspiciatis porro, quas sequi tempore vero
        vitae voluptates?
      </div>
    )
  },
})
let Page2 = React.createClass({
  getInitialState() {
    return {
      className: "pageactive",
    }
  },
  handler() {
    if (this.state.className === "pageactive") {
      this.setState({
        className: "",
      })
    } else {
      this.setState({
        className: "pageactive",
      })
    }
  },
  render() {
    return (
      <div className={`${this.state.className} page`} onClick={this.handler}>
        <h1>Page2</h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Fuga porro voluptas voluptatum. Corporis debitis deleniti, doloremque et
        eum ex id iste magni nobis nostrum quae, reiciendis rem repellendus
        similique tempora.
      </div>
    )
  },
})
```

定义 `needLogin` 函数，用来判断用户否登陆并根据情况跳转到相应的页面。

```javascript
function needLogin(nextState, replaceState) {
  if (!goLogin.isLogin) {
    replaceState({ nextPathname: nextState.location.pathname }, "/login")
  }
}
```

最后，执行 `render` 命令。

```javascript
render(
  <Router>
    <Route path="/" component={App}>
      <Route path="login" component={Login} />
      <Route path="logout" component={Logout} />
      <Route path="about" component={About} />
      <Route path="page1" component={Page1} />
      <Route path="page2" component={Page2} onEnter={needLogin} />
    </Route>
  </Router>,
  document.body
)
```

[点击这里查看 DEMO](http://kisnows.com/F2E-practice/react-router/src/index.html)
这段代码实现了这么一个功能：

1. 首先页面默认为未登录状态。
2. 此时点击 Page1,会显示 Page1 的内容。
3. 点击 Page2 的时候，Page 内容的显示被拦截，出现登陆页面。
4. 当你点击 login 后，就会显示 Page2 的内容，并且状态切换为 Logout.
5. 当我们点击 Logout 的时候，就会退出登录。

在这段代码中，当我们点击 page2 的时候，首先会触发 `<Link>` 标签中的 to 属性来找到对应的 path 为 page2 的路由，然后会触发 needLogin 事件。
在 needLogin 事件中，我们判断 goLogin.isLogin 事件，如果未登录，则将路径替换为 '/login'.
并在 `<Route>` 中找到 path 为 '/login' 的一项，然后渲染 Login 组件。
也就是说我们可以在 `<Route>` 中监听事件，以此来根据需要动态的改变路由地址。
