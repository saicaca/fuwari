# Swup Scroll plugin

A [swup](https://swup.js.org) plugin for customizable smooth scrolling.

- Enables acceleration-based smooth scrolling
- Animates scroll position between page visits
- Animates scrolling to anchors
- Define a custom offset for scroll positions
- Emulate scroll target selector

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/scroll-plugin
```

```js
import SwupScrollPlugin from '@swup/scroll-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/scroll-plugin@3"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupScrollPlugin()]
});
```

## Behavior

Scroll Plugin works out of the box for sites where the `window` is the main scroll container,
scrolling back up on page visits and restoring the previous position on browser history visits.

### Scroll containers

If your site has other scroll containers than the `window`, like overflowing divs, the plugin will
happily restore their scroll positions as long as you let it know about those containers. You can
either add the attribute `[data-swup-scroll-container]` to them or use the
[scrollContainers](#scrollcontainers) option to configure a custom selector.

### Reset vs. restore

On each page navigation, the plugin will **reset** the scroll position to the top just like the
browser would. On backword/forward history visits, it will **restore** the previous scroll position
that was saved right before leaving the page.

You can customize when to reset vs. restore while clicking a link using the
[shouldResetScrollPosition](#shouldresetscrollposition) option. A common use case would be a
custom back button: clicking it would normally reset the scoll position to the top while users would expect it
to restore the previous scroll position on the page the link points towards.

## Options

### doScrollingRightAway

`doScrollingRightAway` defines if swup is supposed to wait for the replace of the page to scroll to the top.

### animateScroll

`animateScroll` defines whether the scroll animation is enabled or swup simply sets the scroll
without animation instead. Passing `true` or `false` will enable or disable all scroll animations.
For finer control, you can pass an object:

```javascript
{
  animateScroll: {
    betweenPages: true,
    samePageWithHash: true,
    samePage: true
  }
}
```

💡 We encourage you to respect user preferences when setting the `animateScroll` option:

```javascript
// Using a simple boolean...
{
  animateScroll: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
// ...or this little monster, with full control over everything:
{
  animateScroll: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {
    betweenPages: true,
    samePageWithHash: true,
    samePage: true
  }
}
```

### scrollFriction and scrollAcceleration

The animation behavior of the scroll animation can be adjusted by setting `scrollFriction` and `scrollAcceleration`.

### getAnchorElement

Customize how the scroll target is found on the page. Defaults to standard browser behavior (`#id` first, `a[name]` second).

```javascript
{
  // Use a custom data attribute instead of id
  getAnchorElement: (hash) => {
    hash = hash.replace('#', '')
    return document.querySelector(`[data-scroll-target="${hash}"]`)
  }
}
```

### markScrollTarget

Due to [certain limitations](https://github.com/whatwg/html/issues/639) of the History API,
the [`:target` CSS pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:target) stops
working on sites that push their own history entries, which includes any site using swup. Enabling
this option provides an alternative way of styling the current target element.

Navigating to the URL `/index.html#section2` will make the following element the target element:

```html
<section id="section2">Example</section>
```

To highlight the current target element, use the `data-swup-scroll-target` attribute for styling:

```css
[data-swup-scroll-target] {
  outline: 5px auto blue;
}
```

### Offset

Offset to substract from the final scroll position, to account for fixed headers. Can be either a number or a function that returns the offset.

```javascript
{
  // Number: fixed offset in px
  offset: 30,

  // Function: calculate offset before scrolling
  offset: () => document.querySelector('#header').offsetHeight,

  // The scroll target element is passed into the function
  offset: target => target.offsetHeight * 2,
}
```

### scrollContainers

Customize the selector string used for finding scroll containers other than the `window`. See the
[Scroll Containers](#scroll-containers) section for an explanation of how the plugin deals with
overflowing containers.

```js
{
  // Always restore the scroll position of overflowing tables and sidebars
  scrollContainers: '.overflowing-table, .overflowing-sidebar'
}
```

### shouldResetScrollPosition

Callback function that allows customizing the behavior when a link is clicked. Instead of scrolling
back up on page visits, returning `false` here will instead restore the previous scroll position
recorded for that page. See [Reset vs. restore](#reset-vs-restore) for an explanation and use cases.

```js
{
  // Don't scroll back up for custom back-links, mimicking the browser back button
  shouldResetScrollPosition: (link) => !link.matches('.backlink')
}
```

### Default options

```javascript
new SwupScrollPlugin({
  doScrollingRightAway: false,
  animateScroll: {
    betweenPages: true,
    samePageWithHash: true,
    samePage: true
  },
  scrollFriction: 0.3,
  scrollAcceleration: 0.04,
  getAnchorElement: null,
  markScrollTarget: false,
  offset: 0,
  scrollContainers: `[data-swup-scroll-container]`,
  shouldResetScrollPosition: (link) => true
});
```

## Methods on the swup instance

Scroll Plugin adds the method `scrollTo` to the swup instance, which can be used for custom scrolling.
The method accepts a scroll position in pixels and a boolean whether the scroll position should be animated:

```js
// will animate the scroll position of the window to 2000px
swup.scrollTo(2000, true);
```

## Hooks

The plugin adds two new hooks `scroll:start` and `scroll:end` :

```js
swup.hooks.on('scroll:start', () => console.log('Swup started scrolling'));
swup.hooks.on('scroll:end', () => console.log('Swup finished scrolling'));
```

## Overwriting `swup.scrollTo`

You can overwrite the scroll function with your own implementation. This way, you can gain full control over how you animate your scroll positions. Here's an example using [GSAP's](https://greensock.com/docs/v3/) [ScrollToPlugin](https://greensock.com/docs/v3/Plugins/ScrollToPlugin):

```js

import Swup from 'swup';
import SwupScrollPlugin from '@swup/scroll-plugin';

import { gsap } from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);

const swup = new Swup({
	plugins: [new SwupScrollPlugin()]
});

/**
 * Overwrite swup's scrollTo function
 */
swup.scrollTo = (offsetY, animate = true) => {
	if (!animate) {
		swup.hooks.callSync('scroll:start', undefined);
		window.scrollTo(0, offsetY);
		swup.hooks.callSync('scroll:end', undefined);
		return;
	}

	/**
	 * Use GSAP ScrollToPlugin for animated scrolling
	 * @see https://greensock.com/docs/v3/Plugins/ScrollToPlugin
	 */
	gsap.to(window, {
		duration: 0.8,
		scrollTo: offsetY,
		ease: 'power4.inOut',
		autoKill: true,
		onStart: () => {
			swup.hooks.callSync('scroll:start', undefined);
		},
		onComplete: () => {
			swup.hooks.callSync('scroll:end', undefined);
		},
		onAutoKill: () => {
			swup.hooks.callSync('scroll:end', undefined);
		},
	});

};

```