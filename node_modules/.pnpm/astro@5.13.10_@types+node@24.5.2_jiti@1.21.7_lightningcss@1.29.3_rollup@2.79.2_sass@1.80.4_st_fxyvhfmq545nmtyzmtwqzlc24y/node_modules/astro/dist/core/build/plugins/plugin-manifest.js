import { fileURLToPath } from "node:url";
import { resolve as importMetaResolve } from "import-meta-resolve";
import { glob } from "tinyglobby";
import { builtinDrivers } from "unstorage";
import { getAssetsPrefix } from "../../../assets/utils/getAssetsPrefix.js";
import { normalizeTheLocale } from "../../../i18n/index.js";
import { toFallbackType, toRoutingStrategy } from "../../../i18n/utils.js";
import { runHookBuildSsr } from "../../../integrations/hooks.js";
import { BEFORE_HYDRATION_SCRIPT_ID, PAGE_SCRIPT_ID } from "../../../vite-plugin-scripts/index.js";
import {
  getAlgorithm,
  getDirectives,
  getScriptHashes,
  getScriptResources,
  getStrictDynamic,
  getStyleHashes,
  getStyleResources,
  shouldTrackCspHashes,
  trackScriptHashes,
  trackStyleHashes
} from "../../csp/common.js";
import { encodeKey } from "../../encryption.js";
import { fileExtension, joinPaths, prependForwardSlash } from "../../path.js";
import { DEFAULT_COMPONENTS } from "../../routing/default.js";
import { serializeRouteData } from "../../routing/index.js";
import { addRollupInput } from "../add-rollup-input.js";
import { getOutFile, getOutFolder } from "../common.js";
import { cssOrder, mergeInlineCss } from "../internal.js";
import { makePageDataKey } from "./util.js";
const manifestReplace = "@@ASTRO_MANIFEST_REPLACE@@";
const replaceExp = new RegExp(`['"]${manifestReplace}['"]`, "g");
const SSR_MANIFEST_VIRTUAL_MODULE_ID = "@astrojs-manifest";
const RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID = "\0" + SSR_MANIFEST_VIRTUAL_MODULE_ID;
function resolveSessionDriver(driver) {
  if (!driver) {
    return null;
  }
  try {
    if (driver === "fs") {
      return importMetaResolve(builtinDrivers.fsLite, import.meta.url);
    }
    if (driver in builtinDrivers) {
      return importMetaResolve(builtinDrivers[driver], import.meta.url);
    }
  } catch {
    return null;
  }
  return driver;
}
function vitePluginManifest(options, internals) {
  return {
    name: "@astro/plugin-build-manifest",
    enforce: "post",
    options(opts) {
      return addRollupInput(opts, [SSR_MANIFEST_VIRTUAL_MODULE_ID]);
    },
    resolveId(id) {
      if (id === SSR_MANIFEST_VIRTUAL_MODULE_ID) {
        return RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID;
      }
    },
    augmentChunkHash(chunkInfo) {
      if (chunkInfo.facadeModuleId === RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID) {
        return Date.now().toString();
      }
    },
    load(id) {
      if (id === RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID) {
        const imports = [
          `import { deserializeManifest as _deserializeManifest } from 'astro/app'`,
          `import { _privateSetManifestDontUseThis } from 'astro:ssr-manifest'`
        ];
        const resolvedDriver = resolveSessionDriver(options.settings.config.session?.driver);
        const contents = [
          `const manifest = _deserializeManifest('${manifestReplace}');`,
          `if (manifest.sessionConfig) manifest.sessionConfig.driverModule = ${resolvedDriver ? `() => import(${JSON.stringify(resolvedDriver)})` : "null"};`,
          `_privateSetManifestDontUseThis(manifest);`
        ];
        const exports = [`export { manifest }`];
        return { code: [...imports, ...contents, ...exports].join("\n") };
      }
    },
    async generateBundle(_opts, bundle) {
      for (const [chunkName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset") {
          continue;
        }
        if (chunk.modules[RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID]) {
          internals.manifestEntryChunk = chunk;
          delete bundle[chunkName];
        }
        if (chunkName.startsWith("manifest")) {
          internals.manifestFileName = chunkName;
        }
      }
    }
  };
}
function pluginManifest(options, internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginManifest(options, internals)
        };
      },
      "build:post": async ({ mutate }) => {
        if (!internals.manifestEntryChunk) {
          throw new Error(`Did not generate an entry chunk for SSR`);
        }
        const manifest = await createManifest(options, internals);
        const shouldPassMiddlewareEntryPoint = options.settings.adapter?.adapterFeatures?.edgeMiddleware;
        await runHookBuildSsr({
          config: options.settings.config,
          manifest,
          logger: options.logger,
          entryPoints: internals.entryPoints,
          middlewareEntryPoint: shouldPassMiddlewareEntryPoint ? internals.middlewareEntryPoint : void 0
        });
        const code = injectManifest(manifest, internals.manifestEntryChunk);
        mutate(internals.manifestEntryChunk, ["server"], code);
      }
    }
  };
}
async function createManifest(buildOpts, internals) {
  if (!internals.manifestEntryChunk) {
    throw new Error(`Did not generate an entry chunk for SSR`);
  }
  const clientStatics = new Set(
    await glob("**/*", {
      cwd: fileURLToPath(buildOpts.settings.config.build.client)
    })
  );
  for (const file of clientStatics) {
    internals.staticFiles.add(file);
  }
  const staticFiles = internals.staticFiles;
  const encodedKey = await encodeKey(await buildOpts.key);
  return await buildManifest(buildOpts, internals, Array.from(staticFiles), encodedKey);
}
function injectManifest(manifest, chunk) {
  const code = chunk.code;
  return code.replace(replaceExp, () => {
    return JSON.stringify(manifest);
  });
}
async function buildManifest(opts, internals, staticFiles, encodedKey) {
  const { settings } = opts;
  const routes = [];
  const domainLookupTable = {};
  const entryModules = Object.fromEntries(internals.entrySpecifierToBundleMap.entries());
  if (settings.scripts.some((script) => script.stage === "page")) {
    staticFiles.push(entryModules[PAGE_SCRIPT_ID]);
  }
  const prefixAssetPath = (pth) => {
    if (settings.config.build.assetsPrefix) {
      const pf = getAssetsPrefix(fileExtension(pth), settings.config.build.assetsPrefix);
      return joinPaths(pf, pth);
    } else {
      return prependForwardSlash(joinPaths(settings.config.base, pth));
    }
  };
  for (const route of opts.routesList.routes) {
    if (!DEFAULT_COMPONENTS.find((component) => route.component === component)) {
      continue;
    }
    routes.push({
      file: "",
      links: [],
      scripts: [],
      styles: [],
      routeData: serializeRouteData(route, settings.config.trailingSlash)
    });
  }
  for (const route of opts.routesList.routes) {
    if (!route.prerender) continue;
    if (!route.pathname) continue;
    const outFolder = getOutFolder(opts.settings, route.pathname, route);
    const outFile = getOutFile(opts.settings.config, outFolder, route.pathname, route);
    const file = outFile.toString().replace(opts.settings.config.build.client.toString(), "");
    routes.push({
      file,
      links: [],
      scripts: [],
      styles: [],
      routeData: serializeRouteData(route, settings.config.trailingSlash)
    });
    staticFiles.push(file);
  }
  const needsStaticHeaders = settings.adapter?.adapterFeatures?.experimentalStaticHeaders ?? false;
  for (const route of opts.routesList.routes) {
    const pageData = internals.pagesByKeys.get(makePageDataKey(route.route, route.component));
    if (!pageData) continue;
    if (route.prerender && !needsStaticHeaders) {
      continue;
    }
    const scripts = [];
    if (settings.scripts.some((script) => script.stage === "page")) {
      const src = entryModules[PAGE_SCRIPT_ID];
      scripts.push({
        type: "external",
        value: prefixAssetPath(src)
      });
    }
    const links = [];
    const styles = pageData.styles.sort(cssOrder).map(({ sheet }) => sheet).map((s) => s.type === "external" ? { ...s, src: prefixAssetPath(s.src) } : s).reduce(mergeInlineCss, []);
    routes.push({
      file: "",
      links,
      scripts: [
        ...scripts,
        ...settings.scripts.filter((script) => script.stage === "head-inline").map(({ stage, content }) => ({ stage, children: content }))
      ],
      styles,
      routeData: serializeRouteData(route, settings.config.trailingSlash)
    });
  }
  const i18n = settings.config.i18n;
  if (i18n && i18n.domains) {
    for (const [locale, domainValue] of Object.entries(i18n.domains)) {
      domainLookupTable[domainValue] = normalizeTheLocale(locale);
    }
  }
  if (!(BEFORE_HYDRATION_SCRIPT_ID in entryModules)) {
    entryModules[BEFORE_HYDRATION_SCRIPT_ID] = "";
  }
  let i18nManifest = void 0;
  if (settings.config.i18n) {
    i18nManifest = {
      fallback: settings.config.i18n.fallback,
      fallbackType: toFallbackType(settings.config.i18n.routing),
      strategy: toRoutingStrategy(settings.config.i18n.routing, settings.config.i18n.domains),
      locales: settings.config.i18n.locales,
      defaultLocale: settings.config.i18n.defaultLocale,
      domainLookupTable
    };
  }
  let csp = void 0;
  if (shouldTrackCspHashes(settings.config.experimental.csp)) {
    const algorithm = getAlgorithm(settings.config.experimental.csp);
    const scriptHashes = [
      ...getScriptHashes(settings.config.experimental.csp),
      ...await trackScriptHashes(internals, settings, algorithm)
    ];
    const styleHashes = [
      ...getStyleHashes(settings.config.experimental.csp),
      ...settings.injectedCsp.styleHashes,
      ...await trackStyleHashes(internals, settings, algorithm)
    ];
    csp = {
      cspDestination: settings.adapter?.adapterFeatures?.experimentalStaticHeaders ? "adapter" : void 0,
      scriptHashes,
      scriptResources: getScriptResources(settings.config.experimental.csp),
      styleHashes,
      styleResources: getStyleResources(settings.config.experimental.csp),
      algorithm,
      directives: getDirectives(settings),
      isStrictDynamic: getStrictDynamic(settings.config.experimental.csp)
    };
  }
  return {
    hrefRoot: opts.settings.config.root.toString(),
    cacheDir: opts.settings.config.cacheDir.toString(),
    outDir: opts.settings.config.outDir.toString(),
    srcDir: opts.settings.config.srcDir.toString(),
    publicDir: opts.settings.config.publicDir.toString(),
    buildClientDir: opts.settings.config.build.client.toString(),
    buildServerDir: opts.settings.config.build.server.toString(),
    adapterName: opts.settings.adapter?.name ?? "",
    routes,
    site: settings.config.site,
    base: settings.config.base,
    userAssetsBase: settings.config?.vite?.base,
    trailingSlash: settings.config.trailingSlash,
    compressHTML: settings.config.compressHTML,
    assetsPrefix: settings.config.build.assetsPrefix,
    componentMetadata: Array.from(internals.componentMetadata),
    renderers: [],
    clientDirectives: Array.from(settings.clientDirectives),
    entryModules,
    inlinedScripts: Array.from(internals.inlinedScripts),
    assets: staticFiles.map(prefixAssetPath),
    i18n: i18nManifest,
    buildFormat: settings.config.build.format,
    checkOrigin: (settings.config.security?.checkOrigin && settings.buildOutput === "server") ?? false,
    serverIslandNameMap: Array.from(settings.serverIslandNameMap),
    key: encodedKey,
    sessionConfig: settings.config.session,
    csp
  };
}
export {
  RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID,
  SSR_MANIFEST_VIRTUAL_MODULE_ID,
  pluginManifest
};
