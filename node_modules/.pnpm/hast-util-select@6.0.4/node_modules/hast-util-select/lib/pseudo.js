/**
 * @import {AstPseudoClass} from 'css-selector-parser'
 * @import {default as NthCheck} from 'nth-check'
 * @import {ElementContent, Element, Parents} from 'hast'
 * @import {State} from './index.js'
 */

import {extendedFilter} from 'bcp-47-match'
import {parse as commas} from 'comma-separated-tokens'
import {ok as assert, unreachable} from 'devlop'
import {hasProperty} from 'hast-util-has-property'
import {whitespace} from 'hast-util-whitespace'
import fauxEsmNthCheck from 'nth-check'
import {zwitch} from 'zwitch'
import {walk} from './walk.js'

/** @type {NthCheck} */
// @ts-expect-error: types are broken.
const nthCheck = fauxEsmNthCheck.default || fauxEsmNthCheck

/** @type {(rule: AstPseudoClass, element: Element, index: number | undefined, parent: Parents | undefined, state: State) => boolean} */
export const pseudo = zwitch('name', {
  handlers: {
    'any-link': anyLink,
    blank,
    checked,
    dir,
    disabled,
    empty,
    enabled,
    'first-child': firstChild,
    'first-of-type': firstOfType,
    has,
    is,
    lang,
    'last-child': lastChild,
    'last-of-type': lastOfType,
    not,
    'nth-child': nthChild,
    'nth-last-child': nthLastChild,
    'nth-last-of-type': nthLastOfType,
    'nth-of-type': nthOfType,
    'only-child': onlyChild,
    'only-of-type': onlyOfType,
    optional,
    'read-only': readOnly,
    'read-write': readWrite,
    required,
    root,
    scope
  },
  invalid: invalidPseudo,
  unknown: unknownPseudo
})

/**
 * Check whether an element matches an `:any-link` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function anyLink(_, element) {
  return (
    (element.tagName === 'a' ||
      element.tagName === 'area' ||
      element.tagName === 'link') &&
    hasProperty(element, 'href')
  )
}

/**
 * @param {State} state
 *   State.
 * @param {AstPseudoClass} query
 *   Query.
 */
function assertDeep(state, query) {
  if (state.shallow) {
    throw new Error('Cannot use `:' + query.name + '` without parent')
  }
}

/**
 * Check whether an element matches a `:blank` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function blank(_, element) {
  return !someChildren(element, check)

  /**
   * @param {ElementContent} child
   * @returns {boolean}
   */
  function check(child) {
    return (
      child.type === 'element' || (child.type === 'text' && !whitespace(child))
    )
  }
}

/**
 * Check whether an element matches a `:checked` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function checked(_, element) {
  if (element.tagName === 'input' || element.tagName === 'menuitem') {
    return Boolean(
      (element.properties.type === 'checkbox' ||
        element.properties.type === 'radio') &&
        hasProperty(element, 'checked')
    )
  }

  if (element.tagName === 'option') {
    return hasProperty(element, 'selected')
  }

  return false
}

/**
 * Check whether an element matches a `:dir()` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
function dir(query, _1, _2, _3, state) {
  assert(query.argument, 'expected `argument`')
  assert(query.argument.type === 'String', 'expected plain text')
  return state.direction === query.argument.value
}

/**
 * Check whether an element matches a `:disabled` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function disabled(_, element) {
  return (
    (element.tagName === 'button' ||
      element.tagName === 'input' ||
      element.tagName === 'select' ||
      element.tagName === 'textarea' ||
      element.tagName === 'optgroup' ||
      element.tagName === 'option' ||
      element.tagName === 'menuitem' ||
      element.tagName === 'fieldset') &&
    hasProperty(element, 'disabled')
  )
}

/**
 * Check whether an element matches an `:empty` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function empty(_, element) {
  return !someChildren(element, check)

  /**
   * @param {ElementContent} child
   * @returns {boolean}
   */
  function check(child) {
    return child.type === 'element' || child.type === 'text'
  }
}

