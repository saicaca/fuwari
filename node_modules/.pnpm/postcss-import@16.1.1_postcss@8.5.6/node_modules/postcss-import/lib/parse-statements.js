"use strict"

// external tooling
const valueParser = require("postcss-value-parser")

// extended tooling
const { stringify } = valueParser

module.exports = function parseStatements(result, styles, conditions, from) {
  const statements = []
  let nodes = []
  let encounteredNonImportNodes = false

  styles.each(node => {
    let stmt
    if (node.type === "atrule") {
      if (node.name === "import")
        stmt = parseImport(result, node, conditions, from)
      else if (node.name === "charset")
        stmt = parseCharset(result, node, conditions, from)
      else if (
        node.name === "layer" &&
        !encounteredNonImportNodes &&
        !node.nodes
      )
        stmt = parseLayer(result, node, conditions, from)
    } else if (node.type !== "comment") {
      encounteredNonImportNodes = true
    }

    if (stmt) {
      if (nodes.length) {
        statements.push({
          type: "nodes",
          nodes,
          conditions: [...conditions],
          from,
        })
        nodes = []
      }
      statements.push(stmt)
    } else nodes.push(node)
  })

  if (nodes.length) {
    statements.push({
      type: "nodes",
      nodes,
      conditions: [...conditions],
      from,
    })
  }

  return statements
}

function parseCharset(result, atRule, conditions, from) {
  if (atRule.prev()) {
    return result.warn("@charset must precede all other statements", {
      node: atRule,
    })
  }
  return {
    type: "charset",
    node: atRule,
    conditions: [...conditions],
    from,
  }
}

function parseImport(result, atRule, conditions, from) {
  let prev = atRule.prev()

  // `@import` statements may follow other `@import` statements.
  if (prev) {
    do {
      if (
        prev.type === "comment" ||
        (prev.type === "atrule" && prev.name === "import")
      ) {
        prev = prev.prev()
        continue
      }

      break
    } while (prev)
  }

  // All `@import` statements may be preceded by `@charset` or `@layer` statements.
  // But the `@import` statements must be consecutive.
  if (prev) {
    do {
      if (
        prev.type === "comment" ||
        (prev.type === "atrule" &&
          (prev.name === "charset" || (prev.name === "layer" && !prev.nodes)))
      ) {
        prev = prev.prev()
        continue
      }

      return result.warn(
        "@import must precede all other statements (besides @charset or empty @layer)",
        { node: atRule },
      )
    } while (prev)
  }

  if (atRule.nodes) {
    return result.warn(
      "It looks like you didn't end your @import statement correctly. " +
        "Child nodes are attached to it.",
      { node: atRule },
    )
  }

  const params = valueParser(atRule.params).nodes
  const stmt = {
    type: "import",
    uri: "",
    fullUri: "",
    node: atRule,
    conditions: [...conditions],
    from,
  }

  let layer
  let media
  let supports

  for (let i = 0; i < params.length; i++) {
    const node = params[i]

    if (node.type === "space" || node.type === "comment") continue

    if (node.type === "string") {
      if (stmt.uri) {
        return result.warn(`Multiple url's in '${atRule.toString()}'`, {
          node: atRule,
        })
      }

      if (!node.value) {
        return result.warn(`Unable to find uri in '${atRule.toString()}'`, {
          node: atRule,
        })
      }

      stmt.uri = node.value
      stmt.fullUri = stringify(node)
      continue
    }

    if (node.type === "function" && /^url$/i.test(node.value)) {
      if (stmt.uri) {
        return result.warn(`Multiple url's in '${atRule.toString()}'`, {
          node: atRule,
        })
      }

      if (!node.nodes?.[0]?.value) {
        return result.warn(`Unable to find uri in '${atRule.toString()}'`, {
          node: atRule,
        })
      }

      stmt.uri = node.nodes[0].value
      stmt.fullUri = stringify(node)
      continue
    }

    if (!stmt.uri) {
      return result.warn(`Unable to find uri in '${atRule.toString()}'`, {
        node: atRule,
      })
    }

    if (
      (node.type === "word" || node.type === "function") &&
      /^layer$/i.test(node.value)
    ) {
      if (typeof layer !== "undefined") {
        return result.warn(`Multiple layers in '${atRule.toString()}'`, {
          node: atRule,
        })
      }

      if (typeof supports !== "undefined") {
        return result.warn(
          `layers must be defined before support conditions in '${atRule.toString()}'`,
          {
            node: atRule,
          },
        )
      }

      if (node.nodes) {
        layer = stringify(node.nodes)
      } else {
        layer = ""
      }

      continue
    }

    if (node.type === "function" && /^supports$/i.test(node.value)) {
      if (typeof supports !== "undefined") {
        return result.warn(
          `Multiple support conditions in '${atRule.toString()}'`,
          {
            node: atRule,
          },
        )
      }

      supports = stringify(node.nodes)

      continue
    }

    media = stringify(params.slice(i))
    break
  }

  if (!stmt.uri) {
    return result.warn(`Unable to find uri in '${atRule.toString()}'`, {
      node: atRule,
    })
  }

  if (
    typeof media !== "undefined" ||
    typeof layer !== "undefined" ||
    typeof supports !== "undefined"
  ) {
    stmt.conditions.push({
      layer,
      media,
      supports,
    })
  }

  return stmt
}

function parseLayer(result, atRule, conditions, from) {
  return {
    type: "layer",
    node: atRule,
    conditions: [...conditions],
    from,
  }
}
