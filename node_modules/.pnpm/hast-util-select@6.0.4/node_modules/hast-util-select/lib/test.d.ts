/**
 * Test a rule.
 *
 * @param {AstRule} query
 *   AST rule (with `pseudoClasses`).
 * @param {Element} element
 *   Element.
 * @param {number | undefined} index
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} parent
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
export function test(query: AstRule, element: Element, index: number | undefined, parent: Parents | undefined, state: State): boolean;
import type { AstRule } from 'css-selector-parser';
import type { Element } from 'hast';
import type { Parents } from 'hast';
import type { State } from './index.js';
//# sourceMappingURL=test.d.ts.map