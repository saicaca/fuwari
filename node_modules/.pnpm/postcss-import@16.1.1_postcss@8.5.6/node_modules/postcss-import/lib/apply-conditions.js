"use strict"

const base64EncodedConditionalImport = require("./base64-encoded-import")

module.exports = function applyConditions(bundle, atRule) {
  const firstImportStatementIndex = bundle.findIndex(
    stmt => stmt.type === "import",
  )
  const lastImportStatementIndex = bundle.findLastIndex(
    stmt => stmt.type === "import",
  )

  bundle.forEach((stmt, index) => {
    if (stmt.type === "charset" || stmt.type === "warning") {
      return
    }

    if (
      stmt.type === "layer" &&
      ((index < lastImportStatementIndex && stmt.conditions?.length) ||
        (index > firstImportStatementIndex && index < lastImportStatementIndex))
    ) {
      stmt.type = "import"
      stmt.node = stmt.node.clone({
        name: "import",
        params: base64EncodedConditionalImport(
          `'data:text/css;base64,${Buffer.from(stmt.node.toString()).toString(
            "base64",
          )}'`,
          stmt.conditions,
        ),
      })

      return
    }

    if (!stmt.conditions?.length) {
      return
    }

    if (stmt.type === "import") {
      stmt.node.params = base64EncodedConditionalImport(
        stmt.fullUri,
        stmt.conditions,
      )
      return
    }

    let nodes
    let parent
    if (stmt.type === "layer") {
      nodes = [stmt.node]
      parent = stmt.node.parent
    } else {
      nodes = stmt.nodes
      parent = nodes[0].parent
    }

    const atRules = []

    // Convert conditions to at-rules
    for (const condition of stmt.conditions) {
      if (typeof condition.media !== "undefined") {
        const mediaNode = atRule({
          name: "media",
          params: condition.media,
          source: parent.source,
        })

        atRules.push(mediaNode)
      }

      if (typeof condition.supports !== "undefined") {
        const supportsNode = atRule({
          name: "supports",
          params: `(${condition.supports})`,
          source: parent.source,
        })

        atRules.push(supportsNode)
      }

      if (typeof condition.layer !== "undefined") {
        const layerNode = atRule({
          name: "layer",
          params: condition.layer,
          source: parent.source,
        })

        atRules.push(layerNode)
      }
    }

    // Add nodes to AST
    const outerAtRule = atRules.shift()
    const innerAtRule = atRules.reduce((previous, next) => {
      previous.append(next)
      return next
    }, outerAtRule)

    parent.insertBefore(nodes[0], outerAtRule)

    // remove nodes
    nodes.forEach(node => {
      node.parent = undefined
    })

    // better output
    nodes[0].raws.before = nodes[0].raws.before || "\n"

    // wrap new rules with media query and/or layer at rule
    innerAtRule.append(nodes)

    stmt.type = "nodes"
    stmt.nodes = [outerAtRule]
    delete stmt.node
  })
}
