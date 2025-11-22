/**
 * @import {AstRule} from 'css-selector-parser'
 * @import {Element, Nodes, Parents} from 'hast'
 * @import {State} from './index.js'
 */

/**
 * @typedef Counts
 *   Info on elements in a parent.
 * @property {number} count
 *   Number of elements.
 * @property {Map<string, number>} types
 *   Number of elements by tag name.
 *
 * @typedef Nest
 *   Rule sets by nesting.
 * @property {Array<AstRule> | undefined} adjacentSibling
 *   `a + b`
 * @property {Array<AstRule> | undefined} descendant
 *   `a b`
 * @property {Array<AstRule> | undefined} directChild
 *   `a > b`
 * @property {Array<AstRule> | undefined} generalSibling
 *   `a ~ b`
 */

import {enterState} from './enter-state.js'
import {test} from './test.js'

/** @type {Array<never>} */
const empty = []

/**
 * Walk a tree.
 *
 * @param {State} state
 *   State.
 * @param {Nodes | undefined} tree
 *   Tree.
 */
export function walk(state, tree) {
  if (tree) {
    one(state, [], tree, undefined, undefined, tree)
  }
}

/**
 * Add a rule to a nesting map.
 *
 * @param {Nest} nest
 *   Nesting.
 * @param {keyof Nest} field
 *   Field.
 * @param {AstRule} rule
 *   Rule.
 */
function add(nest, field, rule) {
  const list = nest[field]
  if (list) {
    list.push(rule)
  } else {
    nest[field] = [rule]
  }
}

/**
 * Check in a parent.
 *
 * @param {State} state
 *   State.
 * @param {Nest} nest
 *   Nesting.
 * @param {Parents} node
 *   Parent.
 * @param {Nodes} tree
 *   Tree.
 * @returns {undefined}
 *   Nothing.
 */
function all(state, nest, node, tree) {
  const fromParent = combine(nest.descendant, nest.directChild)
  /** @type {Array<AstRule> | undefined} */
  let fromSibling
  let index = -1
  /**
   * Total counts.
   * @type {Counts}
   */
  const total = {count: 0, types: new Map()}
  /**
   * Counts of previous siblings.
   * @type {Counts}
   */
  const before = {count: 0, types: new Map()}

  while (++index < node.children.length) {
    count(total, node.children[index])
  }

  index = -1

  while (++index < node.children.length) {
    const child = node.children[index]
    // Uppercase to prevent prototype polution, injecting `constructor` or so.
    // Normalize because HTML is insensitive.
    const name =
      child.type === 'element' ? child.tagName.toUpperCase() : undefined
    // Before counting further elements:
    state.elementIndex = before.count
    state.typeIndex = name ? before.types.get(name) || 0 : 0
    // After counting all elements.
    state.elementCount = total.count
    state.typeCount = name ? total.types.get(name) : 0

    // Only apply if this is a parent, this should be an element, but we check
    // for parents so that we delve into custom nodes too.
    if ('children' in child) {
      const forSibling = combine(fromParent, fromSibling)
      const nest = one(
        state,
        forSibling,
        node.children[index],
        index,
        node,
        tree
      )
      fromSibling = combine(nest.generalSibling, nest.adjacentSibling)
    }

    // We found one thing, and one is enough.
    if (state.one && state.found) {
      break
    }

    count(before, node.children[index])
  }
}

/**
 * Apply selectors to an element.
 *
 * @param {State} state
 *   Current state.
 * @param {Array<AstRule>} rules
 *   Rules to apply.
 * @param {Element} node
 *   Element to apply rules to.
 * @param {number | undefined} index
 *   Index of `node` in `parent`.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Nest}
 *   Further rules.
 */
