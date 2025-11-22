/**
 * Check that the given `node` matches `selector`.
 *
 * This only checks the element itself, not the surrounding tree.
 * Thus, nesting in selectors is not supported (`p b`, `p > b`), neither are
 * selectors like `:first-child`, etc.
 * This only checks that the given element matches the selector.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [node]
 *   Node that might match `selector`, should be an element (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {boolean}
 *   Whether `node` matches `selector`.
 */
export function matches(selector: string, node?: Nodes | null | undefined, space?: Space | null | undefined): boolean;
/**
 * Select the first element that matches `selector` in the given `tree`.
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [tree]
 *   Tree to search (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {Element | undefined}
 *   First element in `tree` that matches `selector` or `undefined` if nothing
 *   is found; this could be `tree` itself.
 */
export function select(selector: string, tree?: Nodes | null | undefined, space?: Space | null | undefined): Element | undefined;
/**
 * Select all elements that match `selector` in the given `tree`.
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`h1`, `a, b`).
 * @param {Nodes | null | undefined} [tree]
 *   Tree to search (optional).
 * @param {Space | null | undefined} [space='html']
 *   Name of namespace (default: `'html'`).
 * @returns {Array<Element>}
 *   Elements in `tree` that match `selector`.
 *   This could include `tree` itself.
 */
export function selectAll(selector: string, tree?: Nodes | null | undefined, space?: Space | null | undefined): Array<Element>;
/**
 * Name of namespace.
 */
export type Space = "html" | "svg";
/**
 * Direction.
 */
export type Direction = "auto" | "ltr" | "rtl";
/**
 * Current state.
 */
export type State = {
    /**
     *   Current direction.
     */
    direction: Direction;
    /**
     *   Whether we’re in `contentEditable`.
     */
    editableOrEditingHost: boolean;
    /**
     *   Track siblings: there are `n` siblings.
     */
    elementCount: number | undefined;
    /**
     *   Track siblings: this current element has `n` elements before it.
     */
    elementIndex: number | undefined;
    /**
     *   Whether we found at least one match.
     */
    found: boolean;
    /**
     *   Current language.
     */
    language: string | undefined;
    /**
     *   Whether we can stop looking after we found one element.
     */
    one: boolean;
    /**
     *   Matches.
     */
    results: Array<Element>;
    /**
     *   Original root selectors.
     */
    rootQuery: AstSelector;
    /**
     *   Current schema.
     */
    schema: Schema;
    /**
     *   Elements in scope.
     */
    scopeElements: Array<RootContent>;
    /**
     *   Whether we only allow selectors without nesting.
     */
    shallow: boolean;
    /**
     *   Track siblings: there are `n` siblings with this element’s tag name.
     */
    typeCount: number | undefined;
    /**
     *   Track siblings: this current element has `n` elements with its tag name
     *   before it.
     */
    typeIndex: number | undefined;
};
import type { Nodes } from 'hast';
import type { Element } from 'hast';
import type { AstSelector } from 'css-selector-parser';
import type { Schema } from 'property-information';
import type { RootContent } from 'hast';
//# sourceMappingURL=index.d.ts.map