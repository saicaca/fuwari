/**
 * @import {AstAttribute} from 'css-selector-parser'
 * @import {Element, Properties} from 'hast'
 * @import {Info, Schema} from 'property-information'
 */

import {stringify as commas} from 'comma-separated-tokens'
import {ok as assert} from 'devlop'
import {find} from 'property-information'
import * as spaces from 'space-separated-tokens'

/**
 * @param {AstAttribute} query
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {Schema} schema
 *   Schema of element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
export function attribute(query, element, schema) {
  const info = find(schema, query.name)
  const propertyValue = element.properties[info.property]
  let value = normalizeValue(propertyValue, info)

  // Exists.
  if (!query.value) {
    return value !== undefined
  }

  assert(query.value.type === 'String', 'expected plain string')
  let key = query.value.value

  // Case-sensitivity.
  if (query.caseSensitivityModifier === 'i') {
    key = key.toLowerCase()

    if (value) {
      value = value.toLowerCase()
    }
  }

  if (value !== undefined) {
    switch (query.operator) {
      // Exact.
      case '=': {
        return key === value
      }

      // Ends.
      case '$=': {
        return key === value.slice(-key.length)
      }

      // Contains.
      case '*=': {
        return value.includes(key)
      }

      // Begins.
      case '^=': {
        return key === value.slice(0, key.length)
      }

      // Exact or prefix.
      case '|=': {
        return (
          key === value ||
          (key === value.slice(0, key.length) &&
            value.charAt(key.length) === '-')
        )
      }

      // Space-separated list.
      case '~=': {
        return (
          // For all other values (including comma-separated lists), return whether this
          // is an exact match.
          key === value ||
          // If this is a space-separated list, and the query is contained in it, return
          // true.
          spaces.parse(value).includes(key)
        )
      }
      // Other values are not yet supported by CSS.
      // No default
    }
  }

  return false
}

/**
 *
 * @param {Properties[keyof Properties]} value
 * @param {Info} info
 * @returns {string | undefined}
 */
function normalizeValue(value, info) {
  if (value === null || value === undefined) {
    // Empty.
  } else if (typeof value === 'boolean') {
    if (value) {
      return info.attribute
    }
  } else if (Array.isArray(value)) {
    if (value.length > 0) {
      return (info.commaSeparated ? commas : spaces.stringify)(value)
    }
  } else {
    return String(value)
  }
}
