# Swup A11y Plugin

A [swup](https://swup.js.org) plugin for enhanced accessibility.

Loading new content via AJAX is a great experience for most users, but comes with serious
shortcomings for screen reader users. This plugin will improve that:

- **Announce page visits** to screenreaders by reading the new page title
- **Restore focus** after swapping out the content
- **Skip animations** for users with a preference for reduced motion

Accessibility can be hard to get right. That's why we're keen to hear your feedback. Share your
experience and suggest improvements by [opening an issue](https://github.com/swup/a11y-plugin/issues/new/choose)
on this repo. Let's make swup better together!

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/a11y-plugin
```

```js
import SwupA11yPlugin from '@swup/a11y-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/a11y-plugin@5"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupA11yPlugin()]
});
```

## Markup

The plugin should work out of the box if you use proper semantic markup for your content, i.e. a
descriptive `h1` for each page heading. See the options below for customizing what tags to look for.

<!-- prettier-ignore -->
```html
<body> <!-- will be focused -->
  <header>
    Logo
  </header>
  <main>
    <h1>Page Title</h1> <!-- will be announced -->
    <p>Lorem ipsum dolor sit amet</p>
  </main>
</body>
```

## Announcements

The plugin will announce the new page to screen readers after navigating to it. It will look for the
following and announce the first one found:

- Heading label: `<h1 aria-label="About"></h1>`
- Heading content: `<h1>About</h1>`
- Document title: `<title>About</title>`
- Page URL: `/about/`

The easiest way to announce a page title differing from the main heading is using `aria-label`. The
example below will be announced as `Homepage`.

```html
<h1 aria-label="Homepage">Project Title</h1>
```

## Focus

On page navigation, the plugin will reset focus to the body, imitating default browser behavior.
When clicking anchor links on the same page, the plugin will focus the target of the link.

> [!TIP]
> When linking to other sections on the page, make sure to target a single item that is descriptive
> of the section, e.g. a heading or a button. Linking to a large container has multiple issues:
> Some browsers will scroll to the center of the targeted container, disorienting near-sighted users
> with increased zoom. Screen readers will also start reading out the content of the targeted
> element, which can be overwhelming when a whole content section is being read out.

## Styling

Browsers will display a visible outline around elements focused by this plugin. That's great for
orientation of keyboard users, but tends to be annoying for mouse users. We can make both groups of
users happy by using a combination of the `:focus` and `:focus-visible` pseudo-class to hide any
focus outlines while the site is being used with a mouse:

```css
:focus:not(:focus-visible) {
  outline: none;
}
```

See these guides on [Controlling focus](https://web.dev/control-focus-with-tabindex/)
and [Styling focus](https://web.dev/style-focus/) for details and more examples.

## Options

All options with their default values:

```javascript
{
  headingSelector: 'h1',
  respectReducedMotion: true,
  autofocus: false,
  announcements: {
    visit: 'Navigated to: {title}',
    url: 'New page at {url}'
  }
}
```

### headingSelector

The selector for finding page headings. The content of the first found heading will be read to
screenreaders after a new page was loaded.

### respectReducedMotion

Whether to respects users' preference for reduced motion.

Disable animated page transitions and animated scrolling if a user has enabled a
setting on their device to minimize the amount of non-essential motion. Learn more about
[prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

### autofocus

Whether to focus elements with an `autofocus` attribute after navigation.

> [!CAUTION]
> Make sure to use this wisely. Automatically focussing elements can be useful to draw attention to
> inputs, but it comes with a list of drawbacks on its own, especially for screen-reading technology.
> See [Autofocus accessibility considerations](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus#accessibility_considerations)
> for details.

### announcements

How the new page is announced. A visit is announced differently depending on whether the new page
has a title or not. If found, the main heading or document title is announced. If neither is found,
the new url will be announced instead:

- **Title found?** Read `announcements.visit`, replacing `{title}` with the new title
- **No title?** Read `announcements.visit` too, but replacing `{title}` with the content of `announcements.url`

```js
{
  announcements: {
    visit: 'Navigated to: {title}',
    url: 'New page at {url}'
  }
}
```

#### Translations

For multi-language sites, pass in a nested object keyed by locale. The locale must match the
`html` element's [lang](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/lang) attribute
exactly. Use an asterisk `*` to declare fallback translations.

> [!NOTE]
> Swup will not update the lang attribute on its own. For that, you can either install the
> [Head Plugin](https://swup.js.org/plugins/head-plugin/) to do it automatically, or you can do update
> it yourself in the `content:replace` hook.

```js
{
  announcements: {
    'en-US': {
      visit: 'Navigated to: {title}',
      url: 'New page at {url}'
    },
    'de-DE': {
      visit: 'Navigiert zu: {title}',
      url: 'Neue Seite unter {url}'
    },
    'fr-FR': {
      visit: 'Navigué vers : {title}',
      url: 'Nouvelle page à {url}'
    },
    '*': {
      visit: '{title}',
      url: '{url}'
    }
  }
}
```

## Visit object

The plugin extends the visit object with a new `a11y` key that can be used to customize the
behavior on the fly.

```js
{
  from: { ... },
  to: { ... },
  a11y: {
    announce: 'Navigated to: About',
    focus: 'body'
  }
}
```

### visit.a11y.announce

The text to announce after the new page was loaded. This is the final text after choosing the
correct language from the [announcements](#announcements) option and filling in any placeholders.
Modify it to read a custom announcement.

Since the text can only be populated once the new page was fetched and its contents are available,
the only place to inspect or modify this would be right before the `content:announce` hook.

```js
swup.hooks.before('content:announce', (visit) => {
  visit.a11y.announce = 'New page loaded';
});
```

### visit.a11y.focus

The element to receive focus after the new page was loaded, by default the `body`. Can be customized
per visit. Set it to a selector `string` to select an element, or set it to `false` to not move the
focus on this visit.

## Hooks

The plugin adds two new hooks: `content:announce` and `content:focus`. Both run directly
after the internal `content:replace` handler, when the new content is already in the DOM.

### content:announce

Executes the announcement of the new page title.

```js
swup.hooks.on('content:announce', () => console.log('New content was announced'));
```

### content:focus

Executes the focussing of the new page.

```js
swup.hooks.on('content:focus', () => console.log('New content received focus'));
```

## Methods on the swup instance

The plugin adds the following method to the swup instance:

### announce

Announce something programmatically. Use this if you are making use of
[`options.resolveUrl`](https://swup.js.org/options/#resolve-url) and still want
state changes to be announced.

```js
swup.announce?.(`Filtered by ${myFilterString}`);
```
