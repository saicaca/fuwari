// src/index.ts
import rehypeExpressiveCode from "rehype-expressive-code";

// src/ec-config.ts
function getEcConfigFileUrl(projectRootUrl) {
  return new URL("./ec.config.mjs", projectRootUrl);
}
async function loadEcConfigFile(projectRootUrl) {
  const pathsToTry = [
    // This path works in most scenarios, but not when the integration is processed by Vite
    // due to a Vite bug affecting import URLs using the "file:" protocol
    new URL(`./ec.config.mjs?t=${Date.now()}`, projectRootUrl).href
  ];
  if (import.meta.env?.BASE_URL?.length) {
    pathsToTry.push(`/ec.config.mjs?t=${Date.now()}`);
  }
  function coerceError(error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      return error;
    }
    return { message: error };
  }
  for (const path of pathsToTry) {
    try {
      const module = await import(
        /* @vite-ignore */
        path
      );
      if (!module.default) {
        throw new Error(`Missing or invalid default export. Please export your Expressive Code config object as the default export.`);
      }
      return module.default;
    } catch (error) {
      const { message, code } = coerceError(error);
      if (code === "ERR_MODULE_NOT_FOUND" || code === "ERR_LOAD_URL") {
        if (message.replace(/(imported )?from .*$/, "").includes("ec.config.mjs"))
          continue;
      }
      throw new Error(
        `Your project includes an Expressive Code config file ("ec.config.mjs")
				that could not be loaded due to ${code ? `the error ${code}` : "the following error"}: ${message}`.replace(/\s+/g, " "),
        error instanceof Error ? { cause: error } : void 0
      );
    }
  }
  return {};
}
function mergeEcConfigOptions(...configs) {
  const merged = {};
  configs.forEach((config) => merge(merged, config, ["defaultProps", "frames", "shiki", "styleOverrides"]));
  return merged;
  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function merge(target, source, limitDeepMergeTo, path = "") {
    for (const key in source) {
      const srcProp = source[key];
      const tgtProp = target[key];
      if (isObject(srcProp)) {
        if (isObject(tgtProp) && (!limitDeepMergeTo || limitDeepMergeTo.includes(key))) {
          merge(tgtProp, srcProp, void 0, path ? path + "." + key : key);
        } else {
          target[key] = { ...srcProp };
        }
      } else if (Array.isArray(srcProp)) {
        if (Array.isArray(tgtProp) && path === "shiki" && key === "langs") {
          target[key] = [...tgtProp, ...srcProp];
        } else {
          target[key] = [...srcProp];
        }
      } else {
        target[key] = srcProp;
      }
    }
  }
}

// src/renderer.ts
import { createRenderer, getStableObjectHash } from "rehype-expressive-code";

// src/astro-config.ts
function serializePartialAstroConfig(config) {
  const partialConfig = {
    base: config.base,
    root: config.root,
    srcDir: config.srcDir
  };
  if (config.build) {
    partialConfig.build = {};
    if (config.build.assets)
      partialConfig.build.assets = config.build.assets;
    if (config.build.assetsPrefix)
      partialConfig.build.assetsPrefix = config.build.assetsPrefix;
  }
  if (config.markdown?.shikiConfig?.langs) {
    partialConfig.markdown = { shikiConfig: { langs: config.markdown.shikiConfig.langs } };
  }
  return JSON.stringify(partialConfig);
}
function getAssetsPrefix(fileExtension, assetsPrefix) {
  if (!assetsPrefix)
    return "";
  if (typeof assetsPrefix === "string")
    return assetsPrefix;
  const dotLessFileExtension = fileExtension.slice(1);
  if (assetsPrefix[dotLessFileExtension]) {
    return assetsPrefix[dotLessFileExtension];
  }
  return assetsPrefix.fallback;
}
function getAssetsBaseHref(fileExtension, assetsPrefix, base) {
  return (getAssetsPrefix(fileExtension, assetsPrefix) || base || "").trim().replace(/\/+$/g, "");
}

