---
title: 借助gulp自动化前端开发
date: 2015-01-18 23:18:27
tags:
  - gulp
  - 前端
  - JavaScript
category: 技术
---

`gulp`是一款小巧的自动化构建工具，可以帮助我们自动运行大量乏味重复性的任务，比如代码压缩、合并等等，可以为我们节约大量的时间。在制作简历过程中，因为需要用到`less`，而`less`需要编译，所以就简单学习了这款工具。

<!--more-->

## 安装 Gulp.js

因为`gulp`基于`node`构建，所以必须先装上`node`。安装好`node`后，通过`npm`来安装`gulp`：

```bash
    npm install -g gulp
```

## 在项目中配置

因为我需要编译`less`，所以先要安装`gulp`的`less`插件：

```bash
npm install --save-dev gulp gulp-less
```

命令中的`--save-dev`可以将安装的包添加到包配置文件 package.json 中：

```json
"dependencies": {
    "gulp": "^3.8.10",
    "gulp-livereload": "^3.4.0",
    "gulp-less": "^2.0.1",
    "less-plugin-autoprefix": "^1.3.0"
},
```

如果项目中没有这个文件，可以通过`npm init`初始化命令来创建。
在项目下的根目录下创建 Gulpfile.js 文件，这个文件用来定义用到什么插件，执行哪些任务等。
在我制作简历过程中，需要将通过 bower 管理的两个依赖库复制到特定文件夹下，同时监控并编译`less`文件。所以配置文件如下：

```js
var gulp = require("gulp"),
  less = require("gulp-less") //引入less插件

// 定义 less 任务
gulp.task("less", function () {
  gulp.src("./less/main.less").pipe(less()).pipe(gulp.dest("./style"))
})
//复制文件到特定目录
gulp.task("depends", function () {
  gulp
    .src([
      "./bower_components/pagepiling.js/jquery.pagepiling.min.js",
      "./bower_components/pagepiling.js/jquery.pagepiling.css",
    ])
    .pipe(gulp.dest("./depends"))
})
//监控less文件，一旦有更改，就执行less编译任务
gulp.task("watch", function () {
  gulp.watch("less/*.less", ["less"])
})
//默认任务
gulp.task("default", ["less", "depends", "watch"])
```

其中：

- `gulp.task()`就是定义任务的函数，需要两个参数，一个是任务名，一个是回调函数。
- `gulp.src()`是引入文件函数，用来将需要执行的文件路劲引入函数。
- `.pipe()`将引入的文件传递给执行函数，比如`.pipe(less())`将`gulp.src('./less/main.less')`中得文件传递给`less()`函数。
- `gulp.desk()`输出函数，将文件输出到指定目录
- `gulp.watch()`监控函数，一旦发现指定文件有了变化，就会执行相应的函数。
