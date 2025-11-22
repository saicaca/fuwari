import { routeIsRedirect } from "../../redirects/index.js";
import { addRollupInput } from "../add-rollup-input.js";
import { RENDERERS_MODULE_ID } from "./plugin-renderers.js";
import { getPagesFromVirtualModulePageName, getVirtualModulePageName } from "./util.js";
const ASTRO_PAGE_MODULE_ID = "@astro-page:";
const ASTRO_PAGE_RESOLVED_MODULE_ID = "\0" + ASTRO_PAGE_MODULE_ID;
function vitePluginPages(opts, internals) {
  return {
    name: "@astro/plugin-build-pages",
    options(options) {
      if (opts.settings.buildOutput === "static") {
        const inputs = /* @__PURE__ */ new Set();
        for (const pageData of Object.values(opts.allPages)) {
          if (routeIsRedirect(pageData.route)) {
            continue;
          }
          inputs.add(getVirtualModulePageName(ASTRO_PAGE_MODULE_ID, pageData.component));
        }
        return addRollupInput(options, Array.from(inputs));
      }
    },
    resolveId(id) {
      if (id.startsWith(ASTRO_PAGE_MODULE_ID)) {
        return "\0" + id;
      }
    },
    async load(id) {
      if (id.startsWith(ASTRO_PAGE_RESOLVED_MODULE_ID)) {
        const imports = [];
        const exports = [];
        const pageDatas = getPagesFromVirtualModulePageName(
          internals,
          ASTRO_PAGE_RESOLVED_MODULE_ID,
          id
        );
        for (const pageData of pageDatas) {
          const resolvedPage = await this.resolve(pageData.moduleSpecifier);
          if (resolvedPage) {
            imports.push(`import * as _page from ${JSON.stringify(pageData.moduleSpecifier)};`);
            exports.push(`export const page = () => _page`);
            imports.push(`import { renderers } from "${RENDERERS_MODULE_ID}";`);
            exports.push(`export { renderers };`);
            return { code: `${imports.join("\n")}${exports.join("\n")}` };
          }
        }
      }
    }
  };
}
function pluginPages(opts, internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginPages(opts, internals)
        };
      }
    }
  };
}
export {
  ASTRO_PAGE_MODULE_ID,
  ASTRO_PAGE_RESOLVED_MODULE_ID,
  pluginPages
};