// src/renderer.ts
async function createAstroRenderer({ ecConfig, astroConfig, logger }) {
  const { emitExternalStylesheet = true, customCreateRenderer, plugins = [], shiki = true, ...rest } = ecConfig ?? {};
  const assetsDir = astroConfig.build?.assets || "_astro";
  const hashedStyles = [];
  const hashedScripts = [];
  plugins.push({
    name: "astro-expressive-code",
    hooks: {
      postprocessRenderedBlockGroup: ({ renderData, renderedGroupContents }) => {
        const isFirstGroupInDocument = renderedGroupContents[0]?.codeBlock.parentDocument?.positionInDocument?.groupIndex === 0;
        if (!isFirstGroupInDocument)
          return;
        const extraElements = [];
        hashedStyles.forEach(([hashedRoute]) => {
          extraElements.push({
            type: "element",
            tagName: "link",
            properties: { rel: "stylesheet", href: `${getAssetsBaseHref(".css", astroConfig.build?.assetsPrefix, astroConfig.base)}${hashedRoute}` },
            children: []
          });
        });
        hashedScripts.forEach(([hashedRoute]) => {
          extraElements.push({
            type: "element",
            tagName: "script",
            properties: { type: "module", src: `${getAssetsBaseHref(".js", astroConfig.build?.assetsPrefix, astroConfig.base)}${hashedRoute}` },
            children: []
          });
        });
        if (!extraElements.length)
          return;
        renderData.groupAst.children.unshift(...extraElements);
      }
    }
  });
  const mergedShikiConfig = shiki === true ? {} : shiki;
  const astroShikiConfig = astroConfig.markdown?.shikiConfig;
  if (mergedShikiConfig) {
    if (!mergedShikiConfig.langs && astroShikiConfig?.langs)
      mergedShikiConfig.langs = astroShikiConfig.langs;
    if (!mergedShikiConfig.langAlias && astroShikiConfig?.langAlias)
      mergedShikiConfig.langAlias = astroShikiConfig.langAlias;
  }
  const renderer = await (customCreateRenderer ?? createRenderer)({
    plugins,
    logger,
    shiki: mergedShikiConfig,
    ...rest
  });
  renderer.hashedStyles = hashedStyles;
  renderer.hashedScripts = hashedScripts;
  if (emitExternalStylesheet) {
    const combinedStyles = `${renderer.baseStyles}${renderer.themeStyles}`;
    hashedStyles.push(getHashedRouteWithContent(combinedStyles, `/${assetsDir}/ec.{hash}.css`));
    renderer.baseStyles = "";
    renderer.themeStyles = "";
  }
  const uniqueJsModules = [...new Set(renderer.jsModules)];
  const mergedJsCode = uniqueJsModules.join("\n");
  renderer.jsModules = [];
  hashedScripts.push(getHashedRouteWithContent(mergedJsCode, `/${assetsDir}/ec.{hash}.js`));
  return renderer;
}
function getHashedRouteWithContent(content, routeTemplate) {
  const contentHash = getStableObjectHash(content, { hashLength: 5 });
  return [routeTemplate.replace("{hash}", contentHash), content];
}

