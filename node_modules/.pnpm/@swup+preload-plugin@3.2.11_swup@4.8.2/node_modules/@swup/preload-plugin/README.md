# Swup Preload Plugin

A [swup](https://swup.js.org) plugin for preloading pages and faster navigation.

- Links with a `data-swup-preload` attribute will be preloaded automatically
- Hovering a link on pointer devices will preload that link's URL, speeding up load time by a few 100ms. To save server resources, the number of simultaneous preload requests is limited to 5 by default.
- Touch devices will instead preload links at the start of touch events, giving a ~80ms speed-up
- Optionally preload links as they become visible in the viewport

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/preload-plugin
```

```js
import SwupPreloadPlugin from '@swup/preload-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/preload-plugin@3"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupPreloadPlugin()]
});
```

## Preloading

The plugin supports four ways of preloading links:

- Hovering a link
- Marking links to preload with a special attribute
- Watching the viewport for links to become visible
- Passing in a list of URLs to preload at once

### Hovering links

Hovering a link will automatically preload it. Enabled by default.

Depending on the user's device, the preload will be triggered when it is hovered with a mouse,
touched with a finger, or focused using the keyboard. Hovered links are preloaded with higher
priority than other running requests.

```html
<a href="/about">About</a> <!-- will preload when hovering -->
```

### Marking links to preload

To preload specific links, mark them with the `data-swup-preload` attribute.

```html
<a href="/about" data-swup-preload>About</a>
```

To preload all links in a container, mark the container with `data-swup-preload-all`.

```html
<nav data-swup-preload-all>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

### Preload links as they become visible

Preload links as they enter the viewport. Not enabled by default.

See the [preloadVisibleLinks](#preloadvisiblelinks) option for details.

### Preload a list of URLs

Preload specific known URLs.

See the [swup.preload()](#preload) method for details.

## Options

### throttle

Type: `Number`, Default: `5`

The *concurrency limit* for simultaneous requests when preloading.

### preloadHoveredLinks

Type: `Boolean`, Default: `true`

Preload links when they are hovered, touched or focused.

### preloadVisibleLinks

Type: `Boolean` | `Object`, Default: `false`

Preload links when they enter the viewport. Pass in a boolean `true` to enable with default options.

```js
new SwupPreloadPlugin({ preloadVisibleLinks: true })
```

For more control over the behavior, pass in an object. These are the default options:

```js
new SwupPreloadPlugin({
  preloadVisibleLinks: {
    /** How much area of a link must be visible to preload it: 0 to 1.0 */
    threshold: 0.2,
    /** How long a link must be visible to preload it, in milliseconds */
    delay: 500,
    /** Containers to look for links in */
    containers: ['body'],
    /** Callback for opting out selected elements from preloading */
    ignore: (el) => false
  }
})
```

### preloadInitialPage

Type: `Boolean`, Default: `true`

Preload the initial page to allow instant back-button navigation after having navigated away from
it. Disable this if it causes issues or doesn't make sense in your specific scenario.

## Methods on the swup instance

The plugin adds two methods for preloading pages to the swup instance.

### preload

Preload a URL or array of URLs. Returns a Promise that resolves when all requested pages have been preloaded.

```js
await swup.preload('/path/to/page');
await swup.preload(['/some/page', '/other/page']);
```

### preloadLinks

Scan the DOM for links with the attribute `[data-swup-preload]` and call `preload` for each URL:

```js
swup.preloadLinks();
```

## Hooks

The plugin creates two new hooks.

> **Note** The visit object might be `undefined` or already settled for these hooks

### page:preload

Fires when a page was preloaded.

```js
swup.hooks.on('page:preload', (_visit, { page }) => console.log('preloaded:', page));
```

### link:hover

Fires every time a link is hovered.

```js
swup.hooks.on('link:hover', (_visit, { el }) => console.log('link hovered:', el));
```
