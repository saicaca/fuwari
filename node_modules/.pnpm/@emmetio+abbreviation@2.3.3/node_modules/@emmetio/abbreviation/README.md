# Emmet markup abbreviation parser

Parses given Emmet *markup* abbreviation into AST. Parsing is performed in two steps: first it tokenizes given abbreviation (useful for syntax highlighting in editors) and then tokens are analyzed and converted into AST nodes as plain, JSON-serializable objects.

Note that AST tree in most cases cannot be used directly for output: for example, AST node produced from `.foo.bar` element misses element name and contains two `class` attributes with `foo` and `bar` values (not a single `class` with `foo bar` value).

## Usage

You can install it via npm:

```bash
npm install @emmetio/abbreviation
```

Then add it into your project:

```js
import parse from '@emmetio/abbreviation';

const tree = parse('div#foo>span.bar*3');
/* {
    type: 'Abbreviation',
    children: [{
        type: 'AbbreviationNode',
        name: 'div',
        attributes: [...],
        children: [...]
    }]
} */

```
The returned tree contains `AbbreviationNode` items: a node with name, attributes and/or text content. E.g. an element that can be represented somehow. Repeated and grouped nodes like `a>(b+c)*3` are automatically converted and duplicated as distinct `AbbreviationNode` with distinct `.repeat` property which identifies node in repeating sequence.

## Abbreviation syntax

Emmet abbreviation element has the following basic parts:

```
name.class#id[attributes?, ...]{text value}*repeater/
```

* `name` — element name, like `div`, `span` etc. Stored as `node.name` property.
* `[attributes]` — list of attributes. Each attribute is stored as [`AbbreviationAttribute`](/src/types.ts) instance and can be accessed by `node.getAttribute(name)`. Each attribute can be written in different formats:
	* `attr` — attribute with empty value.
	* `attr=value` — attribute with value. The `value` may contain any character except space or `]`.
	* `attr="value"` or `attr='value'` — attribute with value in quotes. Quotes are automatically removed. Expression values like `attr={value}` are supported and can be identified by `valueType: "expression"` property.
	* `attr.` — boolean attribute, e.g. attribute without value, like `required` in `<input>`.
    * `!attr` – implicit attribute, will be outputted if its value is not empty. Used as a placeholder to preserve attribute order in output.
	* `./non/attr/value` — value for default attribute. In other words, anything that doesn’t match a attribute name characters. Can be a single- or double-quotted as well. Default attribute is stored with `null` as name and should be used later, for example, to resolve predefined attributes.
* `.class` — shorthand for `class` attribute. Note that an element can have multiple classes, like `.class1.class2.class3`.
* `#id` — shorthand for `id` attribute.
* `{text}` — node’s text content
* `*N` — element repeater, tells parser to create `N` copies of given node.
* `/` — optional self-closing operator. Marks element with `node.selfClosing = true`.

### Operators

Each element of abbreviation must be separated with any of these operators:

```
elem1+elem2>elem3
```

* `+` — sibling operator, adds next element as a next sibling of current element in tree.
* `>` — child operator, adds next element as a child of current element.
* `^` — climb-up operator, adds next element as a child of current element’s parent node. Multiple climb-up operators are allowed, each operator moves one level up by tree.

### Groups

A set of elements could be grouped using `()`, mostly for repeating and for easier elements nesting:

```
a>(b>c+d)*4+(e+f)
```

Groups can be optionally concatenated with `+` operator.
