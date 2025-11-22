/**
 * @import {AstSelector} from 'css-selector-parser'
 */

import {createParser} from 'css-selector-parser'

const cssSelectorParse = createParser({syntax: 'selectors-4'})

/**
 * @param {string} selector
 *   Selector to parse.
 * @returns {AstSelector}
 *   Parsed selector.
 */
export function parse(selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('Expected `string` as selector, not `' + selector + '`')
  }

  return cssSelectorParse(selector)
}
