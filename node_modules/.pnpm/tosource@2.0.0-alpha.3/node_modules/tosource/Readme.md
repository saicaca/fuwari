# node-tosource

[![Actions Status](https://github.com/marcello3d/node-tosource/workflows/Node%20CI/badge.svg)](https://github.com/marcello3d/node-tosource/actions)
[![npm version](https://badge.fury.io/js/tosource.svg)](https://badge.fury.io/js/tosource)
[![codecov](https://codecov.io/gh/marcello3d/node-tosource/branch/master/graph/badge.svg)](https://codecov.io/gh/marcello3d/node-tosource)

toSource is a super simple function that converts JavaScript objects back to source code.

## Introduction

Motivation: JSON doesn't support serializing functions, dates, or regular expressions. I wanted
a quick and simple way to push trusted data structures with code from Node down to the browser.

This should make it easier to share code and modules between the server and client.

## Installation

```
npm install tosource
```

## Examples

The following code:

```js
import toSource from 'tosource';

console.log(
  toSource([
    4,
    5,
    6,
    'hello',
    {
      a: 2,
      b: 3,
      '1': 4,
      if: 5,
      yes: true,
      no: false,
      nan: NaN,
      infinity: Infinity,
      undefined: undefined,
      null: null,
      foo: function (bar) {
        console.log('woo! a is ' + a);
        console.log('and bar is ' + bar);
      },
    },
    /we$/gi,
    new Date('Wed, 09 Aug 1995 00:00:00 GMT'),
  ]),
);
```

Output:

```
[ 4,
  5,
  6,
  "hello",
  { 1:4,
    a:2,
    b:3,
    "if":5,
    yes:true,
    no:false,
    nan:NaN,
    infinity:Infinity,
    "undefined":undefined,
    "null":null,
    foo:function (bar) {
        console.log('woo! a is ' + a);
        console.log('and bar is ' + bar);
      } },
  /we$/gi,
  new Date(807926400000) ]
```

See [tosource.test.ts][1] for more examples.

## Supported Types

- numbers (including `NaN`, `Infinity`, and `-0`)
- strings
- Arrays (including sparse arrays)
- object literals
- function
- `RegExp` instances
- `Date` instances
- `Map`
- `Set`
- `true` / `false`
- `undefined`
- `null`

## Notes

- Functions are serialized with `func.toString()`, no closure properties are serialized
- Multiple references to the same object become copies
- Circular references are encoded as `{$circularReference:true}`

## License

toSource is open source software under the [zlib license][2].

[1]: https://github.com/marcello3d/node-tosource/blob/master/src/tosource.test.ts
[2]: https://github.com/marcello3d/node-tosource/blob/master/LICENSE
