/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'
// Closing or final punctuation, or terminal markers that should still be
// included in the previous sentence, even though they follow the sentence’s
// terminal marker.
import {affixSymbol} from '../expressions.js'

// Move certain punctuation following a terminal marker (thus in the next
// sentence) to the previous sentence.
export const mergeAffixSymbol = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph>}
   */
  function (child, index, parent) {
    if ('children' in child && child.children.length > 0 && index > 0) {
      const previous = parent.children[index - 1]
      const first = child.children[0]
      const second = child.children[1]

      if (
        previous &&
        previous.type === 'SentenceNode' &&
        (first.type === 'SymbolNode' || first.type === 'PunctuationNode') &&
        affixSymbol.test(toString(first))
      ) {
        child.children.shift() // Remove `first`.
        previous.children.push(first)

        // Update position.
        if (first.position && previous.position) {
          previous.position.end = first.position.end
        }

        if (second && second.position && child.position) {
          child.position.start = second.position.start
        }

        // Next, iterate over the previous node again.
        return index - 1
      }
    }
  }
)