// src/vite-plugin.ts
import { stableStringify } from "rehype-expressive-code";
function vitePluginAstroExpressiveCode({
  styles,
  scripts,
  ecIntegrationOptions,
  processedEcConfig,
  astroConfig,
  command
}) {
  const modules = {};
  const configModuleContents = [];
  configModuleContents.push(`export const astroConfig = ${serializePartialAstroConfig(astroConfig)}`);
  const { customConfigPreprocessors, ...otherEcIntegrationOptions } = ecIntegrationOptions;
  configModuleContents.push(`export const ecIntegrationOptions = ${stableStringify(otherEcIntegrationOptions)}`);
  const strEcConfigFileUrlHref = JSON.stringify(getEcConfigFileUrl(astroConfig.root).href);
  configModuleContents.push(
    `let ecConfigFileOptions = {}`,
    `try {`,
    `	ecConfigFileOptions = (await import('virtual:astro-expressive-code/ec-config')).default`,
    `} catch (e) {`,
    `	console.error('*** Failed to load Expressive Code config file ${strEcConfigFileUrlHref}. You can ignore this message if you just renamed/removed the file.\\n\\n(Full error message: "' + (e?.message || e) + '")\\n')`,
    `}`,
    `export { ecConfigFileOptions }`
  );
  modules["virtual:astro-expressive-code/config"] = configModuleContents.join("\n");
  modules["virtual:astro-expressive-code/ec-config"] = "export default {}";
  modules["virtual:astro-expressive-code/preprocess-config"] = customConfigPreprocessors?.preprocessComponentConfig || `export default ({ ecConfig }) => ecConfig`;
  const shikiConfig = typeof processedEcConfig.shiki === "object" ? processedEcConfig.shiki : {};
  const configuredEngine = shikiConfig.engine === "javascript" ? "javascript" : "oniguruma";
  const anyThemeOrThemes = processedEcConfig;
  const effectiveThemesOrTheme = anyThemeOrThemes.themes ?? anyThemeOrThemes.theme ?? [];
  const effectiveThemes = Array.isArray(effectiveThemesOrTheme) ? effectiveThemesOrTheme : [effectiveThemesOrTheme];
  const configuredBundledThemes = effectiveThemes.filter((theme) => typeof theme === "string");
  const shikiAssetRegExp = /(?<=\n)\s*\{[\s\S]*?"id": "(.*?)",[\s\S]*?\n\s*\},?\s*\n/g;
  const noQuery = (source) => source.split("?")[0];
  const getVirtualModuleContents = (source) => {
    if (command === "dev") {
      for (const file of [...styles, ...scripts]) {
        const [fileName, contents] = file;
        if (noQuery(fileName) === noQuery(source))
          return contents;
      }
    }
    return source in modules ? modules[source] : void 0;
  };
  return [
    {
      name: "vite-plugin-astro-expressive-code",
      async resolveId(source, importer) {
        if (source === "virtual:astro-expressive-code/api") {
          const resolved = await this.resolve("astro-expressive-code", importer);
          if (resolved)
            return resolved;
          return await this.resolve("astro-expressive-code");
        }
        if (source === "virtual:astro-expressive-code/ec-config") {
          const resolved = await this.resolve("./ec.config.mjs");
          if (resolved)
            return resolved;
        }
        if (getVirtualModuleContents(source))
          return `\0${source}`;
      },
      load: (id) => id?.[0] === "\0" ? getVirtualModuleContents(id.slice(1)) : void 0,
      // If any file imported by the EC config file changes, restart the server
      async handleHotUpdate({ modules: modules2, server }) {
        if (!modules2 || !server)
          return;
        const isImportedByEcConfig = (module, depth = 0) => {
          if (!module || !module.importers || depth >= 6)
            return false;
          for (const importingModule of module.importers) {
            if (noQuery(module.url).endsWith("/ec.config.mjs")) {
              return true;
            }
            if (isImportedByEcConfig(importingModule, depth + 1))
              return true;
          }
          return false;
        };
        if (modules2.some((module) => isImportedByEcConfig(module))) {
          await server.restart();
        }
      },
      transform: (code, id) => {
        if (id.includes("/plugin-shiki/dist/")) {
          return code.replace(/(return \[)(?:.*?shiki\/engine\/(javascript|oniguruma).*?)(\]\[0\])/g, (match, prefix, engine, suffix) => {
            if (engine === configuredEngine)
              return match;
            return `${prefix}undefined${suffix}`;
          });
        }
        if (processedEcConfig.removeUnusedThemes !== false && id.match(/\/shiki\/dist\/themes\.m?js$/)) {
          return code.replace(shikiAssetRegExp, (match, bundledTheme) => {
            if (configuredBundledThemes.includes(bundledTheme))
              return match;
            return "";
          });
        }
        if (shikiConfig.bundledLangs && id.match(/\/shiki\/dist\/langs\.m?js$/)) {
          return code.replace(shikiAssetRegExp, (match, bundledLang) => {
            if (shikiConfig.bundledLangs.includes(bundledLang))
              return match;
            return "";
          });
        }
      }
    },
    // Add a second plugin that only runs in build mode (to avoid Vite warnings about emitFile)
    // which emits the extracted styles & scripts as static assets
    {
      name: "vite-plugin-astro-expressive-code-build",
      apply: "build",
      buildEnd() {
        for (const file of [...styles, ...scripts]) {
          const [fileName, source] = file;
          this.emitFile({
            type: "asset",
            // Remove leading slash and any query params
            fileName: noQuery(fileName.slice(1)),
            source
          });
        }
      }
    }
  ];
}

