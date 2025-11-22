import { getServerOutputDirectory } from "../../prerender/utils.js";
import { BEFORE_HYDRATION_SCRIPT_ID, PAGE_SCRIPT_ID } from "../../vite-plugin-scripts/index.js";
import { routeIsFallback, routeIsRedirect } from "../redirects/helpers.js";
import { RedirectSinglePageBuiltModule } from "../redirects/index.js";
import { Pipeline } from "../render/index.js";
import { createAssetLink, createStylesheetElementSet } from "../render/ssr-element.js";
import { createDefaultRoutes } from "../routing/default.js";
import { findRouteToRewrite } from "../routing/rewrite.js";
import { getOutDirWithinCwd } from "./common.js";
import { cssOrder, getPageData, mergeInlineCss } from "./internal.js";
import { ASTRO_PAGE_MODULE_ID, ASTRO_PAGE_RESOLVED_MODULE_ID } from "./plugins/plugin-pages.js";
import { getPagesFromVirtualModulePageName, getVirtualModulePageName } from "./plugins/util.js";
import { i18nHasFallback } from "./util.js";
class BuildPipeline extends Pipeline {
  constructor(internals, manifest, options, config = options.settings.config, settings = options.settings, defaultRoutes = createDefaultRoutes(manifest)) {
    const resolveCache = /* @__PURE__ */ new Map();
    async function resolve(specifier) {
      if (resolveCache.has(specifier)) {
        return resolveCache.get(specifier);
      }
      const hashedFilePath = manifest.entryModules[specifier];
      if (typeof hashedFilePath !== "string" || hashedFilePath === "") {
        if (specifier === BEFORE_HYDRATION_SCRIPT_ID) {
          resolveCache.set(specifier, "");
          return "";
        }
        throw new Error(`Cannot find the built path for ${specifier}`);
      }
      const assetLink = createAssetLink(hashedFilePath, manifest.base, manifest.assetsPrefix);
      resolveCache.set(specifier, assetLink);
      return assetLink;
    }
    const serverLike = settings.buildOutput === "server";
    const streaming = serverLike;
    super(
      options.logger,
      manifest,
      options.runtimeMode,
      manifest.renderers,
      resolve,
      serverLike,
      streaming
    );
    this.internals = internals;
    this.manifest = manifest;
    this.options = options;
    this.config = config;
    this.settings = settings;
    this.defaultRoutes = defaultRoutes;
  }
  #componentsInterner = /* @__PURE__ */ new WeakMap();
  /**
   * This cache is needed to map a single `RouteData` to its file path.
   * @private
   */
  #routesByFilePath = /* @__PURE__ */ new WeakMap();
  get outFolder() {
    return this.settings.buildOutput === "server" ? this.settings.config.build.server : getOutDirWithinCwd(this.settings.config.outDir);
  }
  getRoutes() {
    return this.options.routesList.routes;
  }
  static create({
    internals,
    manifest,
    options
  }) {
    return new BuildPipeline(internals, manifest, options);
  }
  /**
   * The SSR build emits two important files:
   * - dist/server/manifest.mjs
   * - dist/renderers.mjs
   *
   * These two files, put together, will be used to generate the pages.
   *
   * ## Errors
   *
   * It will throw errors if the previous files can't be found in the file system.
   *
   * @param staticBuildOptions
   */
  static async retrieveManifest(settings, internals) {
    const baseDirectory = getServerOutputDirectory(settings);
    const manifestEntryUrl = new URL(
      `${internals.manifestFileName}?time=${Date.now()}`,
      baseDirectory
    );
    const { manifest } = await import(manifestEntryUrl.toString());
    if (!manifest) {
      throw new Error(
        "Astro couldn't find the emitted manifest. This is an internal error, please file an issue."
      );
    }
    const renderersEntryUrl = new URL(`renderers.mjs?time=${Date.now()}`, baseDirectory);
    const renderers = await import(renderersEntryUrl.toString());
    const middleware = internals.middlewareEntryPoint ? async function() {
      const mod = await import(internals.middlewareEntryPoint.toString());
      return { onRequest: mod.onRequest };
    } : manifest.middleware;
    if (!renderers) {
      throw new Error(
        "Astro couldn't find the emitted renderers. This is an internal error, please file an issue."
      );
    }
    return {
      ...manifest,
      renderers: renderers.renderers,
      middleware
    };
  }
  headElements(routeData) {
    const {
      internals,
      manifest: { assetsPrefix, base },
      settings
    } = this;
    const links = /* @__PURE__ */ new Set();
    const pageBuildData = getPageData(internals, routeData.route, routeData.component);
    const scripts = /* @__PURE__ */ new Set();
    const sortedCssAssets = pageBuildData?.styles.sort(cssOrder).map(({ sheet }) => sheet).reduce(mergeInlineCss, []);
    const styles = createStylesheetElementSet(sortedCssAssets ?? [], base, assetsPrefix);
    if (settings.scripts.some((script) => script.stage === "page")) {
      const hashedFilePath = internals.entrySpecifierToBundleMap.get(PAGE_SCRIPT_ID);
      if (typeof hashedFilePath !== "string") {
        throw new Error(`Cannot find the built path for ${PAGE_SCRIPT_ID}`);
      }
      const src = createAssetLink(hashedFilePath, base, assetsPrefix);
      scripts.add({
        props: { type: "module", src },
        children: ""
      });
    }
    for (const script of settings.scripts) {
      if (script.stage === "head-inline") {
        scripts.add({
          props: {},
          children: script.content
        });
      }
    }
    return { scripts, styles, links };
  }
  componentMetadata() {
  }
  /**
   * It collects the routes to generate during the build.
   * It returns a map of page information and their relative entry point as a string.
   */
  retrieveRoutesToGenerate() {
    const pages = /* @__PURE__ */ new Map();
    for (const [virtualModulePageName, filePath] of this.internals.entrySpecifierToBundleMap) {
      if (virtualModulePageName.includes(ASTRO_PAGE_RESOLVED_MODULE_ID)) {
        let pageDatas = [];
        pageDatas.push(
          ...getPagesFromVirtualModulePageName(
            this.internals,
            ASTRO_PAGE_RESOLVED_MODULE_ID,
            virtualModulePageName
          )
        );
        for (const pageData of pageDatas) {
          pages.set(pageData, filePath);
        }
      }
    }
    for (const pageData of this.internals.pagesByKeys.values()) {
      if (routeIsRedirect(pageData.route)) {
        pages.set(pageData, pageData.component);
      } else if (routeIsFallback(pageData.route) && (i18nHasFallback(this.config) || routeIsFallback(pageData.route) && pageData.route.route === "/")) {
        const moduleSpecifier = getVirtualModulePageName(ASTRO_PAGE_MODULE_ID, pageData.component);
        const filePath = this.internals.entrySpecifierToBundleMap.get(moduleSpecifier);
        if (filePath) {
          pages.set(pageData, filePath);
        }
      }
    }
    for (const [buildData, filePath] of pages.entries()) {
      this.#routesByFilePath.set(buildData.route, filePath);
    }
    return pages;
  }
  async getComponentByRoute(routeData) {
    if (this.#componentsInterner.has(routeData)) {
      const entry = this.#componentsInterner.get(routeData);
      return await entry.page();
    }
    for (const route of this.defaultRoutes) {
      if (route.component === routeData.component) {
        return route.instance;
      }
    }
    const filePath = this.#routesByFilePath.get(routeData);
    const module = await this.retrieveSsrEntry(routeData, filePath);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { routeData, pathname, newUrl } = findRouteToRewrite({
      payload,
      request,
      routes: this.options.routesList.routes,
      trailingSlash: this.config.trailingSlash,
      buildFormat: this.config.build.format,
      base: this.config.base,
      outDir: this.serverLike ? this.manifest.buildClientDir : this.manifest.outDir
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { routeData, componentInstance, newUrl, pathname };
  }
  async retrieveSsrEntry(route, filePath) {
    if (this.#componentsInterner.has(route)) {
      return this.#componentsInterner.get(route);
    }
    let entry;
    if (routeIsRedirect(route)) {
      entry = await this.#getEntryForRedirectRoute(route, this.outFolder);
    } else if (routeIsFallback(route)) {
      entry = await this.#getEntryForFallbackRoute(route, this.outFolder);
    } else {
      const ssrEntryURLPage = createEntryURL(filePath, this.outFolder);
      entry = await import(ssrEntryURLPage.toString());
    }
    this.#componentsInterner.set(route, entry);
    return entry;
  }
  async #getEntryForFallbackRoute(route, outFolder) {
    if (route.type !== "fallback") {
      throw new Error(`Expected a redirect route.`);
    }
    if (route.redirectRoute) {
      const filePath = getEntryFilePath(this.internals, route.redirectRoute);
      if (filePath) {
        const url = createEntryURL(filePath, outFolder);
        const ssrEntryPage = await import(url.toString());
        return ssrEntryPage;
      }
    }
    return RedirectSinglePageBuiltModule;
  }
  async #getEntryForRedirectRoute(route, outFolder) {
    if (route.type !== "redirect") {
      throw new Error(`Expected a redirect route.`);
    }
    if (route.redirectRoute) {
      const filePath = getEntryFilePath(this.internals, route.redirectRoute);
      if (filePath) {
        const url = createEntryURL(filePath, outFolder);
        const ssrEntryPage = await import(url.toString());
        return ssrEntryPage;
      }
    }
    return RedirectSinglePageBuiltModule;
  }
}
function createEntryURL(filePath, outFolder) {
  return new URL("./" + filePath + `?time=${Date.now()}`, outFolder);
}
function getEntryFilePath(internals, pageData) {
  const id = "\0" + getVirtualModulePageName(ASTRO_PAGE_MODULE_ID, pageData.component);
  return internals.entrySpecifierToBundleMap.get(id);
}
export {
  BuildPipeline
};
