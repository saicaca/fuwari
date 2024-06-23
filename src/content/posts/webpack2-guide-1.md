---
title: 【翻译向】webpack2 指南（上）
category: 技术
date: 2017-01-17 21:49:35
tags:
  - webpack
---

# 前置定义

Bundle 代码包
Chunk 代码块

# 安装

npm install webpack --save-dev

# 代码分割

代码分割是 webpack 中最引人注目的功能之一。它允许你把代码分割成各种可以根据需求载入的代码包，就像一个用户浏览器去匹配路由一样，或者一个用户发出的事件。这允许你小的模块，允许你控制资源的载入优先级，如果使用得当的话，可以大大影响（降低）你应用的加载时间。

## 缓存和并行加载的资源分割

### 第三方代码分割

一个典型的应用会依赖很多第三方的框架和库文件。不像应用代码本身，这些第三方代码的变更非常频繁。
如果我们保持这些库在它本身的代码包中，从应用代码本身分离出来，那么我们就可以使用浏览器的缓存策略去在一个长时间内把这些代码缓存到最终用户的机器上。

为了达到这个效果，第三方代码的 verndor 包的 hash 部分必须保持不变，不管应用代码如何变化。学习 [如何通过 `CommonsChunkPlugin` 来分割 verndor/libray 代码](https://webpack.js.org/guids/code-splitting-libraries)。

### CSS 分割

你可能也想把样式文件分割成为一个单独的包，从应用逻辑总独立出来。这可以增强样式文件的可缓存性，并且允许浏览器在加载应用代码时并行加载你的样式文件，因此也可以避免 FOUC （一个无样式内容的闪屏）。
学习 [如何去分割 CSS](https//webpack.js.org/guides/code-splitting-css) 通过使用 `ExtractTextWebpackPlugin`.

## 按需代码分割

虽然前面的资源分割需要用户在配置文件中预先指定分割点，但是也可以在应用代码中创建动态的分割点。

这个功能在有很多细微颗粒代码块时会很有用，举个例子，每一个应用的路由或者按照用户的预测行为。这可以使用户按需加载需要的资源。

### 通过 `require.ensure()` 来分割代码

`require.ensure` 是一个 CommonJS 风格的方式去异步加载资源。通过添加 `require.ensure([<fileurl>])` , 我们可以在代码中定义一个分割点。 Webpack 可以创建一个包含在这个分割点中的所有代码的代码包。学习 [如何分割代码](https://webpack.js.org/guides/code-splitting-require) 通过使用 `require.ensure()`.

> TODO System.import()

<!-- more -->

# 代码分割 - CSS

在 webpack 中，当你使用 css-loader 并且在 JavaScript 中引入 CSS 文件，那么 CSS 文件会被打包在你的 JavaScript 文件中。这有一个不好的地方，就是你无法使用浏览器异步并行加载 CSS 的能力。相反，你的页面会等到整个 JavaScript 文件加载完成，才完成了样式文件的加载。Webpack 可以通过使用 extract-text-webpack-plugin 和 css-loader 来把样式文件分离出来去解决这个问题。

## 使用 `css-loader`

引入 css 到你的 JavaScript 中，需要使用 css-loader 去配置 webpack 的配置文件。

```javascript
//webpack.config.js

modules.exports = function(env){
    entry: '..',
    ...
    module: {
        rules: [{
            test: /\.css$/,
            exclude: /node_modules/,
            loader: 'css-loader'
        }]
    }
    ...
}
```

## 使用 `extract-text-webpack-plugin` - ExtractTextPlugin

安装：

```bash
npm I --save-dev extract-text-webpack-plugin
```

要使用这个 `ExtractTextPlugin`,需要通过两个步骤配置在 `webpack.config.js` 中。

### 在 lodaer 里面

从之前的 `css-loader` 中适配，我们应该如下添加 `ExtractTextPlugin`.

```bash
loader: ExtractTextPlugin.extract('css-loader?sourceMap') //Can be used without sourcemaps too.
```

### 在 plugin 里面

```bash
new ExtractTextPlugin({ filename: 'bundle.css', disable: false, allChunks: true })
```

通过这两步，就可以生成一个新的包含所有 CSS 模块的代码包，然后把他们添加到 `index.html` 的 `heade` 中去。可以通过 [ExtractTextPlugin](https://github.com/webpack/extract-text-webpack-plugin#api) 去了解关于它 api 的更多信息。

完整的配置文件如下：

```javascript
var ExtractTextPlugin = require("extract-text-webpack-plugin")
module.exports = function () {
  return {
    entry: "./main.js",
    output: {
      path: "./dist",
      filename: "bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract({
            loader: "css-loader?sourceMap",
          }),
        },
      ],
    },
    devtool: "source-map",
    plugins: [
      new ExtractTextPlugin({
        filename: "bundle.css",
        disable: false,
        allChunks: true,
      }),
    ],
  }
}
```

# 代码分割-库文件

一个典型的应用会依赖很多第三方来提供框架或功能支持。项目中使用的固定版本的库/框架文件的代码一般不会有变动，然而应用本身的业务逻辑代码却经常会有变动。

把应用代码和库文件的代码打包在一起是一件非常低效的事情。这是因为浏览器可以根据缓存头缓存这些资源文件到本地而不用每次都去服务端或者 cdn 上去发请求重新获取，如果文件内容没有变动的话。为了能够享受这个好处，我们需要保持第三方文件的 hash 不变，无论应用本身的代码如何变化。

我们只有把应用代码和第三方代码分离开才可以达到这样的效果。

我们考虑一个一个简单的应用，它使用了 momentjs ，一个通常用来时间格式化的库。

安装 `moment` ：

```bash
npm install --save moment
```

Index 文件会引用 `moment` 作为一个依赖并且打印当前的时间：

**Index.js**

```javascript
var moment = require("moment")
console.log(moment().format())
```

我们可以通过如下这个配置文件来打包这个应用

**Webapck.config.js**

```javascript
module.exports = function (env) {
  return {
    entry: "./index.js",
    output: {
      filename: "[chunkhash].[name].js",
      path: "./dist",
    },
  }
}
```

当运行 `webapck` 命令的时候，如果你检查打包后的文件，你会发现 `moment` 和 `index.js` 都被打包在了 `bundle.js` 中。

这不是一个很好的解决方案。如果 `index.js` 修改了，那么这打包文件会重新构建，浏览器就需要重新去加载这个文件，即使 moment.js 文件并没有任何改动。

## 多个入口

让我们缓和这个问题，我们给 moment 添加一个新的入口命名为 vendors.

**Webpack.config.js**

```javascript
module.exports = function (env) {
  return {
    entry: {
      main: "./index.js",
      vendor: "moment",
    },
    output: {
      filename: "[chunkhash].[name].js",
      path: "./dist",
    },
  }
}
```

现在执行 webpack 命令，我们会看到两个打包后的文件。如果你检查里面代码的话，你会看到 `moment` 的代码同时出现在两个代码包中。

为了解决这个问题，我们需要使用 [CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin).

## `CommonsChunksPlugin`

这是一个相当复杂的插件。它从根本上允许你从不同的代码包中提取出所有的相同模块并且把它们加入到共同的代码包中。如果这个相同的代码包不存在，那么就创建一个新的。

我们可以修改 webpack 的配置文件来使用这个 `CommonsCunksPlugin`

**Webpack.config.js**

```javascript
var webpack = require("webpack")
module.exports = function (env) {
  return {
    entry: {
      main: "./index.js",
      vendor: "moment",
    },
    output: {
      filename: "[chunkhash].[name].js",
      path: "./dist",
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor", // Specify the common bundle's name.
      }),
    ],
  }
}
```

这样的话， `moment` 的代码就只会出现在 vendor 代码包中了。

## 清单文件（Manifest File）

但是，如果我们可以修改应用的代码并且再次执行 `webpack` 命令，我们看到 vendors 文件的 hash 还是变化了。即使我们已经分离了 `vendor` 和 `main` 代码包，但是当应用代码发生修改的时候 `vendor` 还是变化了。 这意味着我们依旧不能享受浏览器缓存带来的好处，因为每一次重新编译都会修改 vendors 的 hash 值。

这个问题是因为每一次编译，webpack 生成一些 webpack 运行时代码，用来帮助 webpack 来做它的工作。当那里存在一个单独的代码包，运行时会驻留在其中。但当多个代码包被生成的时候，运行时代码会被提取到公共的模块中，就是这个 `vendor` 文件。

为了阻止这个，我们需要提取出运行时到一个分离的清单文件（Manifest File）。虽然我们又多创建另一个代码包，但它的开销也被我们在 vendor 文件上获得的长期缓存所带来的好处所抵消了。

**Webpack.config.js**

```javascript
var webpack = require("webpack")
module.exports = function (env) {
  return {
    entry: {
      main: "./index.js",
      vendor: "moment",
    },
    output: {
      filename: "[chunkhash].[name].js",
      path: "./dist",
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ["vendor", "manifest"], // Specify the common bundle's name.
      }),
    ],
  }
}
```

通过上面这个配置文件，我们会看到三个代码包被生成。`vendor`,`main` 和 `manifest`. 这样当应用代码修改的时候，重新打包后，修改的就只有 `main` 和 `manifest` 了。 `manifest` 被修改是因为里面有对生成文件 hash 值的引用。

# 代码分割-使用 RequireJS

在这个章节，我们讨论 webpack 如何通过 `require.ensure()` 分割代码。

## `require.ensure()`

Webpack 静态分析给 `require.ensure()` 在代码中当构建和添加模块到分离的代码块中。这个新的代码块会被 webpack 在需要的时候通过 jsonp 引入。

它的语法如下：

```javascript
require.ensure(dependencies: String[], callback: function(require), chunkName: String)
```

### 依赖(dependencies)

这是一个字符串数组，用来声明所有需要在执行回掉函数之前就需要预先加载好且可用的模块。

### 回调函数(callback)

一个回调函数会被 webpack 执行一次当所有依赖(dependencies)都被加载以后。Require 对象的实现作为一个参数传递给这个回调函数。这样，我们可以更进一步 `require` 需要的依赖(dependencies)和其他需要执行的模块。

### 代码块名字(chunkName)

代码块名字是一个用来命名通过 `require.ensrue()` 创建的代码块。通过给不同的 `require.ensure()` 创建的代码分割点分割出来的代码块一个相同的名字，我们可以确保所有的依赖都被打包到同一个代码块中。

我们来看一下如下结构的一个项目

```
\\ file structure
    |
    js --|
    |    |-- entry.js
    |    |-- a.js
    |    |-- b.js
    webpack.config.js
    |
    dist
```

```javascript
// entry.js

require("a")
require.ensure([], function (require) {
  require("b")
})

// a.js
console.log("***** I AM a *****")

// b.js
console.log("***** I AM b *****")
```

```javascript
// webpack.config.js

module.exports = function (env) {
  return {
    entry: "./js/entry.js",
    output: {
      filename: "bundle.js",
      path: "./dist",
    },
  }
}
```

当运行 webpack 命令的时候，我们发现 webpack 创建了两个新的代码包，`bundle.js` 和 `0.bundle.js`.

`entry.js` 和 `a.js` 被打包到了 `bundle.js` 中。

`b.js` 被打包到了 `0.bundle.js`

## `require.ensure()` 的陷阱

### 空数组作为一个参数

```javascript
require.ensure([], function (require) {
  require("./a.js")
})
```

上面的代码确保一个分割点被创建， `a.js` 会被 webpack 单独的打包成一个文件。

### 依赖作为参数

```javascript
require.ensure(["./a.js"], function (require) {
  require("./b.js")
})
```

上面的代码，`a.js` 和 `b.js` 会被一起打包并且从主代码包中分离出来。但是只有 `b.js` 的内容被执行了。 `a.js` 的内容只是是可用的但并没有被执行。为了执行 `a.js`, 我们需要 require 它作为一个同步的方式比如 `require('./a.js)` ，这样 JavaScript 就可以执行它了。

# 依赖管理

    Ø es6 module
    Ø Commonjs
    Ø Amd

## 表达式依赖（require with expression）

当你通过表达式去引入一个模块的时候，就会创建一个上下文，所以当编译的时候我们并不知道准确的模块是哪个。

例：

```javascript
require("./template/" + name + ".ejs")
```

Webpack 解析 `require()` 的调用，并且提取出来一些信息：

```
Directory:./template
Regularexpression:/^.*\.ejs$/
```

### 上下文模块（context module）

一个上下文模块被生成。它包含了在这个文件夹下所有可以被上面的正则匹配所匹配到的模块的引用。上下文模块包含了一个把请求解释到模块 id 的 map.
例：

```json
{
  "./table.ejs": 42,
  "./table-row.ejs": 43,
  "./directory/folder.ejs": 44
}
```

上下文模块同样包含了一些运行时代码用来访问这个 map.

这意味着动态的引用可以被支持，但是会导致所有可能被用到的模块都被打包到了最终的代码包中。

### `require.context`

你可以通过 `require.context()` 方法创建你自己的上下文。它允许你传入一个用来查询的文件夹，一个用来决定是否递归查找子文件夹的标识，还有一个用来匹配文件的正则表达式。

Webpack 会在代码打包的时候解析 `require.context()`

它的语法如下：

```javascript
require.context(directory, (useSubdirectories = false), (regExp = /^\.\//))
```

例：

````javascript
require.context("./test", false, /\.test\.js$/);
// a context with files from the test directory that can be required with a request endings with `.test.js`.
```

```javascript
require.context("../", true, /\.stories\.js$/);
// a context with all files in the parent folder and descending folders ending with `.stories.js`.
```

## 上下文模块API（context module API）
一个上下文模块暴露一个方法，它接收一个参数：请求的内容。
暴露出来的函数有三个属性：`resolve`,`key`,`id`
	• `resolve` 是一个函数，执行后返回解析后的请求内容的模块 id
	• `keys`是一个函数，执行后返回一个数组，包含所有可能被上下文模块所请求的所有的模块的 id
	当你想要通过正则匹配引入一个文件夹下所有模块时，这会非常有用：

```javascript
function importAll (r) {
  r.keys().forEach(r);
}
importAll(require.context('../components/', true, /\.js$/))
````

````javascript
var cache = {};
function importAll (r) {
  r.keys().forEach(key => cache[key] = r(key));
}
importAll(require.context('../components/', true, /\.js$/));
// At build-time cache will be polulated with all required modules.
```

	• `id` 是上下文模块生成的模块 id. 当使用 `module.hot.accept` 时，这会非常有用。


````