// src/index.ts
export * from "rehype-expressive-code";
function astroExpressiveCode(integrationOptions = {}) {
  const integration = {
    name: "astro-expressive-code",
    hooks: {
      "astro:config:setup": async (args) => {
        const { command, config: astroConfig, updateConfig, logger, addWatchFile } = args;
        const ownPosition = astroConfig.integrations.findIndex((integration2) => integration2.name === "astro-expressive-code");
        const mdxPosition = astroConfig.integrations.findIndex((integration2) => integration2.name === "@astrojs/mdx");
        if (ownPosition > -1 && mdxPosition > -1 && mdxPosition < ownPosition) {
          throw new Error(
            `Incorrect integration order: To allow code blocks on MDX pages to use
						astro-expressive-code, please move astroExpressiveCode() before mdx()
						in the "integrations" array of your Astro config file.`.replace(/\s+/g, " ")
          );
        }
        addWatchFile(getEcConfigFileUrl(astroConfig.root));
        const ecConfigFileOptions = await loadEcConfigFile(astroConfig.root);
        const mergedOptions = mergeEcConfigOptions(integrationOptions, ecConfigFileOptions);
        const processedEcConfig = await mergedOptions.customConfigPreprocessors?.preprocessAstroIntegrationConfig({ ecConfig: mergedOptions, astroConfig }) || mergedOptions;
        const { customCreateAstroRenderer } = processedEcConfig;
        delete processedEcConfig.customCreateAstroRenderer;
        delete processedEcConfig.customConfigPreprocessors;
        const { hashedStyles, hashedScripts, ...renderer } = await (customCreateAstroRenderer ?? createAstroRenderer)({ astroConfig, ecConfig: processedEcConfig, logger });
        const rehypeExpressiveCodeOptions = {
          // Even though we have created a custom renderer, some options are used
          // by the rehype integration itself (e.g. `tabWidth`, `getBlockLocale`),
          // so we pass all of them through just to be safe
          ...processedEcConfig,
          // Pass our custom renderer to the rehype integration
          customCreateRenderer: () => renderer
        };
        updateConfig({
          vite: {
            plugins: [
              vitePluginAstroExpressiveCode({
                styles: hashedStyles,
                scripts: hashedScripts,
                ecIntegrationOptions: integrationOptions,
                processedEcConfig,
                astroConfig,
                command
              })
            ]
          },
          markdown: {
            syntaxHighlight: false,
            rehypePlugins: [[rehypeExpressiveCode, rehypeExpressiveCodeOptions]]
          }
        });
      }
    }
  };
  return integration;
}
function defineEcConfig(config) {
  return config;
}
var src_default = astroExpressiveCode;
export {
  astroExpressiveCode,
  createAstroRenderer,
  src_default as default,
  defineEcConfig,
  mergeEcConfigOptions
};
//# sourceMappingURL=index.js.map