---
title: 前端开发标准化 - 最佳实践 - 从开发到上线
date: 2023-09-15 07:49:23
tags:
  - 前端开发
  - 最佳实践
category: 技术
---

## 前言

本文原发于公司内部 ATA 平台，经过数据脱敏后，重新整理成为了这篇文章。所以文章内会有很多内部系统的介绍和链接，这些链接以及平台无法在非公司内网打开，但不影响文章整体的阅读和理解。

## 前言

在过去的一年中，我们团队的流量业务经历了一系列的重构和大幅度性能优化。最近，在**前端开发标准化平台**的支持下，我们也进行了一轮标准化治理。现在，从各个角度来看，整个应用相比之前都有了不小的提升。

抛砖引玉，我把其中的一些思考和选择总结成了这篇文章，给大家做参考。

## 技术选型

### 开发框架选择

#### 为什么选择 React

这个没有什么需要讨论的，内部的所有基建以及大环境决定了必然是 React。

#### 为什么是 React18

原本项目是 React16，React18 相较于 16 主要的变化：

- 并发模式 - React18默认开启了并发模式, 简单讲就是组件渲染从同步不可中断改为了异步可终端，从而提升页面的响应效率；
  - > With this capability, React can prepare new screens in the background without blocking the main thread. This means the UI can respond immediately to user input even if it’s in the middle of a large rendering task, creating a fluid user experience.
