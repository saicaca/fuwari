"use strict"

module.exports = function applyStyles(bundle, styles) {
  styles.nodes = []

  // Strip additional statements.
  bundle.forEach(stmt => {
    if (["charset", "import", "layer"].includes(stmt.type)) {
      stmt.node.parent = undefined
      styles.append(stmt.node)
    } else if (stmt.type === "nodes") {
      stmt.nodes.forEach(node => {
        node.parent = undefined
        styles.append(node)
      })
    }
  })
}
