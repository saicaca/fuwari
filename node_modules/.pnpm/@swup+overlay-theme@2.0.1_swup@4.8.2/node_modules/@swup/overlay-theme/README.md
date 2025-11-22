# Swup Overlay Theme

A [swup](https://swup.js.org) theme for showing an overlay during animations.

Makes an overlay slide on top of the page until the new page is shown.

## Installation

Install the theme from npm and import it into your bundle.

```bash
npm install @swup/overlay-theme
```

```js
import SwupOverlayTheme from '@swup/overlay-theme';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/overlay-theme@2"></script>
```

## Usage

To run this theme, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupOverlayTheme()]
});
```

## Options

### direction

Changes the direction of the overlay animation.
Defaults to `to-right`. Available values: `to-right`, `to-left`, `to-bottom` and `to-top`.

### Default options

```javascript
new SwupOverlayTheme({
  direction: 'to-right'
});
```

## Customization

You can override the plugin's custom properties to fine-tweak the animation.
These are the defaults:

```css
body {
  --swup-overlay-theme-color: #2D2E82;
  --swup-overlay-theme-duration: .6s;
  --swup-overlay-theme-delay: .2s;
  --swup-overlay-theme-scale: 1.2;
  --swup-overlay-theme-skew: 5deg;
}
```

To style the overlay directly, use the class name `.swup-transition-overlay`:

```css
.swup-transition-overlay {
  background: linear-gradient(45deg, rgb(131,58,180), rgb(253,29,29), rgb(252,176,69));
}
```
