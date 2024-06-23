---
title: 【翻译向】webpack2 指南（中）
category: 技术
published: 2017-01-18 19:49:14
tags:
  - webpack
---

# 动态模块替换（Hot Module Repalcement -React）

就像之前 [理念页面](https://webpack.js.org/concepts/hot-module-repalcement) 中解析的细节那样，动态模块替换（HMR）会在应用运行时动态的替换、添加或者删除模块而不用重新刷新页面。 HMR 非常有用，当应用只有一个状态树（single state tree）时。

下面介绍的方法描述中使用了 Babel 和 React ,但这并不是使用 HRM 所必须的工具。

## 项目配置

这里会指导你如何用 Babel， React 和 PostCss 一起使用 HMR 去演示一个项目。为了能够跟着下面走下去，需要把这些依赖添加到 `package.json` 中去。

为了使用 HMR，你需要如下这些依赖：

```bash
npm install --save-dev babel@6.5.2 babel-core@6.13.2 babel-loader@6.2.4 babel-preset-es2015@6.13.2 babel-preset-react@6.11.1 babel-preset-stage-2@6.13.0 css-loader@0.23.1 postcss-loader@0.9.1 react-hot-loader@3.0.0-beta.6 style-loader@0.13.1 webpack@2.1.0-beta.25 webpack-dev-server@2.1.0-beta.0
```

同时，为了达到我们演示的目的，还需要：

```bash
npm install --save react@15.3.0 react-dom@15.3.0
```

### Babel Config

`.babelrc` 文件应该如下：

```json
{
  "presets": [
    ["es2015", { "modules": false }],
    // webpack understands the native import syntax, and uses it for tree shaking

    "stage-2",
    // Specifies what level of language features to activate.
    // Stage 2 is "draft", 4 is finished, 0 is strawman.
    // See https://tc39.github.io/process-document/

    "react"
    // Transpile React components to JavaScript
  ],
  "plugins": [
    "react-hot-loader/babel"
    // Enables React code to work with HMR.
  ]
}
```

### Webpack Config

<!-- more -->

```javascript
const { resolve } = require("path")
const webpack = require("webpack")

module.exports = {
  entry: [
    "react-hot-loader/patch",
    // activate HMR for React

    "webpack-dev-server/client?http://localhost:8080",
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint

    "webpack/hot/only-dev-server",
    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates

    "./index.js",
    // the entry point of our app
  ],
  output: {
    filename: "bundle.js",
    // the output bundle

    path: resolve(__dirname, "dist"),

    publicPath: "/",
    // necessary for HMR to know where to load the hot update chunks
  },

  context: resolve(__dirname, "src"),

  devtool: "inline-source-map",

  devServer: {
    hot: true,
    // enable HMR on the server

    contentBase: resolve(__dirname, "dist"),
    // match the output path

    publicPath: "/",
    // match the output `publicPath`
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader?modules", "postcss-loader"],
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates
  ],
}
```

上面有很多配置，但不是所有都和 HMR 有关。可以通过查阅 webpack-dev-server options 和 concept pages 来加深理解。

我们基础设想是这样的，你的 JavaScript 入口文件在 `./src/index.js` 且你使用 CSS Module 来编写样式文件。

配置文件中需要重点关注的是 `devServer` 和 `entry` key. `HotModueReplacementPlugin` 同样需要被包含在 `plugins` key 中。

为了达到目的，我们引入了两个模块：

- `react-hot-loader` 添加到了入口中， 是为了能够使 React 支持 HMR
- 为了更好的理解 HMR 每次更新的时候做了哪些事情，我们添加了 `NamedModulePlugin`

### Code

```javascript
// ./src/index.js
import React from "react"
import ReactDOM from "react-dom"
import { AppContainer } from "react-hot-loader"

// AppContainer is a necessary wrapper component for HMR

import App from "./components/App"

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById("root")
  )
}

render(App)

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NewApp = require("./components/App").default
    render(NewApp)
  })
}
```

```javascript
// ./src/components/App.js
import React from "react"

import styles from "./App.css"

const App = () => (
  <div className={styles.app}>
    <h2>Hello, </h2>
  </div>
)

export default App
```

```css
.app {
  text-size-adjust: none;
  font-family: helvetica, arial, sans-serif;
  line-height: 200%;
  padding: 6px 20px 30px;
}
```

一个需要特别注意的是 `module` 的引用：

1. Webpack 会暴露出 `module.hot` 给我们的代码，当我们设置 `devServer: { hot: true }` 时；
2. 这样我们可以使用 `module.hot` 来给特定的资源弃用 HMR （这里是 `App.js`）. 这里有一个非常重要的 API `module.hot.accept` ,用来决定如何处理这些特定的依赖。
3. 需要注意的是，webpack2 内建支持 ES2015 模块语法，你不需要在 `module.hot.accept` 中重新引用跟组件。为了达到这个目的，需要在 `.babelrc` 配置 Babel ES2015 的预先设置：
   ```javascript
   ;["es2015", { modules: false }]
   ```
   就像我们在之前 Babel Config 中配置的那样。需要注意，禁用 Babel 的模块功能 不仅仅是为了启用 HMR。如果你不关掉这个配置，那么你会碰到需要问题。
4. 如果你在 webpack2 的配置文件中使用 ES6 模块，并且你按照 #3 修改了 `.babelrc`，那么你需要使用 `require` 语法来创建两个 `.babelrc` 文件：
   1. 一个放在根目录下面并配置为 `"presets: ["es2015"]"`
   1. 一个放在 webpack 要编译的文件夹下，比如在这个例子中，就是 `src/`
      所以在这个案例中，`module.hot.accept` 会执行 `render` 方法无论 `src/compoents/App.js` 或者其它的依赖文件变化的时候 ——这意味着当 `App.css` 被引入到 `App.js` 中以后，即使是 `App.css` 被修改，
      `render` 方法同样会被执行。

### Index.html

入口页面需要被放在页面 `dist` 下面，webpack-dev-server 的运行需要这个文件。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example Index</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

### Package.json

最后，我们需要启动 `webpack-dev-server` 来打包我们的代码并且看看 HMR 是如何工作的。我们可以使用如下的 `package.json` 入口：

```json
{
  "scripts": {
    "start": "webpack-dev-server"
  }
}
```

执行 `npm start`, 打开浏览器输入 `http://localhost:8080`, 应该可以看到下面这些项展示在 console.log 中：

```
dev-server.js:49[HMR] Waiting for update signal from WDS…
only-dev-server.js:74[HMR] Waiting for update signal from WDS…
client?c7c8:24 [WDS] Hot Module Replacement enabled.
```

然后编辑并且修改 `App.js` 文件，你会在 console.log 中看到类似如下的日志：

```
[WDS] App updated. Recompiling…
client?c7c8:91 [WDS] App hot update…
dev-server.js:45 [HMR] Checking for updates on the server…
log-apply-result.js:20 [HMR] Updated modules:
log-apply-result.js:22 [HMR]  - ./components/App.js
dev-server.js:27 [HMR] App is up to date.
```

注意 HMR 指出了更新模块的路径。这是因为我们使用了 `NamedModulesPlugin`.

# 开发环境（Development）

这个章节介绍在开发过程中可以使用的一些工具。

**需要注意，不能在生产环境使用**

## Source Map

当 JS 发生异常的时候，我们需要指导是哪一个文件的哪一行出错了。但是当文件都被 webpack 打包以后，找问题会变得很麻烦。
Source Map 就是为了解决这个问题的。它有很多不同的[选项](https://webpack.js.org/configuration/devtool)，每一种都有的好处和不足。在一开始，我们使用：

```bash
devtool: "cheap-eval-source-map"
```

## 选择一个工具（Choosing a Tool）

Webpack 可被用于监视模式（watch mode）。这种模式下， webpack 会监视你的文件，当它们有变动的时候就会重编译。Webpack-dev-server 提供了一个很方便使用的开发环境的服务，并且支持自动刷新功能。如果你已经有了一个开发环境的服务，并且希望能够拥有更好的适应性，那么 webpack-dev-middleware 可以被用作一个中间件来达到这个目的。

Webpack-dev-server 和 webpack-dev-middleware 实在内存中进行编译的，这意味着打包后的代码包并不会保存到本地磁盘中。这回使打包变得很快，同时不会产生很多临时文件来污染你的本地文件系统。

大多数情况下，你都会想要去使用 webpack-dev-server， 因为它使用起来很方便，而且提供了许多开箱即用的功能。

### Webpack 监视模式（wtach mode）

Webpack 的监视模式会检测文件的变动。只要变动被检测到，它就会重新进行一次编译。我们希望它的编译过程能有一个很好的进度展示。那么就执行以下命令：

```bash
webpack --progress --watch
```

随便修改一个文件然后保存，你就会看到重新编译的过程。

监视模式没有考虑任何和服务有关的问题，所以你需要自己提供一个服务。一个简单的服务就是 `[server](https://github.com/tj/serve)`. 当安装好后（`npm i server -g`），在你打包后的文件目录下运行：

```bash
server
```

当每次重新编译后，你都需要手动的去刷新浏览器。

### webpack-dev-server

webpack-dev-server 提供一个支持自动刷新的服务。

首先，确认你 `index.html` 页面里面已经引用了你的代码包。我们先假设 `output.filename` 设置为 `bundle.js`:

```html
<script src="/bundle.js"></srcipt>
```

从 npm 安装 `webpack-dev-server`：

```bash
npm install webpack-dev-server --save-dev
```

然后就可以执行 `webpack-dev-server` 的命令了：

```bash
webpack-dev-server --open
```

上面的命令会自动打开你的浏览器并指定到 `http://localhost:8080`.

修改一下你的文件并保存。你会发现代码被重新打包了，当打包完成的时候，页面会自动刷新。如果没有如愿达到效果，那么你需要调整 `watchOptions(https://webpack.js.org/configuration/dev-server#devserver-watchoptions-)`.

现在你有了一个可以自动刷新的服务，接下来我们看如何启用动态模块替换（Hot Module Replacement）。这是一个可以提供不刷新页面替换模块的接口，查看[这里](https://webpack.js.org/guides/hmr-react)了解更多 。

webpack-dev-server 可以做很多的事情，比如代理请求到你的后端服务。想了解更多的配置项，那就查看 [devServer 的文档吧](https://webpack.js.org/configuration/dev-server)。

### webpack-dev-middleware

webpack-dev-middleware 适用于基于中间件的链接堆栈（好难翻译）。当你已经有一个 Node.js 服务或者你想要完全的控制服务的时候会很有用。

这个中间件会让文件编译在内存中进行。当一个编译在进行过程中，它会延迟一个文件请求，直到它编译完成。

首先从 npm 上安装：

```bash
npm install express webpack-dev-server --save-dev
```

作为一个例子，我们可以这样使用中间件：

```javascript
var express = require("express")
var webpackDevMiddleware = require("webpack-dev-middleware")
var webpack = require("webpack")
var webpackConfig = require("./webpack.config")

var app = express()
var compiler = webpack(webpackConfig)

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: "/", // Same as `output.publicPath` in most cases.
  })
)

app.listen(3000, function () {
  console.log("Listening on port 3000!")
})
```

根据你在 `output.publicPath` 和 `output.filename` 中的配置，你打包的代码应该可以通过 `http://localhost:3000/bundle.js` 访问。

默认情况下使用的是监视模式。它还支持懒模式（lazy mode），只有在有请求进来的时候才会重新编译。

配置如下：

```javascript
app.use(
  webpackDevMiddleware(compiler, {
    lazy: true,
    filename: "bundle.js", // Same as `output.filename` in most cases.
  })
)
```

还有许多其它有用的选项，详细内容可以查看 [文档](https://webpack.js.org/configuration/dev-server).

# 为生产环境构建（Building for Production）

本章介绍如何用 webpack 来做生产环境的构建。

## 一条自动化的方式

执行 `webpack -p`(等同于 `webpack --optimize--minimize --define process.env.NODE_ENV="production"`).
这会执行以下几个步骤：

- 使用 `UglifyJsPlugin` 压缩文件
- 执行了 `LoaderOptionsPlugin`, 查看[文档](https://webpack.js.org/plugins/loader-options-plugin)
- 设置 Node 的环境变量

### 源码压缩

webpack 使用 `UglifyJsPlugin` 来压缩源码，通过执行 [UglifyJs](http://lisperator.net/uglifyjs/) 来达到压缩输出代码的目的。这个插件支持所有 UgilfyJs 的功能。在命令行里输入 `--optimize-minimize` ，那么相当与在配置文件中添加了以下配置：

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  /*...*/
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap:
        options.devtool &&
        (options.devtool.indexOf("sourcemap") >= 0 ||
          options.devtool.indexOf("source-map") >= 0),
    }),
  ],
}
```

这样，基于 [devtools option](https://webpack.js.org/configuration/devtool/) ，在打包的时候会生成 Source Map.

### 资源映射（Source Map）

我们推荐在开发环境启用 Source Map. 因为在 debug 或者测试的时候很有用。Webpack 可以生成包含在代码包或者分离文件中的 inline Source Map.

在配置文件中，通过修改 `devtools` 配置来设置 Source Map 类型。目前我们支持七种不同类型的 Source Map. 可以在[具体文档](https://webpack.js.org/configuration/devtool)中找到更加详细的介绍。

一个比较好好的选择是使用 `cheap-module-source-map`，可以将源映射简化为每行映射(simplifies the Source Maps to a single mapping per line)。

### Node 环境变量

执行 `webpack -p`( `--define process.env.NODE_EMV="production"`) 会通过如下的配置调用 `DefinePlugin`:

```javascript
// webpack.config.js
const webpack = require("webpack")

module.exports = {
  /*...*/
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
}
```

`DefindPlugin` 会在源码中进行查找和替换的工作。所有找到的 `process.env.NODE_ENV` 都会被替换为 `production`. 这样，类似与 `if(process.env.NODE_ENV !=='procution') console.log(…)` 这样的代码就会被 `UnglifyJs` 认为等同于 `if(false) console.log(…)` .

## 一个手动的方式：为 webpack 配置不同环境变量下的配置文件

一个最简单的方式来为 webpack 配置不同环境变量下的配置文件的方法就是建立多个配置文件。比如：

**dev.js**

```javascript
// 此处官网文档有语法错误，我改了一下
module.exports = function (env) {
  return {
    devtool: "cheap-module-source-map",
    output: {
      path: path.join(__dirname, "/../dist/assets"),
      filename: "[name].bundle.js",
      publicPath: publicPath,
      sourceMapFilename: "[name].map",
    },
    devServer: {
      port: 7777,
      host: "localhost",
      historyApiFallback: true,
      noInfo: false,
      stats: "minimal",
      publicPath: publicPath,
    },
  }
}
```

**prod.js**

```javascript
module.exports = function (env) {
  return {
    output: {
      path: path.join(__dirname, "/../dist/assets"),
      filename: "[name].bundle.js",
      publicPath: publicPath,
      sourceMapFilename: "[name].map",
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true,
        },
        compress: {
          screw_ie8: true,
        },
        comments: false,
      }),
    ],
  }
}
```

然后把我们的 webpack.config.js 的内容改成下面这样：

```javascript
function buildConfig(env) {
  return require("./config/" + env + ".js")({ env: env })
}