/**
 * Check whether an element matches an `:enabled` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function enabled(query, element) {
  return !disabled(query, element)
}

/**
 * Check whether an element matches a `:first-child` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function firstChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.elementIndex === 0
}

/**
 * Check whether an element matches a `:first-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function firstOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.typeIndex === 0
}

/**
 * @param {AstPseudoClass} query
 *   Query.
 * @returns {(value: number) => boolean}
 *   N.
 */
function getCachedNthCheck(query) {
  /** @type {(value: number) => boolean} */
  // @ts-expect-error: cache.
  let cachedFunction = query._cachedFn

  if (!cachedFunction) {
    const value = query.argument
    assert(value, 'expected `argument`')

    if (value.type !== 'Formula') {
      throw new Error(
        'Expected `nth` formula, such as `even` or `2n+1` (`of` is not yet supported)'
      )
    }

    cachedFunction = nthCheck(value.a + 'n+' + value.b)
    // @ts-expect-error: cache.
    query._cachedFn = cachedFunction
  }

  return cachedFunction
}

/**
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {number | undefined} _1
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _2
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function has(query, element, _1, _2, state) {
  assert(query.argument, 'expected `argument`')
  assert(query.argument.type === 'Selector', 'expected selector')

  /** @type {State} */
  const childState = {
    ...state,
    // Not found yet.
    found: false,
    // One result is enough.
    one: true,
    results: [],
    rootQuery: query.argument,
    scopeElements: [element],
    // Do walk deep.
    shallow: false
  }

  walk(childState, {type: 'root', children: element.children})

  return childState.results.length > 0
}

// Shouldn’t be called, parser gives correct data.
/* c8 ignore next 3 */
function invalidPseudo() {
  unreachable('Invalid pseudo-selector')
}

/**
 * Check whether an element `:is` further selectors.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {number | undefined} _1
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _2
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function is(query, element, _1, _2, state) {
  assert(query.argument, 'expected `argument`')
  assert(query.argument.type === 'Selector', 'expected selector')

  /** @type {State} */
  const childState = {
    ...state,
    // Not found yet.
    found: false,
    // One result is enough.
    one: true,
    results: [],
    rootQuery: query.argument,
    scopeElements: [element],
    // Do walk deep.
    shallow: false
  }

  walk(childState, element)

  return childState.results[0] === element
}

