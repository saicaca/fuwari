/**
 * @typedef {import('nlcst').Sentence} Sentence
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'
import {numerical} from '../expressions.js'

// Merge initialisms.
export const mergeInitialisms = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Sentence>}
   */
  function (child, index, parent) {
    if (
      index > 0 &&
      child.type === 'PunctuationNode' &&
      toString(child) === '.'
    ) {
      const previous = parent.children[index - 1]

      if (
        previous.type === 'WordNode' &&
        previous.children &&
        previous.children.length !== 1 &&
        previous.children.length % 2 !== 0
      ) {
        let position = previous.children.length
        let isAllDigits = true

        while (previous.children[--position]) {
          const otherChild = previous.children[position]

          const value = toString(otherChild)

          if (position % 2 === 0) {
            // Initialisms consist of one character values.
            if (value.length > 1) {
              return
            }

            if (!numerical.test(value)) {
              isAllDigits = false
            }
          } else if (value !== '.') {
            if (position < previous.children.length - 2) {
              break
            } else {
              return
            }
          }
        }

        if (!isAllDigits) {
          // Remove `child` from parent.
          parent.children.splice(index, 1)

          // Add child to the previous children.
          previous.children.push(child)

          // Update position.
          if (previous.position && child.position) {
            previous.position.end = child.position.end
          }

          // Next, iterate over the node *now* at the current position.
          return index
        }
      }
    }
  }
)
