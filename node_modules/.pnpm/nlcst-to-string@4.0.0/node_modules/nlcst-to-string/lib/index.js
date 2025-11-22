/**
 * @typedef {import('nlcst').Nodes} Nodes
 */

/** @type {Readonly<Array<Nodes>>} */
const emptyNodes = []

/**
 * Get the text content of a node or list of nodes.
 *
 * Prefers the node’s plain-text fields, otherwise serializes its children, and
 * if the given value is an array, serialize the nodes in it.
 *
 * @param {Array<Nodes> | Nodes} value
 *   Node or list of nodes to serialize.
 * @returns {string}
 *   Result.
 */
export function toString(value) {
  let index = -1

  if (!value || (!Array.isArray(value) && !value.type)) {
    throw new Error('Expected node, not `' + value + '`')
  }

  if ('value' in value) return value.value

  const children = (Array.isArray(value) ? value : value.children) || emptyNodes

  /** @type {Array<string>} */
  const values = []

  while (++index < children.length) {
    values[index] = toString(children[index])
  }

  return values.join('')
}
