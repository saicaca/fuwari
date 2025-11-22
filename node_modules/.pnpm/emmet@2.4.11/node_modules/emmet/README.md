# Emmet — the essential toolkit for web-developers

Emmet is a web-developer’s toolkit for boosting HTML & CSS code writing.

With Emmet, you can type expressions (_abbreviations_) similar to CSS selectors and convert them into code fragment with a single keystroke. For example, this abbreviation:

```
ul#nav>li.item$*4>a{Item $}
```

...can be expanded into:

```html
<ul id="nav">
    <li class="item1"><a href="">Item 1</a></li>
    <li class="item2"><a href="">Item 2</a></li>
    <li class="item3"><a href="">Item 3</a></li>
    <li class="item4"><a href="">Item 4</a></li>
</ul>
```

## Features

* **Familiar syntax**: as a web-developer, you already know how to use Emmet. Abbreviation syntax is similar to CSS Selectors with shortcuts for id, class, custom attributes, element nesting and so on.
* **Dynamic snippets**: unlike default editor snippets, Emmet abbreviations are dynamic and parsed as-you-type. No need to predefine them for each project, just type `MyComponent>custom-element` to convert any word into a tag.
* **CSS properties shortcuts**: Emmet provides special syntax for CSS properties with embedded values. For example, `bd1-s#f.5` will be expanded to `border: 1px solid rgba(255, 255, 255, 0.5)`.
* **Available for most popular syntaxes**: use single abbreviation to produce code for most popular syntaxes like HAML, Pug, JSX, SCSS, SASS etc.

[Read more about Emmet features](https://docs.emmet.io)

This repo contains only core module for parsing and expanding Emmet abbreviations. Editor plugins are available as [separate repos](https://github.com/emmetio).

This is a *monorepo*: top-level project contains all the code required for converting abbreviation into code fragment while [`./packages`](/packages) folder contains modules for parsing abbreviations into AST and can be used independently (for example, as lexer for syntax highlighting).

### Installation

You can install Emmet as a regular npm module:

```bash
npm i emmet
```

## Usage

To expand abbreviation, pass it to default function of `emmet` module:

```js
import expand from 'emmet';

console.log(expand('p>a')); // <p><a href=""></a></p>
```

By default, Emmet expands *markup* abbreviation, e.g. abbreviation used for producing nested elements with attributes (like HTML, XML, HAML etc.). If you want to expand *stylesheet* abbreviation, you should pass it as a `type` property of second argument:

```js
import expand from 'emmet';

console.log(expand('p10', { type: 'stylesheet' })); // padding: 10px;
```

A stylesheet abbreviation has slightly different syntax compared to markup one: it doesn’t support nesting and attributes but allows embedded values in element name.

Alternatively, Emmet supports *syntaxes* with predefined snippets and options:

```js
import expand from 'emmet';

console.log(expand('p10', { syntax: 'css' })); // padding: 10px;
console.log(expand('p10', { syntax: 'stylus' })); // padding 10px
```

Predefined syntaxes already have `type` attribute which describes whether given abbreviation is markup or stylesheet, but if you want to use it with your custom syntax name, you should provide `type` config option as well (default is `markup`):

```js
import expand from 'emmet';

console.log(expand('p10', {
    syntax: 'my-custom-syntax',
    type: 'stylesheet',
    options: {
        'stylesheet.between': '__',
        'stylesheet.after': '',
    }
})); // padding__10px
```

You can pass `options` property as well to shape-up final output or enable/disable various features. See [`src/config.ts`](src/config.ts) for more info and available options.

## Extracting abbreviations from text

A common workflow with Emmet is to type abbreviation somewhere in source code and then expand it with editor action. To support such workflow, abbreviations must be properly _extracted_ from source code:

```js
import expand, { extract } from 'emmet';

const source = 'Hello world ul.tabs>li';
const data = extract(source, 22); // { abbreviation: 'ul.tabs>li' }

console.log(expand(data.abbreviation)); // <ul class="tabs"><li></li></ul>
```

The `extract` function accepts source code (most likely, current line) and character location in source from which abbreviation search should be started. The abbreviation is searched in backward direction: the location pointer is moved backward until it finds abbreviation bound. Returned result is an object with `abbreviation` property and `start` and `end` properties which describe location of extracted abbreviation in given source.

Most current editors automatically insert closing quote or bracket for `(`, `[` and `{` characters so when user types abbreviation that uses attributes or text, it will end with the following state (`|` is caret location):

```
ul>li[title="Foo|"]
```

E.g. caret location is not at the end of abbreviation and must be moved a few characters ahead. The `extract` function is able to handle such cases with `lookAhead` option (enabled by default). This this option enabled, `extract` method automatically detects auto-inserted characters and adjusts location, which will be available as `end` property of the returned result:

```js
import { extract } from 'emmet';

const source = 'a div[title] b';
const loc = 11; // right after "title" word

// `lookAhead` is enabled by default
console.log(extract(source, loc)); // { abbreviation: 'div[title]', start: 2, end: 12 }
console.log(extract(source, loc, { lookAhead: false })); // { abbreviation: 'title', start: 6, end: 11 }
```

By default, `extract` tries to detect _markup_ abbreviations (see above). _stylesheet_ abbreviations has slightly different syntax so in order to extract abbreviations for stylesheet syntaxes like CSS, you should pass `type: 'stylesheet'` option:

```js
import { extract } from 'emmet';

const source = 'a{b}';
const loc = 3; // right after "b"

console.log(extract(source, loc)); // { abbreviation: 'a{b}', start: 0, end: 4 }


// Stylesheet abbreviations does not have `{text}` syntax
console.log(extract(source, loc, { type: 'stylesheet' })); // { abbreviation: 'b', start: 2, end: 3 }
```

### Extract abbreviation with custom prefix

Lots of developers uses React (or similar) library for writing UI code which mixes JS and XML (JSX) in the same source code. Since _any_ Latin word can be used as Emmet abbreviation, writing JSX code with Emmet becomes pain since it will interfere with native editor snippets and distract user with false positive abbreviation matches for variable names, methods etc.:

```js
var div // `div` is a valid abbreviation, Emmet may transform it to `<div></div>`
```

A possible solution for this problem it to use _prefix_ for abbreviation: abbreviation can be successfully extracted only if its preceded with given prefix.

```js
import { extract } from 'emmet';

const source1 = '() => div';
const source2 = '() => <div';

extract(source1, source1.length); // Finds `div` abbreviation
extract(source2, source2.length); // Finds `div` abbreviation too

extract(source1, source1.length, { prefix: '<' }); // No match, `div` abbreviation is not preceded with `<` prefix
extract(source2, source2.length, { prefix: '<' }); // Finds `div` since it preceded with `<` prefix
```

With `prefix` option, you can customize your experience with Emmet in any common syntax (HTML, CSS and so on) if user is distracted too much with Emmet completions for any typed word. A `prefix` may contain multiple character but the last one *must* be a character which is not part of Emmet abbreviation. Good candidates are `<`, `&`, `→` (emoji or Unicode symbol) and so on.
