/**
 * Find definitions in `tree`.
 *
 * Uses CommonMark precedence, which means that earlier definitions are
 * preferred over duplicate later definitions.
 *
 * @param {Nodes} tree
 *   Tree to check.
 * @returns {GetDefinition}
 *   Getter.
 */
export function definitions(tree: Nodes): GetDefinition
export type Definition = import('mdast').Definition
export type Nodes = import('mdast').Nodes
/**
 * Get a definition by identifier.
 */
export type GetDefinition = (
  identifier?: string | null | undefined
) => Definition | undefined
