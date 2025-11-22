import { viteID, wrapId } from "../core/util.js";
import { isBuildableCSSRequest } from "./util.js";
import { crawlGraph } from "./vite.js";
const inlineQueryRE = /(?:\?|&)inline(?:$|&)/;
async function getStylesForURL(filePath, loader) {
  const importedCssUrls = /* @__PURE__ */ new Set();
  const importedStylesMap = /* @__PURE__ */ new Map();
  const crawledFiles = /* @__PURE__ */ new Set();
  for await (const importedModule of crawlGraph(loader, viteID(filePath), true)) {
    if (importedModule.file) {
      crawledFiles.add(importedModule.file);
    }
    if (isBuildableCSSRequest(importedModule.url)) {
      let css = "";
      if (typeof importedModule.ssrModule?.default === "string") {
        css = importedModule.ssrModule.default;
      } else {
        let modId = importedModule.url;
        if (!inlineQueryRE.test(importedModule.url)) {
          if (importedModule.url.includes("?")) {
            modId = importedModule.url.replace("?", "?inline&");
          } else {
            modId += "?inline";
          }
        }
        try {
          const ssrModule = await loader.import(modId);
          css = ssrModule.default;
        } catch {
          continue;
        }
      }
      importedStylesMap.set(importedModule.url, {
        id: wrapId(importedModule.id ?? importedModule.url),
        url: wrapId(importedModule.url),
        content: css
      });
    }
  }
  return {
    urls: importedCssUrls,
    styles: [...importedStylesMap.values()],
    crawledFiles
  };
}
export {
  getStylesForURL
};
