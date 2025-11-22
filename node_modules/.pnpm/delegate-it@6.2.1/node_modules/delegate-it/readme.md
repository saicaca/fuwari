# delegate-it [![][badge-gzip]][link-bundlephobia]

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/delegate-it.svg?label=gzipped
[link-bundlephobia]: https://bundlephobia.com/result?p=delegate-it

> Lightweight event delegation

This is a fork of the popular but abandoned [`delegate`](https://github.com/zenorocha/delegate) with some improvements:

- modern: ES2022, TypeScript, Edge 16+ (it uses `WeakMap` and `Element.closest()`)
- idempotent: identical listeners aren't added multiple times, just like the native `addEventListener`
- debugged ([2d54c11](https://github.com/fregante/delegate-it/commit/2d54c1182aefd3ec9d8250fda76290971f5d7166), [c6bb88c](https://github.com/fregante/delegate-it/commit/c6bb88c2aa8097b25f22993a237cf09c96bcbfb8))
- supports [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)

## Install

```
npm install delegate-it
```

```js
// This module is only offered as a ES Module
import delegate from 'delegate-it';
```

## Usage

### Add event delegation

```js
delegate('.btn', 'click', event => {
	console.log(event.delegateTarget);
});
```

### With listener options

```js
delegate('.btn', 'click', event => {
	console.log(event.delegateTarget);
}, {
	capture: true
});
```

### On a custom base

Use this option if you don't want to have a global listener attached on `html`, it improves performance:

```js
delegate('.btn', 'click', event => {
	console.log(event.delegateTarget);
}, {
	base: document.querySelector('main')
});
```

### Remove event delegation

```js
const controller = new AbortController();
delegate('.btn', 'click', event => {
	console.log(event.delegateTarget);
}, {
	signal: controller.signal,
});

controller.abort();
```

### Listen to one event only

```js
delegate('.btn', 'click', event => {
	console.log('This will only be called once');
}, {
	once: true
});
```

### Listen to one event only, with a promise

```js
import {oneEvent} from 'delegate-it';

await oneEvent('.btn', 'click');
console.log('The body was clicked');
```

## TypeScript

If you're using TypeScript and have event types that are custom, you can override the global `GlobalEventHandlersEventMap` interface via declaration merging. e.g. say you have a `types/globals.d.ts` file, you can add the following.

```js
interface GlobalEventHandlersEventMap {
	'details:toggle': UIEvent;
}
```

In the file that imports `EventType`, you will now be able to set the event type to `'details:toggled'`.

```js
import {EventType} from 'delegate-it';

const someEventType1: EventType = 'details:toggled'; // all good
const someEventType2: EventType = 'click'; // all good
const someEventType3: EventType = 'some-invalid-event-type'; // no good
```

## Related

- [select-dom](https://github.com/fregante/select-dom) - Lightweight `querySelector`/`All` wrapper that outputs an Array.
- [doma](https://github.com/fregante/doma) - Parse an HTML string into `DocumentFragment` or one `Element`, in a few bytes.
- [Refined GitHub](https://github.com/sindresorhus/refined-github) - Uses this module.
