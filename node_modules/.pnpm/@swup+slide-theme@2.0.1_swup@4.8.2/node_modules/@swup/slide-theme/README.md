# Swup Slide Theme

A [swup](https://swup.js.org) theme for in/out slide animations.

Makes the content slide out to one direction, and slide in from the other.

## Installation

Install the theme from npm and import it into your bundle.

```bash
npm install @swup/slide-theme
```

```js
import SwupSlideTheme from '@swup/slide-theme';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/slide-theme@2"></script>
```

## Usage

To run this theme, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupSlideTheme()]
});
```

## Options

### mainElement

Changes the selector of the elements to slide in/out. Defaults to `#swup`.

### reversed

Reverses the transition direction. Defaults to `false`.

## Customization

You can override the plugin's custom properties to fine-tweak the animation.
These are the defaults:

```css
body {
  --swup-slide-theme-translate: 60px;
  --swup-slide-theme-duration-fade: .3s;
  --swup-slide-theme-duration-slide: .4s;
}
```
