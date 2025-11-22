import { Element } from 'hast';
export { Element, ElementContent, Node, Nodes, Parent, Parents, Properties, Root } from 'hast';
export { toHtml } from 'hast-util-to-html';
export { toText } from 'hast-util-to-text';
export { matches, select, selectAll } from 'hast-util-select';
export { visit } from 'unist-util-visit';
export { CONTINUE, EXIT, SKIP, visitParents } from 'unist-util-visit-parents';
export { h, s } from 'hastscript';

/**
 * Sets a property on the given AST node.
 *
 * You can set the value to `null` to remove the property.
 */
declare function setProperty(node: Element, propertyName: string, value: string | string[] | null): void;
/**
 * Retrieves an array of class names from the given AST node.
 */
declare function getClassNames(node: Element): string[];
/**
 * Adds a class name to the given AST node.
 *
 * If the class name already exists on the node, it will not be added again.
 */
declare function addClassName(node: Element, className: string): void;
/**
 * Removes a class name from the given AST node.
 *
 * If the class name does not exist on the node, nothing will be changed.
 */
declare function removeClassName(node: Element, className: string): void;
/**
 * If the given node has a `style` attribute, parses it and returns a map of its styles.
 *
 * If the node has no `style` attribute, an empty map is returned.
 */
declare function getInlineStyles(node: Element): Map<string, string>;
/**
 * Sets the `style` attribute on the given node to the given styles.
 *
 * Any existing styles will be overwritten.
 */
declare function setInlineStyles(node: Element, styles: Map<string, string>): void;
/**
 * Sets a single inline style property on the given node.
 *
 * You can set the value to an empty string or `null` to remove the property.
 *
 * Use `valueFormat` to specify how the value should be serialized:
 * - `'raw'`: The value is used as-is. This is the default.
 * - `'string'`: The value is serialized as a CSS string value, escaping special characters.
 */
declare function setInlineStyle(node: Element, cssProperty: string, value: string | null, valueFormat?: 'raw' | 'string'): void;

export { addClassName, getClassNames, getInlineStyles, removeClassName, setInlineStyle, setInlineStyles, setProperty };
