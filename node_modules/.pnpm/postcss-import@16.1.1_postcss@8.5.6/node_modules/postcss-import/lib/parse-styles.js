"use strict"

const path = require("path")

const dataURL = require("./data-url")
const parseStatements = require("./parse-statements")
const processContent = require("./process-content")
const resolveId = require("./resolve-id")
const formatImportPrelude = require("./format-import-prelude")

async function parseStyles(
  result,
  styles,
  options,
  state,
  conditions,
  from,
  postcss,
) {
  const statements = parseStatements(result, styles, conditions, from)

  for (const stmt of statements) {
    if (stmt.type !== "import" || !isProcessableURL(stmt.uri)) {
      continue
    }

    if (options.filter && !options.filter(stmt.uri)) {
      // rejected by filter
      continue
    }

    await resolveImportId(result, stmt, options, state, postcss)
  }

  let charset
  const beforeBundle = []
  const bundle = []

  function handleCharset(stmt) {
    if (!charset) charset = stmt
    // charsets aren't case-sensitive, so convert to lower case to compare
    else if (
      stmt.node.params.toLowerCase() !== charset.node.params.toLowerCase()
    ) {
      throw stmt.node.error(
        `Incompatible @charset statements:
  ${stmt.node.params} specified in ${stmt.node.source.input.file}
  ${charset.node.params} specified in ${charset.node.source.input.file}`,
      )
    }
  }

  // squash statements and their children
  statements.forEach(stmt => {
    if (stmt.type === "charset") handleCharset(stmt)
    else if (stmt.type === "import") {
      if (stmt.children) {
        stmt.children.forEach((child, index) => {
          if (child.type === "import") beforeBundle.push(child)
          else if (child.type === "layer") beforeBundle.push(child)
          else if (child.type === "charset") handleCharset(child)
          else bundle.push(child)
          // For better output
          if (index === 0) child.parent = stmt
        })
      } else beforeBundle.push(stmt)
    } else if (stmt.type === "layer") {
      beforeBundle.push(stmt)
    } else if (stmt.type === "nodes") {
      bundle.push(stmt)
    }
  })

  return charset
    ? [charset, ...beforeBundle.concat(bundle)]
    : beforeBundle.concat(bundle)
}

async function resolveImportId(result, stmt, options, state, postcss) {
  if (dataURL.isValid(stmt.uri)) {
    // eslint-disable-next-line require-atomic-updates
    stmt.children = await loadImportContent(
      result,
      stmt,
      stmt.uri,
      options,
      state,
      postcss,
    )

    return
  } else if (dataURL.isValid(stmt.from.slice(-1))) {
    // Data urls can't be used as a base url to resolve imports.
    throw stmt.node.error(
      `Unable to import '${stmt.uri}' from a stylesheet that is embedded in a data url`,
    )
  }

  const atRule = stmt.node
  let sourceFile
  if (atRule.source?.input?.file) {
    sourceFile = atRule.source.input.file
  }
  const base = sourceFile
    ? path.dirname(atRule.source.input.file)
    : options.root

  const paths = [await options.resolve(stmt.uri, base, options, atRule)].flat()

  // Ensure that each path is absolute:
  const resolved = await Promise.all(
    paths.map(file => {
      return !path.isAbsolute(file)
        ? resolveId(file, base, options, atRule)
        : file
    }),
  )

  // Add dependency messages:
  resolved.forEach(file => {
    result.messages.push({
      type: "dependency",
      plugin: "postcss-import",
      file,
      parent: sourceFile,
    })
  })

  const importedContent = await Promise.all(
    resolved.map(file => {
      return loadImportContent(result, stmt, file, options, state, postcss)
    }),
  )

  // Merge loaded statements
  // eslint-disable-next-line require-atomic-updates
  stmt.children = importedContent.flat().filter(x => !!x)
}

async function loadImportContent(
  result,
  stmt,
  filename,
  options,
  state,
  postcss,
) {
  const atRule = stmt.node
  const { conditions, from } = stmt
  const stmtDuplicateCheckKey = conditions
    .map(condition =>
      formatImportPrelude(condition.layer, condition.media, condition.supports),
    )
    .join(":")

  if (options.skipDuplicates) {
    // skip files already imported at the same scope
    if (state.importedFiles[filename]?.[stmtDuplicateCheckKey]) {
      return
    }

    // save imported files to skip them next time
    if (!state.importedFiles[filename]) {
      state.importedFiles[filename] = {}
    }
    state.importedFiles[filename][stmtDuplicateCheckKey] = true
  }

  if (from.includes(filename)) {
    return
  }

  const content = await options.load(filename, options)

  if (content.trim() === "" && options.warnOnEmpty) {
    result.warn(`${filename} is empty`, { node: atRule })
    return
  }

  // skip previous imported files not containing @import rules
  if (
    options.skipDuplicates &&
    state.hashFiles[content]?.[stmtDuplicateCheckKey]
  ) {
    return
  }

  const importedResult = await processContent(
    result,
    content,
    filename,
    options,
    postcss,
  )

  const styles = importedResult.root
  result.messages = result.messages.concat(importedResult.messages)

  if (options.skipDuplicates) {
    const hasImport = styles.some(child => {
      return child.type === "atrule" && child.name === "import"
    })
    if (!hasImport) {
      // save hash files to skip them next time
      if (!state.hashFiles[content]) {
        state.hashFiles[content] = {}
      }

      state.hashFiles[content][stmtDuplicateCheckKey] = true
    }
  }

  // recursion: import @import from imported file
  return parseStyles(
    result,
    styles,
    options,
    state,
    conditions,
    [...from, filename],
    postcss,
  )
}

function isProcessableURL(uri) {
  // skip protocol base uri (protocol://url) or protocol-relative
  if (/^(?:[a-z]+:)?\/\//i.test(uri)) {
    return false
  }

  // check for fragment or query
  try {
    // needs a base to parse properly
    const url = new URL(uri, "https://example.com")
    if (url.search) {
      return false
    }
  } catch {} // Ignore

  return true
}

module.exports = parseStyles
