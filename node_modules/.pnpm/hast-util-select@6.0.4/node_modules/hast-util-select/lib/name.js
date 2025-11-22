/**
 * @import {AstTagName} from 'css-selector-parser'
 * @import {Element} from 'hast'
 */

/**
 * Check whether an element has a tag name.
 *
 * @param {AstTagName} query
 *   AST rule (with `tag`).
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
export function name(query, element) {
  return query.name === element.tagName
}
