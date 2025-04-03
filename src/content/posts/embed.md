---
title: Embed Example
published: 2025-03-27T00:00:00+00:00
description: Guide to using the embed feature.
tags: [Markdown, Blogging, Demo]
category: Examples
draft: false
---

## About Embed

Simply write a link, and the external site will be embedded automatically.

## Usage

### Embedding a Site

```markdown
[](https://www.youtube.com/watch?v=5gIf0_xpFPI)
```

[](https://www.youtube.com/watch?v=5gIf0_xpFPI)

```markdown
[](https://www.bilibili.com/video/BV1fK4y1s7Qf/ "A title")
```

[](https://www.bilibili.com/video/BV1fK4y1s7Qf/ "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

### Embedding Multiple Sites

When you include only links within a paragraph, they will be grouped together. Hard or soft breaks can also be used.

```markdown
[](https://www.desmos.com/calculator/3kshfiqwha)  
[](https://www.desmos.com/calculator/hek5x4fsyk)  
[](https://www.desmos.com/calculator/d738hcma3w)
```

[](https://www.desmos.com/calculator/3kshfiqwha)  
[](https://www.desmos.com/calculator/hek5x4fsyk)  
[](https://www.desmos.com/calculator/d738hcma3w)

```markdown
[](https://www.desmos.com/calculator/3kshfiqwha "Title 1")  
[](https://www.desmos.com/calculator/hek5x4fsyk "Title 2")  
[](https://www.desmos.com/calculator/d738hcma3w "Title 3")
```

[](https://www.desmos.com/calculator/3kshfiqwha "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
[](https://www.desmos.com/calculator/hek5x4fsyk "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
[](https://www.desmos.com/calculator/d738hcma3w "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

```markdown
[](https://www.desmos.com/calculator/3kshfiqwha "Here becomes the caption")  
[](https://www.desmos.com/calculator/hek5x4fsyk)  
[](https://www.desmos.com/calculator/d738hcma3w)
```

[](https://www.desmos.com/calculator/3kshfiqwha "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
[](https://www.desmos.com/calculator/hek5x4fsyk)  
[](https://www.desmos.com/calculator/d738hcma3w)

## Options

You can specify the options in the `astro.config.mjs` file.

```javascript
...
import remarkEmbed from "./src/plugins/remark-embed.ts"
...
export default defineConfig({
  ...
  markdown: {
    ...
    remarkPlugins: [
      ...
      remarkEmbed, // Plugin here
      ...
```

| Name      | Type     | Default | Description                                              |
| --------- | -------- | ------- | -------------------------------------------------------- |
| className | string   | ""      | The class name to apply to the outer `<figure>` element. |
| sources   | Source[] | []      | An array of Source objects for embedding.                |

### Source

| Name             | Type                | Required | Description                                                                                                                          |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| contentUrl       | RegExp              | ✅        | A regular expression to match URLs for embedding a website.                                                                          |
| embedUrl         | string              | -        | The URL format used for embedding a website. Supports placeholders like `${N}`, which correspond to captured groups in `contentUrl`. |
| queryParams      | Record<string, any> | -        | Query parameters to append to the embed URL. Supports placeholders like `${N}`, which correspond to captured groups in `contentUrl`. |
| iframeAttributes | Record<string, any> | -        | Additional attributes to set on the iframe element.                                                                                  |

## Site-specific Options

Below are configuration examples for embedding specific websites. For parameter details, please refer to the documentation of each website.

### YouTube

```javascript
{
  sources: [
    {
      contentUrl: /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/,
      embedUrl: 'https://www.youtube.com/embed/${1}',
      iframeAttributes: {
        loading: 'lazy',
        title: 'YouTube video player',
        allow:
          'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        referrerpolicy: 'strict-origin-when-cross-origin',
      },
    },
  ],
}
```

### Bilibili

```javascript
{
  sources: [
    {
      contentUrl: /https:\/\/www.bilibili.com\/video\/([a-zA-Z0-9]+)\/?/,
      embedUrl: '//player.bilibili.com/player.html',
      queryParams: {
        poster: 1,
        autoplay: 0,
        bvid: '${1}',
        p: 1,
      },
      iframeAttributes: {
        loading: 'lazy',
        allow: 'fullscreen',
      },
    },
  ],
}
```

### Desmos

```javascript
{
  sources: [
    {
      contentUrl:
        /^https:\/\/www\.desmos\.com\/calculator\/(?:[a-zA-Z0-9]+)$/,
      queryParams: {
        embed: '',
      },
      iframeAttributes: {
        loading: 'lazy',
      },
    },
  ],
}
```
