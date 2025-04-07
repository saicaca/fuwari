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

### Single Embed

#### With Caption

Markdown:

```markdown
[](url "A title")
```

HTML:

```html
<figure>
  <div>
    <figure>
      <iframe src="url"></iframe>
      <figcaption>A title</figcaption>
    </figure>
  </div>
</figure>
```

[](https://www.youtube.com/watch?v=5gIf0_xpFPI "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

#### Without Caption

Markdown:

```markdown
[](url)
```

HTML:

```html
<figure>
  <div>
    <iframe src="url"></iframe>
  </div>
</figure>
```

[](https://www.bilibili.com/video/BV1fK4y1s7Qf/)

### Multiple Embeds

When you include only links within a paragraph, they will be grouped together. Hard or soft breaks can also be used.

#### With Captions

Markdown:

```markdown
[](url1 "Title 1")  
[](url2 "Title 2")
```

HTML:

```html
<figure>
  <div>
    <figure>
      <iframe src="url1"></iframe>
      <figcaption>Title 1</figcaption>
    </figure>
    <figure>
      <iframe src="url2"></iframe>
      <figcaption>Title 2</figcaption>
    </figure>
  </div>
</figure>
```

[](https://www.youtube.com/watch?v=5gIf0_xpFPI  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
[](https://www.bilibili.com/video/BV1fK4y1s7Qf/ "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

#### Without Captions

Markdown:

```markdown
[](url1)  
[](url2)
```

HTML:

```html
<figure>
  <div>
    <iframe src="url1"></iframe>
    <iframe src="url2"></iframe>
  </div>
</figure>
```

[](https://www.youtube.com/watch?v=5gIf0_xpFPI)  
[](https://www.bilibili.com/video/BV1fK4y1s7Qf/)

#### With Shared Caption

Markdown:

```markdown
[](url1 "This becomes the caption")  
[](url2)  
[](url3)
```

HTML:

```html
<figure>
  <div>
    <iframe src="url1"></iframe>
    <iframe src="url2"></iframe>
    <iframe src="url3"></iframe>
  </div>
  <figcaption>This becomes the caption</figcaption>
</figure>
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
      contentUrl: /^https:\/\/www.bilibili.com\/video\/([a-zA-Z0-9]+)\/?$/,
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
