import { addRollupInput } from "../add-rollup-input.js";
const RENDERERS_MODULE_ID = "@astro-renderers";
const RESOLVED_RENDERERS_MODULE_ID = `\0${RENDERERS_MODULE_ID}`;
function vitePluginRenderers(opts) {
  return {
    name: "@astro/plugin-renderers",
    options(options) {
      return addRollupInput(options, [RENDERERS_MODULE_ID]);
    },
    resolveId(id) {
      if (id === RENDERERS_MODULE_ID) {
        return RESOLVED_RENDERERS_MODULE_ID;
      }
    },
    async load(id) {
      if (id === RESOLVED_RENDERERS_MODULE_ID) {
        if (opts.settings.renderers.length > 0) {
          const imports = [];
          const exports = [];
          let i = 0;
          let rendererItems = "";
          for (const renderer of opts.settings.renderers) {
            const variable = `_renderer${i}`;
            imports.push(`import ${variable} from ${JSON.stringify(renderer.serverEntrypoint)};`);
            rendererItems += `Object.assign(${JSON.stringify(renderer)}, { ssr: ${variable} }),`;
            i++;
          }
          exports.push(`export const renderers = [${rendererItems}];`);
          return { code: `${imports.join("\n")}
${exports.join("\n")}` };
        } else {
          return { code: `export const renderers = [];` };
        }
      }
    }
  };
}
function pluginRenderers(opts) {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginRenderers(opts)
        };
      }
    }
  };
}
export {
  RENDERERS_MODULE_ID,
  RESOLVED_RENDERERS_MODULE_ID,
  pluginRenderers
};
