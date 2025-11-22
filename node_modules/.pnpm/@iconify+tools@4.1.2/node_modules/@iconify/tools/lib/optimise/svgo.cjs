'use strict';

const svgo = require('svgo');
const id = require('@iconify/utils/lib/svg/id');

function getSVGOPlugins(options) {
  return [
    "cleanupAttrs",
    "mergeStyles",
    "inlineStyles",
    "removeComments",
    "removeUselessDefs",
    "removeEditorsNSData",
    "removeEmptyAttrs",
    "removeEmptyContainers",
    "convertStyleToAttrs",
    "convertColors",
    "convertTransform",
    "removeUnknownsAndDefaults",
    "removeNonInheritableGroupAttrs",
    "removeUnusedNS",
    "cleanupNumericValues",
    "cleanupListOfValues",
    "moveElemsAttrsToGroup",
    "moveGroupAttrsToElems",
    "collapseGroups",
    "sortDefsChildren",
    "sortAttrs",
    // Plugins that are bugged when using animations
    ...options.animated ? [] : ["removeUselessStrokeAndFill"],
    // Plugins that modify shapes or are bugged when using animations
    ...options.animated || options.keepShapes ? [] : [
      "removeHiddenElems",
      "convertShapeToPath",
      "convertEllipseToCircle",
      {
        name: "convertPathData",
        params: {
          noSpaceAfterFlags: true
        }
      },
      {
        name: "mergePaths",
        params: {
          noSpaceAfterFlags: true
        }
      },
      // 'removeOffCanvasPaths', // bugged for some icons
      "reusePaths"
    ],
    // Clean up IDs, first run
    // Sometimes bugs out on animated icons. Do not use with animations!
    ...!options.animated && options.cleanupIDs !== false ? ["cleanupIds"] : []
  ];
}
function runSVGO(svg, options = {}) {
  const code = svg.toString();
  const multipass = options.multipass !== false;
  let plugins;
  if (options.plugins) {
    plugins = options.plugins;
  } else {
    const animated = code.includes("<animate") || code.includes("<set");
    plugins = getSVGOPlugins({
      ...options,
      animated
    });
    if (code.includes("filter=") && code.includes("transform=")) {
      plugins = plugins.filter(
        (item) => item !== "moveElemsAttrsToGroup"
      );
    }
  }
  const pluginOptions = {
    plugins,
    multipass
  };
  const result = svgo.optimize(code, pluginOptions);
  if (typeof result.error === "string") {
    throw new Error(result.error);
  }
  let content = result.data.replace(/<defs\/>/g, "");
  if (!options.plugins) {
    const prefix = options.cleanupIDs !== void 0 ? options.cleanupIDs : "svgID";
    if (prefix !== false) {
      let counter = 0;
      content = id.replaceIDs(
        content,
        typeof prefix === "string" ? () => {
          return prefix + (counter++).toString(36);
        } : prefix
      );
    }
  }
  if (!options.plugins || options.plugins.find((item) => {
    if (typeof item === "string") {
      return item === "reusePaths";
    }
    return item.name === "reusePaths";
  })) {
    content = content.replace(' xmlns:xlink="http://www.w3.org/1999/xlink"', "").replaceAll("xlink:href=", "href=");
  }
  svg.load(content);
}

exports.getSVGOPlugins = getSVGOPlugins;
exports.runSVGO = runSVGO;
