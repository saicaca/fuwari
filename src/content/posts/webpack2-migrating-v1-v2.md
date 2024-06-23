---
title: 【翻译向】Webpack 1 到 2 升级指南
category: 技术
published: 2017-01-20 01:00:33
tags:
  - webpack
---

## `resolve.root`,`resolve.fallback`,`resolve.modulesDirectories`

这些配置项项都被一个单独的配置所替代 `resolve.modules`. 查看 [resolving](https://webpack.js.org/configuration/resolve) 了解更多。

```js
resolve: {
-   root: path.join(__dirname, "src")
+   modules: [
+     path.join(__dirname, "src"),
+     "node_modules"
+   ]
}
 
```

## `resolve.extensions`

这个选项已经不在需要传一个空字符串了。它的行为已经被移动到了 `resolve.enforceExtension`. 查看 [resolving](https://webpack.js.org/configuration/resolve) 了解更多。

## `resolve.*`

这里修改了很多内容。因为被用到的不是很多，所以就不一一列举出来了。查看 [resolving](https://webpack.js.org/configuration/resolve) 了解更多。

## `module.loaders` 现在是 `module.rules`

老的 loader 配置被一个更加强大的 rules 系统所取代了，允许配置 loader 和更多内容。为了保证一致性，旧的 `module.loaders` 语法依然可以合法且可以使用的。新的命名规范更加易于理解，这是一个使用 `module.rules` 去升级配置的很好的理由。

```js
  module: {
-   loaders: [
+   rules: [
      {
        test: /\.css$/,
-       loaders: [
+       use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
-           query: {
+           options: {
              modules: true
            }
        ]
      },
      {
        test: /\.jsx$/,
        loader: "babel-loader", // Do not use "use" here
        options: {
          // ...
        }
      }
    ]
  }
```

<!--more-->

## 把 loader 链接起来（Chaining loaders）

就像在 webpack1 中那样，loader 可以被链接起来，把上一个 loader 的结果传递给下一个 loader. 使用 [rule.use](https://webpack.js.org/configuration/module#rule-use)， `use` 可以设置为一个 loaders 的列表。在 webpack1 中，loader 通过 `!` 来链接再一起。现在只会在 `module.loaders` 里面才会支持这样的风格。

```js
  module: {
-   loaders: {
+   rules: {
      test: /\.less$/,
-     loader: "style-loader!css-loader!less-loader"
+     use: [
+       "style-loader",
+       "css-loader",
+       "less-loader"
+     ]
    }
  }
```

## 自动添加 `-loader` 后辍的特性被移除了

在引入 loader 的时候不能在省略后面的 `-loader` 了。

```js
module: {
  rules: [
    {
      use: [
        -"style",
        +"style-loader",
        -"css",
        +"css-loader",
        -"less",
        +"less-loader",
      ],
    },
  ]
}
```

不过依旧可以使用 `resolveLoader.moduleExtensions` 配置来达到以前的目的，但是我们不推荐这样做。

```
+ resolveLoader: {
+   moduleExtensions: ["-loader"]
+ }
```

## 不再需要 `json-loader`

当没有给 sjon 文件配置对应的 loader 的时候，webpack 会自动使用 `json-loader` 来载入 JSON 文件。

```
  module: {
    rules: [
-     {
-       test: /\.json/,
-       loader: "json-loader"
-     }
    ]
  }
```

webpack 选择这样做的目的是想要抹平在 webpack，nodejs 和 browserify 不同环境下的区别。

## 配置中的 loaders 会相对与上下文来解析（Loaders in configuration resolve relative to context）

在 webpack1 中配置的 loader 会相对与匹配到的文件解析。但是 webapck2 中配置的 loader 会根据 `context` 的设置来解析。

这解决了当由于使用 `npm link` 或者引用 `context` 之外导致模块重复引入的问题。

你可能会通过 hach 的方式解决这个问题：

```
  module: {
    rules: [
      {
        // ...
-       loader: require.resolve("my-loader")
+       loader: "my-loader"
      }
    ]
  },
  resolveLoader: {
-   root: path.resolve(__dirname, "node_modules")
  }
```

`module.preLoades` 和 `module.postLoaders` 被移除了

```
  module: {
-   preLoaders: [
+   rules: [
      {
        test: /\.js$/,
+       enforce: "pre",
        loader: "eslint-loader"
      }
    ]
  }
```

## `UglifyJsPlugin` sourceMap

`UglifyJsPlugin` 中 `souceMap` 的默认选项从 `true` 改为了 `false`. 这意味着如果你需要在压缩后的代码中使用 souceMap 的功能，需要手动去配置 `sourceMap:false`.

```
  devtool: "source-map",
  plugins: [
    new UglifyJsPlugin({
+     sourceMap: true
    })
  ]
```

## `UglifyJsPlugin` 警告

`UglifyJsPlugin` 中 `compress.warnings` 和上一条一样，默认选项从 `true` 改为了 `false`.如果需要看到 uglifyjs 的警告，需要设置 `compress.warnings` 为 `true`.

```
  devtool: "source-map",
  plugins: [
    new UglifyJsPlugin({
+     compress: {
+       warnings: true
+     }
    })
  ]
```

## `UglifyJsPlugin` 压缩 loader（minimize loaders）

`UglifyJsPlugin` 不会在压缩模式下切换 loaders 了。`minimize: true` 需要一直被设置在配置来传给 loader 了，查看文档以了解更多的内容。

在 webpack3 或者后续的版本中，loaders 的压缩模式这个特性会被移除掉。

## `BannderPlugin` - breaking change

`BannderPlugin` 不在支持传递两个参数，而是传递一个对象。

```
  plugins: [
-    new webpack.BannerPlugin('Banner', {raw: true, entryOnly: true});
+    new webpack.BannerPlugin({banner: 'Banner', raw: true, entryOnly: true});
  ]
```

## `OccurrenceOrderPlugin` 被作为默认设置

不在需要手动去配置了

```
  plugins: [
-   new webpack.optimize.OccurrenceOrderPlugin()
  ]
```

## `ExtractTextWebpackPlugin` - breaking change

ExtractTextWebpackPlugin 1.0.0 无法在 webpack2 中正常工作，需要安装 ExtractTextPlugin V2 。

```bash
npm install --save-dev extract-text-webpack-plugin@beta
```

配置的区别主要是在语法上。

`ExtractTextPlugin.extract`

```
module: {
  rules: [
    test: /.css$/,
-    loader: ExtractTextPlugin.extract("style-loader", "css-loader", { publicPath: "/dist" })
+    loader: ExtractTextPlugin.extract({
+      fallbackLoader: "style-loader",
+      loader: "css-loader",
+      publicPath: "/dist"
+    })
  ]
}
```

`new ExtractTextPlugin({options})`

```
plugins: [
-  new ExtractTextPlugin("bundle.css", { allChunks: true, disable: false })
+  new ExtractTextPlugin({
+    filename: "bundle.css",
+    disable: false,
+    allChunks: true
+  })
]
```

## 全动态 require 会默认失败（Full dynamic requires now fail by default）

一个由表达式决定的依赖会创建一个空的上下文来替代之前创建的一个包含完成文件夹的上下文。

最好重构这里的代码，因为它不会在 ES2015 模块里面工作。如果这对你来说不太可能，可以使用 `ContextReplacementPlugin` 来指定编译器找到正确的地址。

## 在 CLI 和配置文件中使用自定义参数

如果你滥用 CLI 参数去传递自定义参数到配置中，像这样：

```
webapck --custom-stuff
```

```js
// webpack.config.js
var customStuff = process.argv.indexOf("--custom-stuff") >= 0
/* ... */
module.exports = config
```

你会发现这样不再被允许了，现在 CLI 比之前更加严格了。

作为替代，现在有一个接口用来给配置传递参数。未来的工具会基于这个。

```
webpack --env.customStuff
```

```js
module.exports = function (env) {
  var customStuff = env.customStuff
  /* ... */
  return config
}
```

查看 [CLI](https://webpack.js.org/api/cli)

## `require.ensure` 和 AMD `require` 是异步的了

这些函数变成了异步的，代替之前如果代码块已经被加载后它们的回调函数会同步执行的行为。

**`require.ensure` 现在依赖与原生的 `Promise`, 如果在一个不支持 `Promise` 的环境下使用 `require.ensure` ，那么你需要一个 polyfill.**

## Loader 的配置要通过 `options`

不能在通过在 `webpack.config.js` 中一个自定义的属性来配置 loader 了。必须通过 `options`. 下面这个 `ts` 属性的配置在 webpack2 中已经不合法了。

```js
module.exports = {
  ...
    module: {
  rules: [{
    test: /\.tsx?$/,
    loader: 'ts-loader'
  }]
},
// does not work with webpack 2
ts: { transpileOnly: false }
}
```

## 什么是 `options`？

好问题。严格的说，它可能是两个东西；都是用来配置一个 loader 的方式。典型的 `options` 被称为 `query`, 是一个可以被添加 loader 名字后面的字符串。更像一个 查询字符（query string），但实际上是 [greater powers](https://github.com/webpack/loader-utils#parsequery)

```js
module.exports = {
  ...
  module: {
  rules: [{
    test: /\.tsx?$/,
    loader: 'ts-loader?' + JSON.stringify({ transpileOnly: false })
   }]
  }
}
 
```

同样可以是一个指定的对象，和 loader 一同提供：

```js
module.exports = {
  ...
    module: {
  rules: [{
    test: /\.tsx?$/,
    loader: 'ts-loader'
    options:  { transpileOnly: false }
  }]
}
}
 
```

## `LoaderOptionsPlugin` 上下文

一些 loader 需要从配置文件中读取上下文信息。这个需要长期的设置在 loader 的选项中。

为了兼容老的 loader，可以通过这个插件来传递给 loader：

```js
plugins: [
  +   new webpack.LoaderOptionsPlugin({
    +     options: {
  +       context: __dirname
  +     }
+   })
]
 
```

## `debug`

在 webapck1 中 `debug` 选项用来把 loader 切换到 debug 模式。

在 webapck3 或更后面的版本中，这个模式会被移除掉。

为了兼容老的 loader，可以通过这个插件来传递参数给 loader：

```
- debug: true,
  plugins: [
+   new webpack.LoaderOptionsPlugin({
+     debug: true
+   })
]

```

## ES2015 代码分割

在 webpack1 中，可以通过 `require.ensure` 来懒加载一些代码块：

```js
require.ensure([], function (require) {
  var foo = require("./module")
})
```

在 ES2015 中我们使用 `import()` 作为一个方法在运行时动态的记载 ES2015.

webpack 会把 `import()` 作为一个分割点，并且把加载的代码分离出来作为一个单独的代码块。

`import()` 需要一个模块的名称作为参数，并返回一个 Promise 对象。

```js
function onClick() {
  import("./module")
    .then((module) => {
      return module.default
    })
    .catch((err) => {
      console.log("Chunk loading failed")
    })
}
```

好消息：现在代码块加载失败可以被处理了，因为它们是基于 Promise 的。

警告（Caveat）：`require.ensure` 可以方便的指定代码块的名字，通过第三个参数，但是 `import` API 还不支持这个特性。如果你还依赖这个功能，那么你可以继续使用 `require.ensure`.

```js
require.ensure(
  [],
  function (require) {
    var foo = require("./module")
  },
  "custom-chunk-name"
)
```

如果想要和 Babel 结合使用 `import`, 你需要安装 [dynamic-import](http://babeljs.io/docs/plugins/syntax-dynamic-import/) 这个还处于 Stage 3 的语法插件来绕过语法解析错误。当这个提案被加到标准里面后，就不需要这么做了。

## 动态表达式（Dynamic expressions）

很有可能你会需要传递一个表达式给 `import()`. 这里处理的模式跟 CommonJs 中很相似。

`import()` 创建一个单独的代码块给每个可能的模块。

```js
function route(path, query) {
  return import(`./routes/${path}/route`).then(
    (route) => new route.Route(query)
  )
}
// This creates a separate chunk for each possible route
```

## 混合使用 ES2015，AMD 和 CommonJS

如果是 AMD 和 CommonJs ，那么它们完全可以很自由的混合使用。在这种情况下，Webpack 的处理的行为和 babel 或者 node-eps 相似。

```js
// CommonJS consuming ES2015 Module
var book = require("./book")

book.currentPage
book.readPage()
book.default === "This is a book"
```

```js
// ES2015 Module consuming CommonJS
// module.exports map to default
import fs, { readFileSync } from "fs"

// named exports are read from returned object+

typeof fs.readFileSync === "function"
typeof readFileSync === "function"
```

很重要的一点是，你需要告诉 babel 不要解析这些模块符号（module symbols），这样 webpack 才能使用它们。在 `.babelrc` 中这样配置就可以了：

**babelrc**

```
{
  "presets": [
    ["es2015", { "modules": false }]
  ]
}
```

## 提示

不需要修改什么，但是会很方便。

### 字符串模板

webpack 现在支持在表达式中使用字符串模板了。这意味着可以在 webpack constructs 中使用他们：

```
- require("./templates/" + name);
+ require(`./templates/${name}`);
```

### Configuration Promise

webpack 现在支持从配置文件中返回一个 `Promise` 了。这意味着我们可以在配置文件中做一些异步的处理。

**webapck.config.js**

```js
module.exports = function () {
  return fetchLangs().then((lang) => ({
    entry: "...",
    // ...
    plugins: [new DefinePlugin({ LANGUAGE: lang })],
  }))
}
```

### 高级 loader 匹配

webpack 现在支持更多的方式来让 loader 去匹配文件

```js
module: {
  rules: [
    {
      resource: /filename/, // matches "/path/filename.js"
      resourceQuery: /querystring/, // matches "/filename.js?querystring"
      issuer: /filename/, // matches "/path/something.js" if requested from "/path/filename.js"
    },
  ]
}
```

### 更多的命令行选项

添加了一些新的命令行选项：
`--define process.env.NODE_ENV="production"` ,查看 `DefinePlugin`.

`--display-depth` 展示每个模块和入口的距离

`--display-used-exports` 展示模块使用了那个模块的暴露的信息

`--display-max-modules` 设置输出中展示的最大模块数量

`-p` 同样设置了 `process.env.NODE_ENV` 为 "production"

### Loader 修改

只和 loader 的作者有关。

### 可缓存（Cacheable）

Loader 现在默认是可以缓存的。Loader 必须选择 return 如果它们是不可缓存的话。

```
  // Cacheable loader
  module.exports = function(source) {
-   this.cacheable();
    return source;
  }
```

```
  // Not cacheable loader
  module.exports = function(source) {
+   this.cacheable(false);
    return source;
  }
```

### 复杂的选项

webpack1 只支持可以 `JSON.stringify`选线的 loader. webpack2 支持所有的 plugins 接收一个 JS 对象作为参数。

使用复杂的选项会带来一个限制。需要给设置对象一个 `ident` 使他可以被其它 loaders 引用。

拥有一个 `ident` 在选项对象上，意味着他可以被其它 inline loader 引用。

```
require('some-loader??by-iden!resource')
```

```
{
  test: /.../,
  loader: "...",
  options: {
    ident: "by-ident",
    magic: () => return Math.random()
  }
}
```

这种 inline 写法不应该经常使用，但是它可以被 laoder 生成的代码使用。例子：style-loader 生成一个模块，`require` 了剩下的请求（比如用来暴露 CSS）。

```
// style-loader generated code (simplified)
var addStyle = require("./add-style");
var css = require("-!css-loader?{"modules":true}!postcss-loader??postcss-ident");

addStyle(css);
```

所以如果你要使用复杂的选项，那么告诉你的用户有关 `ident` 的事情。
