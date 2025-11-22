import { shouldInlineAsset } from "./util.js";
function vitePluginScripts(internals) {
  let assetInlineLimit;
  return {
    name: "@astro/plugin-scripts",
    configResolved(config) {
      assetInlineLimit = config.build.assetsInlineLimit;
    },
    async generateBundle(_options, bundle) {
      const outputs = Object.values(bundle);
      const importedIds = /* @__PURE__ */ new Set();
      for (const output of outputs) {
        if (output.type === "chunk") {
          for (const id of output.imports) {
            importedIds.add(id);
          }
        }
      }
      for (const output of outputs) {
        if (output.type === "chunk" && output.facadeModuleId && internals.discoveredScripts.has(output.facadeModuleId) && !importedIds.has(output.fileName) && output.imports.length === 0 && output.dynamicImports.length === 0 && shouldInlineAsset(output.code, output.fileName, assetInlineLimit)) {
          internals.inlinedScripts.set(output.facadeModuleId, output.code.trim());
          delete bundle[output.fileName];
        }
      }
    }
  };
}
function pluginScripts(internals) {
  return {
    targets: ["client"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginScripts(internals)
        };
      }
    }
  };
}
export {
  pluginScripts
};
