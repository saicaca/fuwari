# Swup Parallel Plugin

A [swup](https://swup.js.org) plugin for animating the previous and next page in parallel.

- Combines swup's leave/enter animations into a single animation
- Keeps the previous page visible while the next page is entering
- Allows synchronous animations like overlays, crossfades, or slideshows

## Demos

To see parallel animations in action, check out the official demos:

- [slideshow animation](https://swup-demo-slideshow.swupjs.repl.co)
- [reveal animation](https://swup-demo-reveal.swupjs.repl.co)

<div data-video data-screencast>

https://github.com/swup/parallel-plugin/assets/22225348/aff0a235-d9aa-472b-9967-1e9fa0e67313

</div>

Feel free to explore more examples on the [Swup Demos](https://swup.js.org/getting-started/demos/) page of the docs.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/parallel-plugin
```

```js
import SwupParallelPlugin from '@swup/parallel-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/parallel-plugin@0"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupParallelPlugin()]
});
```

## Scenario

When transitioning pages, swup will hide the previous page before replacing the content and showing
the next page. This is fine in most cases, and great for performance and accessibility. However,
some layouts **require the previous page to be visible for the duration of the page transition**: think
crossfades, overlays, slideshows, 3D effects, etc. For these to be convincing, the old and new
containers must be **animated at the same time**.

## Lifecycle

**Swup default animations**

- Animate out: hide the previous content
- Replace the content entirely
- Animate in: show the next content
- Previous and next content are never in the DOM at the same time

**Parallel Plugin animations**

- Skip the out-phase of the animation
- Add the next content to the DOM
- Animate in and out: show the next content while hiding the previous content
- Previous and next content are DOM siblings during the animation

## Markup

In this example, we want to slide in the new `main` element while sliding out the previous `main`
element. The markup for parallel animations isn't any different from normal animations: a simple
section with a content area.

```html
<section>
  <header>
    My Website
  </header>
  <main id="swup" class="transition-slide">
    <h1>Welcome</h1>
  </main>
</section>
```

### State during the animation

During the animation, both containers will be in the DOM at the same time.
Swup has inserted the next container, will wait for any animations to finish, and
then remove the previous container.

Note: for accessibility reasons, the next container is always inserted **before** the previous one
and the previous one is marked as hidden from screen readers by setting `aria-hidden="true"`.

```html
<section>
  <header>
    My Website
  </header>
  <!-- Next container -->
  <main id="swup" class="transition-slide is-next-container">
    <h1>Next page</h1>
  </main>
    <!-- Previous container -->
  <main id="swup" class="transition-slide is-previous-container" aria-hidden="true">
    <h1>Previous page</h1>
  </main>
</section>
```

## Styling

### Basic styling for parallel animations

Showing both the previous and current container during a page transition requires slightly more
complex styling than usual. The containers need to be layered on top of each other while they're
both in the DOM.

The details depend on the specific layout, however the easiest way in most cases
is a CSS `grid` with both containers claiming the same row and column.
This type of layout avoids messy absolute positioning and scroll offsets.

```css
/* Layout */

section {
  display: grid;
  overflow: hidden;
  grid-template-areas: "header"
                        "main";
}

section > header {
  grid-area: header;
}

section > main {
  grid-area: main;
}
```

### Defining the animations

Instead of using swup's default classes for timing the animation, parallel animations can be
controlled using two custom classes applied by this plugin on the containers themselves:

The class `is-previous-container` defines the **final state** of the previous container, e.g.
already out of view or transparent. It is added directly after the element is added to the DOM to
begin the animation.

The class `is-next-container` defines the **initial state** of the next container about to enter the
page, e.g. still out of view or transparent. It is added before the element is inserted into the
DOM and removed directly after insertion to begin the animation. As it's only applied for a split
second, it won't be visible when inspecting the element in the browser dev tools.

```css
/* Parallel animation timing */
.is-changing .transition-slide {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

/* Style of previous container after leaving */
.transition-slide.is-previous-container {
  transform: translateX(-100%);
  opacity: 0;
}

/* Style of next container before entering */
.transition-slide.is-next-container {
  transform: translateX(100%);
  opacity: 0;
}
```

## Timing

Technically, the plugin will **skip the out-animation**, add the next container, wait for animations to
finish, then remove the previous container. **All animations now happen in the in-phase** of the
lifecycle, after the `content:replace` hook that normally marks the middle of the animation
process. Any containers that are not animated or not animated in parallel (e.g. a static header)
will be replaced at the start of the parallel animation.

This also applies when using the [JS plugin](https://swup.js.org/plugins/js-plugin/): the
out-animation is skipped entirely and only the in-animation is executed. You'll need to perform
both animations in the `in` handler.

## Keeping the previous container

The previous container is removed from the DOM after the animation finishes. If you need to keep one
or more copies of it around after the animation, you can set the [keep](#keep) option and adjust
your styling.

> **Warning**
> Keep in mind the accessibility concerns of having duplicate content on the page. While
> this plugin marks containers as `aria-hidden="true"`, the duplicate content can still be clicked
> and focussed. Marking previous containers as
> [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) is a possible
> solution but not applicable to all use cases. Turning a `main` container into a simple `div` would
> be helpful as well, however it's impossible to do without a complete re-render of the element.

```js
new SwupParallelPlugin({ keep: 1 })
```

Previous containers that will be kept are marked with a class name of `.is-kept-container`. Those
about to be removed are marked with `.is-removing-container`.

```html
<section>
  <main id="swup" class="transition-slide is-next-container"></main>
  <main id="swup" class="transition-slide is-previous-container is-kept-container" aria-hidden="true"></main>
  <main id="swup" class="transition-slide is-previous-container is-kept-container is-removing-container" aria-hidden="true"></main>
</section>
```

Use the classes `is-removing-container` to style the transition of a container to be removed.

```css
.is-changing .transition-slide {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.transition-slide.is-next-container {
  transform: translateX(100%);
  opacity: 0;
}

.transition-slide.is-kept-container {
  transform: translateX(-100%);
}

.transition-slide.is-removing-container {
  transform: translateX(-200%);
  opacity: 0;
}
```

## Options

### containers

By default, all content containers are animated in parallel. If you only want to perform parallel
animations for specific containers and replace other containers normally, specify the parallel
containers here.

```js
{
  containers: ['main']
}
```

### keep

The number of previous containers to keep around **after** the animation finishes. Useful for layouts
like slideshows, stacks, etc. Default: `0`.

```js
{
  keep: 1
}
```

Pass an object indexed by selector to keep around the previous version of certain containers only:

```js
{
  containers: ['main', 'footer'],
  keep: { 'main': 1 }
}
```

## API

### Opting out of parallel animations

The plugin will set a flag on the visit object, indicating the current visit
as a parallel animation: `visit.animation.parallel`. You can unset this flag
to fall back to a normal animation with leave and enter in series.

```js
// Disable parallel animations for this visit
swup.hooks.on('visit:start', (visit) => {
  if (someCondition) {
    visit.animation.parallel = false;
  }
});
```

## Hooks

The plugin adds two new hooks to swup. Both hooks receive a `ContainerSet` instance as their
only argument:

```ts
type ContainerSet = {
  /** Selector to match this container */
  selector: string;
  /** Incoming container element */
  next: HTMLElement;
  /** Outgoing container element */
  previous: HTMLElement;
  /** Container elements to keep around after the animation */
  keep: HTMLElement[];
  /** Container elements to remove after the animation */
  remove: HTMLElement[];
};
```

### `content:insert`

Triggered when the new content containers are inserted. Hook before this to manipulate the
elements before they are inserted into the DOM.

```js
swup.hooks.before('content:insert', (visit, { containers }) => {
  for (const { next } of containers) {
    console.log('About to insert container', next);
  }
});
```

### `content:remove`

Triggered when the previous containers are removed, after the animation has finished.

```js
swup.hooks.before('content:remove', (visit, { containers }) => {
  for (const { remove } of containers) {
    console.log('About to remove containers', remove);
  }
});
```