module.exports = buildConfig(env)
```

最后，在 `package.json` 中添加如下命令：

```bash
"build:dev": "webpack --env=dev --progress --profile --colors",
 "build:dist": "webpack --env=prod --progress --profile --colors",
```

可以看到，我们把环境变量传给了 webpack.config.js 文件。从这里我们使用一个简单的方式通过传递环境变量来决定使用正确的配置文件。

一个更加高级的途径是我们有一个基础配置文件，里面有所有共通的功能，然后在不同环境变量下的不同功能通过指定特定的文件，然后使用 `webpack-merge` 来合并成一个完整的配置。这样可以避免写很多
重复的代码。比如，类似与解析 js,ts,png,jpeg 等都是共通的功能，需要放在基础配置文件里面：

**base.js**

```javascript
module.exports = function () {
  return {
    entry: {
      polyfills: "./src/polyfills.ts",
      vendor: "./src/vendor.ts",
      main: "./src/main.ts",
    },
    output: {
      path: path.join(__dirname, "/../dist/assets"),
      filename: "[name].bundle.js",
      publicPath: publicPath,
      sourceMapFilename: "[name].map",
    },
    resolve: {
      extensions: ["", ".ts", ".js", ".json"],
      modules: [path.join(__dirname, "src"), "node_modules"],
    },
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loaders: ["awesome-typescript-loader", "angular2-template-loader"],
          exclude: [/\.(spec|e2e)\.ts$/],
        },
        {
          test: /\.css$/,
          loaders: ["to-string-loader", "css-loader"],
        },
        {
          test: /\.(jpg|png|gif)$/,
          loader: "file",
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          loader: "url-loader?limit=100000",
        },
      ],
    },
    plugins: [
      new ForkCheckerPlugin(),

      new webpack.optimize.CommonsChunkPlugin({
        name: ["polyfills", "vendor"].reverse(),
      }),
      new HtmlWebpackPlugin({
        template: "src/index.html",
        chunksSortMode: "dependency",
      }),
    ],
  }
}
```

然后使用 `webpack-merge` 来合并特定环境变量下指定的配置文件。来看一个合并生产环境下特定配置的例子（和上面 prod.js 对比以下）：

**prod.js(updated)**

```javascript
const webpackMerge = require("webpack-merge")

