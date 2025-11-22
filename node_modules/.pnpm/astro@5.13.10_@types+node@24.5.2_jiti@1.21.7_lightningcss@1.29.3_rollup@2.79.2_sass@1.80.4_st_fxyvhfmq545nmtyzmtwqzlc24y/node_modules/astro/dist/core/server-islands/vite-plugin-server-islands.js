import MagicString from "magic-string";
import { AstroError, AstroErrorData } from "../errors/index.js";
const VIRTUAL_ISLAND_MAP_ID = "@astro-server-islands";
const RESOLVED_VIRTUAL_ISLAND_MAP_ID = "\0" + VIRTUAL_ISLAND_MAP_ID;
const serverIslandPlaceholder = "'$$server-islands$$'";
function vitePluginServerIslands({ settings }) {
  let command = "serve";
  let viteServer = null;
  const referenceIdMap = /* @__PURE__ */ new Map();
  return {
    name: "astro:server-islands",
    enforce: "post",
    config(_config, { command: _command }) {
      command = _command;
    },
    configureServer(_server) {
      viteServer = _server;
    },
    resolveId(name) {
      if (name === VIRTUAL_ISLAND_MAP_ID) {
        return RESOLVED_VIRTUAL_ISLAND_MAP_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ISLAND_MAP_ID) {
        return { code: `export const serverIslandMap = ${serverIslandPlaceholder};` };
      }
    },
    transform(_code, id) {
      const info = this.getModuleInfo(id);
      if (!info?.meta?.astro) return;
      const astro = info.meta.astro;
      for (const comp of astro.serverComponents) {
        if (!settings.serverIslandNameMap.has(comp.resolvedPath)) {
          if (!settings.adapter) {
            throw new AstroError(AstroErrorData.NoAdapterInstalledServerIslands);
          }
          let name = comp.localName;
          let idx = 1;
          while (true) {
            if (!settings.serverIslandMap.has(name)) {
              break;
            }
            name += idx++;
          }
          settings.serverIslandNameMap.set(comp.resolvedPath, name);
          settings.serverIslandMap.set(name, () => {
            return viteServer?.ssrLoadModule(comp.resolvedPath);
          });
          if (command === "build") {
            let referenceId = this.emitFile({
              type: "chunk",
              id: comp.specifier,
              importer: id,
              name: comp.localName
            });
            referenceIdMap.set(comp.resolvedPath, referenceId);
          }
        }
      }
    },
    renderChunk(code) {
      if (code.includes(serverIslandPlaceholder)) {
        if (referenceIdMap.size === 0) {
          return {
            code: code.replace(serverIslandPlaceholder, "new Map();"),
            map: null
          };
        }
        let mapSource = "new Map([";
        for (let [resolvedPath, referenceId] of referenceIdMap) {
          const fileName = this.getFileName(referenceId);
          const islandName = settings.serverIslandNameMap.get(resolvedPath);
          mapSource += `
	['${islandName}', () => import('./${fileName}')],`;
        }
        mapSource += "\n]);";
        referenceIdMap.clear();
        const ms = new MagicString(code);
        ms.replace(serverIslandPlaceholder, mapSource);
        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: "boundary" })
        };
      }
    }
  };
}
export {
  VIRTUAL_ISLAND_MAP_ID,
  vitePluginServerIslands
};
