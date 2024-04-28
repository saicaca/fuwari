
import githubCardDirective from "./github-card.mjs"

/**
 * Array of handlers for remark directives.
 * @type {Array<Function>}
 */
export const remarkDirectiveHandlers = [
  githubCardDirective
]







/**
 * Object containing the types of directives.
 * @typedef {Object} DirectiveTypes
 * @property {string} container - Multiline containers (blocks with content)
 * 
 * `:::spoiler`
 * 
 * `Im your father`
 * 
 * `:::`
 * @property {string} leaf - Leafs (block without content).
 * 
 * `::youtube[Cat in a box]{vid=01ab2cd3efg}``
 * @property {string} text - Directives inside text (inline).
 * 
 * `:name[label]{attributes}`
 */

/**
 * Basic structure of a directive feature
 * @typedef {Object} DirectiveFeatureType
 * @property {"container" | "leaf" | "block" | string[]} type - The type of directive to search for
 * @property {string} nodeName - The name of the directive in the markdown
 * @property {Function} action - The "filter" function that changes the tree when the directive is found.
 */

/**
 * The types of generic markdown directives
 * 
 * https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
 * @type {DirectiveTypes}
 */
const directiveTypes = {
  container: "containerDirective",
  leaf: "leafDirective",
  text: "textDirective",
}