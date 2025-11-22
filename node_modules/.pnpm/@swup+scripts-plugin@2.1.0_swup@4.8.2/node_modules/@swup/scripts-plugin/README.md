# Swup Scripts Plugin

A [swup](https://swup.js.org) plugin for re-evaluating scripts.

Re-run any `<script>` tags inside the `<head>` and/or `<body>` on every page view. This can be
helpful if you don't have full control over the scripts included on your website.

Ignores any script tags with the attribute `[data-swup-ignore-script]`. This attribute **must be**
on the script tag that initializes swup itself to prevent creating multiple swup instances.

> **🚨 Warning:** Use this plugin as a last resort for projects with limited control over the included scripts. Running scripts without destroying previous ones can cause memory leaks and potentially break your page.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/scripts-plugin
```

```javascript
import SwupScriptsPlugin from '@swup/scripts-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/scripts-plugin@2"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupScriptsPlugin()]
});
```

## Options

### head / body

The plugin provides two boolean options — `head` and `body`. Both are set to `true` by default.
Set these to `false` to disable re-evaluating scripts globally in the head or body of your website.

```javascript
new SwupScriptsPlugin({
  head: true,
  body: true
});
```

### optin

Some third-party libraries like Google Tag Manager might not give you any control over how
scripts are inserted into the page. In that case, enabling the `optin` option will only reload the
scripts explicitly marked with a `[data-swup-reload-script]` attribute.

```javascript
new SwupScriptsPlugin({
  optin: false
});
```
