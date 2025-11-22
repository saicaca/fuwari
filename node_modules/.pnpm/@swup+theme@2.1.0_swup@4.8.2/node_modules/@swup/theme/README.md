# Swup Base Theme

Base class for creating [swup](https://swup.js.org) themes.

## Creating a Theme

To create a new theme, use the official [swup theme template](https://github.com/swup/theme-template).
It comes with detailed instructions and the required tooling.

## Usage

Import the base class and extend your theme from it.

```js
import Theme from '@swup/theme';

export default class ThemeName extends Theme {
  name = 'ThemeName';
  mount() {}
  unmount() {}
}
```

## Development

The official [swup command-line interface](https://github.com/swup/cli) has commands to help with
bundling and linting themes.

```sh
npm install --save-dev @swup/cli
```

### Bundling

Bundle the theme for production using [microbundle](https://github.com/developit/microbundle),
creating ESM and UMD builds.

```bash
# Bundle and transpile code for distribution
swup package:bundle

# Bundle code in watch mode
swup package:dev
```

### Linting & formatting

Lint the theme code using [prettier](https://prettier.io/) and swup's recommended rules.

```bash
# Lint code
swup package:lint

# Fix and format any lint errors
swup package:format
```

### Package info

Check that the themes's package.json file contains the required information for microbundle:
input, output, export map, amd name, etc.

```bash
# Check package info
swup package:check
```
