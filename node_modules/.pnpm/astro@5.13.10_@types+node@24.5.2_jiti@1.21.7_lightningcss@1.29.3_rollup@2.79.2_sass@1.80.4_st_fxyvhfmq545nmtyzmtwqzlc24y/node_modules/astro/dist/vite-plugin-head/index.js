import { getParentModuleInfos, getTopLevelPageModuleInfos } from "../core/build/graph.js";
import { getAstroMetadata } from "../vite-plugin-astro/index.js";
const injectExp = /(?:^\/\/|\/\/!)\s*astro-head-inject/;
function configHeadVitePlugin() {
  let server;
  function propagateMetadata(id, prop, value, seen = /* @__PURE__ */ new Set()) {
    if (seen.has(id)) return;
    seen.add(id);
    const mod = server.moduleGraph.getModuleById(id);
    const info = this.getModuleInfo(id);
    if (info?.meta.astro) {
      const astroMetadata = getAstroMetadata(info);
      if (astroMetadata) {
        Reflect.set(astroMetadata, prop, value);
      }
    }
    for (const parent of mod?.importers || []) {
      if (parent.id) {
        propagateMetadata.call(this, parent.id, prop, value, seen);
      }
    }
  }
  return {
    name: "astro:head-metadata",
    enforce: "pre",
    apply: "serve",
    configureServer(_server) {
      server = _server;
    },
    resolveId(source, importer) {
      if (importer) {
        return this.resolve(source, importer, { skipSelf: true }).then((result) => {
          if (result) {
            let info = this.getModuleInfo(result.id);
            const astro = info && getAstroMetadata(info);
            if (astro) {
              if (astro.propagation === "self" || astro.propagation === "in-tree") {
                propagateMetadata.call(this, importer, "propagation", "in-tree");
              }
              if (astro.containsHead) {
                propagateMetadata.call(this, importer, "containsHead", true);
              }
            }
          }
          return result;
        });
      }
    },
    transform(source, id) {
      if (!server) {
        return;
      }
      let info = this.getModuleInfo(id);
      if (info && getAstroMetadata(info)?.containsHead) {
        propagateMetadata.call(this, id, "containsHead", true);
      }
      if (info && getAstroMetadata(info)?.propagation === "self") {
        const mod = server.moduleGraph.getModuleById(id);
        for (const parent of mod?.importers ?? []) {
          if (parent.id) {
            propagateMetadata.call(this, parent.id, "propagation", "in-tree");
          }
        }
      }
      if (injectExp.test(source)) {
        propagateMetadata.call(this, id, "propagation", "in-tree");
      }
    }
  };
}
function astroHeadBuildPlugin(internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:before"() {
        return {
          vitePlugin: {
            name: "astro:head-metadata-build",
            generateBundle(_opts, bundle) {
              const map = internals.componentMetadata;
              function getOrCreateMetadata(id) {
                if (map.has(id)) return map.get(id);
                const metadata = {
                  propagation: "none",
                  containsHead: false
                };
                map.set(id, metadata);
                return metadata;
              }
              for (const [, output] of Object.entries(bundle)) {
                if (output.type !== "chunk") continue;
                for (const [id, mod] of Object.entries(output.modules)) {
                  const modinfo = this.getModuleInfo(id);
                  if (modinfo) {
                    const meta = getAstroMetadata(modinfo);
                    if (meta?.containsHead) {
                      for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
                        let metadata = getOrCreateMetadata(pageInfo.id);
                        metadata.containsHead = true;
                      }
                    }
                    if (meta?.propagation === "self") {
                      for (const info of getParentModuleInfos(id, this)) {
                        let metadata = getOrCreateMetadata(info.id);
                        if (metadata.propagation !== "self") {
                          metadata.propagation = "in-tree";
                        }
                      }
                    }
                  }
                  if (mod.code && injectExp.test(mod.code)) {
                    for (const info of getParentModuleInfos(id, this)) {
                      getOrCreateMetadata(info.id).propagation = "in-tree";
                    }
                  }
                }
              }
            }
          }
        };
      }
    }
  };
}
export {
  astroHeadBuildPlugin,
  configHeadVitePlugin as default
};
