/**
 * @import {AstRule} from 'css-selector-parser'
 * @import {Element, Parents} from 'hast'
 * @import {State} from './index.js'
 */

import {attribute} from './attribute.js'
import {className} from './class-name.js'
import {id} from './id.js'
import {name} from './name.js'
import {pseudo} from './pseudo.js'

/**
 * Test a rule.
 *
 * @param {AstRule} query
 *   AST rule (with `pseudoClasses`).
 * @param {Element} element
 *   Element.
 * @param {number | undefined} index
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} parent
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
export function test(query, element, index, parent, state) {
  for (const item of query.items) {
    // eslint-disable-next-line unicorn/prefer-switch
    if (item.type === 'Attribute') {
      if (!attribute(item, element, state.schema)) return false
    } else if (item.type === 'Id') {
      if (!id(item, element)) return false
    } else if (item.type === 'ClassName') {
      if (!className(item, element)) return false
    } else if (item.type === 'PseudoClass') {
      if (!pseudo(item, element, index, parent, state)) return false
    } else if (item.type === 'PseudoElement') {
      throw new Error('Invalid selector: `::' + item.name + '`')
    } else if (item.type === 'TagName') {
      if (!name(item, element)) return false
    } else {
      // Otherwise `item.type` is `WildcardTag`, which matches.
    }
  }

  return true
}
