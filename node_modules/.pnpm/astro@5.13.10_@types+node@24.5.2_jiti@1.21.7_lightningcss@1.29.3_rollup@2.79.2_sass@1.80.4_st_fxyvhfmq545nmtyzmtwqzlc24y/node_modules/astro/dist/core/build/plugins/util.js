import { extname } from "node:path";
function extendManualChunks(outputOptions, hooks) {
  const manualChunks = outputOptions.manualChunks;
  outputOptions.manualChunks = function(id, meta) {
    if (hooks.before) {
      let value = hooks.before(id, meta);
      if (value) {
        return value;
      }
    }
    if (typeof manualChunks == "object") {
      if (id in manualChunks) {
        let value = manualChunks[id];
        return value[0];
      }
    } else if (typeof manualChunks === "function") {
      const outid = manualChunks.call(this, id, meta);
      if (outid) {
        return outid;
      }
    }
    if (hooks.after) {
      return hooks.after(id, meta) || null;
    }
    return null;
  };
}
const ASTRO_PAGE_EXTENSION_POST_PATTERN = "@_@";
const ASTRO_PAGE_KEY_SEPARATOR = "&";
function makePageDataKey(route, componentPath) {
  return route + ASTRO_PAGE_KEY_SEPARATOR + componentPath;
}
function getVirtualModulePageName(virtualModulePrefix, path) {
  const extension = extname(path);
  return virtualModulePrefix + (extension.startsWith(".") ? path.slice(0, -extension.length) + extension.replace(".", ASTRO_PAGE_EXTENSION_POST_PATTERN) : path);
}
function getPagesFromVirtualModulePageName(internals, virtualModulePrefix, id) {
  const path = getComponentFromVirtualModulePageName(virtualModulePrefix, id);
  const pages = [];
  internals.pagesByKeys.forEach((pageData) => {
    if (pageData.component === path) {
      pages.push(pageData);
    }
  });
  return pages;
}
function getComponentFromVirtualModulePageName(virtualModulePrefix, id) {
  return id.slice(virtualModulePrefix.length).replace(ASTRO_PAGE_EXTENSION_POST_PATTERN, ".");
}
function shouldInlineAsset(assetContent, assetPath, assetsInlineLimit) {
  if (typeof assetsInlineLimit === "function") {
    const result = assetsInlineLimit(assetPath, Buffer.from(assetContent));
    if (result != null) {
      return result;
    } else {
      return Buffer.byteLength(assetContent) < 4096;
    }
  }
  return Buffer.byteLength(assetContent) < Number(assetsInlineLimit);
}
export {
  ASTRO_PAGE_EXTENSION_POST_PATTERN,
  extendManualChunks,
  getPagesFromVirtualModulePageName,
  getVirtualModulePageName,
  makePageDataKey,
  shouldInlineAsset
};
