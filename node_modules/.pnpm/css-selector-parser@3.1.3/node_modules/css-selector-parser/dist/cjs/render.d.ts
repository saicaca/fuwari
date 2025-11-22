import { AstEntity } from './ast.js';
/**
 * Renders CSS Selector AST back to a string.
 *
 * @example
 *
 * import {ast, render} from 'css-selector-parser';
 *
 * const selector = ast.selector({
 *     rules: [
 *         ast.rule({
 *             items: [
 *                 ast.tagName({name: 'a'}),
 *                 ast.id({name: 'user-23'}),
 *                 ast.className({name: 'user'}),
 *                 ast.pseudoClass({name: 'visited'}),
 *                 ast.pseudoElement({name: 'before'})
 *             ]
 *         })
 *     ]
 * });
 *
 * console.log(render(selector)); // a#user-23.user:visited::before
 */
export declare function render(entity: AstEntity): string;
