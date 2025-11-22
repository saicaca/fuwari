import { normalizeEntryId } from "./plugin-component-entry.js";
function vitePluginInternals(input, opts, internals) {
  return {
    name: "@astro/plugin-build-internals",
    config(config, options) {
      if (options.command === "build" && config.build?.ssr) {
        return {
          ssr: {
            // Always bundle Astro runtime when building for SSR
            noExternal: ["astro"],
            // Except for these packages as they're not bundle-friendly. Users with strict package installations
            // need to manually install these themselves if they use the related features.
            external: [
              "sharp"
              // For sharp image service
            ]
          }
        };
      }
    },
    async generateBundle(_options, bundle) {
      const promises = [];
      const mapping = /* @__PURE__ */ new Map();
      for (const specifier of input) {
        promises.push(
          this.resolve(specifier).then((result) => {
            if (result) {
              if (mapping.has(result.id)) {
                mapping.get(result.id).add(specifier);
              } else {
                mapping.set(result.id, /* @__PURE__ */ new Set([specifier]));
              }
            }
          })
        );
      }
      await Promise.all(promises);
      for (const [_, chunk] of Object.entries(bundle)) {
        if (chunk.fileName.startsWith(opts.settings.config.build.assets)) {
          internals.clientChunksAndAssets.add(chunk.fileName);
        }
        if (chunk.type === "chunk" && chunk.facadeModuleId) {
          const specifiers = mapping.get(chunk.facadeModuleId) || /* @__PURE__ */ new Set([chunk.facadeModuleId]);
          for (const specifier of specifiers) {
            internals.entrySpecifierToBundleMap.set(normalizeEntryId(specifier), chunk.fileName);
          }
        }
      }
    }
  };
}
function pluginInternals(options, internals) {
  return {
    targets: ["client", "server"],
    hooks: {
      "build:before": ({ input }) => {
        return {
          vitePlugin: vitePluginInternals(input, options, internals)
        };
      }
    }
  };
}
export {
  pluginInternals
};