/**
 * Check whether an element matches a `:lang()` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function lang(query, _1, _2, _3, state) {
  assert(query.argument, 'expected `argument`')
  assert(query.argument.type === 'String', 'expected string')

  return (
    state.language !== '' &&
    state.language !== undefined &&
    extendedFilter(state.language, commas(query.argument.value)).length > 0
  )
}

/**
 * Check whether an element matches a `:last-child` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function lastChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return Boolean(
    state.elementCount && state.elementIndex === state.elementCount - 1
  )
}

/**
 * Check whether an element matches a `:last-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function lastOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return (
    typeof state.typeIndex === 'number' &&
    typeof state.typeCount === 'number' &&
    state.typeIndex === state.typeCount - 1
  )
}

/**
 * Check whether an element does `:not` match further selectors.
 *
 * @param {AstPseudoClass} query
 *   Query.
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
function not(query, element, index, parent, state) {
  return !is(query, element, index, parent, state)
}

/**
 * Check whether an element matches an `:nth-child` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function nthChild(query, _1, _2, _3, state) {
  const cachedFunction = getCachedNthCheck(query)
  assertDeep(state, query)
  return (
    typeof state.elementIndex === 'number' && cachedFunction(state.elementIndex)
  )
}

/**
 * Check whether an element matches an `:nth-last-child` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function nthLastChild(query, _1, _2, _3, state) {
  const cachedFunction = getCachedNthCheck(query)
  assertDeep(state, query)
  return Boolean(
    typeof state.elementCount === 'number' &&
      typeof state.elementIndex === 'number' &&
      cachedFunction(state.elementCount - state.elementIndex - 1)
  )
}

/**
 * Check whether an element matches a `:nth-last-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function nthLastOfType(query, _1, _2, _3, state) {
  const cachedFunction = getCachedNthCheck(query)
  assertDeep(state, query)
  return (
    typeof state.typeCount === 'number' &&
    typeof state.typeIndex === 'number' &&
    cachedFunction(state.typeCount - 1 - state.typeIndex)
  )
}

/**
 * Check whether an element matches an `:nth-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function nthOfType(query, _1, _2, _3, state) {
  const cachedFunction = getCachedNthCheck(query)
  assertDeep(state, query)
  return typeof state.typeIndex === 'number' && cachedFunction(state.typeIndex)
}

/**
 * Check whether an element matches an `:only-child` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function onlyChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.elementCount === 1
}

/**
 * Check whether an element matches an `:only-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} _1
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function onlyOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.typeCount === 1
}

/**
 * Check whether an element matches an `:optional` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function optional(query, element) {
  return !required(query, element)
}

/**
 * Check whether an element matches a `:read-only` pseudo.
 *
 * @param {AstPseudoClass} query
 *   Query.
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
function readOnly(query, element, index, parent, state) {
  return !readWrite(query, element, index, parent, state)
}

/**
 * Check whether an element matches a `:read-write` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {number | undefined} _1
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _2
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function readWrite(_, element, _1, _2, state) {
  return element.tagName === 'input' || element.tagName === 'textarea'
    ? !hasProperty(element, 'readOnly') && !hasProperty(element, 'disabled')
    : Boolean(state.editableOrEditingHost)
}

/**
 * Check whether an element matches a `:required` pseudo.
 *
 * @param {AstPseudoClass} _
 *   Query.
 * @param {Element} element
 *   Element.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function required(_, element) {
  return (
    (element.tagName === 'input' ||
      element.tagName === 'textarea' ||
      element.tagName === 'select') &&
    hasProperty(element, 'required')
  )
}

/**
 * Check whether an element matches a `:root` pseudo.
 *
 * @param {AstPseudoClass} _1
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} parent
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function root(_1, element, _2, parent, state) {
  return Boolean(
    (!parent || parent.type === 'root') &&
      state.schema &&
      (state.schema.space === 'html' || state.schema.space === 'svg') &&
      (element.tagName === 'html' || element.tagName === 'svg')
  )
}

/**
 * Check whether an element matches a `:scope` pseudo.
 *
 * @param {AstPseudoClass} _1
 *   Query.
 * @param {Element} element
 *   Element.
 * @param {number | undefined} _2
 *   Index of `element` in `parent`.
 * @param {Parents | undefined} _3
 *   Parent of `element`.
 * @param {State} state
 *   State.
 * @returns {boolean}
 *   Whether `element` matches `query`.
 */
function scope(_1, element, _2, _3, state) {
  return state.scopeElements.includes(element)
}

/**
 * Check children.
 *
 * @param {Element} element
 *   Element.
 * @param {(child: ElementContent) => boolean} check
 *   Check.
 * @returns {boolean}
 *   Whether a child of `element` matches `check`.
 */
function someChildren(element, check) {
  const children = element.children
  let index = -1

  while (++index < children.length) {
    if (check(children[index])) return true
  }

  return false
}

/**
 * @param {unknown} query_
 *   Query-like value.
 * @returns {never}
 *   Nothing.
 * @throws
 *   Exception.
 */
function unknownPseudo(query_) {
  // Runtime JS guarantees it has a `name`.
  const query = /** @type {AstPseudoClass} */ (query_)
  throw new Error('Unknown pseudo-selector `' + query.name + '`')
}
