# Swup Head Plugin

A [swup](https://swup.js.org) plugin for updating the contents of the head tag.

- Adds any meta tags and assets from the next page to the current document
- Updates the lang and dir attributes of the html element
- Supports delaying the transition until new stylesheets have loaded

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/head-plugin
```

```js
import SwupHeadPlugin from '@swup/head-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/head-plugin@2"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupHeadPlugin()]
});
```

## Markup

When using `noscript` tags inside the head, make sure they only contain the
[node types allowed inside the head element](https://html.spec.whatwg.org/multipage/dom.html#metadata-content-2).
Otherwise, the browser will implicitly close the head element and interpret them as part of the
body, most probably breaking this plugin and leading to unforseen results.
See [the following issue](https://github.com/swup/head-plugin/issues/40) for details and a fix.

## Options

### persistAssets

Whether to keep orphaned `link`, `style` and `script` tags from the old page
that weren't included on the new page. Useful for third-party libraries that
add custom styles but can only be run once.

Defaults to `false`, i.e. orphaned assets will be removed.

Setting it to `true` acts as a shortcut for setting the `persistTags` option to
a selector of `link[rel=stylesheet], script[src], style`.

```javascript
new SwupHeadPlugin({
  persistAssets: true
});
```

### persistTags

Define which tags will be persisted when a new page is loaded.

Defaults to `false`, i.e. all orphaned tags will be removed.

```javascript
new SwupHeadPlugin({
  // Keep all orphaned tags
  persistTags: true,

  // Keep all tags that match a CSS selector
  persistTags: 'style[data-keep-style]',

  // Use a function to determine whether to keep a tag
  persistTags: (tag) => tag.children.length > 1
});
```

### awaitAssets

Setting this to `true` will delay the transition to the new page until all newly
added assets have finished loading, imitating the standard browser behavior of render-blocking requests. Currently only supports stylesheets.
Defaults to `false`.

```javascript
new SwupHeadPlugin({
  awaitAssets: true
});
```

### attributes

Update additional attributes of the html element. By default, the `lang` and `dir` attributes are
updated, but you can define a custom list of attributes here. Accepts an array of strings or
regular expression instances.

```javascript
{
  attributes: ['lang', 'dir', 'style', /^data-/]
}
```
