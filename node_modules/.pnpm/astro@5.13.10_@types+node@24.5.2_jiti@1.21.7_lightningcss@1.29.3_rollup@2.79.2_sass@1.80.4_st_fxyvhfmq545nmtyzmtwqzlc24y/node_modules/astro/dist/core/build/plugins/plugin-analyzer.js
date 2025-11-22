import { getTopLevelPageModuleInfos } from "../graph.js";
import {
  getPageDataByViteID,
  trackClientOnlyPageDatas,
  trackScriptPageDatas
} from "../internal.js";
function vitePluginAnalyzer(internals) {
  return {
    name: "@astro/rollup-plugin-astro-analyzer",
    async generateBundle() {
      const ids = this.getModuleIds();
      for (const id of ids) {
        const info = this.getModuleInfo(id);
        if (!info?.meta?.astro) continue;
        const astro = info.meta.astro;
        for (const c of astro.hydratedComponents) {
          const rid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
          if (internals.discoveredHydratedComponents.has(rid)) {
            const exportNames = internals.discoveredHydratedComponents.get(rid);
            exportNames?.push(c.exportName);
          } else {
            internals.discoveredHydratedComponents.set(rid, [c.exportName]);
          }
        }
        if (astro.clientOnlyComponents.length) {
          const clientOnlys = [];
          for (const c of astro.clientOnlyComponents) {
            const cid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
            if (internals.discoveredClientOnlyComponents.has(cid)) {
              const exportNames = internals.discoveredClientOnlyComponents.get(cid);
              exportNames?.push(c.exportName);
            } else {
              internals.discoveredClientOnlyComponents.set(cid, [c.exportName]);
            }
            clientOnlys.push(cid);
            const resolvedId = await this.resolve(c.specifier, id);
            if (resolvedId) {
              clientOnlys.push(resolvedId.id);
            }
          }
          for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
            const newPageData = getPageDataByViteID(internals, pageInfo.id);
            if (!newPageData) continue;
            trackClientOnlyPageDatas(internals, newPageData, clientOnlys);
          }
        }
        if (astro.scripts.length) {
          const scriptIds = astro.scripts.map(
            (_, i) => `${id.replace("/@fs", "")}?astro&type=script&index=${i}&lang.ts`
          );
          for (const scriptId of scriptIds) {
            internals.discoveredScripts.add(scriptId);
          }
          for (const pageInfo of getTopLevelPageModuleInfos(id, this)) {
            const newPageData = getPageDataByViteID(internals, pageInfo.id);
            if (!newPageData) continue;
            trackScriptPageDatas(internals, newPageData, scriptIds);
          }
        }
      }
    }
  };
}
function pluginAnalyzer(internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginAnalyzer(internals)
        };
      }
    }
  };
}
export {
  pluginAnalyzer
};
