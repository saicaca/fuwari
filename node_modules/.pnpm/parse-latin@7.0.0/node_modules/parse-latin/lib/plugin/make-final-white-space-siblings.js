/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 * @typedef {import('nlcst').Root} Root
 */

import {modifyChildren} from 'unist-util-modify-children'

// Move white space ending a paragraph up, so they are the siblings of
// paragraphs.
export const makeFinalWhiteSpaceSiblings = modifyChildren(
  /**
   * @type {import('unist-util-modify-children').Modifier<Paragraph | Root>}
   */

  function (child, index, parent) {
    if ('children' in child) {
      const tail = child.children[child.children.length - 1]

      if (tail && tail.type === 'WhiteSpaceNode') {
        child.children.pop() // Remove `tail`.
        parent.children.splice(index + 1, 0, tail)
        const previous = child.children[child.children.length - 1]

        if (previous && previous.position && child.position) {
          child.position.end = previous.position.end
        }

        // Next, iterate over the current node again.
        return index
      }
    }
  }
)
