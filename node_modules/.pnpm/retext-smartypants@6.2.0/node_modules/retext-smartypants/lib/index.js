/**
 * @import {Parents, Punctuation, Root, SentenceContent, Symbol} from 'nlcst'
 */

/**
 * @callback Method
 *   Transform.
 * @param {State} state
 *   Info passed around.
 * @param {Punctuation | Symbol} node
 *   Node.
 * @param {number} index
 *   Position of `node` in `parent`.
 * @param {Parents} parent
 *   Parent of `node`.
 * @returns {boolean | undefined | void}
 *   Whether to remove the node (`true`); or not (otherwise).
 *
 * @typedef Options
 *   Configuration.
 * @property {'all' | boolean | null | undefined} [backticks=true]
 *   Transform backticks (default: `true`); when `true`, turns double
 *   backticks into an opening double quote and double straight single quotes
 *   into a closing double quote; when `'all'`, does that and turns single
 *   backticks into an opening single quote and a straight single quotes into
 *   a closing single smart quote; `quotes: false` must be used with
 *   `backticks: 'all'`.
 * @property {QuoteCharacterMap | null | undefined} [closingQuotes]
 *   Closing quotes to use (default: `{double: '”', single: '’'}`).
 * @property {'inverted' | 'oldschool' | boolean | null | undefined} [dashes=true]
 *   Transform dashes (default: `true`);
 *   when `true`, turns two dashes into an em dash character;
 *   when `'oldschool'`, turns three dashes into an em dash and two into an en
 *   dash;
 *   when `'inverted'`, turns three dashes into an en dash and two into an em
 *   dash.
 * @property {'spaced' | 'unspaced' | boolean | null | undefined} [ellipses=true]
 *   Transform triple dots (default: `true`).
 *   when `'spaced'`, turns triple dots with spaces into ellipses;
 *   when `'unspaced'`, turns triple dots without spaces into ellipses;
 *   when `true`, turns triple dots with or without spaces into ellipses.
 * @property {QuoteCharacterMap | null | undefined} [openingQuotes]
 *   Opening quotes to use (default: `{double: '“', single: '‘'}`).
 * @property {boolean | null | undefined} [quotes=true]
 *   Transform straight quotes into smart quotes (default: `true`).
 *
 * @typedef State
 *   Info passed around.
 * @property {Quotes} close
 *   Closing quotes.
 * @property {Quotes} open
 *   Opening quotes.
 *
 * @typedef QuoteCharacterMap
 *   Quote characters.
 * @property {string} double
 *   Character to use for double quotes.
 * @property {string} single
 *   Character to use for single quotes.
 *
 * @typedef {[string, string]} Quotes
 *   Quotes.
 */

import {visit} from 'unist-util-visit'
import {toString} from 'nlcst-to-string'

/** @type {Quotes} */
const defaultClosingQuotes = ['”', '’']
/** @type {Quotes} */
const defaultOpeningQuotes = ['“', '‘']

/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * Replace straight punctuation marks with curly ones.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function retextSmartypants(options) {
  const settings = options || emptyOptions
  /** @type {Array<Method>} */
  const methods = []

  if (settings.quotes !== false) {
    methods.push(quotesDefault)
  }

  if (settings.ellipses === 'spaced') {
    methods.push(ellipsesSpaced)
  } else if (settings.ellipses === 'unspaced') {
    methods.push(ellipsesUnspaced)
  } else if (settings.ellipses !== false) {
    methods.push(ellipsesDefault)
  }

  if (settings.backticks === 'all') {
    if (settings.quotes !== false) {
      throw new Error("Cannot accept `backticks: 'all'` with `quotes: true`")
    }

    methods.push(backticksAll)
  } else if (settings.backticks !== false) {
    methods.push(backticksDefault)
  }

  if (settings.dashes === 'inverted') {
    methods.push(dashesInverted)
  } else if (settings.dashes === 'oldschool') {
    methods.push(dashesOldschool)
  } else if (settings.dashes !== false) {
    methods.push(dashesDefault)
  }

  /** @type {State} */
  const state = {
    close: settings.closingQuotes
      ? [settings.closingQuotes.double, settings.closingQuotes.single]
      : defaultClosingQuotes,
    open: settings.openingQuotes
      ? [settings.openingQuotes.double, settings.openingQuotes.single]
      : defaultOpeningQuotes
  }

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, function (node, position, parent) {
      let index = -1

      if (
        parent &&
        position !== undefined &&
        (node.type === 'PunctuationNode' || node.type === 'SymbolNode')
      ) {
        while (++index < methods.length) {
          const result = methods[index](state, node, position, parent)
          if (result === true) {
            console.log('drop', node)
            parent.children.splice(position, 1)
            return position
          }
        }
      }
    })
  }
}

/**
 * Transform single and double backticks and single quotes into smart quotes.
 *
 * @type {Method}
 */
function backticksAll(state, node, index, parent) {
  backticksDefault(state, node, index, parent)

  if (node.value === '`') {
    node.value = '‘'
  } else if (node.value === "'") {
    node.value = '’'
  }
}

/**
 * Transform double backticks and single quotes into smart quotes.
 *
 * @type {Method}
 */
