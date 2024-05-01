/// <reference types="mdast" />
import { h } from 'hastscript'

/**
 * Creates an admonition component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} [properties.title] - An optional title.
 * @param {('tip'|'note'|'important'|'caution'|'warning')} type - The admonition type.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created admonition component.
 */
export function AdmonitionComponent(properties, children, type) {
 if (!Array.isArray(children) || children.length === 0)
  return h("div",
    { class: 'hidden' },
    'Invalid admonition directive. (Admonition directives must be of block type ":::note{name="name"} <content> :::")'
  );

  const title = properties?.title;

  return h(`blockquote`,
    { class: `admonition bdm-${type}` },
    [ h("span", { class: `bdm-title` }, title ? title : type.toUpperCase()), ...children] 
  );
}