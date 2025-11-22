"use strict"
// builtin tooling
const path = require("path")

// internal tooling
const applyConditions = require("./lib/apply-conditions")
const applyRaws = require("./lib/apply-raws")
const applyStyles = require("./lib/apply-styles")
const loadContent = require("./lib/load-content")
const parseStyles = require("./lib/parse-styles")
const resolveId = require("./lib/resolve-id")

function AtImport(options) {
  options = {
    root: process.cwd(),
    path: [],
    skipDuplicates: true,
    resolve: resolveId,
    load: loadContent,
    plugins: [],
    addModulesDirectories: [],
    warnOnEmpty: true,
    ...options,
  }

  options.root = path.resolve(options.root)

  // convert string to an array of a single element
  if (typeof options.path === "string") options.path = [options.path]

  if (!Array.isArray(options.path)) options.path = []

  options.path = options.path.map(p => path.resolve(options.root, p))

  return {
    postcssPlugin: "postcss-import",
    async Once(styles, { result, atRule, postcss }) {
      const state = {
        importedFiles: {},
        hashFiles: {},
      }

      if (styles.source?.input?.file) {
        state.importedFiles[styles.source.input.file] = {}
      }

      if (options.plugins && !Array.isArray(options.plugins)) {
        throw new Error("plugins option must be an array")
      }

      const bundle = await parseStyles(
        result,
        styles,
        options,
        state,
        [],
        [],
        postcss,
      )

      applyRaws(bundle)
      applyConditions(bundle, atRule)
      applyStyles(bundle, styles)
    },
  }
}

AtImport.postcss = true

module.exports = AtImport