function backticksDefault(_, node) {
  if (node.value === '``') {
    node.value = '“'
  } else if (node.value === "''") {
    node.value = '”'
  }
}

/**
 * Transform two dashes into an em dash.
 *
 * @type {Method}
 */
function dashesDefault(_, node) {
  if (node.value === '--') {
    node.value = '—'
  }
}

/**
 * Transform three dashes into an en dash, and two into an em dash.
 *
 * @type {Method}
 */
function dashesInverted(_, node, index, parent) {
  const next = parent.children[index + 1]

  if (
    node.value === '—' &&
    next &&
    next.type === 'PunctuationNode' &&
    next.value === '-'
  ) {
    next.value = '–'
    return true
  }

  if (node.value === '---') {
    node.value = '–'
  } else if (node.value === '--') {
    node.value = '—'
  }
}

/**
 * Transform three dashes into an em dash, and two into an en dash.
 *
 * @type {Method}
 */
function dashesOldschool(_, node, index, parent) {
  const next = parent.children[index + 1]

  if (
    node.value === '–' &&
    next &&
    next.type === 'PunctuationNode' &&
    next.value === '-'
  ) {
    next.value = '—'
    return true
  }

  if (node.value === '---') {
    node.value = '—'
  } else if (node.value === '--') {
    node.value = '–'
  }
}

/**
 * Transform multiple dots into unicode ellipses.
 *
 * @type {Method}
 */
function ellipsesDefault(_, node, index, parent) {
  ellipsesSpaced(_, node, index, parent)
  ellipsesUnspaced(_, node, index, parent)
}

/**
 * Transform multiple dots with spaces into unicode ellipses.
 *
 * @type {Method}
 */
function ellipsesSpaced(_, node, index, parent) {
  const value = node.value
  const siblings = parent.children

  if (!/^\.+$/.test(value)) {
    return
  }

  // Search for dot-nodes with whitespace between.
  /** @type {Array<SentenceContent>} */
  const nodes = []
  let position = index
  let count = 1

  // It’s possible that the node is merged with an adjacent word-node.  In that
  // code, we cannot transform it because there’s no reference to the
  // grandparent.
  while (--position > 0) {
    let sibling = siblings[position]

    if (sibling.type !== 'WhiteSpaceNode') {
      break
    }

    const queue = sibling
    sibling = siblings[--position]

    if (
      sibling &&
      (sibling.type === 'PunctuationNode' || sibling.type === 'SymbolNode') &&
      /^\.+$/.test(sibling.value)
    ) {
      nodes.push(queue, sibling)

      count++

      continue
    }

    break
  }

  if (count < 3) {
    return
  }

  siblings.splice(index - nodes.length, nodes.length)

  node.value = '…'
}

/**
 * Transform multiple dots without spaces into unicode ellipses.
 *
 * @type {Method}
 */
function ellipsesUnspaced(_, node) {
  // Simple node with three dots and without whitespace.
  if (/^\.{3,}$/.test(node.value)) {
    node.value = '…'
  }
}

/**
 * Transform straight single- and double quotes into smart quotes.
 *
 * @type {Method}
 */
// eslint-disable-next-line complexity
function quotesDefault(state, node, index, parent) {
  const siblings = parent.children
  const value = node.value

  if (value !== '"' && value !== "'") {
    return
  }

  const quoteIndex = value === '"' ? 0 : 1
  const previous = siblings[index - 1]
  const next = siblings[index + 1]
  const nextNext = siblings[index + 2]
  const nextValue = next ? toString(next) : ''

  if (
    next &&
    (next.type === 'PunctuationNode' || next.type === 'SymbolNode') &&
    (!nextNext || nextNext.type !== 'WordNode')
  ) {
    // Special case if the very first character is a quote followed by
    // punctuation at a non-word-break. Close the quotes by brute force.
    node.value = state.close[quoteIndex]
  } else if (
    next &&
    (next.type === 'PunctuationNode' || next.type === 'SymbolNode') &&
    (nextValue === '"' || nextValue === "'") &&
    nextNext &&
    nextNext.type === 'WordNode'
  ) {
    // Special case for double sets of quotes:
    // `He said, "'Quoted' words in a larger quote."`
    node.value = state.open[quoteIndex]
    next.value = state.open[nextValue === '"' ? 0 : 1]
  } else if (next && /^\d\ds$/.test(nextValue)) {
    // Special case for decade abbreviations: `the '80s`
    node.value = state.close[quoteIndex]
  } else if (
    previous &&
    (previous.type === 'WhiteSpaceNode' ||
      previous.type === 'PunctuationNode' ||
      previous.type === 'SymbolNode') &&
    next &&
    next.type === 'WordNode'
  ) {
    // Get most opening single quotes.
    node.value = state.open[quoteIndex]
  } else if (
    previous &&
    previous.type !== 'WhiteSpaceNode' &&
    previous.type !== 'SymbolNode' &&
    previous.type !== 'PunctuationNode'
  ) {
    // Closing quotes.
    node.value = state.close[quoteIndex]
  } else if (
    !next ||
    next.type === 'WhiteSpaceNode' ||
    (value === "'" && nextValue === 's')
  ) {
    node.value = state.close[quoteIndex]
  } else {
    node.value = state.open[quoteIndex]
  }
}
