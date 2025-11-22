# focus-options-polyfill

[![npm version](http://img.shields.io/npm/v/focus-options-polyfill.svg?label=npm%20package&style=flat-square&logo=npm&logoWidth=20)](https://npmjs.com/package/focus-options-polyfill "View this project on npm")

JavaScript polyfill for `focusOptions`, an optional property passed to `HTMLElement.focus()` that contains the `preventScroll` boolean, which controls whether the browser should prevent a focused element from being scrolled into view.


## Current support

https://caniuse.com/#feat=mdn-api_htmlelement_focus_preventscroll_option


## Docs

* WHATWG Spec

  https://html.spec.whatwg.org/multipage/interaction.html#dom-focusoptions-preventscroll

* MDN Web Docs - focus

  https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus


## Intents to implement

* Chrome/Chromium: Chrome Platform Status issue 734166 - Prevent scrolling in HTMLElement.focus()

  https://www.chromestatus.com/feature/5745122025144320

* Edge: Issue 14314565 - Enable ability to prevent scrolling in Element.focus()

  https://web.archive.org/web/20190401133643/https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14314565/

* Firefox: Bug 1374045 - Consider adding support for customizing scrolling behavior with Element.focus

  https://bugzilla.mozilla.org/show_bug.cgi?id=1374045

* Safari: WebKit Bug 178583 - Enable ability to prevent scrolling in Element.focus()

  https://bugs.webkit.org/show_bug.cgi?id=178583


## document.scrollingElement

This polyfill uses a basic fallback for the [document.scrollingElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/scrollingElement) property, using `document.documentElement` when not found.

This could suffice in basic cases, but if you need wider and/or specific support you should refer to a polyfill for it:

* https://github.com/mathiasbynens/document.scrollingElement

Also, to overcome its absence if you are executing this polyfill through [`jsdom`](https://github.com/jsdom/jsdom), you could place this in your setup:

```js
document.scrollingElement = document.documentElement
```

More context about this property can be found in:

* https://developer.mozilla.org/en-US/docs/Web/API/Document/scrollingElement
* https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode
* https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement


## Dev and testing

To check this polyfill you can do:

```bash
npm run dev
```

to launch a small page that will check browser/polyfill behaviour.
