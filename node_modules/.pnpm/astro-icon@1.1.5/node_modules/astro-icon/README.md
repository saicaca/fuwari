# Astro Icon

This **[Astro integration](https://docs.astro.build/en/guides/integrations-guide/)** provides a straight-forward `Icon` component for [Astro](https://astro.build).

- <strong>[Why Astro Icon](#why-astro-icon)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Configuration](#configuration)</strong>
- <strong>[Examples](#examples)</strong>
- <strong>[Migrating to v1](#migrating-to-v1)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why Astro Icon

## Installation

### Quick Install

The `astro add` command-line tool automates the installation for you. Run one of the following commands in a new terminal window. (If you aren't sure which package manager you're using, run the first command.) Then, follow the prompts, and type "y" in the terminal (meaning "yes") for each one.

```sh
# Using NPM
npx astro add astro-icon
# Using Yarn
yarn astro add astro-icon
# Using PNPM
pnpm astro add astro-icon
```

If you run into any issues, [feel free to report them to us on GitHub](https://github.com/natemoo-re/astro-icon/issues) and try the manual installation steps below.

### Manual Install

First, install the `astro-icon` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-icon
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

**`astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  integrations: [icon()],
});
```

## Usage

Astro Icon is ready to use, with zero additional configuration. The included `Icon` component allows you to inline `svg`s directly into your HTML. Repeasted

### Local Icons

By default, Astro Icon supports custom local `svg` icons. They are optimized with [`svgo`](https://github.com/svg/svgo) automatically with no extra build step. See ["A Pretty Good SVG Icon System"](https://css-tricks.com/pretty-good-svg-icon-system/#just-include-the-icons-inline) from CSS Tricks.

1. Create a directory inside of `src/` named `icons/`.
2. Add each desired icon as an individual `.svg` file to `src/icons/`
3. Reference a specific icon file using the `name` prop.

```astro
---
import { Icon } from 'astro-icon/components';
---

<!-- Loads the SVG in `/src/icons/filename.svg` -->
<Icon name="filename" />
```

## Iconify Icons

Astro Icon also supports [Iconify](https://iconify.design) icon sets out-of-the-box.

1. Find an Icon Set to use on the [Iconify Icon Sets website](https://icon-sets.iconify.design/)
2. Install the package (eg. `npm i -D @iconify-json/mdi`)
3. Reference a specific icon using the `name` prop with (eg. `mdi:account`)

```astro
---
import { Icon } from 'astro-icon/components'
---

<!-- Automatically fetches and inlines Material Design Icon's "account" SVG -->
<Icon name="mdi:account" />
```

### Props

The `Icon` component allows these custom properties:

```ts
interface Props extends HTMLAttributes<"svg"> {
  /**
   * References a specific Icon
   */
  name: string;
  "is:inline"?: boolean;
  title?: string;
  desc?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
}
```

The `Icon` also accepts any global HTML attributes and `aria` attributes. They will be forwarded to the rendered `<svg>` element.
See the [`Props.ts`](./packages/core/components/Icon.astro#L10-L17) file for more details.

### Styling

Styling your icons is straightforward. Any styles can be targeted to the `[data-icon]` attribute selector. If you want to target a specific icon, you may target it by name using `[data-icon="filename"]`.

```astro
---
import { Icon } from 'astro-icon/components';
---

<style lang="css">
    [data-icon] {
        color: blue;
        /* OR */
        fill: blue;
    }
    [data-icon="annotation"] {
        color: red;
        /* OR */
        fill: red;
    }
</style>

<Icon name="adjustment" /> <!-- will be blue -->
<Icon name="annotation" /> <!-- will be red -->

<!-- Example using Tailwind to apply color -->
<Icon name="annotation" class="text-red-500" /> <!-- will be red-500 -->
```

### Using with Frameworks

Astro Icon can be used with other frameworks utilizing the [`slot` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot). You can read more about how to use Slots in Astro here. [Passing Children to Framework Components](https://docs.astro.build/en/core-concepts/framework-components/#passing-children-to-framework-components)

## Configuration

### Configuring the Integration

The Astro Icon integration has its own options for controlling the `Icon` component. Change these in the `astro.config.mjs` file which is where your project's integration settings live.

#### config.include

For users with a project using `output: 'server'` or `output: 'hybrid'`, it is highly recommended to configure the exact icons that should be included in the server bundle. By default, every icon in the set will be bundled into the server JavaScript.

To filter the exact Iconify icons that should be included, set an array of allowed icons inside of the `include` object. Only these icons will be bundled.

**`astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  // ...
  integrations: [
    icon({
      include: {
        mdi: ["*"], // (Default) Loads entire Material Design Icon set
        mdi: ["account"], // Loads only Material Design Icon's "account" SVG
      },
    }),
  ],
});
```

#### config.iconDir

If you want to use a different custom svg icon directory instead of the default `src/icons/`, specify that file path using `config.iconDir`

```js ins={2}
import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  // ...
  integrations: [
    icon({
      iconDir: "src/assets/icons",
    }),
  ],
});
```

#### config.svgoOptions

If you want to behavior of `.svg` optimization, you can configure the `svgo` options rather than using the defaults. Read more about the available [`svgo` options here](https://github.com/svg/svgo#configuration).

```js
import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  // ...
  integrations: [
    icon({
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                // customize default plugin options
                inlineStyles: {
                  onlyMatchedOnce: false,
                },

                // or disable plugins
                removeDoctype: false,
              },
            },
          },
        ],
      },
    }),
  ],
});
```

## Migrating to v1

`astro-icon` v1 contains a number of breaking changes. Please reference the [**Migrate to `astro-icon` v1** guide](https://www.astroicon.dev/guides/upgrade/v1/) to update from older versions of `astro-icon`.

## Contributing

You're welcome to submit an issue or PR!

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes to this integration.
