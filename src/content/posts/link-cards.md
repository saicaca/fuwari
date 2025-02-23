---
title: Link Cards Example
published: 2025-02-23T00:00:00+00:00
description: Guide to using the link card feature.
tags: [Markdown, Blogging, Demo]
category: Examples
draft: false
---

## About Link Cards

Link Cards are similar to the `<LinkCard>` component in [Starlight](https://starlight.astro.build), displaying links in a card format.

## Usage

Include only a single "bare" link (a link without descriptive text), or something similar, within a paragraph in Markdown, and it will automatically be converted into a Link Card.

```markdown

**External Links**

https://astro.build/

<https://github.com/saicaca/fuwari/>

[https://fuwari.vercel.app/](https://fuwari.vercel.app/)

**Internal Links**

[/posts/guide/](/posts/guide/)

For more details, see the internalLink option section.

**IDN (Internationalized Domain Name)**

https://はじめよう.みんな/

```

https://astro.build/

<https://github.com/saicaca/fuwari/>

[https://fuwari.vercel.app/](https://fuwari.vercel.app/)

[/posts/guide/](/posts/guide/)

https://はじめよう.みんな/

> [!NOTE]
> Once the cards are displayed, try changing the theme color or enabling dark mode!

## Options

You can specify the options in the `astro.config.mjs` file.

```javascript
...
import fuwariLinkCard from "./src/plugins/fuwari-link-card.js"
...
export default defineConfig({
  ...
  integrations: [
    ...
    fuwariLinkCard(), // Plugin here
    ...
```

If the order of plugins is complex, you can also specify it as a remark plugin.

```javascript
...
import remarkLinkCard from "./src/plugins/remark-link-card.js"
...
export default defineConfig({
  ...
  markdown: {
    ...
    remarkPlugins: [
      ...
      remarkLinkCard, // Plugin here
      ...
```

| Name             | Type            | Default                                                                                                                                        | Description                                                                                                                                                                                                                                                                    |
| ---------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| devMode          | boolean         | [import.meta.env.DEV](https://docs.astro.build/en/guides/environment-variables/#default-environment-variables "Default environment variables") | Enable or disable development mode.                                                                                                                                                                                                                                            |
| linkAttributes   | Object          | { target: '', rel: '' }                                                                                                                        | Set the target and relationship attributes for external links. These attributes can also be left unset to delegate handling to other plugins.                                                                                                                                  |
| rewriteRules     | Array\<Object\> | []                                                                                                                                             | Rewrite specific metadata attributes fetched from links, such as the title and description.                                                                                                                                                                                    |
| base             | string          | '/'                                                                                                                                            | Specify the same base path as Astro's. For details, refer [here](https://docs.astro.build/en/reference/configuration-reference/#base "Configuration Reference"). **When used as an integration, if not specified, this option will be determined automatically.**              |
| defaultThumbnail | string          | ''                                                                                                                                             | Path to the default thumbnail image to use when the metadata does not include image data. It should be relative to the public directory. For example, set `defaultThumbnail` to 'images/default-thumbnail.jpg' if the image is located at public/images/default-thumbnail.jpg. |
| internalLink     | Object          | { enabled: false, site: '' }                                                                                                                   | Enable internal link processing within your site.                                                                                                                                                                                                                              |
| cache            | Object          | See detailed options below.                                                                                                                    | Download and cache images during the build process.                                                                                                                                                                                                                            |

### linkAttributes

| Name   | Type   | Default | Description                                                                                                                      |
| ------ | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| target | string | ''      | Specify where to open linked documents. The default (empty) does not set a target on links.                                      |
| rel    | string | ''      | Define the relationship between the current document and the linked document. The default (empty) does not set any relationship. |

### rewriteRules

| Name         | Type            | Default | Description                                                   |
| ------------ | --------------- | ------- | ------------------------------------------------------------- |
| url          | RegExp          |         | A regular expression pattern is used to match a specific URL. |
| rewriteSteps | Array\<Object\> |         | Defines rewrite rules for specific metadata attributes.       |

Below is an example that shows how to rewrite the "title" and "description" for metadata fetched from links pointing to a GitHub repository.

```javascript
rewriteRules: [
  {
    url: /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/,
    rewriteSteps: [
      { key: "title", pattern: /:.*/, replacement: "" },
      {
        key: "description",
        pattern: /(?: (?:\. )?Contribute to (?:.+\/.+) .+\.?)|(?: - (?:.+\/.+))$/,
        replacement: "",
      },
      {
        key: "description",
        pattern: /^Contribute to (?:.+\/.+) .+\.?$/,
        replacement: "No description provided.",
      },
    ],
  },
],
```

| Name        | Type   | Default | Description                                                                                                                                             |
| ----------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| key         | string |         | Metadata attribute key to be rewritten.                                                                                                                 |
| pattern     | RegExp |         | Regular expression pattern used to match the current value of the metadata attribute. The part of the value that matches this pattern will be replaced. |
| replacement | string |         | String to replace the matched pattern in the metadata attribute.                                                                                        |

### internalLink

Set `enabled` to `true` to enable internal link processing within your site. The `site` and `base` options resolve internal links to absolute URLs. **Internal links must point to files that exist on the server.**

| Name    | Type    | Default | Description                                                                                                                                                                                                                                                          |
| ------- | ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled | boolean | false   | Enable or disable internal link processing.                                                                                                                                                                                                                          |
| site    | string  | ''      | Specify the same deployed URL as Astro's. For details, refer [here](https://docs.astro.build/en/reference/configuration-reference/#site "Configuration Reference"). **When used as an integration, if not specified, this option will be determined automatically.** |

### cache

The following related options allow you to easily control the caching behavior.

| Name         | Type    | Default                                                                                                           | Description                                                                                                                                                                                                                              |
| ------------ | ------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled      | boolean | false                                                                                                             | Enable or disable caching.                                                                                                                                                                                                               |
| outDir       | string  | './dist/'                                                                                                         | Output directory path.  For details, refer [here](https://docs.astro.build/en/reference/configuration-reference/#outdir "Configuration Reference"). **Aligning with Astro allows you to benefit from features like image optimization.** |
| cacheDir     | string  | './link-card/'                                                                                                    | Cache directory path. If `devMode` is set to true, the final URL to the cached images will be `base + outDir + cacheDir`. Otherwise, it will be `base + cacheDir`.                                                                       |
| maxFileSize  | number  | 0                                                                                                                 | Maximum file size (in bytes) to cache. Set to 0 for no limit.                                                                                                                                                                            |
| maxCacheSize | number  | 0                                                                                                                 | Maximum total cache size (in bytes). Set to 0 for no limit.                                                                                                                                                                              |
| userAgent    | string  | 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36' | Identifier included in HTTP request headers to specify the client.                                                                                                                                                                       |

### Quick and Easy Options Setup

This plugin uses `@fastify/deepmerge` to simplify options setup.

<https://www.npmjs.com/package/@fastify/deepmerge>

## HTML Structure for Styling

The styles are specified in `src/styles/link-card.css`, and the HTML is automatically generated. Below is an example structure to guide you when customizing the styles:

```html
<div class="link-card__container">
  <a href="https://astro.build/" class="link-card">
    <div class="link-card__info">
      <div class="link-card__title">Astro</div>
      <div class="link-card__description">Astro builds fast content sites, powerful web applications, dynamic server APIs, and everything in-between.</div>
      <div class="link-card__metadata">
        <div class="link-card__domain">
          <img alt="favicon" class="link-card__favicon" src="https://www.google.com/s2/favicons?domain=astro.build">
          <span class="link-card__domain-name">astro.build</span>
        </div>
      </div>
    </div>
    <div class="link-card__thumbnail">
      <img alt="Astro - Build the web you want." class="link-card__image" src="https://astro.build/og/astro.jpg">
    </div>
  </a>
</div>
```
