/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('nlcst').Paragraph} Paragraph
 * @typedef {import('unist').Position} Position
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Sentence} Sentence
 */

import {visitChildren} from 'unist-util-visit-children'

// Patch the position on a parent node based on its first and last child.
export const patchPosition = visitChildren(
  /**
   * @type {import('unist-util-visit-children').Visitor<Paragraph | Root | Sentence>}
   */
  function (child, index, node) {
    const siblings = node.children

    if (
      child.position &&
      index < 1 &&
      /* c8 ignore next */
      (!node.position || !node.position.start)
    ) {
      patch(node)
      node.position.start = child.position.start
    }

    if (
      child.position &&
      index === siblings.length - 1 &&
      (!node.position || !node.position.end)
    ) {
      patch(node)
      node.position.end = child.position.end
    }
  }
)

/**
 * @param {Node} node
 * @returns {asserts node is Node & {position: Position}}
 */
function patch(node) {
  if (!node.position) {
    // @ts-expect-error: fine, we’ll fill it later.
    node.position = {}
  }
}
