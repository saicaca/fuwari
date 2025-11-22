# Swup Forms Plugin

A [swup](https://swup.js.org) plugin for submitting forms.

- Serialize and submit forms with animated page transitions
- Opt-in with a configurable selector, by default `form[data-swup-form]`
- Respects custom animations set on the form element

**Note:** This plugin is meant for simple scenarios like search or
contact forms. For complex requirements like custom
serialization, it is recommended to use the swup API directly.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/forms-plugin
```

```js
import SwupFormsPlugin from '@swup/forms-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/forms-plugin@3"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupFormsPlugin()]
});
```

## Server response

Action, method and encoding type attributes set on the form are respected.

The server response must be a valid page with all containers to be replaced by swup.

## Custom animations

The plugin respects custom animations set on the form using the `data-swup-animation` attribute:

```html
<!-- Animate with an 'overlay' custom animation -->
<form action="/" data-swup-form data-swup-animation="overlay"></form>
```

## Inline Forms

If you give a form an additional attribute `[data-swup-inline-form]`, swup will:

- update only that form when being submitted, ignoring the default `containers`.
- scroll back to the beginning of the form
- scope animations to the form itself

> **Note** If you mark a form as an inline form, the form **must have an `id` attribute**

### Example

**HTML**

```html
<form id="form-1" class="transition-form" data-swup-form data-swup-inline-form method="POST">
  <input name="test"></input> <input type="submit"></input>
</form>
```

**CSS**

```css
.transition-form.is-changing {
  transition: opacity 200ms;
}
.transition-form.is-animating {
  opacity: 0;
}
```

## Options

### `formSelector`

Type: `String`, Default: `form[data-swup-form]`

Customize the selector for forms which should be handled by swup.

### `inlineFormSelector`

Type: `String`, Default: `form[data-swup-inline-form]`

Customize the selector for [inline forms](#inline-forms)

### `stripEmptyParams`

Type: `Boolean`, Default: `false`

Strip empty parameters from forms with `action="GET"` before submitting.

- Before: `?foo=&bar=baz&bat=`
- After: `?bar=baz`

## Hooks

The plugin adds two new hooks to swup.

### `form:submit`

Triggered when a form is submitted.

```js
swup.hooks.on('form:submit', (visit, { el, event }) => {
  console.log(el);
});
```

### `form:submit:newtab`

Triggered when a form is submitted to a new tab or window. This will happen if the user
has pressed either the `Command` (Mac), `Control` (Windows) or `Shift` key while submitting
the form. The plugin normalizes that behavior across browsers.
