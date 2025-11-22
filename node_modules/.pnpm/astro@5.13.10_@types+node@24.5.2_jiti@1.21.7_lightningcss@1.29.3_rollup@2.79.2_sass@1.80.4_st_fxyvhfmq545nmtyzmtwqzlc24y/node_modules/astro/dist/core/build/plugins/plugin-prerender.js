import { getPrerenderMetadata } from "../../../prerender/metadata.js";
import { ASTRO_PAGE_RESOLVED_MODULE_ID } from "./plugin-pages.js";
import { getPagesFromVirtualModulePageName } from "./util.js";
function vitePluginPrerender(internals) {
  return {
    name: "astro:rollup-plugin-prerender",
    generateBundle(_, bundle) {
      const moduleIds = this.getModuleIds();
      for (const id of moduleIds) {
        const pageInfo = internals.pagesByViteID.get(id);
        if (!pageInfo) continue;
        const moduleInfo = this.getModuleInfo(id);
        if (!moduleInfo) continue;
        const prerender = !!getPrerenderMetadata(moduleInfo);
        pageInfo.route.prerender = prerender;
      }
      const nonPrerenderOnlyChunks = getNonPrerenderOnlyChunks(bundle, internals);
      internals.prerenderOnlyChunks = Object.values(bundle).filter((chunk) => {
        return chunk.type === "chunk" && !nonPrerenderOnlyChunks.has(chunk);
      });
    }
  };
}
function getNonPrerenderOnlyChunks(bundle, internals) {
  const chunks = Object.values(bundle);
  const prerenderOnlyEntryChunks = /* @__PURE__ */ new Set();
  const nonPrerenderOnlyEntryChunks = /* @__PURE__ */ new Set();
  for (const chunk of chunks) {
    if (chunk.type === "chunk" && chunk.isEntry) {
      if (chunk.facadeModuleId?.startsWith(ASTRO_PAGE_RESOLVED_MODULE_ID)) {
        const pageDatas = getPagesFromVirtualModulePageName(
          internals,
          ASTRO_PAGE_RESOLVED_MODULE_ID,
          chunk.facadeModuleId
        );
        const prerender = pageDatas.every((pageData) => pageData.route.prerender);
        if (prerender) {
          prerenderOnlyEntryChunks.add(chunk);
          continue;
        }
      }
      nonPrerenderOnlyEntryChunks.add(chunk);
    }
  }
  const nonPrerenderOnlyChunks = new Set(nonPrerenderOnlyEntryChunks);
  for (const chunk of nonPrerenderOnlyChunks) {
    for (const importFileName of chunk.imports) {
      const importChunk = bundle[importFileName];
      if (importChunk?.type === "chunk") {
        nonPrerenderOnlyChunks.add(importChunk);
      }
    }
    for (const dynamicImportFileName of chunk.dynamicImports) {
      const dynamicImportChunk = bundle[dynamicImportFileName];
      if (dynamicImportChunk?.type === "chunk" && !prerenderOnlyEntryChunks.has(dynamicImportChunk)) {
        nonPrerenderOnlyChunks.add(dynamicImportChunk);
      }
    }
  }
  return nonPrerenderOnlyChunks;
}
function pluginPrerender(opts, internals) {
  if (opts.settings.buildOutput === "static") {
    return { targets: ["server"] };
  }
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginPrerender(internals)
        };
      }
    }
  };
}
export {
  pluginPrerender
};
