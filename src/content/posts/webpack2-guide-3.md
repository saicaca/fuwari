---
title: 【翻译向】webpack2 指南（下）
category: 技术
published: 2017-01-19 01:14:35
tags:
  - webpack
---

# 缓存（Caching）

为了能够使 webpack 处理后的静态资源能够长期缓存下来，需要：

1. 使用 `[chunkhash]` 给每一个文件创建基于内容变化的缓存标识
2. 在 HTML 文件中引入文件时使用编译状态来拿到文件名称
3. 在载入资源之前生成 chunk-manifest JSON 文件并写入到 HTML 页面中
4. 确保包含启动代码的入口代码块的 hash 值不会被修改，当它的依赖没有变化的时候

## 存在的问题

每当我们代码中有一些东西需要被更新的时候，它需要在服务上部署然后由客户端重新下载这些文件。当网络状状况不太好的时候，这是意见非常低效的事情。这也是为什么浏览器要缓存静态资源的原因。

这会导致一个陷阱：当我们发布一个新的版本的时候不去更新的文件名，这会让浏览器认为文件没有变化，导致客户端拿不到最新的资源。

一个简单解决问题的方式就是告诉浏览器一个新的文件名。在没有 webpack 的时候我们会使用构建版本来标识此次的更新：

```
application.js?build=1
application.css?build=1
```

在 webpack 中这样做也很简单：每一次 webpack 的构建都会生成一个可以用来构成文件名的独一无二的 hash 值。下面这个配置文件会生成两个带有 hash 值的文件名：

```javascript
// webpack.config.js
const path = require("path")

module.exports = {
  entry: {
    vendor: "./src/vendor.js",
    main: "./src/index.js",
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].[hash].js",
  },
}
```

<!-- more -->

执行 webpack 命令会得到以下输出：

```
Hash: 55e783391098c2496a8f
Version: webpack 1.10.1
Time: 58ms
Asset Size Chunks Chunk Names
main.55e783391098c2496a8f.js 1.43 kB 0 [emitted] main
vendor.55e783391098c2496a8f.js 1.43 kB 1 [emitted] vendor
[0] ./src/index.js 46 bytes {0} [built]
[0] ./src/vendor.js 40 bytes {1} [built]
```

但存在的问题是，每次我们重新编译，所有的文件名都会变化，这会导致客户端每次都重新把整个应用的代码重新下载一遍。那么我们如何才能时客户端每次只下载有变动的文件。

## 给每个文件生成独特的 hash

当一个文件的内容没有变化的时候，如何保证它的文件名不会在每次编译中变化。比如，一个用来放所有的我们的所有依赖库文件的代码包。

Webpack 允许根据文件的内容生成 hash 值。这是更新后的配置：

```js
// webpack.config.js
module.exports = {
  /*...*/
  output: {
    /*...*/
    filename: "[name].[chunkhash].js",
  },
}
```

这个配置同样会生成两个文件，但是每个文件都拥有自己的 hash 值：

```
main.155567618f4367cd1cb8.js 1.43 kB 0 [emitted] main
vendor.c2330c22cd2decb5da5a.js 1.43 kB 1 [emitted] vendor
```

> 不要在开发环境中使用 [chunkhash]，这会导致每次的编译时间边长。把开发环境和生成环境的配置文件分开，在开发环境使用 [name].js ，在生产环境中使用 [name].[chunkhash].js

从 webpack 编译状态（compilation stats）中获取文件名
在开发环境中，你只需要在 HTML 中引入你的文件就可以了。

```html
<script src="main.js"></srcipt>
```

然而，在生产环境中，我们每次都会得到一个不同的文件名：

```html
<script src="main.12312123t234.js"></srcipt>
```

为了能够在 HTML 中引入正确的文件，我们需要了解一些构建的信息。这可以通过下面这个插件来从 webpack 编译状态（compliation stats） 中提取出来。

```js
// webpack.config.js
const path = require("path")

module.exports = {
  /*...*/
  plugins: [
    function () {
      this.plugin("done", function (stats) {
        require("fs").writeFileSync(
          path.join(__dirname, "…", "stats.json"),
          JSON.stringify(stats.toJson())
        )
      })
    },
  ],
}
```

或者，通过下面这些插件来暴露 JSON 文件：

