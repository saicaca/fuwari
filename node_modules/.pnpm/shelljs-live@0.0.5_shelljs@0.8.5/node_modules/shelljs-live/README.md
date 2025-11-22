
# shelljs-live

Execute a shell command while piping output directly to your console.

Motivated by [shelljs] exec's [inability to preserve colors](https://github.com/shelljs/shelljs/issues/86).
Also, great for watcher tasks, as output is not buffered.

Very portable (uses [cross-spawn]), especially when specifying `command` as an array of strings (more below).

## Installation

```sh
npm install shelljs shelljs-live
```

The `shelljs` package is a peerDependency of `shelljs-live` and must be installed.

## Traditional API

```
live(command [, options] [, callback]) => statusCode
```

- `command`
  - Array of unescaped strings. Cannot contain shell logic. **Recommended for portability.**
  - A string. Executed as a shell statement. Please take care when escaping input.
- `options` - *Optional*. [More info](#options).
- `callback` - *Optional*. Called on success/failure. Receives the `statusCode`. Implies the `async:true` option.
- `statusCode` - Number, or in some cases `null`. Success means `statusCode === 0`.

Synchronous usage:

```js
const live = require('shelljs-live')

const statusCode = live(['ps', '-ax']) // live('ps -ax') works too. not recommended
if (statusCode === 0) {
  console.log('Success')
} else {
  console.log('Failure')
}
```

Asynchronous usage:

```js
const live = require('shelljs-live')

live(['ps', '-ax'], (statusCode) => {
  if (statusCode === 0) {
    console.log('Success')
  } else {
    console.log('Failure')
  }
})
```

## Promise API

```
live(command [, options]) => promise
```

- `command`
  - Array of unescaped strings. Cannot contain shell logic. **Recommended for portability.**
  - A string. Executed as a shell statement. Please take care when escaping input.
- `options`: *Optional*. [More info](#options).
- `promise`: [Promise] that triggers success when status code equals `0`, failure otherwise. Neither handler receives the status code.

Usage:

```js
const live = require('shelljs-live/promise')

live(['ps', '-ax']).then(() => {
  console.log('Success')
}, () => {
  console.log('Failure')
})
```

Or if you want to use `await` and don't care about handling errors:

```js
const live = require('shelljs-live/promise')

await live(['ps', '-ax'])
console.log('Success')
```

## Options

- `async`: Asynchronous execution. If a callback is provided, or using the Promise API, it will be set to true, regardless of the passed value (default: `false`).
- `fatal`: Exit upon error (default: `false`, inherits from [ShellJS Config][shelljs-config]).
- `silent`: Do not echo program output to console (default: `false`, inherits from [ShellJS Config][shelljs-config]).

Any other option, such as `cwd`, is passed directly to [spawn].


[shelljs]: https://documentup.com/shelljs/shelljs
[shelljs-config]: https://documentup.com/shelljs/shelljs#configuration
[cross-spawn]: https://www.npmjs.com/package/cross-spawn
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[spawn]: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
