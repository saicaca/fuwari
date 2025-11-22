import { createRoutesList } from "../core/routing/index.js";
import { createDevelopmentManifest } from "../vite-plugin-astro-server/plugin.js";
function defineConfig(config) {
  return config;
}
function getViteConfig(userViteConfig, inlineAstroConfig = {}) {
  return async ({ mode, command }) => {
    const cmd = command === "serve" ? "dev" : "build";
    const [
      fs,
      { mergeConfig },
      { createNodeLogger },
      { resolveConfig, createSettings },
      { createVite },
      { runHookConfigSetup, runHookConfigDone },
      { astroContentListenPlugin }
    ] = await Promise.all([
      import("node:fs"),
      import("vite"),
      import("../core/config/logging.js"),
      import("../core/config/index.js"),
      import("../core/create-vite.js"),
      import("../integrations/hooks.js"),
      import("./vite-plugin-content-listen.js")
    ]);
    const logger = createNodeLogger(inlineAstroConfig);
    const { astroConfig: config } = await resolveConfig(inlineAstroConfig, cmd);
    let settings = await createSettings(config, userViteConfig.root);
    settings = await runHookConfigSetup({ settings, command: cmd, logger });
    const routesList = await createRoutesList({ settings }, logger);
    const manifest = createDevelopmentManifest(settings);
    const viteConfig = await createVite(
      {
        plugins: config.legacy.collections ? [
          // Initialize the content listener
          astroContentListenPlugin({ settings, logger, fs })
        ] : []
      },
      { settings, command: cmd, logger, mode, sync: false, manifest, routesList }
    );
    await runHookConfigDone({ settings, logger });
    return mergeConfig(viteConfig, userViteConfig);
  };
}
export {
  defineConfig,
  getViteConfig
};
