# Swup Morph Plugin

A [swup](https://swup.js.org) plugin for morphing dom nodes into the new page.

Allows morphing containers into the new page without replacing or animating them. The prime use
cases are headers and menus on multi-language sites: you might not want to swap these elements out
with a transition on each page visit, however you'd still want to update any URLs, labels or
classnames when the user switches between languages.

Behind the scenes, it uses
[morphdom](https://github.com/patrick-steele-idem/morphdom) to update the
existing DOM nodes to match the same DOM nodes on the new page being loaded.
This will leave any event handlers in place, as opposed to setting `innerHTML`
on the target.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install swup-morph-plugin
```

```js
import SwupMorphPlugin from 'swup-morph-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/swup-morph-plugin@1"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupMorphPlugin()]
});
```

## Morphed containers

The plugin provides two ways of choosing the containers to be morphed:

### Container option

Pass in a list of selectors into the plugin options to let it know about morphable containers. Use
this method if you have a limited and predictable number of containers to morph.

```javascript
new SwupMorphPlugin({
  containers: ['#nav']
})
```

```html
<nav id="nav">
  <!-- Morphed by this plugin -->
</nav>
<main id="swup">
  <!-- Replaced normally by swup -->
</main>
```

### Data attribute

Add a `data-swup-morph` attribute with a **unique** identifier on containers to be morphed. The
plugin will find all containers with this attribute and match the outgoing and incoming versions
of each container by the value of the attribute. Use this method if you have lots of dynamically
created morphable containers.

```html
<nav data-swup-morph="nav">
  <!-- Morphed by this plugin -->
</nav>
<main id="swup">
  <!-- Replaced normally by swup -->
</main>
```

## Options

### containers

Array of specific DOM selectors that will be morphed into the new page.

```javascript
{
  containers: ['#nav']
}
```

### updateCallbacks

Callbacks to run before elements are updated. This can be used to persist or
discard certain attributes. If the callback returns `false`, the element will
not be updated.

See the [morphdom docs](https://github.com/patrick-steele-idem/morphdom#api) on
the `onBeforeElUpdated` option for details.

```javascript
{
  containers: ['#widget'],
  updateCallbacks: [
    (fromEl, toEl) => {
      // Persist ARIA attributes on buttons and inputs
      if (fromEl.hasAttribute('aria-pressed')) {
        toEl.setAttribute('aria-pressed', fromEl.getAttribute('aria-pressed'))
      }
    }
  ]
}
```
