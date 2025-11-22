/**
 * @typedef {import('nlcst').Root} Root
 */

import {toString} from 'nlcst-to-string'

/**
 * Add support for serializing natural language.
 *
 * @returns {undefined}
 *   Nothing.
 */
export default function retextStringify() {
  // eslint-disable-next-line unicorn/no-this-assignment
  const self =
    /** @type {import('unified').Processor<undefined, undefined, undefined, Root, string>} */ (
      // @ts-expect-error -- TS in JSDoc doesn’t understand `this`.
      this
    )

  self.compiler = compiler
}

/** @type {import('unified').Compiler<Root, string>} */
function compiler(tree) {
  return toString(tree)
}
