import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { getAlgorithm, shouldTrackCspHashes } from "../../core/csp/common.js";
import { generateCspDigest } from "../../core/encryption.js";
import { collectErrorMetadata } from "../../core/errors/dev/utils.js";
import { AstroError, AstroErrorData, isAstroError } from "../../core/errors/index.js";
import { formatErrorMessage } from "../../core/messages.js";
import { appendForwardSlash, joinPaths, prependForwardSlash } from "../../core/path.js";
import { getClientOutputDirectory } from "../../prerender/utils.js";
import {
  ASSETS_DIR,
  CACHE_DIR,
  DEFAULTS,
  RESOLVED_VIRTUAL_MODULE_ID,
  VIRTUAL_MODULE_ID
} from "./constants.js";
import { createMinifiableCssRenderer } from "./implementations/css-renderer.js";
import { createDataCollector } from "./implementations/data-collector.js";
import { createAstroErrorHandler } from "./implementations/error-handler.js";
import { createCachedFontFetcher } from "./implementations/font-fetcher.js";
import { createFontaceFontFileReader } from "./implementations/font-file-reader.js";
import { createCapsizeFontMetricsResolver } from "./implementations/font-metrics-resolver.js";
import { createFontTypeExtractor } from "./implementations/font-type-extractor.js";
import { createXxHasher } from "./implementations/hasher.js";
import { createRequireLocalProviderUrlResolver } from "./implementations/local-provider-url-resolver.js";
import {
  createBuildRemoteFontProviderModResolver,
  createDevServerRemoteFontProviderModResolver
} from "./implementations/remote-font-provider-mod-resolver.js";
import { createRemoteFontProviderResolver } from "./implementations/remote-font-provider-resolver.js";
import { createFsStorage } from "./implementations/storage.js";
import { createSystemFallbacksProvider } from "./implementations/system-fallbacks-provider.js";
import { createUrlProxy } from "./implementations/url-proxy.js";
import {
  createLocalUrlProxyContentResolver,
  createRemoteUrlProxyContentResolver
} from "./implementations/url-proxy-content-resolver.js";
import { createBuildUrlResolver, createDevUrlResolver } from "./implementations/url-resolver.js";
import { orchestrate } from "./orchestrate.js";
function fontsPlugin({ settings, sync, logger }) {
  if (sync || !settings.config.experimental.fonts) {
    return {
      name: "astro:fonts:fallback",
      resolveId(id) {
        if (id === VIRTUAL_MODULE_ID) {
          return RESOLVED_VIRTUAL_MODULE_ID;
        }
      },
      load(id) {
        if (id === RESOLVED_VIRTUAL_MODULE_ID) {
          return {
            code: ""
          };
        }
      }
    };
  }
  const assetsDir = prependForwardSlash(
    appendForwardSlash(joinPaths(settings.config.build.assets, ASSETS_DIR))
  );
  const baseUrl = joinPaths(settings.config.base, assetsDir);
  let fontFileDataMap = null;
  let consumableMap = null;
  let isBuild;
  let fontFetcher = null;
  let fontTypeExtractor = null;
  const cleanup = () => {
    consumableMap = null;
    fontFileDataMap = null;
    fontFetcher = null;
  };
  async function initialize({
    cacheDir,
    modResolver,
    cssRenderer,
    urlResolver
  }) {
    const { root } = settings.config;
    const hasher = await createXxHasher();
    const errorHandler = createAstroErrorHandler();
    const remoteFontProviderResolver = createRemoteFontProviderResolver({
      root,
      modResolver,
      errorHandler
    });
    const pathsToWarn = /* @__PURE__ */ new Set();
    const localProviderUrlResolver = createRequireLocalProviderUrlResolver({
      root,
      intercept: (path) => {
        if (path.startsWith(fileURLToPath(settings.config.publicDir))) {
          if (pathsToWarn.has(path)) {
            return;
          }
          pathsToWarn.add(path);
          logger.warn(
            "assets",
            `Found a local font file ${JSON.stringify(path)} in the \`public/\` folder. To avoid duplicated files in the build output, move this file into \`src/\``
          );
        }
      }
    });
    const storage = createFsStorage({ base: cacheDir });
    const systemFallbacksProvider = createSystemFallbacksProvider();
    fontFetcher = createCachedFontFetcher({ storage, errorHandler, fetch, readFile });
    const fontMetricsResolver = createCapsizeFontMetricsResolver({ fontFetcher, cssRenderer });
    fontTypeExtractor = createFontTypeExtractor({ errorHandler });
    const fontFileReader = createFontaceFontFileReader({ errorHandler });
    const res = await orchestrate({
      families: settings.config.experimental.fonts,
      hasher,
      remoteFontProviderResolver,
      localProviderUrlResolver,
      storage,
      cssRenderer,
      systemFallbacksProvider,
      fontMetricsResolver,
      fontTypeExtractor,
      fontFileReader,
      logger,
      createUrlProxy: ({ local, ...params }) => {
        const dataCollector = createDataCollector(params);
        const contentResolver = local ? createLocalUrlProxyContentResolver({ errorHandler }) : createRemoteUrlProxyContentResolver();
        return createUrlProxy({
          urlResolver,
          contentResolver,
          hasher,
          dataCollector
        });
      },
      defaults: DEFAULTS
    });
    fontFileDataMap = res.fontFileDataMap;
    consumableMap = res.consumableMap;
    if (shouldTrackCspHashes(settings.config.experimental.csp)) {
      const algorithm = getAlgorithm(settings.config.experimental.csp);
      for (const { css } of consumableMap.values()) {
        settings.injectedCsp.styleHashes.push(await generateCspDigest(css, algorithm));
      }
      const resources = urlResolver.getCspResources();
      for (const resource of resources) {
        settings.injectedCsp.fontResources.add(resource);
      }
    }
  }
  return {
    name: "astro:fonts",
    config(_, { command }) {
      isBuild = command === "build";
    },
    async buildStart() {
      if (isBuild) {
        await initialize({
          cacheDir: new URL(CACHE_DIR, settings.config.cacheDir),
          modResolver: createBuildRemoteFontProviderModResolver(),
          cssRenderer: createMinifiableCssRenderer({ minify: true }),
          urlResolver: createBuildUrlResolver({
            base: baseUrl,
            assetsPrefix: settings.config.build.assetsPrefix
          })
        });
      }
    },
    async configureServer(server) {
      await initialize({
        // In dev, we cache fonts data in .astro so it can be easily inspected and cleared
        cacheDir: new URL(CACHE_DIR, settings.dotAstroDir),
        modResolver: createDevServerRemoteFontProviderModResolver({ server }),
        cssRenderer: createMinifiableCssRenderer({ minify: false }),
        urlResolver: createDevUrlResolver({ base: baseUrl })
      });
      const localPaths = [...fontFileDataMap.values()].filter(({ url }) => isAbsolute(url)).map((v) => v.url);
      server.watcher.on("change", (path) => {
        if (localPaths.includes(path)) {
          logger.info("assets", "Font file updated");
          server.restart();
        }
      });
      server.watcher.on("unlink", (path) => {
        if (localPaths.includes(path)) {
          logger.warn(
            "assets",
            `The font file ${JSON.stringify(path)} referenced in your config has been deleted. Restore the file or remove this font from your configuration if it is no longer needed.`
          );
        }
      });
      server.middlewares.use(assetsDir, async (req, res, next) => {
        if (!req.url) {
          return next();
        }
        const hash = req.url.slice(1);
        const associatedData = fontFileDataMap?.get(hash);
        if (!associatedData) {
          return next();
        }
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", 0);
        try {
          const data = await fontFetcher.fetch({ hash, ...associatedData });
          res.setHeader("Content-Length", data.length);
          res.setHeader("Content-Type", `font/${fontTypeExtractor.extract(hash)}`);
          res.end(data);
        } catch (err) {
          logger.error("assets", "Cannot download font file");
          if (isAstroError(err)) {
            logger.error(
              "SKIP_FORMAT",
              formatErrorMessage(collectErrorMetadata(err), logger.level() === "debug")
            );
          }
          res.statusCode = 500;
          res.end();
        }
      });
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return {
          code: `export const fontsData = new Map(${JSON.stringify(Array.from(consumableMap?.entries() ?? []))})`
        };
      }
    },
    async buildEnd() {
      if (settings.config.experimental.fonts.length === 0) {
        cleanup();
        return;
      }
      try {
        const dir = getClientOutputDirectory(settings);
        const fontsDir = new URL(`.${assetsDir}`, dir);
        try {
          mkdirSync(fontsDir, { recursive: true });
        } catch (cause) {
          throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause });
        }
        if (fontFileDataMap) {
          logger.info("assets", "Copying fonts...");
          await Promise.all(
            Array.from(fontFileDataMap.entries()).map(async ([hash, associatedData]) => {
              const data = await fontFetcher.fetch({ hash, ...associatedData });
              try {
                writeFileSync(new URL(hash, fontsDir), data);
              } catch (cause) {
                throw new AstroError(AstroErrorData.UnknownFilesystemError, { cause });
              }
            })
          );
        }
      } finally {
        cleanup();
      }
    }
  };
}
export {
  fontsPlugin
};
