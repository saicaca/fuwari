# Emmet stylesheet abbreviation parser

Parses given Emmet *stylesheet* abbreviation into AST. Parsing is performed in two steps: first it tokenizes given abbreviation (useful for syntax highlighting in editors) and then tokens are analyzed and converted into AST nodes as plain, JSON-serializable objects.

Unlike in [markup abbreviations](/packages/abbreviation), elements in stylesheet abbreviations cannot be nested and contain attributes, but allow embedded values in element names.

## Usage

You can install it via npm:

```bash
npm install @emmetio/css-abbreviation
```

Then add it into your project:

```js
import parse from '@emmetio/css-abbreviation';

const props = parse('p10+poa');
/* [{
    name: 'p',
    value: [{ type: 'CSSValue', value: [...] }],
    important: false
}, {
    name: 'poa',
    value: [],
    important: false
}] */
```
The returned result is an array of `CSSProperty` items: a node with name and values.

## Abbreviation syntax

Emmet stylesheet abbreviation element may start with name and followed by values, optionally chained with `-` delimiter. In most cases, actual CSS properties doesn’t have numbers in their names (or at least they are not used in abbreviation shortcuts) so a number right after alpha characters is considered as *embedded value*, as well as colors starting with `#` character: `p10`, `bg#fc0` etc. If implicit name/value boundary can’t be identified, you should use `-` as value separator: `m-a`, `p10-20` etc.

### Operators

Since CSS properties can’t be nested, the only available operator is `+`.
