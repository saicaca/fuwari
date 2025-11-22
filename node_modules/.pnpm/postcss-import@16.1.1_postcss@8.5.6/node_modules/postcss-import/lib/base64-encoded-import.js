"use strict"

const formatImportPrelude = require("./format-import-prelude")

// Base64 encode an import with conditions
// The order of conditions is important and is interleaved with cascade layer declarations
// Each group of conditions and cascade layers needs to be interpreted in order
// To achieve this we create a list of base64 encoded imports, where each import contains a stylesheet with another import.
// Each import can define a single group of conditions and a single cascade layer.
module.exports = function base64EncodedConditionalImport(prelude, conditions) {
  if (!conditions?.length) return prelude

  conditions.reverse()
  const first = conditions.pop()
  let params = `${prelude} ${formatImportPrelude(
    first.layer,
    first.media,
    first.supports,
  )}`

  for (const condition of conditions) {
    params = `'data:text/css;base64,${Buffer.from(`@import ${params}`).toString(
      "base64",
    )}' ${formatImportPrelude(
      condition.layer,
      condition.media,
      condition.supports,
    )}`
  }

  return params
}
