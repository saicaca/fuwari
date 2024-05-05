---
title: Social Content & Open Graph
published: 2024-05-05
description: 'Read more on how Fuwari handles OG and Social-Content'
image: ''
tags: [Example, Demo, Customization]
category: 'Guide'
draft: false 
---

# What is Open Graph?
The [Open Graph protocol](https://ogp.me/) enables any web page to become a rich object in a social graph. It consist on some structured metadata that signal other websites (and engines!) what is found on that page.

:::tip
Go to the social media/messaging app of your preference and send a link. It should become a rich object!
Below is an example of Discord + Github:
<img src="/public/open-graph-example.png" width="72%">
:::

## Basic post metadata
Fuwari by default adds basic metadata to each post page automatically. Pulling it from the site configuration and the post data:
```html
<meta name="author" content={profileConfig.name}>

<meta property="og:site_name" content={siteConfig.title}>
<meta property="og:url" content={Astro.url}>
<meta property="og:title" content={pageTitle}>
<meta property="og:description" content={description || pageTitle}>

<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:url" content={Astro.url}>
<meta name="twitter:title" content={pageTitle}>
<meta name="twitter:description" content={description || pageTitle}>
```

## Dynamic post image (OG Image)
The post image (as seen above in the Discord example) is really important to elevate your content's social media presence. Creating this image for each post can be time consuming, so Fuwari has an option to generate them dynamically with the help of `astro-og-canvas`.

:::important
This feature is disabled by default as it generates an image per post.

This is not really important as the images have a high compression rate and arent big, but its still something to take into account when deploying. A cache is generated inside `node_module/.astro-og-canvas`.
:::

```js
{ // config.ts | siteConfig
  dynamicOpenGraph: {
    enable: enabled,
    config: { // Extended configuration for "astro-og-canvas"
      /* Add your configuration here */
    }, 
  },
}
```
To customize the looks of the generated OG image, you should change the default `dynamicOpenGraph.config` entry. You can find the extended configuration here: [delucis/astro-og-canvas#image-options](https://github.com/delucis/astro-og-canvas/tree/latest/packages/astro-og-canvas#image-options)