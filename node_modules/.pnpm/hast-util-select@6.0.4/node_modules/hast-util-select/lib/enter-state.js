/**
 * @import {Visitor} from 'unist-util-visit'
 * @import {ElementContent, Nodes} from 'hast'
 * @import {Direction, State} from './index.js'
 */

import {direction} from 'direction'
import {toString} from 'hast-util-to-string'
import {svg} from 'property-information'
import {EXIT, SKIP, visit} from 'unist-util-visit'

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
// eslint-disable-next-line complexity
export function enterState(state, node) {
  const schema = state.schema
  const language = state.language
  const currentDirection = state.direction
  const editableOrEditingHost = state.editableOrEditingHost
  /** @type {Direction | undefined} */
  let directionInferred

  if (node.type === 'element') {
    const lang = node.properties.xmlLang || node.properties.lang
    const type = node.properties.type || 'text'
    const direction = directionProperty(node)

    if (lang !== null && lang !== undefined) {
      state.language = String(lang)
    }

    if (schema && schema.space === 'html') {
      if (node.properties.contentEditable === 'true') {
        state.editableOrEditingHost = true
      }

      if (node.tagName === 'svg') {
        state.schema = svg
      }

      // See: <https://html.spec.whatwg.org/#the-directionality>.
      // Explicit `[dir=rtl]`.
      if (direction === 'rtl') {
        directionInferred = direction
      } else if (
        // Explicit `[dir=ltr]`.
        direction === 'ltr' ||
        // HTML with an invalid or no `[dir]`.
        (direction !== 'auto' && node.tagName === 'html') ||
        // `input[type=tel]` with an invalid or no `[dir]`.
        (direction !== 'auto' && node.tagName === 'input' && type === 'tel')
      ) {
        directionInferred = 'ltr'
        // `[dir=auto]` or `bdi` with an invalid or no `[dir]`.
      } else if (direction === 'auto' || node.tagName === 'bdi') {
        if (node.tagName === 'textarea') {
          // Check contents of `<textarea>`.
          directionInferred = directionBidi(toString(node))
        } else if (
          node.tagName === 'input' &&
          (type === 'email' ||
            type === 'search' ||
            type === 'tel' ||
            type === 'text')
        ) {
          // Check value of `<input>`.
          directionInferred = node.properties.value
            ? directionBidi(String(node.properties.value))
            : 'ltr'
        } else {
          // Check text nodes in `node`.
          visit(node, inferDirectionality)
        }
      }

      if (directionInferred) {
        state.direction = directionInferred
      }
    }
    // Turn off editing mode in non-HTML spaces.
    else if (state.editableOrEditingHost) {
      state.editableOrEditingHost = false
    }
  }

  return reset

  /**
   * @returns {undefined}
   *   Nothing.
   */
  function reset() {
    state.schema = schema
    state.language = language
    state.direction = currentDirection
    state.editableOrEditingHost = editableOrEditingHost
  }

  /** @type {Visitor<ElementContent>} */
  function inferDirectionality(child) {
    if (child.type === 'text') {
      directionInferred = directionBidi(child.value)
      return directionInferred ? EXIT : undefined
    }

    if (
      child !== node &&
      child.type === 'element' &&
      (child.tagName === 'bdi' ||
        child.tagName === 'script' ||
        child.tagName === 'style' ||
        child.tagName === 'textare' ||
        directionProperty(child))
    ) {
      return SKIP
    }
  }
}

/**
 * See `wooorm/direction`.
 *
 * @param {string} value
 *   Value to check.
 * @returns {Exclude<Direction, 'auto'> | undefined}
 *   Directionality.
 */
function directionBidi(value) {
  const result = direction(value)
  return result === 'neutral' ? undefined : result
}

/**
 * @param {ElementContent} node
 *   Node to check.
 * @returns {Direction | undefined}
 *   Directionality.
 */
function directionProperty(node) {
  const value =
    node.type === 'element' && typeof node.properties.dir === 'string'
      ? node.properties.dir.toLowerCase()
      : undefined

  return value === 'auto' || value === 'ltr' || value === 'rtl'
    ? value
    : undefined
}
