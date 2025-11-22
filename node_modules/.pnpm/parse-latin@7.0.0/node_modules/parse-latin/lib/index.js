/**
 * @typedef {import('nlcst').Nodes} Nodes
 * @typedef {import('nlcst').Parents} Parents
 * @typedef {import('nlcst').Paragraph} Paragraph
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').RootContent} RootContent
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').SentenceContent} SentenceContent
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @template {Nodes} Node
 *   Node type.
 * @callback Plugin
 *   Transform a node.
 * @param {Node} node
 *   The node.
 * @returns {undefined | void}
 *   Nothing.
 */

import {toString} from 'nlcst-to-string'
import {mergeAffixExceptions} from './plugin/merge-affix-exceptions.js'
import {mergeAffixSymbol} from './plugin/merge-affix-symbol.js'
import {breakImplicitSentences} from './plugin/break-implicit-sentences.js'
import {makeFinalWhiteSpaceSiblings} from './plugin/make-final-white-space-siblings.js'
import {makeInitialWhiteSpaceSiblings} from './plugin/make-initial-white-space-siblings.js'
import {mergeFinalWordSymbol} from './plugin/merge-final-word-symbol.js'
import {mergeInitialDigitSentences} from './plugin/merge-initial-digit-sentences.js'
import {mergeInitialLowerCaseLetterSentences} from './plugin/merge-initial-lower-case-letter-sentences.js'
import {mergeInitialWordSymbol} from './plugin/merge-initial-word-symbol.js'
import {mergeInitialisms} from './plugin/merge-initialisms.js'
import {mergeInnerWordSymbol} from './plugin/merge-inner-word-symbol.js'
import {mergeInnerWordSlash} from './plugin/merge-inner-word-slash.js'
import {mergeNonWordSentences} from './plugin/merge-non-word-sentences.js'
import {mergePrefixExceptions} from './plugin/merge-prefix-exceptions.js'
import {mergeRemainingFullStops} from './plugin/merge-remaining-full-stops.js'
import {removeEmptyNodes} from './plugin/remove-empty-nodes.js'
import {patchPosition} from './plugin/patch-position.js'
import {
  newLine,
  punctuation,
  surrogates,
  terminalMarker,
  whiteSpace,
  word
} from './expressions.js'

// PARSE LATIN

/**
 * Create a new parser.
 */
export class ParseLatin {
  /**
   * Create a new parser.
   *
   * This additionally supports `retext`-like call: where an instance is
   * created for each file, and the file is given on construction.
   *
   * @param {string | null | undefined} [doc]
   *   Value to parse (optional).
   * @param {VFile | null | undefined} [file]
   *   Corresponding file (optional).
   */
  constructor(doc, file) {
    const value = file || doc

    /** @type {string | undefined} */
    this.doc = value ? String(value) : undefined

    /** @type {Array<Plugin<Root>>} */
    this.tokenizeRootPlugins = [...this.tokenizeRootPlugins]
    /** @type {Array<Plugin<Paragraph>>} */
    this.tokenizeParagraphPlugins = [...this.tokenizeParagraphPlugins]
    /** @type {Array<Plugin<Sentence>>} */
    this.tokenizeSentencePlugins = [...this.tokenizeSentencePlugins]
  }

  /**
   * Turn natural language into a syntax tree.
   *
   * @param {string | null | undefined} [value]
   *   Value to parse (optional).
   * @returns {Root}
   *   Tree.
   */
  parse(value) {
    return this.tokenizeRoot(value || this.doc)
  }

  /**
   * Parse as a root.
   *
   * @param {string | null | undefined} [value]
   *   Value to parse (optional).
   * @returns {Root}
   *   Built tree.
   */
  tokenizeRoot(value) {
    const paragraph = this.tokenizeParagraph(value)
    /** @type {Root} */
    const result = {
      type: 'RootNode',
      children: splitNode(paragraph, 'WhiteSpaceNode', newLine)
    }

    let index = -1
    while (this.tokenizeRootPlugins[++index]) {
      this.tokenizeRootPlugins[index](result)
    }

    return result
  }

  /**
   * Parse as a paragraph.
   *
   * @param {string | null | undefined} [value]
   *   Value to parse (optional).
   * @returns {Paragraph}
   *   Built tree.
   */
  tokenizeParagraph(value) {
    const sentence = this.tokenizeSentence(value)
    /** @type {Paragraph} */
    const result = {
      type: 'ParagraphNode',
      children: splitNode(sentence, 'PunctuationNode', terminalMarker)
    }

    let index = -1
    while (this.tokenizeParagraphPlugins[++index]) {
      this.tokenizeParagraphPlugins[index](result)
    }

    return result
  }

