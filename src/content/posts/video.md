---
title: 在文章中嵌入视频
published: 2023-08-01
description: 分享在 Fuwari 博客的 Markdown 文章里嵌入 YouTube、哔哩哔哩和 m3u8 播放器的常用写法与效果测试。
tags: [demo, video]
category: Examples
draft: true
device: Windows
---

在 Astro 的 Markdown 文章里可以直接写原生 HTML，所以想插视频时不需要额外装插件，直接把视频平台生成的 `<iframe>` 嵌入代码贴进正文就能用。不过上线前建议顺手检查两件事：一是确认嵌入来源可信，二是给 `iframe` 写明尺寸（或宽高比容器）并补上 `allowfullscreen`，避免页面排版塌陷或无法全屏。

最基本的文章写法大致如下：

```yaml
---
title: Include Video in the Post
published: 2023-10-19
// ...
---

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allowfullscreen></iframe>
```

下面顺手放了三种常用来源的实测演示，调整样式或更换播放器参数时可以直接来这里看渲染效果。

## YouTube

YouTube 官方的嵌入代码直接设 `width="100%"` 搭配固定高度就能适配文章正文宽度：

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Bilibili

Bilibili 播放器习惯在外面套一层带 `aspect-ratio: 16/9` 的容器，再让里面的 `iframe` 绝对定位铺满，这样在不同屏幕宽度下都能保持标准比例：

<div style="position: relative; width: 60%; aspect-ratio: 16/9;">
    <iframe src="//player.bilibili.com/player.html?bvid=BV1Fm4ZzDEeY"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>

## m3u8

如果手里是自托管的 `.m3u8` 流媒体地址，也可以通过在线播放器把地址拼进 `url` 参数里，再以 `iframe` 形式嵌进文章：

<iframe src="https://m3u8player.org/player.html?url=https://raw.githubusercontent.com/Pinellia451/m3u8-storge/refs/heads/main/11.m3u8"></iframe>
