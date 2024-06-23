---
title: react-v2ex
date: 2015-12-26 08:11:25
tags:
  - JavaScript
  - React
category: 技术
---

为了练手，用 react 写了个 v2ex 的首页：
[页面地址](http://kisnows.com/react-v2ex/)
[项目地址](https://github.com/kisnows/react-v2ex)

整个项目基础 `react` 搭建，样式本来打算用 inlineStyle 来写的，但是发现写起来太累，于是还是用回到 `sass`，最后用 `webpack `来编译。本来想着看能不能直接调用 V 站的 API 来做一个纯前端的首页，所有的数据都用 ajax 来调，但是发现因为跨域的问题，前端无法拿到数据，也就放弃了，最终也只能是一个静态页面。

说一下写代码中遇到的一些问题吧，首先整个项目的文件结构如下：

```
│  .babelrc
│  .editorconfig
│  .eslintrc
│  .gitignore
│  index.html
│  index.js
│  package.json
│  readme.md
│  server.js
│  tree.txt
│  webpack.config.js
│
├─api
│      hot.json
│      latest.json
│
├─build
│      bundle.js
│      index.html
│
├─components
│      CommunityStatus.js
│      Footer.js
│      Header.js
│      Main.js
│      SearchInput.js
│      TopicsHot.js
│      UserLink.js
│      UserPanel.js
│
├─containers
│      App.js
│
├─sass
│  │  main.scss
│  │  _config.scss
│  │  _global.scss
│  │  _normalize.scss
│  │  _page.scss
│  │
│  └─components
│          _CommunityStatus.scss
│          _Footer.scss
│          _Header.scss
│          _Main.scss
│          _TopicHot.scss
│          _UserPanel.scss
│
├─static
│  └─images
│          qbar_light@2x.png
│
└─utils
        getData.js
```

## 优点

先说说用 react 写的优点，它火起来不是没有道理的，确实是有很多优点的，我这里只说实际码代码中的优点，不涉及 virtualDom 带来的性能提升之类的。

### 结构清晰

因为 react 本身就是组件化的，所以整个页面按结构被分为几个组件，每个组件自己管理自己的展示和行为，最后通过容器组合起来，结构非常清晰。
组件的状态都是通过 state 或者 props 来控制，而我认为大多数组件只需要 props 就行了，只在顶层组件上控制 state，这样可以更加清晰的管理 state。

<!--more-->

### 易于维护

因为结构清晰，所以可以预想到，这样是易于维护的。比如头部要改结构和样式，那就只改 Hearker.js 和对应 \_Header.scss 就行了，或者要改逻辑，那只要修改 Hearker.js 中和 props 或者 state 相关的代码就行了，不用像以前那样在整个页面的逻辑里面去找这块的代码。
这根我目前维护的一些老项目来比，维护性上简直是天壤之别，再也不用愁找不到代码在哪改了，也不用吐槽那一串串的不知道干什么的 jquery 代码了。

### 省去了模版引擎

因为 react 可以说是自带了模版引擎，类似的 jade 或者 ejs 之类的模版引擎也就不需要了，类似这样拿到数据直接渲染就行了。

```javascript
<div>
  {Hot.map((topic, index) => (
    <TopicsHotItem {...topic} key={index} />
  ))}
</div>
```

## 缺点

### 组件划分大小的疑惑

一个页面到底要划分成几个部分？根据逻辑分还是根据页面布局分？组件分到那个层级？像 V 站的这个头部，是划分成一个组件还是三个？
![头部](/imgs/react-v2ex-header.png)
当然这个可能不能算是缺点，可能是因为我经验不足以至于无法确定该如何化分。

### 报错不友好

比如我 className 习惯性的写成了 class，然而 console 里面只是报了个 Did you mean className 的错，但是报不出来错在哪个文件，更不用指望报错在哪行了？只能自己去找，当项目大起来的时候，这个肯定很坑爹。
![报错](/imgs/react-v2ex-error.png)

## 总结

整体来说， react 写起来还是很爽的，而且有点也很明确，组件化·单向数据流·函数式编程，虽然有一些不成熟的问题，但是优点还是突出，如果可以的话，在一些小型项目里实际试水一下应该还是不错的。
