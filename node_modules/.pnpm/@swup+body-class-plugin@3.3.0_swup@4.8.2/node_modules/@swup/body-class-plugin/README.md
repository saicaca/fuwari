# Swup Body Class Plugin

A [swup](https://swup.js.org) plugin for updating the body classname after each page load.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/body-class-plugin
```

```js
import SwupBodyClassPlugin from '@swup/body-class-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/body-class-plugin@3"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupBodyClassPlugin()]
});
```

## Options

### prefix

By default, all classes are updated. If your site uses classes on the body element for functionality
like opening menus, you can tell the plugin to only update classnames starting with a prefix,
e.g. `page-`. It will then only update those classes and leave all other classes untouched.

```javascript
{
  prefix: 'page-'
}
```

### attributes

Update additional attributes of the body element. Useful if you have defined the `lang` or `dir`
attributes or work with `data-*` attributes on the body element. Accepts an array of strings or
regular expression instances.

```javascript
{
  attributes: ['lang', 'dir', /^data-/]
}
```
