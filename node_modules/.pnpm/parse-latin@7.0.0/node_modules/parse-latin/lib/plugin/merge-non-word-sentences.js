/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 */

import {modifyChildren} from 'unist-util-modify-children'

// Merge a sentence into the following sentence, when the sentence does not
// contain word tokens.
export const mergeNonWordSentences = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph>}
   */
  function (child, index, parent) {
    if ('children' in child) {
      let position = -1

      while (child.children[++position]) {
        if (child.children[position].type === 'WordNode') {
          return
        }
      }

      const previous = parent.children[index - 1]

      if (previous && 'children' in previous) {
        previous.children.push(...child.children)

        // Remove the child.
        parent.children.splice(index, 1)

        // Patch position.
        if (previous.position && child.position) {
          previous.position.end = child.position.end
        }

        // Next, iterate over the node *now* at the current position (which was the
        // next node).
        return index
      }

      const next = parent.children[index + 1]

      if (next && 'children' in next) {
        next.children.unshift(...child.children)

        // Patch position.
        if (next.position && child.position) {
          next.position.start = child.position.start
        }

        // Remove the child.
        parent.children.splice(index, 1)
      }
    }
  }
)