const commonConfig = require("./base.js")

module.exports = function (env) {
  return webpackMerge(commonConfig(), {
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("prod"),
        },
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true,
        },
        compress: {
          screw_ie8: true,
        },
        comments: false,
      }),
    ],
  })
}
```

可以注意到，在 'prod.js' 中主要有三处更新，分别是：

    • 通过 'webpack-meger' 合并了 `base.js`
    • 把 `output` 属性移到了 `base.js` 中。我们只要关心在 `base.js` 中以外的不同的配置就可以了
    • 通过 `DefinePlugin` 把 `process.env.NODE_ENV` 设置为 `prod`. 这样，整个应用代码中的 `process.env.NODE_ENV` 都有一个为 `prod` 的值了。

哪些需要在不同的环境变量下保持一致都由你来决定。这里只是通过一个 DEMO 来典型的说明一下如何在不同的环境变量下保持部分配置的统一。

可以看到，`webpack-merge` 是多么强大，可以让我们避免写很多重复的代码（外国人话真多）。

# React 懒加载（Lazy Loading - React）

通过使用高阶函数可以使一个组件懒加载它的依赖而不需要它的消费者知道，或者使用一个接收函数或者模块的组件，可以使一个消费者可以懒加载它的子组件而不需要它的子组件知道。

## 组件懒加载

先看一个消费者选择去懒加载一些组件。`importLazy` 是一个返回 `defualt` 属性的函数，这是为了能和 Babel/ES2015 互通。如果你不需要，可以忽略掉 `importLazy` 方法。`importLazy` 只是简单的返回了通过 `export default` 暴露出的模块。

```javascript
<LazilyLoad
  modules={{
    TodoHandler: () => importLazy(import("./components/TodoHandler")),
    TodoMenuHandler: () => importLazy(import("./components/TodoMenuHandler")),
    TodoMenu: () => importLazy(import("./components/TodoMenu")),
  }}
