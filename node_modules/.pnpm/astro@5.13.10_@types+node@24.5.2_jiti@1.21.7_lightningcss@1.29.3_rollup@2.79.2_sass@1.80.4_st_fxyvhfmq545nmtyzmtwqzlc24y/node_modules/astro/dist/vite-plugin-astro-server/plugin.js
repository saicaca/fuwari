import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";
import { normalizePath } from "vite";
import {
  getAlgorithm,
  getDirectives,
  getScriptHashes,
  getScriptResources,
  getStrictDynamic,
  getStyleHashes,
  getStyleResources,
  shouldTrackCspHashes
} from "../core/csp/common.js";
import { warnMissingAdapter } from "../core/dev/adapter-validation.js";
import { createKey, getEnvironmentKey, hasEnvironmentKey } from "../core/encryption.js";
import { getViteErrorPayload } from "../core/errors/dev/index.js";
import { AstroError, AstroErrorData } from "../core/errors/index.js";
import { patchOverlay } from "../core/errors/overlay.js";
import { NOOP_MIDDLEWARE_FN } from "../core/middleware/noop-middleware.js";
import { createViteLoader } from "../core/module-loader/index.js";
import { createRoutesList } from "../core/routing/index.js";
import { getRoutePrerenderOption } from "../core/routing/manifest/prerender.js";
import { toFallbackType, toRoutingStrategy } from "../i18n/utils.js";
import { runHookRoutesResolved } from "../integrations/hooks.js";
import { baseMiddleware } from "./base.js";
import { createController } from "./controller.js";
import { recordServerError } from "./error.js";
import { DevPipeline } from "./pipeline.js";
import { handleRequest } from "./request.js";
import { setRouteError } from "./server-state.js";
import { trailingSlashMiddleware } from "./trailing-slash.js";
function createVitePluginAstroServer({
  settings,
  logger,
  fs: fsMod,
  routesList,
  manifest
}) {
  return {
    name: "astro:server",
    async configureServer(viteServer) {
      const loader = createViteLoader(viteServer);
      const pipeline = DevPipeline.create(routesList, {
        loader,
        logger,
        manifest,
        settings
      });
      const controller = createController({ loader });
      const localStorage = new AsyncLocalStorage();
      async function rebuildManifest(path = null) {
        pipeline.clearRouteCache();
        if (path !== null) {
          const route = routesList.routes.find(
            (r) => normalizePath(path) === normalizePath(fileURLToPath(new URL(r.component, settings.config.root)))
          );
          if (!route) {
            return;
          }
          if (route.type !== "page" && route.type !== "endpoint") return;
          const routePath = fileURLToPath(new URL(route.component, settings.config.root));
          try {
            const content = await fsMod.promises.readFile(routePath, "utf-8");
            await getRoutePrerenderOption(content, route, settings, logger);
            await runHookRoutesResolved({ routes: routesList.routes, settings, logger });
          } catch (_) {
          }
        } else {
          routesList = await createRoutesList({ settings, fsMod }, logger, { dev: true });
        }
        warnMissingAdapter(logger, settings);
        pipeline.manifest.checkOrigin = settings.config.security.checkOrigin && settings.buildOutput === "server";
        pipeline.setManifestData(routesList);
      }
      viteServer.watcher.on("add", rebuildManifest.bind(null, null));
      viteServer.watcher.on("unlink", rebuildManifest.bind(null, null));
      viteServer.watcher.on("change", rebuildManifest);
      function handleUnhandledRejection(rejection) {
        const error = AstroError.is(rejection) ? rejection : new AstroError({
          ...AstroErrorData.UnhandledRejection,
          message: AstroErrorData.UnhandledRejection.message(rejection?.stack || rejection)
        });
        const store = localStorage.getStore();
        if (store instanceof IncomingMessage) {
          setRouteError(controller.state, store.url, error);
        }
        const { errorWithMetadata } = recordServerError(loader, settings.config, pipeline, error);
        setTimeout(
          async () => loader.webSocketSend(await getViteErrorPayload(errorWithMetadata)),
          200
        );
      }
      process.on("unhandledRejection", handleUnhandledRejection);
      viteServer.httpServer?.on("close", () => {
        process.off("unhandledRejection", handleUnhandledRejection);
      });
      return () => {
        viteServer.middlewares.stack.unshift({
          route: "",
          handle: baseMiddleware(settings, logger)
        });
        viteServer.middlewares.stack.unshift({
          route: "",
          handle: trailingSlashMiddleware(settings)
        });
        viteServer.middlewares.use(async function chromeDevToolsHandler(request, response, next) {
          if (request.url !== "/.well-known/appspecific/com.chrome.devtools.json") {
            return next();
          }
          if (!settings.config.experimental.chromeDevtoolsWorkspace) {
            response.writeHead(404);
            response.end();
            return;
          }
          const pluginVersion = "1.1";
          const cacheDir = settings.config.cacheDir;
          const configPath = new URL("./chrome-workspace.json", cacheDir);
          if (!existsSync(cacheDir)) {
            await mkdir(cacheDir, { recursive: true });
          }
          let config;
          try {
            config = JSON.parse(await readFile(configPath, "utf-8"));
            if (config.version !== pluginVersion) throw new Error("Cached config is outdated.");
          } catch {
            config = {
              workspace: {
                version: pluginVersion,
                uuid: randomUUID(),
                root: fileURLToPath(settings.config.root)
              }
            };
            await writeFile(configPath, JSON.stringify(config));
          }
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(config));
          return;
        });
        viteServer.middlewares.use(async function astroDevHandler(request, response) {
          if (request.url === void 0 || !request.method) {
            response.writeHead(500, "Incomplete request");
            response.end();
            return;
          }
          localStorage.run(request, () => {
            handleRequest({
              pipeline,
              routesList,
              controller,
              incomingRequest: request,
              incomingResponse: response
            });
          });
        });
      };
    },
    transform(code, id, opts = {}) {
      if (opts.ssr) return;
      if (!id.includes("vite/dist/client/client.mjs")) return;
      return patchOverlay(code);
    }
  };
}
function createDevelopmentManifest(settings) {
  let i18nManifest;
  let csp;
  if (settings.config.i18n) {
    i18nManifest = {
      fallback: settings.config.i18n.fallback,
      strategy: toRoutingStrategy(settings.config.i18n.routing, settings.config.i18n.domains),
      defaultLocale: settings.config.i18n.defaultLocale,
      locales: settings.config.i18n.locales,
      domainLookupTable: {},
      fallbackType: toFallbackType(settings.config.i18n.routing)
    };
  }
  if (shouldTrackCspHashes(settings.config.experimental.csp)) {
    const styleHashes = [
      ...getStyleHashes(settings.config.experimental.csp),
      ...settings.injectedCsp.styleHashes
    ];
    csp = {
      cspDestination: settings.adapter?.adapterFeatures?.experimentalStaticHeaders ? "adapter" : void 0,
      scriptHashes: getScriptHashes(settings.config.experimental.csp),
      scriptResources: getScriptResources(settings.config.experimental.csp),
      styleHashes,
      styleResources: getStyleResources(settings.config.experimental.csp),
      algorithm: getAlgorithm(settings.config.experimental.csp),
      directives: getDirectives(settings),
      isStrictDynamic: getStrictDynamic(settings.config.experimental.csp)
    };
  }
  return {
    hrefRoot: settings.config.root.toString(),
    srcDir: settings.config.srcDir,
    cacheDir: settings.config.cacheDir,
    outDir: settings.config.outDir,
    buildServerDir: settings.config.build.server,
    buildClientDir: settings.config.build.client,
    publicDir: settings.config.publicDir,
    trailingSlash: settings.config.trailingSlash,
    buildFormat: settings.config.build.format,
    compressHTML: settings.config.compressHTML,
    assets: /* @__PURE__ */ new Set(),
    entryModules: {},
    routes: [],
    adapterName: settings?.adapter?.name ?? "",
    clientDirectives: settings.clientDirectives,
    renderers: [],
    base: settings.config.base,
    userAssetsBase: settings.config?.vite?.base,
    assetsPrefix: settings.config.build.assetsPrefix,
    site: settings.config.site,
    componentMetadata: /* @__PURE__ */ new Map(),
    inlinedScripts: /* @__PURE__ */ new Map(),
    i18n: i18nManifest,
    checkOrigin: (settings.config.security?.checkOrigin && settings.buildOutput === "server") ?? false,
    key: hasEnvironmentKey() ? getEnvironmentKey() : createKey(),
    middleware() {
      return {
        onRequest: NOOP_MIDDLEWARE_FN
      };
    },
    sessionConfig: settings.config.session,
    csp
  };
}
export {
  createDevelopmentManifest,
  createVitePluginAstroServer as default
};