- 自动批处理 - 允许将多个状态更新批处理到一次重新渲染中，通过减少重新渲染的次数来提高性能；
- 详细文档参考 React 官网：[React v18.0](https://react.dev/blog/2022/03/29/react-v18) 或者内网 ATA 文章[React18新在哪 - ATA (atatech.org)](https://ata.atatech.org/articles/11000262147?spm=ata.25287382.0.0.4a9c75365NLJCR)

#### 如何升级

默认情况下从 React16 升级到 React18 是无损升级的，但是如果需要用 React18 的新特性 `并发模式` 以及 `自动批处理` 则需要稍微一点改动：

从

```jsx
import React, { useEffect, lazy } from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
	<ShowRoom {...(window.globalUtils.getPageData() as SearchResult.PageData)} />,
	document.getElementById('root')
);
```

修改为：

```jsx
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const container = createRoot(document.querySelector('#root')!);
container.render(
	<ShowRoom {...(window.globalUtils.getPageData() as SearchResult.PageData)} />
);
```

这样会开启 React18 的 `并发模式` 以及 `自动批处理` ，这里可能会导致一点问题：React18 以前只有在事件处理中的 setState 会批量处理，但现在基本上都是批量处理了。
需要测试一下，不过一般情况下都会有问题，建议在开发环境使用 `StrictMode` 模式，更容易暴露问题。

```jsx
  const RootComponent = process.env.NODE_ENV === 'development' ? React.StrictMode : React.Fragment;
  if ($root) {
    const container = createRoot($root);
    container.render(
      <RootComponent>
        <DRMSearch {...(window.globalUtils.getPageData() as DRMSearchResult.PageData)} />
      </RootComponent>
    );
  }
```

### 开发语言

#### typescript

typescript 作为 JavaScript 的超集，采用 typescript 的好处太多了：

- 类型系统：在 JavaScript 至上添加了类型系统
- 工具支持：代码自动补全、跳转到定义、接口提示等IDE功能,都需要类型系统的支持
- 更低的维护成本以及低成本的重构
- ...

这些好处在开发过程中是能实时感受到的，不言而喻。

选用 typescript 的缺点：

- 由于添加类型导致的开发成本
- 可能会有人烦与类型系统而变为 anyScript

这个我们只能通过代码 review 来避免，但一般情况下开发者在体验到了 typescript 的好处后不会这样去做的。

对于 tsconfig 的配置，react 项目我们一般采用 create-react-app 中的默认 `tsconfig` 作为基地扩展，默认情况下能满足大部分项目的诉求：

```json
{
  // see https://www.typescriptlang.org/tsconfig to better understand tsconfigs
  "extends": "@tsconfig/create-react-app/tsconfig.json",
  "include": ["src", "types"],
  "compilerOptions": {
    "outDir": "./build/"
  }
}
```

当然有自定义诉求可以参考 [TypeScript: TSConfig Reference - Docs on every TSConfig option (typescriptlang.org)](https://www.typescriptlang.org/tsconfig) 进行修改。

#### less

我们在样式预处理器：`scss`, `less` ,`stylus` 中挑选了 `less`：

- stylus：内部没有用这个的，直接排除
- scss：包括 `fusion` 在内的很多内部组件都是使用的 scss，但是 scss 太重了，无论是依赖的 node-scss 的安装编译还是每次项目的构建，都太慢了
- less：其实有了后处理器 postcss 后这些预处理器都可以不用，但是长久依赖的嵌套以及一些简单的变量、函数功能还是能够提高开发效率的，所以选用了 less，虽然在功能上相较于 scss 弱一点，但是完完全全满足日常开发了，而且足够轻量

前面提到了 `postcss`, 我们用的多主要是两个功能，解决浏览器兼容的 c 以及在无线上用来自适应的 `postcss-px-to-viewport` ，配置文件如下：

```js
const pxtoviewport = require("postcss-px-to-viewport")
const postcssPresetEnv = require("postcss-preset-env")

module.exports = {
  plugins: [
    postcssPresetEnv(),
    pxtoviewport({
      viewportWidth: 375, // (Number) The width of the viewport.
      viewportHeight: 667, // (Number) The height of the viewport.
      unitPrecision: 3, // (Number) The decimal numbers to allow the REM units to grow to.
      viewportUnit: "vw", // (String) Expected units.
      selectorBlackList: [".ignore", ".hairlines", /^\.bc-/, /^\.wlkeeppx/], // (Array) The selectors to ignore and leave as px.
      minPixelValue: 1, // (Number) Set the minimum pixel value to replace.
      mediaQuery: true, // (Boolean) Allow px to be converted in media queries.
    }),
  ],
}
```

`postcss-preset-env` 依赖 `browserslist` 的配置，这个根据自己业务的浏览器分布情况具体来看：

```json
  "browserslist": [
    "android >= 7",
    "ios >= 13"
  ],
```

### 组件库

#### Fusion Next 组件

面向买家的组件库目前只能选 Fusion ，需要注意的是需要用 `@alifd/next` 这个包而不是 `@alife/next` ,后者应该已经不更新了。

用 Fusion 的组件会有一个问题，就是直接使用它的体积太大了, 即使是 gzip 压缩后，js 和 css 加起来都在 300kb 以上。同时如果在项目中参与构建的话会大幅拖慢的开发服务构建速度。

为了解决体积以及开发体验的问题，所以我们有了 `TrafficModlib` .

#### TrafficModLib

这是我们流量业务的共用组件库，包含了 Fusion 的部分组件以及我们的业务组件。通过这样的拆分，来避免直接引用 Fusion 的体积问题以及应用开发体验的问题，后面会详细讲。

### 构建工具

本来流量的应用分布在几个独立的应用中独立构建，之前我们改造了一次升级到了统一的构建器 fie ，降低多个项目中构建工具的维护成本和阴性风险。

但是由于集团的拆分背景以及考虑到 fie 的支持问题，我们最终选择抛弃了 fie 的基地改造为无夸集团依赖的 icbuBuyer 构建器。

过程中还是有些曲折，本身想要基于 def 的底座来开发脚手架以及构建器，结果 def 的命令行工具不更新了，升级到了 o2 ,而 o2 对命令行支持从现状看也让人担忧。在一开始基于 def 又从 def 升级到 o2 的过程中，走了很多弯路，结果最终 def-dev-kit 对应的升级后的 o2 命令根本找不到任何文档。所以最终还是抛弃了这些什么 def、o2 而选择自己开发简单普通的命令行工具。

#### icbuBuyer

我们最终将这个构建器命名为 icbu-buyer 定位买家前台构建器，目前的使用文档：[脚手架 icbu-buyer 使用文档 (antfin.com)](https://aliyuque.antfin.com/we-are-no-one/ggofk9/mv7nzi16uh7u9zyl)

整个构建工具只做了很简单的事情，即包装了一个支持单页和多页开发的 webpack 配置，同时在项目初始化的时候做了一些符合开发标准的环境配置：比如 eslint 配置、prettier、commilint 等，没有任何魔法在里面。在最终 build 时针对 ssr 场景特殊优化单独构建了一份资源，核心的 webpack 配置如下：

```js
export default function (userCofig: Partial<userConfig>): Configuration {
  const { port, production, debug, entryName, type } = userCofig;
  return {
    context: cwd,
    entry: getEntry({ dev: !production, entryName }),
    output: {
      publicPath: '',
      path: getBuildPath(),
      filename: '[name].js',
      chunkFilename: '[name].chunks.js',
      crossOriginLoading: 'anonymous',
    },

    mode: !production ? 'development' : 'production',
    devtool: !production && 'source-map',
    devServer: !production
      ? comboProxy({
          port,
          host: '0.0.0.0',
          hot: true,
        })
      : {},

    resolve: getResolve(),

    optimization: getOptimization(),

    module: {
      rules: getLoaderRules({ production, debug, entryName }),
    },

    externals: getExternals(false, userCofig),

    plugins: [
      debug && new BundleAnalyzerPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].chunk.css',
      }),
      !production &&
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            memoryLimit: 1024,
          },
        }),
    ].filter(item => !!item) as Configuration['plugins'],
  };
}
```

代码地址 [@ali/builder-icbu-buyer - Alibaba NPM Registry (alibaba-inc.com)](https://anpm.alibaba-inc.com/package/@ali/builder-icbu-buyer)

#### 统一构建器的好处是什么

一个大业务下的多个应用，采用统一的构建器，可以减少很多维护以及选择上的问题。即可以享受应用独立拆分后的好处，又可以降低应用拆分后维护成本的问题。

主要的优点：

- babel 的统一配置和管理：不会出现一份代码在这个项目可以用在另一个项目可能因为 babel 配置的问题遭遇了浏览器兼容性问题
- 代码风格的统一控制：可以在项目启动时检测当前项目的各种配置是否符合规范，不规范的话可以强制统一，不再需要在每个项目下去手动配置 eslint、stylelint、prettier、husky 等各种各样麻烦的事情
- 减少依赖的心智负担：每个应用都不再需要在 `devDependents` 里面写一堆一堆的 babel、webpack 之类的依赖了

缺点：

- 由于本地的开发服务以及构建相关的配置都被收拢在了统一的 icbuBuyer 中，相较于直接明了的 webpack 配置文件来说，理解成本略有上升

而且越来越多的业务采用 ice、umi 等之类的解决方案也是懒得去做类似的构建相关的配置维护，不一样的地方在于，ice 之类的工具为了更加通用覆盖更多的业务场景会相对臃肿，同时技术自主度会更低一点。

权衡下来，我们选择更加贴合业务场景、成本更低更可控的，对自己构建工具进行最低限度的简单封装。

#### 应用如何接入

在项目下执行 `tnpm install @ali/builder-icbu-buyer && npx ibuyer setup` 就可以了，会在项目下写入 `icbubuyer.config.js` 以及修改云构建 `abc.json` 的配置。

其中 `icbubuyer.config.js` 为应用的自定义配置，一般的应用默认配置就可以了，但是如果需要自定义，可以修改下的 `icbubuyer.config.js` 的内容：

```js
/**
 * ICBU 买家前台通用构建器配置
 * 只要 abc.json 中的 type 以及 builder 为以下字段
 *    "type": "icbu-buyer"
 *    "builder": "@ali/builder-icbu-buyer"
 * 那么就不要删除该文件，否则构建器将无法正常工作。
 */
const fs = require("fs")
const path = require("path")
const cwd = process.cwd()
const { DEV, DEBUG } = process.env

module.exports = {
  /**
   * 项目类型, 取值为以下值之一，
   * const PROJECT_TYPE = {
      pc: 'web-app-pc',
      m: 'web-app-m',
      npm: 'npm-package',
    };
   */
  type: "web-app-pc",
  port: 3000,
  // 目前仅支持 webpack 作为构建器，后续可能支持别的比如 vite 等
  builder: "webpack",
  // 如果有提取业务功能组件作为独立的包，挂载在全局的 window 上，需要在这里配置
  modLib: {
    // 公共包 package.json 中的 name，用来作为 import 时候的 id
    // 比如 import {Button} from "@alife/icbu-mod-lib"，packageName 为 @alife/icbu-mod-lib
    packageName: "@alife/icbu-traffic-mod-lib",
    // 公共包挂载到全局变量上的命名，比如 IcbuModLib
    modName: "TrafficModLib",
  },
  extendWebpackConfig: (webpackConfig) => {
    // NOTE: 如果一定要自定义 webpack 的配置，可以在这里做一些修改。
    // 但是请注意，如果你的配置有问题，可能会导致构建失败，而且可能会和后续的脚手架升级不兼容【所以强烈不建议修改】
    // webpackConfig.externals = {
    //   react: 'window.React',
    //   'react-dom': 'window.ReactDOM',
    // };
    // TODO: 待七巧板的引用改为 index.js 后，删除 showroom 的配置
    return webpackConfig
  },
}
```

## 技术规约

### 代码规范

代码规范这里没什么说的，除了 js 以外其他采用之前集团前端技术部的整体规范，js 由于之前的 eslint-config-ali 规范过老以及无人维护的原因采用目前最新 eslint-config-att 。

- js：eslint-config-att，配置文档：[Web终端代码规范指南 (antfin.com)](https://aliyuque.antfin.com/livetech/ko5unm/gfw2swu7nbd5xwgn?singleDoc)
- css、less：styleling-config-ali，参考配置：

```json
{
    extends: ['stylelint-config-ali'],
    customSyntax: 'postcss-less',
    plugins: ['stylelint-order'],
    rules: {
      'no-descending-specificity': null,
    },
};
```

- 代码风格统一：prettier 在常规的规范上加了 import 的顺序规范，可以确保所有人代码的 import 顺序一致，参考:

```js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "avoid",
  proseWrap: "always",
  importOrder: [
    "public-path",
    "<THIRD_PARTY_MODULES>",
    "^@ali/(.*)$",
    "^@alife/(.*)$",
    "^@alifd/(.*)$",
    "^[./]",
    "^[./](.*).(json)$",
    "^[./](.*).(css|less|scss|sass)$",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
}
```

- 通过 lint-stage 、husky 确保提交的代码都是合格的代码

### 提交拦截

上面那些规范配了如果没人执行也是没有用的，所以在 commit 的时候加了统一的 hook 确保所有提交上来的代码都是符合规范的。这里我们用的是 husky 以及 lint-stage ，具体的配置方法可以参考官方文档，我们的配置如下：

```json
  "lint-staged": {
    "*.{json,md,scss,css,less,html}": "npx prettier --write --ignore-unknown",
    "src/**/*.{js,jsx,ts,tsx}": [
      "npx prettier  --write",
      "npx eslint --fix"
    ]
  },
```

### 快速接入

这些代码规范也好、提交的拦截也好，配置起来还是挺麻烦的，所以我们有工具可以快速接入，只需要在项目下执行：`tnpm install @ali/builder-icbu-buyer && npx ibuyer setup --configOnly` 就可以快速接入这套规范了。

## 架构设计

在之前我们的应用架构如下：

![应用架构-before](/imgs/frontend-development-standardization-best-practices/Snipaste_2024-01-02_15-25-23.png)

这些业务都是糅杂在搜索的应用 searchBoost 以及 sclist 里面的，那真是牵一发而动全身，seo 的一个发布都有可能导致搜索的前台挂掉。当然这里面有历史的原因，也有组织架构的原因，我们不去过多的讨论过去的问题，来看一下在当下如何调整来更好的适合我们现有的业务。

### 背景分析

流量业务域下具体需要支撑的业务场景：

- 免费承接页：主要是 SEO 场景的 showroom 、countrySearch, 同时包含 PC 和 无线
- 付费承接页：PPC、PLA 以及 DRM 等，同时包含 PC 和 无线

当下我们最终选择用四个应用来分别来承接这些业务：

- traffic-free-pc：免费承接的 PC 应用
- traffic-free-wap：免费承接的 无线 应用
- traffic-pay-pc： 付费承接的 PC 应用
- traffic-pay-wap：付费承接的 无线应用

这个应用划分粒度相对比较合适，遵循的理念为业务域隔离、端型隔离

- 业务域隔离：首先业务域之间必须独立划分，即免费和付费的业务不能在同一个应用，不能互相影响
- 端型隔离：一个业务域下，PC 和 无线需要应用隔离，两者之间在前台没有共性

同时我们在此之外额外建立了两个应用：

- traffic-base：提供全局的基础方法
- traffic-mod-lib：提供业务域的共用组件

为什么需要额外再抽两个应用出来，核心是为了复杂度的拆分：即将复杂度高的部分尽可能抽离到 `traffic-base` 或者 `traffic-mod-lib` 中，上层的业务应用只关心最终的页面展示。复杂度拆分之外，它的附带好处是：性能、开发体验，后面会详细讲。

### 最终方案

最终我们应用架构如下：
![应用架构-before](/imgs/frontend-development-standardization-best-practices/Snipaste_2024-01-02_15-27-22.png)

### 新架构的优点

##### 复杂度管理（Complexity Management）

- 上层业务应用主要负责业务相关逻辑和前端渲染，使其逻辑更加独立。
- 高复杂度的逻辑被下沉到 `traffic-mod-lib` 和 `traffic-base` 中，从而实现复杂度的有效拆分。

##### 代码复用（Code Reusability）

- 通过抽离基础组件和方法至 `traffic-base` 和 `traffic-mod-lib`，不仅提高了代码复用性，还降低了发布风险。
- 基础方法在 `traffic-base` 中被抽离出来，鼓励开发者将全局性、业务无关的方法独立出来。

##### 稳定性（Stability）

- 上层业务发布频率最高，而共用组件和基础方法的发布频率相对较低，这样的层级设计降低了整体的发布风险。
- 业务域（如免费和付费应用）之间的发布不会互相影响，进一步提高系统稳定性。

##### 开发体验（Development Experience）

- 因为依赖库（如React, ReactDOM, Fusion）不需要在每次构建中都被重新编译，应用拆分也让每个应用下的无关代码大幅减少，从而大幅减少了本地开发服务冷启动和热编译的耗时，从而极大地提升了开发体验。
- 每个代码仓库中无关的代码减少，也降低了开发者的心智负担

##### 性能（Performance）

- 低发布频率的基础应用（`traffic-mod-lib`和 `traffic-base`）更容易在 CDN 和用户浏览器端被缓存，从而被动地提高了页面性能。

最终在构建的代码体积上有 70% 的缩减，构建时间有 50% 以上的缩减，具体参考文档：[流量业务重构升级 (antfin.com)](https://aliyuque.antfin.com/carlyuan.yq/fck4kg/slv2b6olb4u57lz7)。

### 基础应用详解

#### traffic-base

提供全局方案，具体来讲：统一的打点、统一的事件监听、统一的事件发布订阅机制以及统一的三方资源加载控制等。

##### 日志采集

比如我们为了规范化打点，制定了[打点规范 (antfin.com)](https://aliyuque.antfin.com/we-are-no-one/eatinq/vomopx)，但是如何确保所有人的打点都符合规范呢？codereview 当然可以，但是成本太高，所以我们的方案是所有打点方法收口到 `traffic-base` 中：自动曝光打点直接由 `traffic-base` 控制，点击打点统一用 `traffic-base` 提供的 logClick 方法，这样就能确保所有的打点都是符合规范的了。

- 统一曝光打点代码
- 统一点击打点方法

##### 事件总线管理

在很多业务场景下，组件或模块需要通过事件机制进行通信。这样的事件发布-订阅模式具有显著的解耦优点，然而，过度的解耦也是它的缺点。随着时间的推移项目的复杂度增加，没有明确的约束和文档可能会导致项目中充斥着各种不可控的事件。
为此我们采用了以下统一的控制方案：

**统一的监听与订阅方法**

通过使用统一的 `TrafficEvent` 类，我们可以在一个中心点管理所有的事件。该类继承自 `EventEmitter`，并包含一个预定义的 `EventType` 对象。

```js
import { EventEmitter } from 'events';
import { EventType } from './constants';

class TrafficEvent extends EventEmitter {
  EventType: typeof EventType;

  constructor() {
    super();
    this.EventType = EventType;
  }

  on<T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any): this {
    if (typeof event === 'string') {
      if (!Object.values(EventType).includes(event)) {
        throw new Error(`无效的事件类型：${event}`);
      }
      console.log(`订阅事件：${event}`);
    }
    // 如果类型是 symbol，则不进行 EventType 校验
    return super.on(event, fn, context);
  }

  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    if (typeof event === 'string') {
      if (!Object.values(EventType).includes(event)) {
        throw new Error(`无效的事件类型：${event}`);
      }
      console.log(`发布事件：${event}`);
    }
    // 如果类型是 symbol，则不进行 EventType 校验
    return super.emit(event, ...args);
  }
}

export default new TrafficEvent();
```

**统一的事件 ID 管理**

所有的事件类型都预先定义在 `EventType` 对象中。这样做不仅增加了代码的可读性，还确保了事件的唯一性。

```js
export const EventType = {
  scrollToEnd: "scrollToEnd",
  scrolling: "scrolling",
  videoChange: "videoChange",
}
```

使用这样的设计，所有需要事件通信的组件必须在 `base` 中注册新的 `eventType`。同时，该方案限制了只能发布和订阅预先定义的事件 ID。通过这种方式，整个事件通信系统都处于一个可控和可管理的状态。如果需要，你还可以在 `TrafficEvent` 总线中添加更多的管理和监控功能。

这样，我们不仅保留了解耦的优点，还通过统一的管理机制，增加了项目的可维护性和可控性。

一个例子：

```js
export function useScrollToEnd(fn: () => void): void {
  const { globalUtils } = useGlobalUtils();
  React.useEffect(() => {
    if (!globalUtils) return;
    const { eventEmitter } = globalUtils;
    eventEmitter.on(eventEmitter.EventType.scrollToEnd, fn);
    return () => {
      eventEmitter.off(eventEmitter.EventType.scrollToEnd, fn);
    };
  }, [fn, globalUtils]);
}
```

##### 页面数据获取

提供了统一的页面同步数据获取方法，所以的上层业务应用在获取页面数据时都通过调用这个方法，而不是直接去读取 window 下的全局变量：

```js
  getPageData(): Record<string, any> {
    return window._PAGE_DATA_;
  }
```

看起来很简单，就三行代码，但是这体现了一种开发理念：即对全局变量的使用需要管控，同时屏蔽了细节。对于上层业务应用来讲，我只需要知道我要通过 getPageData 方法来获取页面数据就好了， 至于它到底怎么来的不重要。

这样上层业务应用不需要直接去操作这个全局变量了，如果某一天这个全局变量和其他变量冲突了，我们可以放心的对齐进行修改而不是因为全局变量的读取写入散布在多个系统的各个代码文件中导致无法修改陷入死局。

如果再进一步，对于这个只读的数据，可以在获取的时候直接通过 `Object.freeze()` 把它冻结掉，变成只读，以免被不知道什么地方修改导致的隐形 bug 。

##### 其他

还有一些类似全局的页面滚动监听、统一的三方资源加载控制确保页面核心功能优先级等方法。

#### traffic-mod-lib

作为公共组件应用，主要承载 FusionNext 组件以及我们自己的业务通用组件。

FusionNext 组件由于保罗万象，所以体积也比较惊人，我们场景只能用到其中的一部分组件，所以进行了单独的处理：

```jsx
// ---------------Next 组件 start---------------
import Balloon from '@alifd/next/lib/balloon';
import Button from '@alifd/next/lib/button';
import Checkbox from '@alifd/next/lib/checkbox';
import Collapse from '@alifd/next/lib/collapse';
import ConfigProvider from '@alifd/next/lib/config-provider';
import Dialog from '@alifd/next/lib/dialog';
import Drawer from '@alifd/next/lib/drawer';
import Icon from '@alifd/next/lib/icon';
import Input from '@alifd/next/lib/input';
import Loading from '@alifd/next/lib/loading';
import Pagination from '@alifd/next/lib/pagination';
import Select from '@alifd/next/lib/select';
import Slider from '@alifd/next/lib/slider';
import Tag from '@alifd/next/lib/tag';
// ---------------Next 组件 end---------------

export {
  Balloon,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  Loading,
  Pagination,
  Icon,
  ConfigProvider,
  Tag,
  Select,
  Slider,
  Drawer,
  Input,
  NextLocalEnUS,
};
```

其他就是业务通用组件了，没什么好说的：

```jsx
import './public-path';

import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

// import IcbuIcon from './components/icon';
import IcbuIcon, { Certificate, FlagIcon, GsYear } from '@alife/bc-icbu-icon';
import safeLog from '@alife/bc-safe-log';

import Alitalk from './components/alitalk';
import './index.less';
import './index.scss';
// ---------------PC流量Footer三巨头-------------
import { FloatingWindow, RecommendLayer, RfqLayer, Swiper, SwiperRefType } from './modules';
import {
  Balloon,
  Button,
  Checkbox,
  Collapse,
  ConfigProvider,
  Dialog,
  Drawer,
  Icon,
  Input,
  Loading,
  NextLocalEnUS,
  Pagination,
  Select,
  Slider,
  Tag,
} from './next';

IcbuIcon.GsYear = GsYear;
IcbuIcon.FlagIcon = FlagIcon;
IcbuIcon.Certificate = Certificate;

export {
  // 基础框架&方法
  React,
  ReactDOM,
  classnames,
  safeLog,

  // next 组件
  Balloon,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  Loading,
  Pagination,
  Icon,
  ConfigProvider,
  Select,
  Tag,
  Slider,
  Drawer,
  Input,
  NextLocalEnUS,

  // 流量业务组件
  FloatingWindow,
  RfqLayer,
  RecommendLayer,
  Swiper,
  // 三方业务组件
  IcbuIcon,
  Alitalk,
};

export type { SwiperRefType };

```

需要注意的是，上层业务应用如何在项目中使用我们 traffic-mod-lib 中组件。这里就需要提到 traffic-mod-lib 的构建上的处理了，我们需要把它作为一个独立的包来构建而不是普通的应用，修改项目下的 `icbubuyer.config.js`

```js
  extendWebpackConfig: (webpackConfig, env) => {
    const isSSR = env === 'ssr';
    // 本应用会作为一个基础包加载到其他应用中，所以需要将打包后的代码挂载到全局变量上
    webpackConfig.output.library = 'TrafficModLib';
    webpackConfig.output.libraryTarget = isSSR ? 'global' : 'window';
    webpackConfig.output.globalObject = isSSR ? 'global' : 'window';
    return webpackConfig;
  },
```

这样只要页面加载了 traffic-mod-lib 的 js，那么就会在全局变量上挂载一个 `TrafficModLib` 的变量。然后需要在上层业务应用的 `icbubuyer.config.js` 中进行配置：

```js
  modLib: {
    // 公共包 package.json 中的 name，用来作为 import 时候的 id
    // 比如 import {Button} from "@alife/icbu-mod-lib"，packageName 为 @alife/icbu-mod-lib
    packageName: '@alife/icbu-traffic-mod-lib',
    // 公共包挂载到全局变量上的命名，比如 IcbuModLib
    modName: 'TrafficModLib',
  },
```

这样所有从 `@alife/icbu-traffic-mod-lib` 的引用最终都是从全局变量 `TrafficModLib` 里面获取了，比如：

```js
import {
  Alitalk,
  Balloon,
  Button,
  IcbuIcon,
  Icon,
  Swiper,
  SwiperRefType,
} from "@alife/icbu-traffic-mod-lib"
```

#### 基础框架

基础框架 React、ReactDOM 这种，我们通过独立的 js 来引入，集团提供了对应的 CDN，流量业务目前引用的是最新的 react 版本。

- 生产环境：`https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.production.min.js,react-dom/18.2.0/umd/react-dom.production.min.js`
- 开发环境：`https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.development.js,react-dom/18.2.0/umd/react-dom.development.js`
  - 如果你使用 lightProxy 来做本地的代理，可以在开发时添加这条命令 `https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.production.min.js,react-dom/18.2.0/umd/react-dom.production.min.js https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.development.js,react-dom/18.2.0/umd/react-dom.development.js` 来提供开发体验

使用独立 cdn 来引入基础框架代码的优点：

- 更加持久的缓存以及相对更高的缓存命中率
- 进一步降低开发服务编译构建时间，提高开发体验，为手持号称末代 Intel 顶配实际性能羸弱的 16GB 内存经常被打满风扇狂转系统经常性差一点卡死同时被云壳蹂躏的 MacBook 的开发者送去关爱，做一个仁慈的人

## 开发&调试

### 工程目录结构

这是我们业务应用的目录规范：

```
.
├── README.md                   # 项目文档
├── abc.json                    # 云构建的配置
├── demo                        # 示例代码
│   ├── data.json               # 示例数据
│   ├── index.html              # 示例HTML
│   ├── index.tsx               # 示例TypeScript React文件
│   └── pla.json                # 示例配置
├── icbubuyer.config.js         # icbubuyer 构建器配置
├── package.json                # 依赖管理
├── src                         # 源代码
│   ├── component               # 共用组件
│   ├── hook                    # 自定义 Hooks
│   ├── module                  # 业务模块
│   ├── pages                   # 页面级组件
│   ├── public-path.js          # webpack 的chunk 引入路径配置
│   ├── style                   # 样式文件
│   ├── types                   # 类型定义
│   └── utils                   # 工具函数
├── tsconfig.json               # TypeScript配置
└── yarn.lock                   # Yarn锁文件

```

所有项目都保持同样的规范好处不言而喻，如果言一下的话就是：

1. **代码组织与可维护性**: 清晰的目录降低维护难度和出错率。
2. **降低入门门槛**: 了解一个项目的目录结构，就了解了其他所有项目。
3. **代码可读性**: 明确清晰的目录降低工程的理解成本，提高代码可读性。
4. **提升协作效率**: 约定大于配置，规范可以减少不必要的沟通，提高团队效率。

### 本地开发

所有的项目拥有统一的 npm script 规范：

- 通过 npm run start 开启本地调试服务
- 通过 npm run build 执行本地构建

不会说启动一个开发服务，这个项目是 `npm run start` 那个是 `npm run dev` ,虽说是看一眼 package.json 就能了解的东西，但是不看就是比看更令人省心，身心愉悦。

执行 npm run start 后，控制台会输出一些内容：构建器是否需要更新、最终使用的配置是什么样的开发服务地址端口等；

![本地开发](/imgs/frontend-development-standardization-best-practices/bendikaifa.png)

然后需要绑定以下 hosts 或者代理，核心目的是把所有前端资源代理到本地开发服务，至于是要测试后端的预发环境还是线上环境那看自己的需求进行响应的代理。

```
// 前端资源代理
127.0.0.1 assets.alicdn.com
127.0.0.1 s.alicdn.com
127.0.0.1 dev.g.alicdn.com
```

此时打开线上的一个需要调试的页面，可以在控制台看到类似这样的输出：
![本地开发](/imgs/frontend-development-standardization-best-practices/bedikaifa-1.png)
说明我们当前打开的页面已经在使用本地开发服务的代码了，可以直接进行代码修改调试了。

### 多应用开发&联调

前面架构部分我们提到，任何一个页面其实都至少依赖三个应用：

- 上层业务应用
- traffic-mod-lib
- traffic-base

这会面临几个问题：

1. 上层业务应用中调用 `traffic-mod-lib` 的组件或者 `traffic-base` 的方法时，怎么知道它有哪些组件或者方法，难道每次用都要去看它们的代码吗？
2. 如果一个需求需要同时修改上层业务应用、`traffic-mod-lib` 以及 `traffic-base` 时，怎么调试，难道每次都需要把其他的应用发到预发环境，或者需要写一堆的代理规则来进行本地调试吗？
   我们来依次解答这些问题。

#### 跨应用 api 调用提示

在业务应用中使用 traffic-mob-lib 的组件或者 `traffic-base` 的方法时，不可能没用一下就要去查代码或者文档，这样效率太低了，也容易出错，同时影响开发体验，会让人觉得应用拆分是徒增烦恼。

这个问题的答案实际上也是对前面为什么采用 typescript 的一个回答，即两个底层应用都构建出一份 d.ts 的定义文件，每个上层业务应用引用就好了。

比如 `traffic-base` 中，有这么几个命令：

```json
"build-types": "./node_modules/.bin/tsc --emitDeclarationOnly",
"publish-patch": "rm -rf ./typings && tnpm run build-types && tnpm run build  && tnpm version patch && tnpm publish && git push"
```

执行 build-types 会在工程下生成整个应用的类型定义文件，然后以 npm 包的形式发布。在业务应用的 d.ts 文件中引用一下就好了：

```d.ts
/// <reference types="@alife/cdn-traffic-base/typings/pc" />
```

这样实际使用时就会有类型安全的代码提示了：

1. 不建议业务应用直接从全局变量上读取调用方法，所以了封装 `traffic-base` 方法的调用
   ![traffic-base](/imgs/frontend-development-standardization-best-practices/traffic-base-1.png)
2. 在使用时，就能获取完整的 api 提示了
   ![traffic-base](/imgs/frontend-development-standardization-best-practices/traffic-base-2.png)

traffic-mod-lib 就更简单了，只需要 build 出一份类型定义文件然后发布 npm 包，上层业务应用直接使用就好了：
![traffic-base](/imgs/frontend-development-standardization-best-practices/traffic-base-3.png)

需要注意的是，无论是 @alife/icbu-traffic-mod-lib 还是 @alife/cdn-traffic-base 虽然在业务应用中被引用了，但是它们并没有真正的参与项目的构建编译打包。在 webpack 中都 external 掉了，参考 icbubuyer.config.js 配置：

```js
  modLib: {
    // 公共包 package.json 中的 name，用来作为 import 时候的 id
    // 比如 import {Button} from "@alife/icbu-mod-lib"，packageName 为 @alife/icbu-mod-lib
    packageName: '@alife/icbu-traffic-mod-lib',
    // 公共包挂载到全局变量上的命名，比如 IcbuModLib
    modName: 'TrafficModLib',
  },
```

#### 多应用本地联调

如果一个需求需要同时修改上层业务应用、`traffic-mod-lib` 以及 `traffic-base` 时，怎么调试？我们的构建器 `icbu-buyer` 中使用 comboProxy 来做 webpack 的本地开发服务，具体在构建器中的代码：

```js
    devServer: !production
      ? comboProxy({
          port,
          host: '0.0.0.0',
          hot: true,
        })
      : {},
```

这里的 comboProxy 是我们自己维护的包，内网地址 [@ali/webpack-server-combo-proxy - Alibaba NPM Registry (alibaba-inc.com)](https://anpm.alibaba-inc.com/package/@ali/webpack-server-combo-proxy) 目前店铺、流量以及几个后台应用都是用这个包来做本地开发服务的。

##### webpack-server-combo-proxy

这个插件主要做了这几件事情：

- 启动一个后台服务，跑在 80 以及 443 端口上
- 将当前的应用注册在这个后台服务中
- 当浏览器端的请求被代理到本地服务时，根据被注册的地址转发到具体的本地应用中

![webpack-server-combo-proxy](/imgs/frontend-development-standardization-best-practices/proxy-1.png)

举个例子，比如我在开发 `cdn-traffic-pay-pc` 应用，当我本地执行 npm run start 启动开发服务时：

1. 检测后台服务是否启动，如果没有的启动一个新的服务，占据 80 以及 443 端口
2. 在这个后台服务上用 `cdn-traffic-pay-pc` 这个应用的 git 地址作为 id 注册到后台服务中，打开 127.0.0.1 可以看到：
   1. ![webpack-server-combo-proxy](/imgs/frontend-development-standardization-best-practices/proxy-1-1.png)
3. 当浏览器访问付费的承接页比如 [alibaba.com/premium/Seals.html?src=sem_ggl&mark=drm0611&tagId=62431584548&product_id=62431584548&pcate=1407&cid=1407&ali_creative_id=7396748df8d7b7171c8c69322fc97f56&ali_image_material_id=0f7f01f815bf5e66f0fe539b6a5802ff](https://www.alibaba.com/premium/Seals.html?src=sem_ggl&mark=drm0611&tagId=62431584548&product_id=62431584548&pcate=1407&cid=1407&ali_creative_id=7396748df8d7b7171c8c69322fc97f56&ali_image_material_id=0f7f01f815bf5e66f0fe539b6a5802ff) 时，其中依赖的比如 drm-search.css 之类的资源就会先通过本地的后台服务然后经过判断最终转发到本地的webpack-dev-server 或者直接请求到预发前端或者线上的地址

当此时需要同时调试其他项目时，只需要在被调试的项目下执行 npm run start，就会根据同样的逻辑注册新的端口以及服务地址，比如此时我需要开发 traffic-mod-lib ，那么启动本地开发服务后再访问 127.0.0.1 查看就会发现多了一个 `cdn-traffic-mod-lib` 的注册地址：
![webpack-server-combo-proxy](/imgs/frontend-development-standardization-best-practices/proxy-2.png)

这样再次访问前台页面时，请求路径符合 `cdn-traffic-pay-pc` 的链接会被转发到 3000 端口下的开发服务，路径符合 `cdn-traffic-mod-lib` 的链接请求会被转发到 3001 下，实现多个项目的同时联调。

这套机制的几个关键点：

1. 前台应用发布到 cdn 后的地址和 git 仓库地址之间有一一对应的关系，比如这个 cdn 资源：`https://s.alicdn.com/@g/ife/cdn-traffic-mod-lib/1.0.4/index.js` 他对应的代码仓库的 git 地址路径就是 `git@gitlab.alibaba-inc.com:ife/cdn-traffic-mod-lib.git` 所以我们的 comboProxy 可以通过资源链接分析出对应的代码仓库，从而可以注册并转发到正确的本地服务地址
2. 服务必须跑在 80 以及 443 端口上，然后通过 hosts 绑定也好代理也好，将所有的前端资源请求代理到本地的这个服务，这样所有的资源请求都得经过本地的代理服务

## 性能

承接页非常注重性能的体验，因为会直接影响到 Google 的算法排名，付费的 landingRate ，所以在性能上我们也做了很多事情。本文只关心代码工程方面的，完整的性能优化指引可以参考：[Alibaba.com 性能优化经验总结](https://blog.kisnows.com/2023/01/11/alibaba-buyer-performance-optimization-summary)

在应用层面，我们做了这些事情：

- 非核心功能异步
- CDN 配置
- 公共库独立接入

### 非核心功能异步

对于页面上非核心的功能，可以使用 webpack 的异步 import 来加载，比如我们页面上的左侧筛选模块：

```jsx
function LeftFilterAsync({ data }: { data: PPCSearchResult.PageData }) {
  const TrafficLeftFilter = lazy(
    () => import(/* webpackChunkName: "left-filter" */ '@alife/traffic-left-filter')
  );
  const { snData, i18nText } = data;
  const handleChange = (link: string) => {
    window.location.href = link;
    window.globalUtils.logUtils.logModClick(
      {
        moduleName: 'left-filter',
      },
      {
        action: 'filter',
        type: link,
      }
    );
  };
  return (
    <SSRCompatibleSuspense
      fallback={<Icon type="loading" style={{ marginLeft: 40, marginTop: 50 }} />}
    >
      <TrafficLeftFilter data={snData} i18n={i18nText} handleChange={handleChange} />
    </SSRCompatibleSuspense>
  );
}
```

通过 `import(/* webpackChunkName: "left-filter" */ '@alife/traffic-left-filter')` 来异步加载 `@alife/traffic-left-filter` 模块，需要注意的是我们使用了一个组件 `SSRCompatibleSuspense` 包裹了异步加载的模块，它的好处是在加载完成之前可以展示一个 loading 来占位，以免用户等待焦虑或者页面抖动：

```jsx
export default function SSRCompatibleSuspense(props: Parameters<typeof Suspense>['0']) {
  const isMounted = useMounted();

  if (isMounted) {
    return <Suspense {...props} />;
  }
  return <>{props.fallback}</>;
}

```

同时需要注意的一点，由于我们的 js 都是在 cdn 上，域名一般都和页面的主域名不一致，所以需要进行配置才能时运行时能够加载到正确的 chunk 地址：

```jsx
文件名：public-path
/**
 * 处理 webpack 代码切分的 path 路径
 */
const REG_SRC = /^(https?:)?\/\/(.+)\/msite\/(.*)cdn-traffic-pay-pc\/([\d.]+)\//;

function getSrcMatch() {
  if (document.currentScript) {
    return document.currentScript.src.match(REG_SRC);
  } else {
    const elScripts = document.querySelectorAll('script[src]');
    // render脚本一般在最后，这里从后往前找，以便提升查找效率
    for (let i = elScripts.length - 1; i >= 0; i--) {
      const matches = elScripts[i].src.match(REG_SRC);
      if (matches) {
        return matches;
      }
    }
  }
}

export function getPublicPath() {
  const matches = getSrcMatch();
  return `//${matches[2]}/msite/cdn-traffic-pay-pc/${matches[4]}/`;
}

try {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = getPublicPath();
} catch (err) {
  console.error(err);
}

```

需要手动设置 webpack 的 public_path ，然后在应用的主入口 js 处引入：

```js
import "../../public-path"

import React from "react"
import classnames from "classnames"
```

这样异步的 chunks 下就会从你配置的 **webpack_public_path** 加载而不是当前页面的域名下加载了。

### CDN 配置

项目更目录下需要有 `.assetsmetafile` 文件来告诉 CDN 服务器当前资源的缓存时间，参考缓存一年的配置：

```
cache-control:max-age=31536000,s-maxage=31536000
```

备注：和架构组的同学沟通说这是个私有的配置，很有可能某一天就没有用了。

### 公共库独立接入

前面提到的 React、ReactDOM 之类的一般不会发生变化的且整个部门机会都是用同样的选择的公共库，建议走独立的 CDN 地址引入，集团提供了常用库 CDN 地址平台 https://work.def.alibaba-inc.com/lib ，流量业务用的是目前 React 的最新版本专转换成 s.alicdn.com 后的资源：

- combo 后的资源：

```
https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.production.min.js,react-dom/18.2.0/umd/react-dom.production.min.js
```

- 解 combo 后：
  - React:https://s.alicdn.com/@g/code/lib/??react/18.2.0/umd/react.production.min.js
  - ReactDOM: https://s.alicdn.com/@g/code/lib/??react-dom/18.2.0/umd/react-dom.production.min.js

独立引用的好处：发布频率低，缓存命中率高。
采用现成的集团提供的 CDN 地址的好处：使用的业务方会更多，在 CDN 的各级边缘节点上的缓存概率也会更大

## 稳定性

在开发过程中，我们通过使用 typescript 提供更强的约束，eslint 以及 stylelint 之类的 lint 工具降低开发阶段的代码问题。同时因为经过应用拆分后，上层业务的复杂度较低，已经大幅降低了日常发布的风险。

同时在发布过程中遵循集团的安全发布的规范，所有的发布需要经过以下几个流程：

- 预发环境测试通过
- codereview：核心项目需要 2 人通过
- 菲尔兹自动化测试通过
- 安全生产环境验证

都没有问题后发布上线，上线后观察一段时间内的监控指标 [流量业务的监控地址] 是否正常，不正常的话及时回滚。

## 总结

本文以从开发到上线的脉络，详细梳理了我们业务的技术选型、规约、架构设计、开发调试方法以及在稳定性和性能上的工作，一些地方都放上了我们实际的代码，希望更加容易理解。并没有什么高深的技术或者很巧妙的实现，都是从工作中沉淀下来的一些自认为的最佳实践。

关于文中的方法或者选择以及方案，有任何疑问或者意见，欢迎讨论。
