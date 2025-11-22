import { defaultClientConditions, defaultServerConditions, normalizePath } from "vite";
import { hasSpecialQueries, normalizeFilename } from "../vite-plugin-utils/index.js";
import { compileAstro } from "./compile.js";
import { handleHotUpdate } from "./hmr.js";
import { parseAstroRequest } from "./query.js";
import { loadId } from "./utils.js";
import { getAstroMetadata } from "./metadata.js";
const astroFileToCompileMetadataWeakMap = /* @__PURE__ */ new WeakMap();
function astro({ settings, logger }) {
  const { config } = settings;
  let server;
  let compile;
  let astroFileToCompileMetadata = /* @__PURE__ */ new Map();
  const srcRootWeb = config.srcDir.pathname.slice(config.root.pathname.length - 1);
  const isBrowserPath = (path) => path.startsWith(srcRootWeb) && srcRootWeb !== "/";
  const notAstroComponent = (component) => !component.resolvedPath.endsWith(".astro");
  const prePlugin = {
    name: "astro:build",
    enforce: "pre",
    // run transforms before other plugins can
    async configEnvironment(name, viteConfig, opts) {
      viteConfig.resolve ??= {};
      if (viteConfig.resolve.conditions == null) {
        if (viteConfig.consumer === "client" || name === "client" || opts.isSsrTargetWebworker) {
          viteConfig.resolve.conditions = [...defaultClientConditions];
        } else {
          viteConfig.resolve.conditions = [...defaultServerConditions];
        }
      }
      viteConfig.resolve.conditions.push("astro");
    },
    configResolved(viteConfig) {
      compile = (code, filename) => {
        return compileAstro({
          compileProps: {
            astroConfig: config,
            viteConfig,
            preferences: settings.preferences,
            filename,
            source: code
          },
          astroFileToCompileMetadata,
          logger
        });
      };
    },
    configureServer(_server) {
      server = _server;
      server.watcher.on("unlink", (filename) => {
        astroFileToCompileMetadata.delete(filename);
      });
    },
    buildStart() {
      astroFileToCompileMetadata = /* @__PURE__ */ new Map();
      if (astroFileToCompileMetadataWeakMap.has(config)) {
        astroFileToCompileMetadata = astroFileToCompileMetadataWeakMap.get(config);
      } else {
        astroFileToCompileMetadataWeakMap.set(config, astroFileToCompileMetadata);
      }
    },
    async load(id, opts) {
      const parsedId = parseAstroRequest(id);
      const query = parsedId.query;
      if (!query.astro) {
        return null;
      }
      const filename = normalizePath(normalizeFilename(parsedId.filename, config.root));
      let compileMetadata = astroFileToCompileMetadata.get(filename);
      if (!compileMetadata) {
        if (server) {
          const code = await loadId(server.pluginContainer, filename);
          if (code != null) await compile(code, filename);
        }
        compileMetadata = astroFileToCompileMetadata.get(filename);
      }
      if (!compileMetadata) {
        throw new Error(
          `No cached compile metadata found for "${id}". The main Astro module "${filename}" should have compiled and filled the metadata first, before its virtual modules can be requested.`
        );
      }
      switch (query.type) {
        case "style": {
          if (typeof query.index === "undefined") {
            throw new Error(`Requests for Astro CSS must include an index.`);
          }
          const result = compileMetadata.css[query.index];
          if (!result) {
            throw new Error(`No Astro CSS at index ${query.index}`);
          }
          result.dependencies?.forEach((dep) => this.addWatchFile(dep));
          return {
            code: result.code,
            // `vite.cssScopeTo` is a Vite feature that allows this CSS to be treeshaken
            // if the Astro component's default export is not used
            meta: result.isGlobal ? void 0 : {
              vite: {
                cssScopeTo: [filename, "default"]
              }
            }
          };
        }
        case "script": {
          if (typeof query.index === "undefined") {
            throw new Error(`Requests for scripts must include an index`);
          }
          if (opts?.ssr) {
            return {
              code: `/* client script, empty in SSR: ${id} */`
            };
          }
          const script = compileMetadata.scripts[query.index];
          if (!script) {
            throw new Error(`No script at index ${query.index}`);
          }
          if (script.type === "external") {
            const src = script.src;
            if (src.startsWith("/") && !isBrowserPath(src)) {
              const publicDir = config.publicDir.pathname.replace(/\/$/, "").split("/").pop() + "/";
              throw new Error(
                `

<script src="${src}"> references an asset in the "${publicDir}" directory. Please add the "is:inline" directive to keep this asset from being bundled.

File: ${id}`
              );
            }
          }
          const result = {
            code: "",
            meta: {
              vite: {
                lang: "ts"
              }
            }
          };
          switch (script.type) {
            case "inline": {
              const { code, map } = script;
              result.code = appendSourceMap(code, map);
              break;
            }
            case "external": {
              const { src } = script;
              result.code = `import "${src}"`;
              break;
            }
          }
          return result;
        }
        case "custom":
        case "template":
        case void 0:
        default:
          return null;
      }
    },
    async transform(source, id) {
      if (hasSpecialQueries(id)) return;
      const parsedId = parseAstroRequest(id);
      if (!parsedId.filename.endsWith(".astro") || parsedId.query.astro) {
        if (this.environment.name === "client") {
          const astroFilename = normalizePath(normalizeFilename(parsedId.filename, config.root));
          const compileMetadata = astroFileToCompileMetadata.get(astroFilename);
          if (compileMetadata && parsedId.query.type === "style" && parsedId.query.index != null) {
            const result = compileMetadata.css[parsedId.query.index];
            result.dependencies?.forEach((dep) => this.addWatchFile(dep));
          }
        }
        return;
      }
      const filename = normalizePath(parsedId.filename);
      const transformResult = await compile(source, filename);
      const astroMetadata = {
        // Remove Astro components that have been mistakenly given client directives
        // We'll warn the user about this later, but for now we'll prevent them from breaking the build
        clientOnlyComponents: transformResult.clientOnlyComponents.filter(notAstroComponent),
        hydratedComponents: transformResult.hydratedComponents.filter(notAstroComponent),
        serverComponents: transformResult.serverComponents,
        scripts: transformResult.scripts,
        containsHead: transformResult.containsHead,
        propagation: transformResult.propagation ? "self" : "none",
        pageOptions: {}
      };
      return {
        code: transformResult.code,
        map: transformResult.map,
        meta: {
          astro: astroMetadata,
          vite: {
            // Setting this vite metadata to `ts` causes Vite to resolve .js
            // extensions to .ts files.
            lang: "ts"
          }
        }
      };
    },
    async handleHotUpdate(ctx) {
      return handleHotUpdate(ctx, { logger, astroFileToCompileMetadata });
    }
  };
  const normalPlugin = {
    name: "astro:build:normal",
    resolveId(id) {
      const parsedId = parseAstroRequest(id);
      if (parsedId.query.astro) {
        return id;
      }
    }
  };
  return [prePlugin, normalPlugin];
}
function appendSourceMap(content, map) {
  if (!map) return content;
  return `${content}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(
    map
  ).toString("base64")}`;
}
export {
  astro as default,
  getAstroMetadata
};