- [https://www.npmjs.com/package/webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin)
- [https://www.npmjs.com/package/assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin)

一个简单的通过 webpack-manifest-plugin 输出的文件如下：

```bash
{
  "main.js": "main.155567618f4367cd1cb8.js",
  "vendor.js": "vendor.c2330c22cd2decb5da5a.js"
}
```

接下来的事情就由你的服务来决定了。这有一个很不错的例子  [walk through for Rails-based projects](
walk through for Rails-based projects). 使用 Node.js 的服务端渲染的话可以使用 [webpack-isomorphic-tools](https://github.com/halt-hammerzeit/webpack-isomorphic-tools). 如果你的应用不需要依赖服务端渲染的话，那完全可以直接生成一个 `index.html`. 可以使用下面这两个插件来完成：

- [https://github.com/ampedandwired/html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
- [https://github.com/szrenwei/inline-manifest-webpack-plugin](https://github.com/szrenwei/inline-manifest-webpack-plugin)

## 确定的 hashes (Deterministic hashes)

为了压缩生成文件的大小，webpack 使用 id 代替名字来识别模块。再编译过程中，id 已经被生成，映射到代码块的名字并且放到一个 JavaScript 对象中，被叫做代码块清单（ chunk manifest）。它会被放到入口文件中，确保打包后的文件能够正常工作。

这会有和之前一样的问题：无论修改任何地方的文件，即使其它地方都没有修改，更新后的入口需要包含清单文件。这会生成一个新的 hash 值，导致问们的入口文件名修改，无法享受长期缓存带来的好处。

为了解决这个问题，我们应该使用 [https://github.com/diurnalist/chunk-manifest-webpack-plugin](https://github.com/diurnalist/chunk-manifest-webpack-plugin) ，一个可以把清单文件提取出来单独放到一个 JSON 文件中。这是更新后的配置文件，会生成 chunk-manifest.json 并放到我们打包后的文件夹下面：

```js
// webpack.config.js
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin")

module.exports = {
  // your config values here
  plugins: [
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest",
    }),
  ],
}
```

当我们从入口文件中移除掉清单文件后，那么我们就需要手动把这个文件提供给 webapck 使用。在上面的例子中你可能注意到 `manifestVariable` 这个选项。这是一个全局变量，一个供 webpack 来查找清单 JSON 文件，这也是为什么我们需要在代码包前面引入到 HTML 中。在 HTML 中写入 JSON 文件的内容是很容易，那么我们的 HTML 文件的 head 部分就会向下面这样：

```html
<html>
  <head>
    <script>
      //<![CDATA[
      window.webpackManifest = {
        0: "main.3d038f325b02fdee5724.js",
        1: "1.c4116058de00860e5aa8.js",
      }
      //]]>
    </script>
  </head>
  <body></body>
</html>
 
```

最终的 webpack.config.js 文件如下：

```js
var path = require("path")
var webpack = require("webpack")
var ManifestPlugin = require("webpack-manifest-plugin")
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin")
var WebpackMd5Hash = require("webpack-md5-hash")

module.exports = {
  entry: {
    vendor: "./src/vendor.js",
    main: "./src/index.js",
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),
    new WebpackMd5Hash(),
    new ManifestPlugin(),
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest",
    }),
  ],
}
```

> 如果使用 [webpack-html-plugin](https://github.com/ampedandwired/html-webpack-plugin) ,那么你可以使用 [ inline-manifest-webpack-plugin ](https://github.com/szrenwei/inline-manifest-webpack-plugin) 来做这件事。

使用这个配置，那么第三方代码块（vendors chunkd）将不会变化，除非你修改它的代码或者依赖。

# 垫片（Shimming）

webpack 作为了个模块打包工具，可以支持的模块系统包括 ES2015 modules, CommonJs 和 AMD. 但是很多情况下，当我们使用第三方库的时候，我们看到他们会依赖一个全局变量比如 `$` 或者说 `jquery`. 它们也可能创建一些需要暴露出来的新的全局变量。我们来看几种不同的方式来使 webpack 能够理解这些非模块（broken modules）的文件。

最好使用在 `dist` 文件下没有打包压缩过的 CommonJs/AMD 文件（Prefer unminified CommonJS/AMD files over bundled dist versions.）
大多数模块会在 `package.json` 的 `main` 字段中指定它们的 `dist` 版本。这对大多数开发者来说都是非常有用的，对 webpack 来说最好设置一个别名到它们的 `src` 目录下面，这样能够使 webpack 更好的优化依赖。但是，在很多情况下使用 `dist` 版本也不会有什么大的问题。

```js
// webpack.config.js

module.exports = {
  ...
  resolve: {
  alias: {
    jquery: "jquery/src/jquery"
  }
}
};
```

## `provide-plugin`

通过使用 `[provide-plugin](https://webpack.js.org/plugins/provide-plugin)` 使这个模块在所有通过 `webpack` 引用的模块中作为一个可用的变量。只有当你使用了这个变量后，对应的模块才会被引用进来。很多古老的模块通过使用特定的全局变量，比如 jQuery 的 `$` 和或者 `jQuery`. 在这个场景下，你可以提前在 webpack 中配置为 `var $=requrei('jquery')` ，在每一次遇到全局 `$` 标识符。

```js
module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
}
```

## `imports-loader`

`[imports-loader](https://webpack.js.org/loaders/imports-loader/)` 将必须要的全局变量插入到传统模块中。比如，一些传统模块依赖 `this` 指向 `window` 对象。这会导致一个问题，当模块被执行在 CommonJS 上下文的时候， `this` 指向为 `module.exports`.在这种情况下，你可以通过 `imports-loader`重写 `this`.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("some-module"),
        use: "imports-loader?this=>window",
      },
    ],
  },
}
```

它支持不同的模块类型，比如 AMD，CommonJS 同时也支持传统模块。可是，通常情况下它会去检查 `define` 变量，然后使用一些奇怪（quirky）的代码去暴露这些属性。在这种情况下，通过设置 `define = false` 来强制 CommonJS 路径可能会有一些帮助。

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("some-module"),
        use: "imports-loader?define=>false",
      },
    ],
  },
}
```

## `exports-loader`

假设一个库文件创建了一个全局变量，期待它的消费者去使用。在这种情况下，我们应该使用 `[exports-loader](https://webpack.js.org/loaders/exports-loader/)`, 来暴露一个 CommonJS 风格的全局变量。比如，为了暴露 `file` 为 `file`，`helpers.parse` 为 `parse`:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("some-module"),
        use: "exports-loader?file,parse=helpers.parse",
        // adds below code the the file's source:
        //  exports["file"] = file;
        //  exports["parse"] = helpers.parse;
      },
    ],
  },
}
```

## `script-loader`

`[script-loader](https://webpack.js.org/loaders/script-loader/)` 会在全局上下文里面解析代码，就和你在 HTML 中添加了一个 `script` 标签一样。在这种情况下，理论上所有的模块都应该正常的运行。

> 这个文件会被作为字符串打包在代码中。不会被 `webpack` 压缩，所以请使用压缩后的版本。同样这种情况无法使用 webpack 提供的开发工具。

假设你有一个 `legacy.js` 文件包含：

```js
GLOBAL_CONFIG = {}
```

## 使用 `script-loader`

```js
require("script-loader!legacy.js")
```

一般会得到这样的结果：

```js
eval("GLOBAL_CONFIG = {}")
```

## `noParse` 选项

当没有 AMD/CommonJS 风格的模块，同时你需要在 `dist` 中引入，你可以把这个模块标识为 `[noParse](https://webpack.js.org/configuration/module/#module-noparse)`. 这样 `webpack` 就只会引入这个模块但是不会去做任何处理，这样也可以减少构建的时间。

> 任何需要 AST 支持的，比如 `ProvidePlugin`, 都是不会工作的。

```js
module.exports = {
  module: {
    noParse: /jquery|backbone/,
  },
}
```

# 编写一个库文件

webpack 是一个工具，可以用来打包应用代码，同样也可以用来打包库代码。如果你是一个 JavaScript 库的作者，正在寻找精简打包代码的流程，那么这个章节的内容会对你很有帮助。

## 编写一个库（Author a Library）

我们这有一个精简的包装库来把数字 1 到 5 转换到对应的单词，反之亦然。 看起来可能是这样的：

**src/index.js**

```js
import _ from "lodash"

import numRef from "./ref.json"

export function numToWord(num) {
  return _.reduce(
    numRef,
    (accum, ref) => {
      return ref.num === num ? ref.word : accum
    },
    ""
  )
}

export function wordToNum(word) {
  return _.reduce(
    numRef,
    (accum, ref) => {
      return ref.word === word && word.toLowerCase() ? ref.num : accum
    },
    -1
  )
}
```

库的使用规范如下：

```js
//ES2015modules

import*aswebpackNumbersfrom'webpack-numbers';

...
webpackNumbers.wordToNum('Two')//outputis2
...

//CommonJSmodules

varwebpackNumbers=require('webpack-numbers');

...
webpackNumbers.numToWord(3);//outputisThree
...

//Asascripttag

<html>
...
<scriptsrc="https://unpkg.com/webpack-numbers"></script>
<script>
...
/*webpackNumbersisavailableasaglobalvariable*/
webpackNumbers.wordToNum('Five')//outputis5
...
</script>
</html>
```

完整的库配置和代码放在这里 [ webpack-library-example](https://github.com/kalcifer/webpack-library-example).

## 配置 webpack

那么接下来的事情就是打包这个库
• 不打包 lodash，但是会被它的消费者引入
• 命名这个库为 `webpack-numbers`, 并且变量为 `webpackNumbers`
• 库可以通过 `import webapckNumbers from 'webpack-numbers'` 或者 `require('webpack-numbers')` 来引入
• 当通过 `script` 标签引入的时候，可以通过全局变量 `webpackNumbers` 来访问
• 可以在 Node.js 中使用

### 添加 webpack

添加基础 webpack 配置。

**webpack.config.js**

```js
module.exports = {
  entry: "./src/index.js",
  output: {
    path: "./dist",
    filename: "webpack-numbers.js",
  },
}
```

这将添加一个基础配置来打包这个库。

### 添加 Loaders

但是如果没有对应 loaders 去解析代码是没有办法工作的。这里，我们添加 `json-loader` 来添加对 json 文件的解析。

**webpack.config.js**

```
module.exports = {
  // ...
  module: {
    rules: [{
      test: /.json$/,
      use: 'json-loader'
    }]
  }
};
 
```

### 添加 `externals`

现在，如果执行 `webpack` 命令，你会发现一个提交较大的代码包被生成。如果你去检查代码，会发现 ladash 被打包到了代码包中。对于你的库来说把 `lodash` 打包在一起使完全没有必要的。

可以通过 `externals` 配置：

**webpack.config.js**

```js
module.exports = {
  ...
    externals: {
  "lodash": {
    commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_"
  }
}
...
};
 
```

这意味着在使用者的环境下你的库会期望依赖 `lodash` 。

### 添加 `libraryTarget`

为了这个库能够被广泛的使用，我们需要让它在不同的环境下有相同的表现。比如， CommonJS，AMD，Node.js 或者作为一个全局变量。

为了达到这个目的，需要在 webpack 配置中添加 `library` 属性。

**webpack.config.js**

```js
module.exports = {
  ...
    output: {
...
  library: 'webpackNumbers'
}
...
};
 
```

这能够你的库被引入的时候可以作为一个全局变量被访问。为了能够在其它情况下使用，在配置中继续添加 `libraryTarget` 的值：

**webpack.config.js**

```js
module.exports = {
  ...
    output: {
...
  library: 'webpackNumbers',
    libraryTarget:'umd' // Possible value - amd, commonjs, commonjs2, commonjs-module, this, var
}
...
};
 
```

如果 `library` 设置了，但是 `libraryTarget`没有配置，那么 `libraryTarget` 默认为 `var` 就像在[ config reference](https://webpack.js.org/configuration/output) 中指定的一样。

### 最后一步

[调整生产环境下的配置文件](https://webpack.js.org/guides/production-build)

将打包后的文件添加到 `package.json` 中指定的字段里面。

**package.json**

```json

{
    ...
    "main": "dist/webpack-numbers.js",
    "module": "src/index.js", // To add as standard module as per https://github.com/dherman/defense-of-dot-js/blob/master/proposal.md#typical-usage
    ...
}

```

现在你可以把它作为一个 npm 模块发布了，并且在 unpkg.com 里面向你的用户传播了。
