/**
 * @import {AstId} from 'css-selector-parser'
 * @import {Element} from 'hast'
 */

/**
 * Check whether an element has an ID.
 *
 * @param {AstId} query
 *   AST rule (with `ids`).
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
export function id(query, element) {
  return element.properties.id === query.name
}
