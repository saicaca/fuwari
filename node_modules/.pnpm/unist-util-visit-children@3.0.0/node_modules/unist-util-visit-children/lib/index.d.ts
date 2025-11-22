/**
 * @typedef {import('unist').Parent} Parent
 */
/**
 * @template {Parent} Kind
 *   Node type.
 * @callback Visitor
 *   Callback called for each `child` in `parent` later given to `visit`.
 * @param {Kind['children'][number]} child
 *   Child of parent.
 * @param {number} index
 *   Position of `child` in parent.
 * @param {Kind} parent
 *   Parent node.
 * @returns {undefined}
 *   Nothing.
 */
/**
 * @template {Parent} Kind
 *   Node type.
 * @callback Visit
 *   Function to call the bound `visitor` for each child in `parent`.
 * @param {Kind} node
 *   Parent node.
 * @returns {undefined}
 *   Nothing.
 */
/**
 * Wrap `visitor` to be called for each child in the nodes later given to
 * `visit`.
 *
 * @template {Parent} Kind
 *   Node type.
 * @param {Visitor<Kind>} visitor
 *   Callback called for each `child` in `parent` later given to `visit`.
 * @returns {Visit<Kind>}
 *   Function to call the bound `visitor` for each child in `parent`.
 */
export function visitChildren<Kind extends import("unist").Parent>(visitor: Visitor<Kind>): Visit<Kind>;
export type Parent = import('unist').Parent;
/**
 * Callback called for each `child` in `parent` later given to `visit`.
 */
export type Visitor<Kind extends import("unist").Parent> = (child: Kind['children'][number], index: number, parent: Kind) => undefined;
/**
 * Function to call the bound `visitor` for each child in `parent`.
 */
export type Visit<Kind extends import("unist").Parent> = (node: Kind) => undefined;
