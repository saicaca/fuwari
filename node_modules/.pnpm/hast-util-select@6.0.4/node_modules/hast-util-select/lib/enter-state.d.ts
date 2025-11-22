/**
 * Enter a node.
 *
 * The caller is responsible for calling the return value `exit`.
 *
 * @param {State} state
 *   Current state.
 *
 *   Will be mutated: `exit` undos the changes.
 * @param {Nodes} node
 *   Node to enter.
 * @returns {() => undefined}
 *   Call to exit.
 */
export function enterState(state: State, node: Nodes): () => undefined;
import type { State } from './index.js';
import type { Nodes } from 'hast';
//# sourceMappingURL=enter-state.d.ts.map