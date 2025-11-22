[npm]: https://img.shields.io/npm/v/@rollup/plugin-yaml
[npm-url]: https://www.npmjs.com/package/@rollup/plugin-yaml
[size]: https://packagephobia.now.sh/badge?p=@rollup/plugin-yaml
[size-url]: https://packagephobia.now.sh/result?p=@rollup/plugin-yaml

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# @rollup/plugin-yaml

🍣 A Rollup plugin which Converts YAML files to ES6 modules.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+) and Rollup v1.20.0+.

## Install

Using npm:

```console
npm install @rollup/plugin-yaml --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import yaml from '@rollup/plugin-yaml';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [yaml()]
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

With an accompanying file `src/index.js`, the local `heroes.yaml` file would now be importable as seen below:

```js
// src/index.js
import { batman } from './heroes.yaml';

console.log(`na na na na ${batman}`);
```

## Options

### `documentMode`

Type: `String`<br>
Default: `single`

If `single`, specifies that the target YAML documents contain only one document in the target file(s). If more than one [document stream](https://yaml.org/spec/1.2/spec.html#id2801681) exists in the target YAML file(s), set `documentMode: 'multi'`.

### `exclude`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.

### `safe`

Type: `Boolean`<br>
Default: `true`

If `true`, specifies that the data in the target YAML file(s) contain trusted data and should be loaded normally. If `false`, data is assumed to be untrusted and will be loaded using [safety methods](https://github.com/nodeca/js-yaml#safeload-string---options-).

### `transform`

Type: `Function`<br>
Default: `undefined`

A function which can optionally mutate parsed YAML. The function should return the mutated `object`, or `undefined` which will make no changes to the parsed YAML.

```js
yaml({
  transform(data, filePath) {
    if (Array.isArray(data) && filePath === './my-file.yml') {
      return data.filter((character) => !character.batman);
    }
  }
});
```

## Meta

[CONTRIBUTING](/.github/CONTRIBUTING.md)

[LICENSE (MIT)](/LICENSE)
