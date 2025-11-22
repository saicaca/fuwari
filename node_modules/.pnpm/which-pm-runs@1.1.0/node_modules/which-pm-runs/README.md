# which-pm-runs

> Detects what package manager executes the process

[![npm version](https://img.shields.io/npm/v/which-pm-runs.svg)](https://www.npmjs.com/package/which-pm-runs)

Supports npm, pnpm, Yarn, cnpm. And also any other package manager that sets the `npm_config_user_agent` env variable.

## Installation

```
pnpm add which-pm-runs
```

## Usage

```js
'use strict'
const whichPMRuns = require('which-pm-runs')

whichPMRuns()
//> {name: "pnpm", version: "0.64.2"}
```

## Related

* [which-pm](https://github.com/zkochan/packages/tree/main/which-pm) - Detects what package manager was used for installation

## License

[MIT](LICENSE) © [Zoltan Kochan](http://kochan.io)
