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
export function toString(value: Array<Nodes> | Nodes): string;
export type Nodes = import('nlcst').Nodes;