function applySelectors(state, rules, node, index, parent) {
  /** @type {Nest} */
  const nestResult = {
    adjacentSibling: undefined,
    descendant: undefined,
    directChild: undefined,
    generalSibling: undefined
  }
  let selectorIndex = -1

  while (++selectorIndex < rules.length) {
    const rule = rules[selectorIndex]

    // We found one thing, and one is enough.
    if (state.one && state.found) {
      break
    }

    // When shallow, we don’t allow nested rules.
    // Idea: we could allow a stack of parents?
    // Might get quite complex though.
    if (state.shallow && rule.nestedRule) {
      throw new Error('Expected selector without nesting')
    }

    // If this rule matches:
    if (test(rule, node, index, parent, state)) {
      const nest = rule.nestedRule

      // Are there more?
      if (nest) {
        /** @type {keyof Nest} */
        const label =
          nest.combinator === '+'
            ? 'adjacentSibling'
            : nest.combinator === '~'
              ? 'generalSibling'
              : nest.combinator === '>'
                ? 'directChild'
                : 'descendant'
        add(nestResult, label, nest)
      } else {
        // We have a match!
        state.found = true

        if (!state.results.includes(node)) {
          state.results.push(node)
        }
      }
    }

    // Descendant.
    if (rule.combinator === undefined) {
      add(nestResult, 'descendant', rule)
    }
    // Adjacent.
    else if (rule.combinator === '~') {
      add(nestResult, 'generalSibling', rule)
    }
    // Drop direct child (`>`), adjacent sibling (`+`).
  }

  return nestResult
}

/**
 * Combine two lists, if needed.
 *
 * This is optimized to create as few lists as possible.
 *
 * @param {Array<AstRule> | undefined} left
 *   Rules.
 * @param {Array<AstRule> | undefined} right
 *   Rules.
 * @returns {Array<AstRule>}
 *   Rules.
 */
function combine(left, right) {
  return left && right && left.length > 0 && right.length > 0
    ? [...left, ...right]
    : left && left.length > 0
      ? left
      : right && right.length > 0
        ? right
        : empty
}

/**
 * Count a node.
 *
 * @param {Counts} counts
 *   Counts.
 * @param {Nodes} node
 *   Node (we’re looking for elements).
 * @returns {undefined}
 *   Nothing.
 */
function count(counts, node) {
  if (node.type === 'element') {
    // Uppercase to prevent prototype polution, injecting `constructor` or so.
    // Normalize because HTML is insensitive.
    const name = node.tagName.toUpperCase()
    const count = (counts.types.get(name) || 0) + 1
    counts.count++
    counts.types.set(name, count)
  }
}

/**
 * Check a node.
 *
 * @param {State} state
 *   State.
 * @param {Array<AstRule>} currentRules
 *   Rules.
 * @param {Nodes} node
 *   Node.
 * @param {number | undefined} index
 *   Index of `node` in `parent`.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @param {Nodes} tree
 *   Tree.
 * @returns {Nest}
 *   Nesting.
 */
function one(state, currentRules, node, index, parent, tree) {
  /** @type {Nest} */
  let nestResult = {
    adjacentSibling: undefined,
    descendant: undefined,
    directChild: undefined,
    generalSibling: undefined
  }

  const exit = enterState(state, node)

  if (node.type === 'element') {
    let rootRules = state.rootQuery.rules

    // Remove direct child rules if this is the root.
    // This only happens for a `:has()` rule, which can be like
    // `a:has(> b)`.
    if (parent && parent !== tree) {
      rootRules = state.rootQuery.rules.filter(
        (d) =>
          d.combinator === undefined ||
          (d.combinator === '>' && parent === tree)
      )
    }

    nestResult = applySelectors(
      state,
      // Try the root rules for this element too.
      combine(currentRules, rootRules),
      node,
      index,
      parent
    )
  }

  // If this is a parent, and we want to delve into them, and we haven’t found
  // our single result yet.
  if ('children' in node && !state.shallow && !(state.one && state.found)) {
    all(state, nestResult, node, tree)
  }

  exit()

  return nestResult
}
