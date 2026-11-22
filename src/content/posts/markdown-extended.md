---
title: Markdown 扩展功能示例
published: 2024-05-01
updated: 2024-11-29
description: '记录并实测 Fuwari 支持的 Markdown 扩展语法，包括 GitHub 仓库卡片和多种风格的提示块写法。'
image: ''
tags: [demo, markdown]
category: 'Examples'
draft: true
device: Windows
---

除了标准 Markdown，Fuwari 还内置了几个写技术博客时很顺手的扩展语法。这篇草稿既是一份常用写法备忘，也方便我在调整 remark 或 rehype 插件后回来做回归检查，确认 GitHub 仓库卡片和提示块依然渲染正常。

## GitHub 仓库卡片

在文章里安利开源项目时，比起干巴巴放一条链接，直接渲染一张带项目信息的仓库卡片会直观很多。卡片会自动链接到对应的 GitHub 项目，并在页面加载时拉取公开仓库数据：

::github{repo="Fabrizz/MMM-OnSpotify"}

实际写文章时，只要用 `::github{repo="<owner>/<repo>"}` 这行指令就能插入，比如：

```markdown
::github{repo="saicaca/fuwari"}
```

## 提示块

写教程或踩坑记录时，经常需要把注意事项、补充技巧和风险警告从正文中拎出来。Fuwari 支持 `note`、`tip`、`important`、`warning` 和 `caution` 五种提示块类型，各自对应不同的强调程度：

:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::

:::important
Crucial information necessary for users to succeed.
:::

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

:::caution
Negative potential consequences of an action.
:::

### 基础写法

最直接的用法是用三个冒号 `:::` 包裹内容并指定类型：

```markdown
:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::
```

### 自定义标题

如果不想用默认的提示块标题，在类型后面加上方括号就能换成自定义标题：

:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::

```markdown
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::
```

### GitHub 风格语法

如果平时更习惯 GitHub Markdown 的引用提示写法，Fuwari 也同样兼容，迁移旧文档时不用逐个改语法：

> [!TIP]
> [The GitHub syntax](https://github.com/orgs/community/discussions/16925) is also supported.

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```
