import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { preview } from "vite";
import * as msg from "../messages.js";
import { getResolvedHostForHttpServer } from "./util.js";
import { vitePluginAstroPreview } from "./vite-plugin-astro-preview.js";
async function createStaticPreviewServer(settings, logger) {
  const startServerTime = performance.now();
  let previewServer;
  try {
    previewServer = await preview({
      configFile: false,
      base: settings.config.base,
      appType: "mpa",
      build: {
        outDir: fileURLToPath(settings.config.outDir)
      },
      preview: {
        host: settings.config.server.host,
        port: settings.config.server.port,
        headers: settings.config.server.headers,
        open: settings.config.server.open,
        allowedHosts: settings.config.server.allowedHosts
      },
      plugins: [vitePluginAstroPreview(settings)]
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error(null, err.stack || err.message);
    }
    throw err;
  }
  logger.info(
    "SKIP_FORMAT",
    msg.serverStart({
      startupTime: performance.now() - startServerTime,
      resolvedUrls: previewServer.resolvedUrls ?? { local: [], network: [] },
      host: settings.config.server.host,
      base: settings.config.base
    })
  );
  function closed() {
    return new Promise((resolve, reject) => {
      previewServer.httpServer.addListener("close", resolve);
      previewServer.httpServer.addListener("error", reject);
    });
  }
  return {
    host: getResolvedHostForHttpServer(settings.config.server.host),
    port: settings.config.server.port,
    closed,
    server: previewServer.httpServer,
    stop: previewServer.close.bind(previewServer)
  };
}
export {
  createStaticPreviewServer as default
};
