# Small and fast HTML matcher

Finds matching opening and closing tag pair for given location in HTML/XML source:

```js
import match from '@emmetio/html-matcher';

const content = '<div><a href="http://emmet.io">Example</a></div>';

// Find tag pair at character 35
const tag = match(content, 35);

console.log(tag.name); // Name of matched tag: "a"
console.log(tag.open); // Range of opening tag: [5, 31]
console.log(tag.end); // Range of closing tag: [38, 42]

// List of attributes found in opening tag
console.log(tag.attributes);
```

By default, matcher works in HTML, which means if it finds tag name which is known to be empty (for example, `<img>`) it will not search for it’s closing part. However, such behavior might be unexpected for XML syntaxes where all tags should be either self-closed or provide closing part. In this case, you should pass `xml: true` option to properly handle XML mode:

```js
import match from '@emmetio/html-matcher';

const content = '<div><img>Caption</img></div>';
const html = match(content, 8);
const xml = match(content, 8, { xml: true });

console.log(html.name); // "img"
console.log(html.open); // [5, 10]
console.log(html.close); // undefined

console.log(xml.name); // "img"
console.log(xml.open); // [5, 10]
console.log(xml.close); // [17, 23]
```

## Special tags

In HTML, some tags has special meaning. For example, a `<script>` tag: its contents should be completely ignored until we find closing `</script>` tag. But, if `<script>` tag contains unknown `type` attribute value, we should consider it as a regular tag.  By default, matcher understands `script` and `style` tags as “special” but you can override them with `special` option:

```js
import match from '@emmetio/html-matcher';

// Treat `<foo-bar>` tag as ”special”: skip its content until `</foo-bar>`. Note that this option overwrites default value with `['script', 'style']` value
match('...', 10, { special: { 'foo-bar': null } });
```

The `special` option is an object where key is a tag name and value is an array of `type` attribute values which, if present in tag, will make it special. If array is not provided, all instances of tag with given name will be considered as special.
