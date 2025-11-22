# Swup Fragment Plugin

<div class="shields">

<!--[![npm version](https://img.shields.io/npm/v/@swup/fragment-plugin.svg)](https://www.npmjs.com/package/@swup/fragment-plugin) -->

[![Unit Tests](https://img.shields.io/github/actions/workflow/status/swup/fragment-plugin/unit-tests.yml?branch=main&label=vitest)](https://github.com/swup/fragment-plugin/actions/workflows/unit-tests.yml)
[![E2E Tests](https://img.shields.io/github/actions/workflow/status/swup/fragment-plugin/e2e-tests.yml?branch=main&label=playwright)](https://github.com/swup/fragment-plugin/actions/workflows/e2e-tests.yml)
[![License](https://img.shields.io/github/license/swup/fragment-plugin.svg)](https://github.com/swup/fragment-plugin/blob/main/LICENSE)

</div>

A [swup](https://swup.js.org) plugin for dynamically replacing containers based on rules 🧩

- Selectively replace containers instead of the main swup containers, based on custom rules
- Improve orientation by animating only the parts of the page that have actually changed
- Give your site the polish and snappiness of a single-page app

## Use cases

All of the following scenarios require updating only a small content fragment instead of
performing a full page transition:

- a filter UI that live-updates its list of results on every interaction
- a detail overlay that shows on top of the currently open content
- a tab group that should update only itself when selecting one of the tabs

If you are looking for selectively replacing forms on submission, you should have a look at
[Forms Plugin](https://swup.js.org/plugins/forms-plugin/#inline-forms).

## Demo

See the plugin in action in [this interactive demo](https://swup-fragment-plugin.netlify.app)

<div data-video data-screencast>

https://github.com/swup/fragment-plugin/assets/869813/ecaf15d7-ec72-43e8-898a-64f61330c6f5

</div>

## Table of contents

- [Installation](#installation)
- [How it works](#how-it-works)
- [Example](#example)
- [Options](#options)
- [How rules are matched](#how-rules-are-matched)
- [How fragment containers are found](#how-fragment-containers-are-found)
- [Advanced use cases](#advanced-use-cases)
- [Skip animations using `<template>`](#skip-animations-using-template)
- [API Methods](#api-methods)

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/fragment-plugin
```

```js
import SwupFragmentPlugin from '@swup/fragment-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/fragment-plugin@1"></script>
```

## How it works

When a visit is determined to be a fragment visit, the plugin will:

- **update only** the contents of the elements matching the rule's `containers`
- **not update** the default [containers](https://swup.js.org/options/#containers) replaced on all other visits
- **wait** for CSS transitions on those fragment elements using [scoped animations](https://swup.js.org/options/#animation-scope)
- **preserve** the current scroll position upon navigation
- add a `to-[name]` class to the elements if the current `rule` has a `name` key
- **ignore** elements that already match the current visit's URL

## Example

### Content filter: only update a list of results

Imagine a website with a `/users/` page that displays a list of users. Above the user list, there
is a filter UI to choose which users to display. Selecting a filter will trigger a visit
to the narrowed-down user list at `/users/filter/x/`. The only part that has changed is the
list of users, so that's what we'd like to replace and animate instead of the whole content
container.

```html
<body>
  <header>Website</header>
  <main id="swup" class="transition-main" class="transition-main">
    <h1>Users</h1>
    <!-- A list of filters for the users: selecting one will update the list below -->
    <ul>
      <a href="/users/filter/1/">Filter 1</a>
      <a href="/users/filter/2/">Filter 2</a>
      <a href="/users/filter/3/">Filter 2</a>
    </ul>
    <!-- The list of users, filtered by the criteria above -->
    <ul id="users">
      <li><a href="/user/1/">User 1</a></li>
      <li><a href="/user/2/">User 2</a></li>
      <li><a href="/user/3/">User 3</a></li>
    </ul>
  </main>
</body>
```

Using Fragment Plugin, we can update **only** the `#users` list when clicking one of the filters.
The plugin expects an array of rules to recognize and handle fragment visits:

```js
const swup = new Swup({
  plugins: [
    new SwupFragmentPlugin({
      rules: [
        {
          from: '/users/:filter?',
          to: '/users/:filter?',
          containers: ['#users']
        }
      ]
    })
  ]
});
```

Now we can add custom animations for our fragment rule:

```css
/*
* The default animation, for visits without matching fragment rules
*/
html.is-changing .transition-main {
  transition: opacity 250ms;
  opacity: 1;
}
html.is-animating .transition-main {
  opacity: 0;
}

/*
* The animation when filtering users
*/
#users.is-changing {
  transition: opacity 250ms;
}
#users.is-animating {
  opacity: 0;
}
```

## Options

```ts
/** A path to match URLs against */
type Path = string | RegExp | Array<string | RegExp>;

/** A fragment rule */
export type Rule = {
  from: Path;
  to: Path;
  containers: string[];
  name?: string;
  scroll?: boolean | string;
  focus?: boolean | string;
  if?: Predicate;
};

/** The plugin options */
export type Options = {
  rules: Rule[];
  debug?: boolean;
};
```

### `rules`

The rules that define whether a visit will be considered a fragment visit. Each rule consists of
mandatory `from` and `to` URL paths, an array of selectors `containers`, as well as an optional
`name` of this rule to allow scoped styling.

The rule's `from`/`to` paths are converted to a regular expression by [path-to-regexp](https://github.com/pillarjs/path-to-regexp) and matched against the current browser URL. If you want to create an either/or path, you can also provide an array of paths, for example:

```js
{
  rules: [
    {
      from: ['/users', '/users/:filter?'],
      to: ['/users', '/users/:filter?'],
      containers: ['#user-list']
    }
  ];
}
```

#### `rule.from`

Required, Type: `string | string[]` – The path(s) to match against the previous URL

#### `rule.to`

Required, Type: `string | string[]` – The path(s) to match against the next URL

#### `rule.containers`

Required, Type: `string[]` – Selectors of containers to be replaced if the visit matches.

**Notes**

- **only IDs and no nested selectors are allowed**. `#my-element` is valid, while
  `.my-element` or `#wrap #child` both will throw an error.
- if **any** of the selectors in `containers` doesn't return a match in the current document, the rule will be skipped.
- Fragment elements **must either match a swup container or be a descendant of one of them**

#### `rule.name`

Optional, Type: `string` – A name for this rule to allow scoped styling, ideally in `kebab-case`

#### `rule.scroll`

Optional, Type: `boolean | string` – By default, scrolling will be disabled for fragment visits.
Using this option, you can re-enable it for selected visits:

- `true` will scroll to the top
- `'#my-element'` will scroll to the first element matching the selector

#### `rule.focus`

Optional, Type: `boolean | string` – If you have [Accessibility Plugin](https://github.com/swup/a11y-plugin/) installed, you can adjust which element to focus for the visit [as described here](https://github.com/swup/a11y-plugin/#visita11yfocus).

#### `rule.if`

Optional, Type: `(visit) => boolean` – A predicate function that allows for fine-grained control over the matching behavior of a rule. The function receives the current [visit](https://swup.js.org/visit/) as a parameter. If the function returns `false`, the related rule is being skipped for the current visit, even if it matches the current route.

### `debug`

Optional, Type: `boolean`, Default `false`. Set to `true` for debug information in the console.

```js
{
  debug: true;
}
```

> [!IMPORTANT] to keep the bundle size small, UMD builds are stripped from all debug messages, so `debug` won't have an effect there.

## How rules are matched

- The first matching rule in your `rules` array will be used for the current visit
- If no rule matches the current visit, the default content containers defined in swup's options will be replaced

## How fragment containers are found

- The `containers` of the matching rule **need to be shared between the current and the incoming document**
- For each selector in the `containers` array, the **first** matching element in the DOM will be selected
- If a visit isn't be considered a reload of the current page, fragment elements that already match the new URL will be ignored

## Advanced use cases

Creating the rules for your fragment visits should be enough to enable dynamic updates on most
sites. However, there are some advanced use cases that require adding certain attributes to the
fragment elements themselves or to links on the page. These tend to be situations where **modal dialogs** are involved and swup doesn't know which page the modal was opened from.

### Fragment URL

Use the `data-swup-fragment-url` attribute to uniquely identify fragment elements.

In scenarios where a modal is rendered on top of other content, leaving or closing the modal to
the same URL it was opened from should ideally not update the content behind it as
nothing has changed. Fragment plugin will normally do that by keeping track of URLs. However,
when swup was initialized on a subpage with an already-visible modal, the plugin doesn't know which URL the content behind it corresponds to. Hence, we need to tell swup manually so it can persist content when closing the modal.

```diff
<!-- the modal -->
<dialog open id="modal">
  <main>
    <h1>User 1</h1>
    <p>Lorem ipsum dolor sit amet...</p>
  </main>
</dialog>
<!-- the content behind the modal -->
<main>
  <section
    id="list"
+   data-swup-fragment-url="/users/"
    >
    <ul>
      <li>User 1</li>
      <li>User 2</li>
      <li>User 3</li>
    </ul>
  </section>
</main>
```

### Link to another fragment

Use the `data-swup-link-to-fragment` attribute to automatically update links pointing to a fragment.

Consider again an overlay rendered on top of other content. To implement a close button for that
overlay, we could ideally point a link at the URL of the content where the overlay is closed. The
fragment plugin will then handle the animation and replacing of the overlay. However, knowing
where to point that link requires knowing where the current overlay was opened from.

`data-swup-link-to-fragment` automates that by keeping the `href` attribute of a link in sync with the currently
tracked URL of the fragment matching the selector provided by the attribute. The code below will make sure the close button will always point at the last known URL of the `#list` fragment to allow seamlessly closing the overlay:

```diff
<dialog open id="modal">
  <main>
    <!-- `href` will be synced to the fragment URL of #list at runtime: -->
+   <a href="" data-swup-link-to-fragment="#list">Close</a>
    <h1>User 1</h1>
    <p>Lorem ipsum dolor sit amet...</p>
  </main>
</dialog>
<main>
  <section id="list"
    data-swup-fragment-url="/users/">
    <ul>
      <li>User 1</li>
      <li>User 2</li>
      <li>User 3</li>
    </ul>
  </section>
</main>
```

> [!TIP]
> To keep your markup semantic and accessible, we recommend you **always provide a default value**
> for the link's `href` attribute, even though it will be updated automatically at runtime:

```diff
<a
+ href="/users/"
  data-swup-link-to-fragment="#list">Close</a>
```

## Skip animations using `<template>`

If all elements of a visit are `<template>` elements, the `out`/`in`-animation will automatically be skipped. This can come in handy for modals:

```js
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
```

```html
<!-- /overview/: provide a <template> as a placeholder for the modal -->
<template id="modal"></template>
<main>
  <ul>
    <!-- list of items that will open in the #modal -->
  </ul>
</main>
```

```html
<!-- /detail/1 -->
<dialog open id="modal">
  <main>
    <h1>Detail 1</h1>
  </main>
</dialog>
<main>
  <ul>
    <!-- list of items that will open in the #modal -->
  </ul>
</main>
```

> [!TIP]
> Fragment Plugin will detect `<dialog open>`-fragment elements automatically on every page view and
> move them to the [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer)
> automatically. This has the benefit of simplified accesssiblity handling and styling.

## API methods

Fragment plugin provides a few API functions for advanced use cases. To be able to access those, you'll need to keep a reference to the plugin during instanciation:

```js
const fragmentPlugin = new SwupFragmentPlugin({ rules });
const swup = new Swup({ plugins: [fragmentPlugin] });
/** You can now call the plugin's public API, for example: */
fragmentPlugin.getFragmentVisit(route);
```

### `getFragmentVisit(route)`

Get information about the fragment visit for a given route. Returns either `FragmentVisit` or `undefined`.

```js
/**
 * Get information about which containers will
 * be replaced when hovering over links:
 */
document.querySelectorAll('a[href]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    const fragmentVisit = fragmentPlugin.getFragmentVisit({
      from: window.location.href, // the current URL
      to: el.href // the URL of the link
    });
    console.log(`will replace ${fragmentVisit?.containers || swup.options.containers}`);
  });
});
```

### `prependRule(rule)`

Prepends a [rule](#type-signature-rule) to the array of rules.

```js
fragmentPlugin.prependRule({ from: '/foo/', to: '/bar/', containers: ['#foobar'] });
```

### `appendRule(rule)`

Appends a [rule](#type-signature-rule) to the array of rules.

```js
fragmentPlugin.prependRule({ from: '/baz/', to: '/bat/', containers: ['#bazbat'] });
```

### `getRules()`

Get a **clone** of all registered fragment rules

```js
console.log(fragmentPlugin.getRules());
```

### `setRules(rules)`

Overwrite all fragment rules with the provided rules. This methods provides the lowest-level access to the rules. For example, you could use it to remove all rules with the name `foobar`:

```js
fragmentPlugin.setRules(fragmentPlugin.getRules().filter((rule) => rule.name !== 'foobar'));
```
