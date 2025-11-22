/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'
// Initial lowercase letter.
import {lowerInitial} from '../expressions.js'

// Merge a sentence into its previous sentence, when the sentence starts with a
// lower case letter.
export const mergeInitialLowerCaseLetterSentences = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph>}
   */
  function (child, index, parent) {
    if (child.type === 'SentenceNode' && index > 0) {
      const previous = parent.children[index - 1]
      const children = child.children

      if (children.length > 0 && previous.type === 'SentenceNode') {
        let position = -1

        while (children[++position]) {
          const node = children[position]

          if (node.type === 'WordNode') {
            if (!lowerInitial.test(toString(node))) {
              return
            }

            previous.children.push(...children)

            parent.children.splice(index, 1)

            // Update position.
            if (previous.position && child.position) {
              previous.position.end = child.position.end
            }

            // Next, iterate over the node *now* at the current position.
            return index
          }

          if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
            return
          }
        }
      }
    }
  }
)
