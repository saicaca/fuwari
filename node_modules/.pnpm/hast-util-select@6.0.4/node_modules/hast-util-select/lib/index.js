/**
 * @import {AstSelector} from 'css-selector-parser'
 * @import {Element, Nodes, RootContent} from 'hast'
 * @import {Schema} from 'property-information'
 */

/**
 * @typedef {'html' | 'svg'} Space
 *   Name of namespace.
 *
 * @typedef {'auto' | 'ltr' | 'rtl'} Direction
 *   Direction.
 *
 * @typedef State
 *   Current state.
 * @property {Direction} direction
 *   Current direction.
 * @property {boolean} editableOrEditingHost
 *   Whether we’re in `contentEditable`.
 * @property {number | undefined} elementCount
 *   Track siblings: there are `n` siblings.
 * @property {number | undefined} elementIndex
 *   Track siblings: this current element has `n` elements before it.
 * @property {boolean} found
 *   Whether we found at least one match.
 * @property {string | undefined} language
 *   Current language.
 * @property {boolean} one
 *   Whether we can stop looking after we found one element.
 * @property {Array<Element>} results
 *   Matches.
 * @property {AstSelector} rootQuery
 *   Original root selectors.
 * @property {Schema} schema
 *   Current schema.
 * @property {Array<RootContent>} scopeElements
 *   Elements in scope.
 * @property {boolean} shallow
 *   Whether we only allow selectors without nesting.
 * @property {number | undefined} typeCount
 *   Track siblings: there are `n` siblings with this element’s tag name.
 * @property {number | undefined} typeIndex
 *   Track siblings: this current element has `n` elements with its tag name
 *   before it.
 */

import {html, svg} from 'property-information'
import {parse} from './parse.js'
import {walk} from './walk.js'

/**
 * Check that the given `node` matches `selector`.
 *
 * This only checks the element itself, not the surrounding tree.
 * Thus, nesting in selectors is not supported (`p b`, `p > b`), neither are
 * selectors like `:first-child`, etc.
 * This only checks that the given element matches the selector.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [node]
 *   Node that might match `selector`, should be an element (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {boolean}
 *   Whether `node` matches `selector`.
 */
export function matches(selector, node, space) {
  const state = createState(selector, node, space)
  state.one = true
  state.shallow = true
  walk(state, node || undefined)
  return state.results.length > 0
}

/**
 * Select the first element that matches `selector` in the given `tree`.
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [tree]
 *   Tree to search (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {Element | undefined}
 *   First element in `tree` that matches `selector` or `undefined` if nothing
 *   is found; this could be `tree` itself.
 */
export function select(selector, tree, space) {
  const state = createState(selector, tree, space)
  state.one = true
  walk(state, tree || undefined)
  return state.results[0]
}

/**
 * Select all elements that match `selector` in the given `tree`.
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [tree]
 *   Tree to search (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {Array<Element>}
 *   Elements in `tree` that match `selector`.
 *   This could include `tree` itself.
 */
export function selectAll(selector, tree, space) {
  const state = createState(selector, tree, space)
  walk(state, tree || undefined)
  return state.results
}

/**
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [tree]
 *   Tree to search (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {State} State
 *   State.
 */
function createState(selector, tree, space) {
  return {
    direction: 'ltr',
    editableOrEditingHost: false,
    elementCount: undefined,
    elementIndex: undefined,
    found: false,
    language: undefined,
    one: false,
    // State of the query.
    results: [],
    rootQuery: parse(selector),
    schema: space === 'svg' ? svg : html,
    scopeElements: tree ? (tree.type === 'root' ? tree.children : [tree]) : [],
    shallow: false,
    typeIndex: undefined,
    typeCount: undefined
  }
}
