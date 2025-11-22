/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'

// Merge a sentence into its previous sentence, when the sentence starts with a
// comma.
export const mergeAffixExceptions = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph>}
   */
  function (child, index, parent) {
    const previous = parent.children[index - 1]

    if (
      previous &&
      'children' in previous &&
      'children' in child &&
      child.children.length > 0
    ) {
      let position = -1

      while (child.children[++position]) {
        const node = child.children[position]

        if (node.type === 'WordNode') {
          return
        }

        if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
          const value = toString(node)

          if (value !== ',' && value !== ';') {
            return
          }

          previous.children.push(...child.children)

          // Update position.
          if (previous.position && child.position) {
            previous.position.end = child.position.end
          }

          parent.children.splice(index, 1)

          // Next, iterate over the node *now* at the current position.
          return index
        }
      }
    }
  }
)
