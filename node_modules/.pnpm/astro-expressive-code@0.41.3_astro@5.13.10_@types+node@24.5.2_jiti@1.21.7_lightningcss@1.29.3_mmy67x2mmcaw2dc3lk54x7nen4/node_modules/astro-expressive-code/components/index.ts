import type { Component, CodeProps } from './types'
import { default as CodeComponent } from './Code.astro'

/**
 * Renders a code block to HTML using [Expressive Code](https://expressive-code.com/).
 *
 * The code to be rendered must be passed to the `code` prop.
 * Passing code as children is not supported to avoid escaping issues.
 *
 * To get syntax highlighted output, also set the `lang` prop to a valid
 * [language identifier](https://expressive-code.com/key-features/syntax-highlighting/#supported-languages)
 * (e.g. `js`, `ts`, `astro`, `html`, `bash`, or many others).
 *
 * You can also set the `meta` prop to a string. It supports the same syntax that you would use
 * in fenced code blocks in markdown/MDX files after the language identifier.
 */
export const Code = CodeComponent as Component<CodeProps>
