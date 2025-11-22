# rollup-plugin-bundle-size [![npm](https://img.shields.io/npm/v/rollup-plugin-bundle-size.svg?maxAge=2592000)](https://www.npmjs.com/package/rollup-plugin-bundle-size)

> A rollup plugin to show the size of the generated bundle(s).

## Installation

```bash
npm install --save-dev rollup-plugin-bundle-size
```

## Usage

### JS API

```js
const rollup = require('rollup');
const bundleSize = require('rollup-plugin-bundle-size');

rollup.rollup({
    entry: 'src/index.js',
    plugins: [
        bundleSize()
    ]
}).then((bundle) => {
    ...
});
```

### Config File

```js
import bundleSize from 'rollup-plugin-bundle-size';

export default {
    entry: 'src/index.js',
    plugins: [
        bundleSize()
    ]
}
```
