import { fileURLToPath } from "node:url";
import autoprefixerPlugin from "autoprefixer";
import tailwindPlugin from "tailwindcss";
async function getPostCssConfig(root, postcssInlineOptions) {
  let postcssConfigResult;
  if (!(typeof postcssInlineOptions === "object" && postcssInlineOptions !== null)) {
    let { default: postcssrc } = await import("postcss-load-config");
    const searchPath = typeof postcssInlineOptions === "string" ? postcssInlineOptions : root;
    try {
      postcssConfigResult = await postcssrc({}, searchPath);
    } catch {
      postcssConfigResult = null;
    }
  }
  return postcssConfigResult;
}
async function getViteConfiguration(tailwindConfigPath, nesting, root, postcssInlineOptions) {
  const postcssConfigResult = await getPostCssConfig(root, postcssInlineOptions);
  const postcssOptions = postcssConfigResult?.options ?? {};
  const postcssPlugins = postcssConfigResult?.plugins?.slice() ?? [];
  if (nesting) {
    const tailwindcssNestingPlugin = (await import("tailwindcss/nesting/index.js")).default;
    postcssPlugins.push(tailwindcssNestingPlugin());
  }
  postcssPlugins.push(tailwindPlugin(tailwindConfigPath));
  postcssPlugins.push(autoprefixerPlugin());
  return {
    css: {
      postcss: {
        ...postcssOptions,
        plugins: postcssPlugins
      }
    }
  };
}
function tailwindIntegration(options) {
  const applyBaseStyles = options?.applyBaseStyles ?? true;
  const customConfigPath = options?.configFile;
  const nesting = options?.nesting ?? false;
  return {
    name: "@astrojs/tailwind",
    hooks: {
      "astro:config:setup": async ({ config, updateConfig, injectScript }) => {
        updateConfig({
          vite: await getViteConfiguration(
            customConfigPath,
            nesting,
            fileURLToPath(config.root),
            config.vite.css?.postcss
          )
        });
        if (applyBaseStyles) {
          injectScript("page-ssr", `import '@astrojs/tailwind/base.css';`);
        }
      }
    }
  };
}
export {
  tailwindIntegration as default
};
