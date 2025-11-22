/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'
import {digitStart} from '../expressions.js'

// Merge a sentence into its previous sentence, when the sentence starts with a
// lower case letter.
export const mergeInitialDigitSentences = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph>}
   */
  function (child, index, parent) {
    const previous = parent.children[index - 1]

    if (
      previous &&
      previous.type === 'SentenceNode' &&
      child.type === 'SentenceNode'
    ) {
      const head = child.children[0]

      if (head && head.type === 'WordNode' && digitStart.test(toString(head))) {
        previous.children.push(...child.children)
        parent.children.splice(index, 1)

        // Update position.
        if (previous.position && child.position) {
          previous.position.end = child.position.end
        }

        // Next, iterate over the node *now* at the current position.
        return index
      }
    }
  }
)
