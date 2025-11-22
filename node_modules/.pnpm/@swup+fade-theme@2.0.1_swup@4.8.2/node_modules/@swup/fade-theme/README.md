# Swup Fade Theme

A [swup](https://swup.js.org) theme for fade animations.

Makes the content fade out when leaving, and fade in when entering.

## Installation

Install the theme from npm and import it into your bundle.

```bash
npm install @swup/fade-theme
```

```js
import SwupFadeTheme from '@swup/fade-theme';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/fade-theme@2"></script>
```

## Usage

To run this theme, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupFadeTheme()]
});
```

## Options

### mainElement

Changes the selector of the elements to fade in/out. Defaults to `#swup`.

## Customization

You can override the plugin's custom properties to fine-tweak the animation.
These are the defaults:

```css
body {
  --swup-fade-theme-duration: .4s;
}
```
