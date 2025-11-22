/**
 * @typedef {import('nlcst').Paragraph} Paragraph
 * @typedef {import('nlcst').Root} Root
 */

import {visitChildren} from 'unist-util-visit-children'

// Move white space starting a sentence up, so they are the siblings of
// sentences.
export const makeInitialWhiteSpaceSiblings = visitChildren(
  /**
   * @type {import('unist-util-visit-children').Visitor<Paragraph | Root>}
   */
  function (child, index, parent) {
    if ('children' in child && child.children) {
      const head = child.children[0]
      if (head && head.type === 'WhiteSpaceNode') {
        child.children.shift()
        parent.children.splice(index, 0, head)
        const next = child.children[0]

        if (next && next.position && child.position) {
          child.position.start = next.position.start
        }
      }
    }
  }
)