  /**
   * Parse as a sentence.
   *
   * @param {string | null | undefined} [value]
   *   Value to parse (optional).
   * @returns {Sentence}
   *   Built tree.
   */
  tokenizeSentence(value) {
    const children = this.tokenize(value)
    /** @type {Sentence} */
    const result = {type: 'SentenceNode', children}

    let index = -1
    while (this.tokenizeSentencePlugins[++index]) {
      this.tokenizeSentencePlugins[index](result)
    }

    return result
  }

  /**
   *  Transform a `value` into a list of nlcsts.
   *
   * @param {string | null | undefined} [value]
   *   Value to parse (optional).
   * @returns {Array<SentenceContent>}
   *   Built sentence content.
   */
  tokenize(value) {
    /** @type {Array<SentenceContent>} */
    const children = []

    if (!value) {
      return children
    }

    const currentPoint = {line: 1, column: 1, offset: 0}
    let from = 0
    let index = 0
    let start = {...currentPoint}
    /** @type {SentenceContent['type'] | undefined} */
    let previousType
    /** @type {string | undefined} */
    let previous

    while (index < value.length) {
      const current = value.charAt(index)
      const currentType = whiteSpace.test(current)
        ? 'WhiteSpaceNode'
        : punctuation.test(current)
        ? 'PunctuationNode'
        : word.test(current)
        ? 'WordNode'
        : 'SymbolNode'

      if (
        from < index &&
        previousType &&
        currentType &&
        !(
          previousType === currentType &&
          // Words or white space continue.
          (previousType === 'WordNode' ||
            previousType === 'WhiteSpaceNode' ||
            // Same character of punctuation or symbol also continues.
            current === previous ||
            // Surrogates of  punctuation or symbol also continue.
            surrogates.test(current))
        )
      ) {
        // Flush the previous queue.
        children.push(createNode(previousType, value.slice(from, index)))
        from = index
        start = {...currentPoint}
      }

      if (current === '\r' || (current === '\n' && previous !== '\r')) {
        currentPoint.line++
        currentPoint.column = 1
      } else if (current !== '\n') {
        currentPoint.column++
      }

      currentPoint.offset++
      previousType = currentType
      previous = current
      index++
    }

    if (previousType && from < index) {
      children.push(createNode(previousType, value.slice(from, index)))
    }

    return children

    /**
     * @param {SentenceContent['type']} type
     *   Node type to build.
     * @param {string} value
     *   Value.
     * @returns {SentenceContent}
     *   Node.
     */
    function createNode(type, value) {
      return type === 'WordNode'
        ? {
            type: 'WordNode',
            children: [
              {
                type: 'TextNode',
                value,
                position: {start, end: {...currentPoint}}
              }
            ],
            position: {start, end: {...currentPoint}}
          }
        : {type, value, position: {start, end: {...currentPoint}}}
    }
  }
}

/**
 * List of transforms handling a sentence.
 */
ParseLatin.prototype.tokenizeSentencePlugins = [
  mergeInitialWordSymbol,
  mergeFinalWordSymbol,
  mergeInnerWordSymbol,
  mergeInnerWordSlash,
  mergeInitialisms,
  patchPosition
]

/**
 * List of transforms handling a paragraph.
 */
ParseLatin.prototype.tokenizeParagraphPlugins = [
  mergeNonWordSentences,
  mergeAffixSymbol,
  mergeInitialLowerCaseLetterSentences,
  mergeInitialDigitSentences,
  mergePrefixExceptions,
  mergeAffixExceptions,
  mergeRemainingFullStops,
  makeInitialWhiteSpaceSiblings,
  makeFinalWhiteSpaceSiblings,
  breakImplicitSentences,
  removeEmptyNodes,
  patchPosition
]

/**
 * List of transforms handling a root.
 */
ParseLatin.prototype.tokenizeRootPlugins = [
  makeInitialWhiteSpaceSiblings,
  makeFinalWhiteSpaceSiblings,
  removeEmptyNodes,
  patchPosition
]

/**
 * A function that splits one node into several nodes.
 *
 * @template {Parents} Node
 *   Node type.
 * @param {Node} node
 *   Node to split.
 * @param {RegExp} expression
 *   Split on this regex.
 * @param {Node['children'][number]['type']} childType
 *   Split this node type.
 * @returns {Array<Node>}
 *   The given node, split into several nodes.
 */
function splitNode(node, childType, expression) {
  /** @type {Array<Node>} */
  const result = []
  let index = -1
  let start = 0

  while (++index < node.children.length) {
    const token = node.children[index]

    if (
      index === node.children.length - 1 ||
      (token.type === childType && expression.test(toString(token)))
    ) {
      /** @type {Node} */
      // @ts-expect-error: fine
      const parent = {
        type: node.type,
        children: node.children.slice(start, index + 1)
      }

      const first = node.children[start]
      const last = token
      if (first.position && last.position) {
        parent.position = {
          start: first.position.start,
          end: last.position.end
        }
      }

      result.push(parent)
      start = index + 1
    }
  }

  return result
}
