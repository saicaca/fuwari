const astroEntryPrefix = "\0astro-entry:";
function vitePluginComponentEntry(internals) {
  const componentToExportNames = /* @__PURE__ */ new Map();
  mergeComponentExportNames(internals.discoveredHydratedComponents);
  mergeComponentExportNames(internals.discoveredClientOnlyComponents);
  for (const [componentId, exportNames] of componentToExportNames) {
    if (exportNames.some((name) => name.includes(".") || name === "*")) {
      componentToExportNames.delete(componentId);
    } else {
      componentToExportNames.set(componentId, Array.from(new Set(exportNames)));
    }
  }
  function mergeComponentExportNames(components) {
    for (const [componentId, exportNames] of components) {
      if (componentToExportNames.has(componentId)) {
        componentToExportNames.get(componentId)?.push(...exportNames);
      } else {
        componentToExportNames.set(componentId, exportNames);
      }
    }
  }
  return {
    name: "@astro/plugin-component-entry",
    enforce: "pre",
    config(config) {
      const rollupInput = config.build?.rollupOptions?.input;
      if (Array.isArray(rollupInput)) {
        config.build.rollupOptions.input = rollupInput.map((id) => {
          if (componentToExportNames.has(id)) {
            return astroEntryPrefix + id;
          } else {
            return id;
          }
        });
      }
    },
    async resolveId(id) {
      if (id.startsWith(astroEntryPrefix)) {
        return id;
      }
    },
    async load(id) {
      if (id.startsWith(astroEntryPrefix)) {
        const componentId = id.slice(astroEntryPrefix.length);
        const exportNames = componentToExportNames.get(componentId);
        if (exportNames) {
          return {
            code: `export { ${exportNames.join(", ")} } from ${JSON.stringify(componentId)}`
          };
        }
      }
    }
  };
}
function normalizeEntryId(id) {
  return id.startsWith(astroEntryPrefix) ? id.slice(astroEntryPrefix.length) : id;
}
function pluginComponentEntry(internals) {
  return {
    targets: ["client"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginComponentEntry(internals)
        };
      }
    }
  };
}
export {
  normalizeEntryId,
  pluginComponentEntry
};
