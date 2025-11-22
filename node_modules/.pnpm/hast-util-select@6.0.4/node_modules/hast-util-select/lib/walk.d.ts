/**
 * Walk a tree.
 *
 * @param {State} state
 *   State.
 * @param {Nodes | undefined} tree
 *   Tree.
 */
export function walk(state: State, tree: Nodes | undefined): void;
/**
 * Info on elements in a parent.
 */
export type Counts = {
    /**
     *   Number of elements.
     */
    count: number;
    /**
     *   Number of elements by tag name.
     */
    types: Map<string, number>;
};
/**
 * Rule sets by nesting.
 */
export type Nest = {
    /**
     *   `a + b`
     */
    adjacentSibling: Array<AstRule> | undefined;
    /**
     *   `a b`
     */
    descendant: Array<AstRule> | undefined;
    /**
     *   `a > b`
     */
    directChild: Array<AstRule> | undefined;
    /**
     *   `a ~ b`
     */
    generalSibling: Array<AstRule> | undefined;
};
import type { State } from './index.js';
import type { Nodes } from 'hast';
import type { AstRule } from 'css-selector-parser';
//# sourceMappingURL=walk.d.ts.map