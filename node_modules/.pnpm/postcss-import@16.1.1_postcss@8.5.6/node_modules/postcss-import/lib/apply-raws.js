"use strict"

module.exports = function applyRaws(bundle) {
  bundle.forEach((stmt, index) => {
    if (index === 0) return

    if (stmt.parent) {
      const { before } = stmt.parent.node.raws
      if (stmt.type === "nodes") stmt.nodes[0].raws.before = before
      else stmt.node.raws.before = before
    } else if (stmt.type === "nodes") {
      stmt.nodes[0].raws.before = stmt.nodes[0].raws.before || "\n"
    }
  })
}
