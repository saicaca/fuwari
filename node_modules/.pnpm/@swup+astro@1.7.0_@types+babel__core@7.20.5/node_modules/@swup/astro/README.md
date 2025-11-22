# @swup/astro

**Make your site feel like a snappy single-page app — without any of the complexity.**

Enable smooth page transitions, smart preloading and more with this
[Astro](https://docs.astro.build/en/guides/integrations-guide/) integration for [swup](https://swup.js.org/).

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## What is swup?

[Swup](https://swup.js.org/) is a versatile and extensible **page transition library** for multi-page apps.
It manages the complete page load lifecycle and smoothly animates between the current and next page.
In addition, it offers many other quality-of-life improvements like **caching**, **smart preloading**,
native **browser history** and enhanced **accessibility**.

[Learn more about swup](https://swup.js.org/getting-started/) in the official docs.

## Installation

First, install the `@swup/astro` package using your package manager.

```sh
npm install @swup/astro
```

Then, apply the integration to your `astro.config.*` file using the `integrations` property:

```js ins={3} "swup()"
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  integrations: [swup()]
});
```

## Usage

Once the integration is installed, swup will handle and animate page visits.
The necessary script is automatically added on every page of your website. Try navigating between
different pages via links — you should no longer see browser refreshes and find page requests
passing through swup under the Network tab in your browser dev tools.

The next step: fine-tune your setup by reading up on available [configuration](#configuration) flags.

### Content containers

If you're using semantic markup and your main content area is wrapped in a `main` tag, swup will
work without modifications to your site. Should you wish to replace other content containers instead
of or in addition to that, edit the [containers](#configcontainers) options.

### Animations

This integration enables swup's 'fade' theme for animated page transitions out of the box.

### Custom animations

If you want to write your own animation styles, disable the [theme](#configtheme) option. You then
need to add an animation class to your animated elements and write the animation styles in CSS.
See below for an example fade animation.
Refer to the swup docs for a full [example setup](https://swup.js.org/getting-started/example/).

```js
export default defineConfig({
  integrations: [
    swup({ theme: false })
  ]
});
```

```html
<main class="transition-fade">
  <h1>Welcome</h1>
</main>
```

```css
html.is-changing .transition-fade {
  transition: 0.4s;
  opacity: 1;
}
html.is-animating .transition-fade {
  opacity: 0;
}
```

### Native view transitions

For best performance in browsers that support it, you can enable swup's native mode and define animations using the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API).

```js
export default defineConfig({
  integrations: [
    swup({ theme: false, native: true })
  ]
});
```

```css
html.is-changing .transition-fade {
  view-transition-name: main;
}
::view-transition-old(main) {
  animation: fade 0.5s ease-in-out both;
}
::view-transition-new(main) {
  animation: fade 0.5s ease-in-out both reverse;
}
@keyframes fade {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### Usage without animations

If you don't need animated page transitions and just want to use swup for its preloading and caching
features, that's fine too! In that case, disable the [theme](#configtheme) option and pass in a
boolean `false` for the [animationClass](#configanimationclass) option as well.

```js
export default defineConfig({
  integrations: [
    swup({ theme: false, animationClass: false })
  ]
});
```

## Configuration

The integration has its own options for enabling and fine-tuning swup features. Change these in the
`astro.config.*` file which is where your project’s integration settings live. These are the defaults:

```js
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  integrations: [
    swup({
      theme: 'fade',
      animationClass: 'transition-',
      containers: ['main'],
      cache: true,
      preload: true,
      accessibility: true,
      ignore: null,
      forms: false,
      morph: false,
      parallel: false,
      progress: false,
      routes: false,
      smoothScrolling: true,
      updateBodyClass: false,
      updateHead: true,
      reloadScripts: true,
      debug: false,
      loadOnIdle: true,
      globalInstance: false,
    })
  ]
});
```

### config.theme

Use one of swup's predefined themes to get started with animated page transitions.

Set to `false` if you want to define your own animation styles.

```js
{
  theme: 'fade' | 'slide' | 'overlay' | false
}
```

Pass in an array with the theme name and an object to override specific theme options:

```js
{
  theme: ['overlay', { direction: 'to-right' }]
}
```

### config.animationClass

If you're not using one of the provided themes, you will need this class for defining your own
animation styles.

The class prefix for detecting animation timing. Swup will wait for all CSS transitions and
keyframe animations to finish on these elements before swapping in the content of the new page.
The default option will select all elements with class names beginning in `transition-`.

```js
{
  animationClass: 'transition-'
}
```

### config.containers

The content containers to be replaced on page visits. Usually the `<main>` element with the content
of the page, but can include any other elements that are present across all pages.
Defaults to the first `main` tag of the page.

**Note**: Only elements **inside** of the `body` tag are supported.

```js
{
  containers: ['#content', '#nav']
}
```

### config.cache

The built-in cache keeps previously loaded pages in memory. This improves speed but can be disabled
for highly dynamic sites that need up-to-date responses on each request.

```js
{
  cache: false
}
```

### config.preload

Smart preloading, enabled by default. Pass in an object to enable or disable preloading features:

```ts
{
  preload: {
    hover: true,
    visible: false
  }
}
```

#### config.preload.hover

Swup will preload links when they are hovered with a mouse, touched with a finger, or focused using
the keyboard. Enabled by default.

#### config.preload.visible

Preload links as they enter the viewport. Not enabled by default, but recommended for a performance
boost to static sites.

#### Preloading links manually

In addition to preloading links when interacting with them, you can mark links for preloading
manually by applying a `data-swup-preload` attribute on the link, or a `data-swup-preload-all` on a
common parent:

```html
<!-- preload a single link -->
<a href="/about" data-swup-preload>About</a>

<!-- preload all links in a container -->
<nav data-swup-preload-all>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

### config.accessibility

Enhance accessibility for screen readers by announcing page visits and focussing the newly updated
content after page visits.

```js
{
  accessibility: true
}
```

### config.ignore

Tell swup to ignore certain links. This is useful for links that should always trigger a full reload,
like links to an admin panel or links you know will download files. The default is to accept all
links unless they are marked with a `data-no-swup` attribute.

The ignore option accepts either an array of strings/regexps or a function that returns a boolean:

- Regular expressions are matched against the url, e.g. `/\.pdf$/i`
- Strings starting with a slash are matched against the beginning of the url, e.g. `/admin`
- All other strings are used as CSS selectors and match against the clicked element, e.g. `a[download]`
- Functions receive the url as well as the element and event that triggered the visit

```js
{
  ignore: [
    /\.pdf$/i,
    '/admin',
    'a[download]',
  ]
}
```

```js
{
  ignore: (url, { el, event }) => event.shiftKey
}
```

### config.forms

If you want swup to handle form submissions as well, enable this option. Note: swup handles
reasonable scenarios like search or contact forms. For complex requirements like file uploads or
custom serialization, it is recommended to use the swup API directly.

```js
{
  forms: true
}
```

Form submissions trigger normal swup navigations: they will animate and replace the content
containers as on other visits. If you'd rather submit the form inline and only animate and
update the form itself, add a `data-swup-inline-form` attribute and a unique `id` to the form:

```html
<form id="contact-form" class="transition-form" data-swup-inline-form>
```

The animation classes are then only added to the form itself:

```css
.transition-form.is-changing {
  transition: opacity 200ms;
}
.transition-form.is-animating {
  opacity: 0;
}
```

To disable swup for specific forms, add a `data-no-swup` attribute on the form element:

```html
<form action="/" data-no-swup>
```

### config.fragments

In most cases, you'll want to replace the same containers on every page visit. Sometimes, however, you need to replace only a subset of containers, or even different containers on different pages.
To do so, you can define a list of fragment rules that tell swup which containers to replace on which pages.

Fragments are a powerful feature for advanced use cases. Please refer to the [Fragment Plugin documentation](https://swup.js.org/plugins/fragment-plugin/) for details and examples.

```js
{
  fragments: [
    {
      from: '/overview/',
      to: '/detail/:id',
      containers: ['#modal']
    },
    {
      from: '/detail/:id',
      to: '/overview/',
      containers: ['#modal']
    }
  ]
}
```

### config.morph

Morph certain containers into the new page without replacing them entirely. Uses
[morphdom](https://github.com/patrick-steele-idem/morphdom) to only update the attributes,
classnames and text content of elements that have changed, instead of replacing the whole
container. This keeps any existing state such as event handlers and scroll positions.

The prime use cases are headers and menus on multi-language sites: you might not want to swap these
elements out with a transition on each page visit, however you'd still want to update any URLs,
labels or classnames when the user switches between languages, without losing event handlers.

```js
{
  morph: ['#nav', '#sidebar']
}
```

### config.parallel

Swup page transitions usually work in series: hide the current page, update the content, show the
new page. If you  want to combine the leave/enter animations and keep the previous content visible
during the animation, enable this option. Doing so will allow synchronous animations like overlays,
crossfades, or slideshows.

For details on the lifecycle and styling of parallel animations, check out the
readme of swup's [Parallel Plugin](https://github.com/swup/parallel-plugin).

```js
{
  parallel: true
}
```

This will run all animations for all containers in parallel. If you only want to animate certain
containers in parallel, pass an array of container selectors:

```js
{
  containers: ['nav', 'main']
  parallel: ['main']
}
```

### config.progress

Display a progress bar for all requests taking longer than ~300ms.

```js
{
  progress: true
}
```

The progress bar has a class name of `swup-progress-bar` you can use for styling.

```css
.swup-progress-bar {
  height: 4px;
  background-color: blue;
}
```

### config.routes

Use path and route names to allow choosing between animations. Given a list of URL patterns,
uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) to identify named routes and
adds them as classnames to use for styling animations, e.g. `from-route-home` or `to-route-project`.

```js
{
  routes: [
    { name: 'home', path: '/:lang?' },
    { name: 'projects', path: '/:lang/projects' },
    { name: 'project', path: '/:lang/project/:slug' }
  ]
}
```

Navigating from `/en/` to `/en/project/some-project/` will add these classes:

```html
<html class="is-animating from-route-home to-route-project">
```

### config.smoothScrolling

Enable acceleration-based smooth scrolling, animated scroll positions between page visits and for
anchor jump links.

```js
{
  smoothScrolling: true
}
```

### config.updateBodyClass

Update the body class after each page visit. Useful if you use classes on the body element for
styling site sections.

```js
{
  updateBodyClass: true
}
```

### config.updateHead

Update the contents of the `head` tag after each page visit. Useful if you have differing
stylesheets per section of your site.

```js
{
  updateHead: true
}
```

### config.reloadScripts

Re-run any `script` tags inside the `head` and `body` on every page view. Helpful as a last resort
for sites with limited control over the included scripts. Beware: Running scripts without destroying
previous ones can cause memory leaks and potentially break your page.

```js
{
  reloadScripts: true
}
```

### config.debug

Add debug output by swup and its plugins to the browser console. Useful during development.

```js
{
  debug: true
}
```

### config.loadOnIdle

Swup is a progressive enhancement and doesn't need to be loaded immediately. By default, this
integration will only initialize swup when the browser is idle, after the document has finished
loading. This improves first-load performance of the site. If for whatever reason you need to
initialize swup immediately on load, set this option to `false`.

```js
{
  loadOnIdle: true
}
```

### config.globalInstance

Store the initialized swup instance in `window.swup`. Useful if you need to add custom hooks or
plugins.

```js
{
  globalInstance: true
}
```

## Advanced usage

### Access to the swup instance

For more advanced usage like registering hook handlers or installing custom plugins, you need access
to the swup instance itself. Enable the `globalInstance` option to have the swup instance available
at `window.swup`. You can then use swup's API directly.

```js
export default defineConfig({
  integrations: [
    swup({ globalInstance: true })
  ]
});
```

```html
<script>
  window.swup.use(new MyCustomSwupPlugin())
  window.swup.hooks.on('page:view', () => {})
</script>
```

**Note**: The global instance might not be available immediately since swup is loaded when the
browser is idle. In that case, you can listen for the `enable` event on the document.

```html
<script>
  const setup = () => {
    window.swup.use(new MyCustomSwupPlugin())
    window.swup.hooks.on('page:view', () => {})
  }
  if (window.swup) {
    setup()
  } else {
    document.addEventListener('swup:enable', setup)
  }
</script>
```

### Control over the initialization

If you need more granularity during the initilization process itself, consider following
[the manual swup setup](https://swup.js.org/getting-started/installation/) instead. As a minimal
requirement, you should install the head plugin and the scripts plugin so that client-side
components are hydrated correctly.

```html
<!-- Layout.astro or another global file -->
<script>
  import Swup from 'swup';
  import SwupHeadPlugin from '@swup/head-plugin';
  import SwupScriptsPlugin from '@swup/scripts-plugin';
  const swup = new Swup({
    plugins: [
      new SwupHeadPlugin(),
      new SwupScriptsPlugin()
    ]
  });
</script>
```

## Troubleshooting

Having trouble implementing swup? Check out the [official docs](https://swup.js.org), look at
[past issues](https://github.com/swup/swup/issues) or create a
[new discussion](https://github.com/swup/swup/discussions/new).

You can also check the [Astro Integration Documentation](https://docs.astro.build/en/guides/integrations-guide/) for more on integrations.

## Contributing

This package is maintained by the swup core team. You're welcome to submit an issue or PR.

## Changelog

See [Changelog](CHANGELOG.md) for a history of changes to this integration.
