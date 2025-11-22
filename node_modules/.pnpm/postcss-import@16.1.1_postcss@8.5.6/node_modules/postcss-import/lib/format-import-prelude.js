"use strict"

module.exports = function formatImportPrelude(layer, media, supports) {
  const parts = []

  if (typeof layer !== "undefined") {
    let layerParams = "layer"
    if (layer) {
      layerParams = `layer(${layer})`
    }

    parts.push(layerParams)
  }

  if (typeof supports !== "undefined") {
    parts.push(`supports(${supports})`)
  }

  if (typeof media !== "undefined") {
    parts.push(media)
  }

  return parts.join(" ")
}
