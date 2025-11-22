import { extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getAssetsPrefix } from "../assets/utils/getAssetsPrefix.js";
import { AstroError, AstroErrorData } from "../core/errors/index.js";
import { createViteLoader } from "../core/module-loader/vite.js";
import { joinPaths, prependForwardSlash } from "../core/path.js";
import { getStylesForURL } from "../vite-plugin-astro-server/css.js";
import {
  CONTENT_IMAGE_FLAG,
  CONTENT_RENDER_FLAG,
  LINKS_PLACEHOLDER,
  PROPAGATED_ASSET_FLAG,
  STYLES_PLACEHOLDER
} from "./consts.js";
import { hasContentFlag } from "./utils.js";
function astroContentAssetPropagationPlugin({
  settings
}) {
  let devModuleLoader;
  return {
    name: "astro:content-asset-propagation",
    enforce: "pre",
    async resolveId(id, importer, opts) {
      if (hasContentFlag(id, CONTENT_IMAGE_FLAG)) {
        const [base, query] = id.split("?");
        const params = new URLSearchParams(query);
        const importerParam = params.get("importer");
        const importerPath = importerParam ? fileURLToPath(new URL(importerParam, settings.config.root)) : importer;
        const resolved = await this.resolve(base, importerPath, { skipSelf: true, ...opts });
        if (!resolved) {
          throw new AstroError({
            ...AstroErrorData.ImageNotFound,
            message: AstroErrorData.ImageNotFound.message(base)
          });
        }
        return resolved;
      }
      if (hasContentFlag(id, CONTENT_RENDER_FLAG)) {
        const base = id.split("?")[0];
        for (const { extensions, handlePropagation = true } of settings.contentEntryTypes) {
          if (handlePropagation && extensions.includes(extname(base))) {
            return this.resolve(`${base}?${PROPAGATED_ASSET_FLAG}`, importer, {
              skipSelf: true,
              ...opts
            });
          }
        }
        return this.resolve(base, importer, { skipSelf: true, ...opts });
      }
    },
    configureServer(server) {
      devModuleLoader = createViteLoader(server);
    },
    async transform(_, id, options) {
      if (hasContentFlag(id, PROPAGATED_ASSET_FLAG)) {
        const basePath = id.split("?")[0];
        let stringifiedLinks, stringifiedStyles;
        if (options?.ssr && devModuleLoader) {
          if (!devModuleLoader.getModuleById(basePath)?.ssrModule) {
            await devModuleLoader.import(basePath);
          }
          const {
            styles,
            urls,
            crawledFiles: styleCrawledFiles
          } = await getStylesForURL(pathToFileURL(basePath), devModuleLoader);
          for (const file of styleCrawledFiles) {
            if (!file.includes("node_modules")) {
              this.addWatchFile(file);
            }
          }
          stringifiedLinks = JSON.stringify([...urls]);
          stringifiedStyles = JSON.stringify(styles.map((s) => s.content));
        } else {
          stringifiedLinks = JSON.stringify(LINKS_PLACEHOLDER);
          stringifiedStyles = JSON.stringify(STYLES_PLACEHOLDER);
        }
        const code = `
					async function getMod() {
						return import(${JSON.stringify(basePath)});
					}
					const collectedLinks = ${stringifiedLinks};
					const collectedStyles = ${stringifiedStyles};
					const defaultMod = { __astroPropagation: true, getMod, collectedLinks, collectedStyles, collectedScripts: [] };
					export default defaultMod;
				`;
        return { code, map: { mappings: "" } };
      }
    }
  };
}
function astroConfigBuildPlugin(options, internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:post": ({ ssrOutputs, mutate }) => {
        const outputs = ssrOutputs.flatMap((o) => o.output);
        const prependBase = (src) => {
          const { assetsPrefix } = options.settings.config.build;
          if (assetsPrefix) {
            const fileExtension = extname(src);
            const pf = getAssetsPrefix(fileExtension, assetsPrefix);
            return joinPaths(pf, src);
          } else {
            return prependForwardSlash(joinPaths(options.settings.config.base, src));
          }
        };
        for (const chunk of outputs) {
          if (chunk.type === "chunk" && chunk.code.includes(LINKS_PLACEHOLDER)) {
            const entryStyles = /* @__PURE__ */ new Set();
            const entryLinks = /* @__PURE__ */ new Set();
            for (const id of chunk.moduleIds) {
              const _entryCss = internals.propagatedStylesMap.get(id);
              if (_entryCss) {
                for (const value of _entryCss) {
                  if (value.type === "inline") entryStyles.add(value.content);
                  if (value.type === "external") entryLinks.add(value.src);
                }
              }
            }
            let newCode = chunk.code;
            if (entryStyles.size) {
              newCode = newCode.replace(
                JSON.stringify(STYLES_PLACEHOLDER),
                JSON.stringify(Array.from(entryStyles))
              );
            } else {
              newCode = newCode.replace(JSON.stringify(STYLES_PLACEHOLDER), "[]");
            }
            if (entryLinks.size) {
              newCode = newCode.replace(
                JSON.stringify(LINKS_PLACEHOLDER),
                JSON.stringify(Array.from(entryLinks).map(prependBase))
              );
            } else {
              newCode = newCode.replace(JSON.stringify(LINKS_PLACEHOLDER), "[]");
            }
            mutate(chunk, ["server"], newCode);
          }
        }
      }
    }
  };
}
export {
  astroConfigBuildPlugin,
  astroContentAssetPropagationPlugin
};