>
  {({ TodoHandler, TodoMenuHandler, TodoMenu }) => (
    <TodoHandler>
      <TodoMenuHandler>
        <TodoMenu />
      </TodoMenuHandler>
    </TodoHandler>
  )}
</LazilyLoad>
```

## 高阶组件（Higher Order Component）

作为一个组件，你可以确保整个组件本身的依赖是懒加载的。当一个组件依赖一个非常大的库文件的时候会很有用。假设我们要写一个支持代码高亮的 Todo 组件：

```javascript
class Todo extends React.Component {
  render() {
    return (
      <div>
        {this.props.isCode ? <Highlight>{content}</Highlight> : content}
      </div>
    )
  }
}
```

我们可以确保只有当我们需要代码高亮功能的时候才去加载这个代价高昂的库文件：

```javascript
// Highlight.js
class Highlight extends React.Component {
  render() {
    const {Highlight} = this.props.highlight;
    // highlight js is now on our props for use
  }
}
export LazilyLoadFactory(Highlight, {
  highlight: () => import('highlight'),
});

```

注意这个 Highlight 组件的消费者是如何在不知情的情况下被懒加载的。

## 完整的代码

LazilyLoad 组件的源码，暴露了组件接口和高阶组件接口。

```javascript
import React from "react"

class LazilyLoad extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      isLoaded: false,
    }
  }

  componentWillMount() {
    this.load(this.props)
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillReceiveProps(next) {
    if (next.modules === this.props.modules) return null
    this.load(next)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  load(props) {
    this.setState({
      isLoaded: false,
    })

    const { modules } = props
    const keys = Object.keys(modules)

    Promise.all(keys.map((key) => modules[key]()))
      .then((values) =>
        keys.reduce((agg, key, index) => {
          agg[key] = values[index]
          return agg
        }, {})
      )
      .then((result) => {
        if (!this._isMounted) return null
        this.setState({ modules: result, isLoaded: true })
      })
  }

  render() {
    if (!this.state.isLoaded) return null
    return React.Children.only(this.props.children(this.state.modules))
  }
}

LazilyLoad.propTypes = {
  children: React.PropTypes.func.isRequired,
}

export const LazilyLoadFactory = (Component, modules) => {
  return (props) => (
    <LazilyLoad modules={modules}>
      {(mods) => <Component {...mods} {...props} />}
    </LazilyLoad>
  )
}

export const importLazy = (promise) => promise.then((result) => result.default)

export default LazilyLoad
```

提示

- 通过使用 bundle loader 可以语义化命名代码块，一次来智能的加载一组代码
- 确保你使用了 babel-preset-2015, 并且设置 modules 为 false，这允许 webpack 去处理 modules

# 公开路径？（Public Path）

Webpack 提供了一个很长有用的功能，可以设置你应用中所有资源引用的基础路径。它被称之为 `publicPath`.

## 使用场景（Use case）

这里有一些真实应用中的场景，通过这个功能来达到目的。

### 在构建的时候设置值

在开发模式下，我们通常会把 `assets/` 目录放在和入口页同级的目录下面。这样没有问题，但是假如在生产环境下你的静态资源是存放在 CDN 上那又该怎么办呢？

可以很方便的通过环境变量来解决这个问题。假设我们有一个变量 `ASSET_PATH`:

```js
// 这里看起来好像有问题
import webpack from "webpack"

// Whatever comes as an environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || "/"

export default {
  output: {
    publicPath: ASSET_PATH,
  },

  plugins: [
    // This makes it possible for us to safely use env vars on our code
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": JSON.stringify(ASSET_PATH),
    }),
  ],
}
```

### 在开发中设置值（Set Value on the fly）

另一种方式是在开发过程成设置 public 路径。Webpack 暴露了一个全局变量 `__webpack_public_path__` 来让我们达到这个目的。所以在你的入口文件中，你可以这样做：

```bash
__webpack_publick_path__ = process.en.ASSET_PATH;
```

如何来做都取决于你。当我们通过 `DefinePlugin` 进行了配置以后， `process.env.ASSET_PATH` 在任何地方都可以直接拿来使用。
