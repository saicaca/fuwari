/**
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').SentenceContent} SentenceContent
 * @typedef {import('nlcst').WordContent} WordContent
 */

import {toString} from 'nlcst-to-string'
import {modifyChildren} from 'unist-util-modify-children'

// Merge words joined by certain punctuation marks.
export const mergeInnerWordSlash = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Sentence>}
   */
  function (child, index, parent) {
    const siblings = parent.children
    const previous = siblings[index - 1]

    if (
      previous &&
      previous.type === 'WordNode' &&
      (child.type === 'SymbolNode' || child.type === 'PunctuationNode') &&
      toString(child) === '/'
    ) {
      const previousValue = toString(previous)
      /** @type {SentenceContent} */
      let tail = child
      /** @type {Array<WordContent>} */
      const queue = [child]
      let count = 1
      let nextValue = ''
      const next = siblings[index + 1]

      if (next && next.type === 'WordNode') {
        nextValue = toString(next)
        tail = next
        queue.push(...next.children)
        count++
      }

      if (previousValue.length < 3 && (!nextValue || nextValue.length < 3)) {
        // Add all found tokens to `prev`s children.
        previous.children.push(...queue)

        siblings.splice(index, count)

        // Update position.
        if (previous.position && tail.position) {
          previous.position.end = tail.position.end
        }

        // Next, iterate over the node *now* at the current position.
        return index
      }
    }
  }
)
