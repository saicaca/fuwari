import { hasAssetPropagationFlag } from "../../../content/index.js";
import { isBuildableCSSRequest } from "../../../vite-plugin-astro-server/util.js";
import * as assetName from "../css-asset-name.js";
import {
  getParentExtendedModuleInfos,
  getParentModuleInfos,
  moduleIsTopLevelPage
} from "../graph.js";
import { getPageDataByViteID, getPageDatasByClientOnlyID } from "../internal.js";
import { extendManualChunks, shouldInlineAsset } from "./util.js";
function pluginCSS(options, internals) {
  return {
    targets: ["client", "server"],
    hooks: {
      "build:before": ({ target }) => {
        let plugins = rollupPluginAstroBuildCSS({
          buildOptions: options,
          internals,
          target
        });
        return {
          vitePlugin: plugins
        };
      }
    }
  };
}
function rollupPluginAstroBuildCSS(options) {
  const { internals, buildOptions } = options;
  const { settings } = buildOptions;
  let resolvedConfig;
  const pagesToCss = {};
  const moduleIdToPropagatedCss = {};
  const cssBuildPlugin = {
    name: "astro:rollup-plugin-build-css",
    outputOptions(outputOptions) {
      const assetFileNames = outputOptions.assetFileNames;
      const namingIncludesHash = assetFileNames?.toString().includes("[hash]");
      const createNameForParentPages = namingIncludesHash ? assetName.shortHashedName(settings) : assetName.createSlugger(settings);
      extendManualChunks(outputOptions, {
        after(id, meta) {
          if (isBuildableCSSRequest(id)) {
            if (options.target === "client") {
              return internals.cssModuleToChunkIdMap.get(id);
            }
            const ctx = { getModuleInfo: meta.getModuleInfo };
            for (const pageInfo of getParentModuleInfos(id, ctx)) {
              if (hasAssetPropagationFlag(pageInfo.id)) {
                const chunkId2 = assetName.createNameHash(id, [id], settings);
                internals.cssModuleToChunkIdMap.set(id, chunkId2);
                return chunkId2;
              }
            }
            const chunkId = createNameForParentPages(id, meta);
            internals.cssModuleToChunkIdMap.set(id, chunkId);
            return chunkId;
          }
        }
      });
    },
    async generateBundle(_outputOptions, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;
        if ("viteMetadata" in chunk === false) continue;
        const meta = chunk.viteMetadata;
        if (meta.importedCss.size < 1) continue;
        if (options.target === "client") {
          for (const id of Object.keys(chunk.modules)) {
            for (const pageData of getParentClientOnlys(id, this, internals)) {
              for (const importedCssImport of meta.importedCss) {
                const cssToInfoRecord = pagesToCss[pageData.moduleSpecifier] ??= {};
                cssToInfoRecord[importedCssImport] = { depth: -1, order: -1 };
              }
            }
          }
        }
        for (const id of Object.keys(chunk.modules)) {
          const parentModuleInfos = getParentExtendedModuleInfos(id, this, hasAssetPropagationFlag);
          for (const { info: pageInfo, depth, order } of parentModuleInfos) {
            if (hasAssetPropagationFlag(pageInfo.id)) {
              const propagatedCss = moduleIdToPropagatedCss[pageInfo.id] ??= /* @__PURE__ */ new Set();
              for (const css of meta.importedCss) {
                propagatedCss.add(css);
              }
            } else if (moduleIsTopLevelPage(pageInfo)) {
              const pageViteID = pageInfo.id;
              const pageData = getPageDataByViteID(internals, pageViteID);
              if (pageData) {
                appendCSSToPage(pageData, meta, pagesToCss, depth, order);
              }
            } else if (options.target === "client") {
              const pageDatas = internals.pagesByScriptId.get(pageInfo.id);
              if (pageDatas) {
                for (const pageData of pageDatas) {
                  appendCSSToPage(pageData, meta, pagesToCss, -1, order);
                }
              }
            }
          }
        }
      }
    }
  };
  const singleCssPlugin = {
    name: "astro:rollup-plugin-single-css",
    enforce: "post",
    configResolved(config) {
      resolvedConfig = config;
    },
    generateBundle(_, bundle) {
      if (resolvedConfig.build.cssCodeSplit) return;
      const cssChunk = Object.values(bundle).find(
        (chunk) => chunk.type === "asset" && chunk.name === "style.css"
      );
      if (cssChunk === void 0) return;
      for (const pageData of internals.pagesByKeys.values()) {
        const cssToInfoMap = pagesToCss[pageData.moduleSpecifier] ??= {};
        cssToInfoMap[cssChunk.fileName] = { depth: -1, order: -1 };
      }
    }
  };
  let assetsInlineLimit;
  const inlineStylesheetsPlugin = {
    name: "astro:rollup-plugin-inline-stylesheets",
    enforce: "post",
    configResolved(config) {
      assetsInlineLimit = config.build.assetsInlineLimit;
    },
    async generateBundle(_outputOptions, bundle) {
      const inlineConfig = settings.config.build.inlineStylesheets;
      Object.entries(bundle).forEach(([id, stylesheet]) => {
        if (stylesheet.type !== "asset" || stylesheet.name?.endsWith(".css") !== true || typeof stylesheet.source !== "string")
          return;
        const toBeInlined = inlineConfig === "always" ? true : inlineConfig === "never" ? false : shouldInlineAsset(stylesheet.source, stylesheet.fileName, assetsInlineLimit);
        const sheet = toBeInlined ? { type: "inline", content: stylesheet.source } : { type: "external", src: stylesheet.fileName };
        let sheetAddedToPage = false;
        internals.pagesByKeys.forEach((pageData) => {
          const orderingInfo = pagesToCss[pageData.moduleSpecifier]?.[stylesheet.fileName];
          if (orderingInfo !== void 0) {
            pageData.styles.push({ ...orderingInfo, sheet });
            sheetAddedToPage = true;
          }
        });
        for (const moduleId in moduleIdToPropagatedCss) {
          if (!moduleIdToPropagatedCss[moduleId].has(stylesheet.fileName)) continue;
          let propagatedStyles = internals.propagatedStylesMap.get(moduleId);
          if (!propagatedStyles) {
            propagatedStyles = /* @__PURE__ */ new Set();
            internals.propagatedStylesMap.set(moduleId, propagatedStyles);
          }
          propagatedStyles.add(sheet);
          sheetAddedToPage = true;
        }
        if (toBeInlined && sheetAddedToPage) {
          delete bundle[id];
          for (const chunk of Object.values(bundle)) {
            if (chunk.type === "chunk") {
              chunk.viteMetadata?.importedCss?.delete(id);
            }
          }
        }
      });
    }
  };
  return [cssBuildPlugin, singleCssPlugin, inlineStylesheetsPlugin];
}
function* getParentClientOnlys(id, ctx, internals) {
  for (const info of getParentModuleInfos(id, ctx)) {
    yield* getPageDatasByClientOnlyID(internals, info.id);
  }
}
function appendCSSToPage(pageData, meta, pagesToCss, depth, order) {
  for (const importedCssImport of meta.importedCss) {
    const cssInfo = pagesToCss[pageData.moduleSpecifier]?.[importedCssImport];
    if (cssInfo !== void 0) {
      if (depth < cssInfo.depth) {
        cssInfo.depth = depth;
      }
      if (cssInfo.order === -1) {
        cssInfo.order = order;
      } else if (order < cssInfo.order && order > -1) {
        cssInfo.order = order;
      }
    } else {
      const cssToInfoRecord = pagesToCss[pageData.moduleSpecifier] ??= {};
      cssToInfoRecord[importedCssImport] = { depth, order };
    }
  }
}
export {
  pluginCSS
};
