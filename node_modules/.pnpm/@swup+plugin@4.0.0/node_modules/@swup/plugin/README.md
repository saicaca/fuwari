# Swup Base Plugin

Base class for creating [swup](https://swup.js.org) plugins.

## Creating a Plugin

To create a new plugin, use the official [swup plugin template](https://github.com/swup/plugin-template).
It comes with detailed instructions and the required tooling.

## Usage

Import the base class and extend your plugin from it.

```js
import Plugin from '@swup/plugin';

export default class PluginName extends Plugin {
  name = 'PluginName';
  mount() {}
  unmount() {}
}
```

## Development

The official [swup command-line interface](https://github.com/swup/cli) has commands to help with
bundling and linting plugins.

```sh
npm install --save-dev @swup/cli
```

### Bundling

Bundle the plugin for production using [microbundle](https://github.com/developit/microbundle),
creating ESM and UMD builds.

```bash
# Bundle and transpile plugin code for distribution
swup package:bundle

# Bundle plugin code in watch mode
swup package:dev
```

### Linting & formatting

Lint the plugin code using [prettier](https://prettier.io/) and swup's recommended rules.

```bash
# Lint plugin code
swup package:lint

# Fix and format any lint errors
swup package:format
```

### Package info

Check that the plugin's package.json file contains the required information for microbundle:
input, output, export map, amd name, etc.

```bash
# Check plugin package info
swup package:check
```
