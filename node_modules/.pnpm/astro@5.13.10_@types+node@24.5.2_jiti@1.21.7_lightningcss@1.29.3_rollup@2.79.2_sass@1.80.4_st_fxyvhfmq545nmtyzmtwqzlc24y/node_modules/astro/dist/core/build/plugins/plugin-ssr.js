import { ASTRO_ACTIONS_INTERNAL_MODULE_ID } from "../../../actions/consts.js";
import { MIDDLEWARE_MODULE_ID } from "../../middleware/vite-plugin.js";
import { routeIsRedirect } from "../../redirects/index.js";
import { VIRTUAL_ISLAND_MAP_ID } from "../../server-islands/vite-plugin-server-islands.js";
import { addRollupInput } from "../add-rollup-input.js";
import { SSR_MANIFEST_VIRTUAL_MODULE_ID } from "./plugin-manifest.js";
import { ASTRO_PAGE_MODULE_ID } from "./plugin-pages.js";
import { RENDERERS_MODULE_ID } from "./plugin-renderers.js";
import { getVirtualModulePageName } from "./util.js";
const SSR_VIRTUAL_MODULE_ID = "@astrojs-ssr-virtual-entry";
const RESOLVED_SSR_VIRTUAL_MODULE_ID = "\0" + SSR_VIRTUAL_MODULE_ID;
const ADAPTER_VIRTUAL_MODULE_ID = "@astrojs-ssr-adapter";
const RESOLVED_ADAPTER_VIRTUAL_MODULE_ID = "\0" + ADAPTER_VIRTUAL_MODULE_ID;
function vitePluginAdapter(adapter) {
  return {
    name: "@astrojs/vite-plugin-astro-adapter",
    enforce: "post",
    resolveId(id) {
      if (id === ADAPTER_VIRTUAL_MODULE_ID) {
        return RESOLVED_ADAPTER_VIRTUAL_MODULE_ID;
      }
    },
    async load(id) {
      if (id === RESOLVED_ADAPTER_VIRTUAL_MODULE_ID) {
        return { code: `export * from ${JSON.stringify(adapter.serverEntrypoint)};` };
      }
    }
  };
}
function vitePluginSSR(internals, adapter, options) {
  return {
    name: "@astrojs/vite-plugin-astro-ssr-server",
    enforce: "post",
    options(opts) {
      const inputs = /* @__PURE__ */ new Set();
      for (const pageData of Object.values(options.allPages)) {
        if (routeIsRedirect(pageData.route)) {
          continue;
        }
        inputs.add(getVirtualModulePageName(ASTRO_PAGE_MODULE_ID, pageData.component));
      }
      const adapterServerEntrypoint = options.settings.adapter?.serverEntrypoint;
      if (adapterServerEntrypoint) {
        inputs.add(ADAPTER_VIRTUAL_MODULE_ID);
      }
      inputs.add(SSR_VIRTUAL_MODULE_ID);
      return addRollupInput(opts, Array.from(inputs));
    },
    resolveId(id) {
      if (id === SSR_VIRTUAL_MODULE_ID) {
        return RESOLVED_SSR_VIRTUAL_MODULE_ID;
      }
    },
    async load(id) {
      if (id === RESOLVED_SSR_VIRTUAL_MODULE_ID) {
        const { allPages } = options;
        const imports = [];
        const contents = [];
        const exports = [];
        let i = 0;
        const pageMap = [];
        for (const pageData of Object.values(allPages)) {
          if (routeIsRedirect(pageData.route)) {
            continue;
          }
          const virtualModuleName = getVirtualModulePageName(
            ASTRO_PAGE_MODULE_ID,
            pageData.component
          );
          let module = await this.resolve(virtualModuleName);
          if (module) {
            const variable = `_page${i}`;
            imports.push(`const ${variable} = () => import("${virtualModuleName}");`);
            const pageData2 = internals.pagesByKeys.get(pageData.key);
            if (pageData2) {
              pageMap.push(`[${JSON.stringify(pageData2.component)}, ${variable}]`);
            }
            i++;
          }
        }
        contents.push(`const pageMap = new Map([
    ${pageMap.join(",\n    ")}
]);`);
        exports.push(`export { pageMap }`);
        const middleware = await this.resolve(MIDDLEWARE_MODULE_ID);
        const ssrCode = generateSSRCode(adapter, middleware.id);
        imports.push(...ssrCode.imports);
        contents.push(...ssrCode.contents);
        return { code: [...imports, ...contents, ...exports].join("\n") };
      }
    },
    async generateBundle(_opts, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset") {
          internals.staticFiles.add(chunk.fileName);
        }
      }
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset") {
          continue;
        }
        if (chunk.modules[RESOLVED_SSR_VIRTUAL_MODULE_ID]) {
          internals.ssrEntryChunk = chunk;
        }
      }
    }
  };
}
function pluginSSR(options, internals) {
  const ssr = options.settings.buildOutput === "server";
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        const adapter = options.settings.adapter;
        const ssrPlugin = ssr && vitePluginSSR(internals, adapter, options);
        const vitePlugin = [vitePluginAdapter(adapter)];
        if (ssrPlugin) {
          vitePlugin.unshift(ssrPlugin);
        }
        return {
          enforce: "after-user-plugins",
          vitePlugin
        };
      },
      "build:post": async () => {
        if (!ssr) {
          return;
        }
        if (!internals.ssrEntryChunk) {
          throw new Error(`Did not generate an entry chunk for SSR`);
        }
        internals.ssrEntryChunk.fileName = options.settings.config.build.serverEntry;
      }
    }
  };
}
function generateSSRCode(adapter, middlewareId) {
  const edgeMiddleware = adapter?.adapterFeatures?.edgeMiddleware ?? false;
  const imports = [
    `import { renderers } from '${RENDERERS_MODULE_ID}';`,
    `import * as serverEntrypointModule from '${ADAPTER_VIRTUAL_MODULE_ID}';`,
    `import { manifest as defaultManifest } from '${SSR_MANIFEST_VIRTUAL_MODULE_ID}';`,
    `import { serverIslandMap } from '${VIRTUAL_ISLAND_MAP_ID}';`
  ];
  const contents = [
    edgeMiddleware ? `const middleware = (_, next) => next()` : "",
    `const _manifest = Object.assign(defaultManifest, {`,
    `    pageMap,`,
    `    serverIslandMap,`,
    `    renderers,`,
    `    actions: () => import("${ASTRO_ACTIONS_INTERNAL_MODULE_ID}"),`,
    `    middleware: ${edgeMiddleware ? "undefined" : `() => import("${middlewareId}")`}`,
    `});`,
    `const _args = ${adapter.args ? JSON.stringify(adapter.args, null, 4) : "undefined"};`,
    adapter.exports ? `const _exports = serverEntrypointModule.createExports(_manifest, _args);` : "",
    ...adapter.exports?.map((name) => {
      if (name === "default") {
        return `export default _exports.default;`;
      } else {
        return `export const ${name} = _exports['${name}'];`;
      }
    }) ?? [],
    // NOTE: This is intentionally obfuscated!
    // Do NOT simplify this to something like `serverEntrypointModule.start?.(_manifest, _args)`
    // They are NOT equivalent! Some bundlers will throw if `start` is not exported, but we
    // only want to silently ignore it... hence the dynamic, obfuscated weirdness.
    `const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}`
  ];
  return {
    imports,
    contents
  };
}
export {
  RESOLVED_SSR_VIRTUAL_MODULE_ID,
  pluginSSR
};
