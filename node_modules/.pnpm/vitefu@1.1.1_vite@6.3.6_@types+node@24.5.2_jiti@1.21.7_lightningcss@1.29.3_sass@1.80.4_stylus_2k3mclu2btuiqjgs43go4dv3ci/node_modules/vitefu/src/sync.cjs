// contains synchronous API only so it can be exported as CJS and ESM

/** @type {import('./index.d.ts').isDepIncluded} */
function isDepIncluded(dep, optimizeDepsInclude) {
  return optimizeDepsInclude.some((id) => parseIncludeStr(id) === dep)
}

/** @type {import('./index.d.ts').isDepExcluded} */
function isDepExcluded(dep, optimizeDepsExclude) {
  dep = parseIncludeStr(dep)
  return optimizeDepsExclude.some(
    (id) => id === dep || dep.startsWith(`${id}/`)
  )
}

/** @type {import('./index.d.ts').isDepNoExternaled} */
function isDepNoExternaled(dep, ssrNoExternal) {
  if (ssrNoExternal === true) {
    return true
  } else {
    return isMatch(dep, ssrNoExternal)
  }
}

/** @type {import('./index.d.ts').isDepExternaled} */
function isDepExternaled(dep, ssrExternal) {
  // If `ssrExternal` is `true`, it just means that all linked
  // dependencies should also be externalized by default. It doesn't
  // mean that a dependency is being explicitly externalized. So we
  // return `false` in this case.
  // @ts-expect-error can be true in Vite 6
  if (ssrExternal === true) {
    return false
  } else {
    return ssrExternal.includes(dep)
  }
}

/**
 * @param {string} raw could be "foo" or "foo > bar" etc
 */
function parseIncludeStr(raw) {
  const lastArrow = raw.lastIndexOf('>')
  return lastArrow === -1 ? raw : raw.slice(lastArrow + 1).trim()
}

/**
 * @param {string} target
 * @param {string | RegExp | (string | RegExp)[]} pattern
 */
function isMatch(target, pattern) {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => isMatch(target, p))
  } else if (typeof pattern === 'string') {
    return target === pattern
  } else if (pattern instanceof RegExp) {
    return pattern.test(target)
  }
}

module.exports = {
  isDepIncluded,
  isDepExcluded,
  isDepNoExternaled,
  isDepExternaled
}
