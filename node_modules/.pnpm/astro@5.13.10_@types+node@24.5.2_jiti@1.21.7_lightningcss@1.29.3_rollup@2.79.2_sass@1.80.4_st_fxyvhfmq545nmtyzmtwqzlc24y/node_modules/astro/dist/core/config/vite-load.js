import { pathToFileURL } from "node:url";
import { createServer } from "vite";
import loadFallbackPlugin from "../../vite-plugin-load-fallback/index.js";
import { debug } from "../logger/core.js";
async function createViteServer(root, fs) {
  const viteServer = await createServer({
    configFile: false,
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { noDiscovery: true },
    clearScreen: false,
    appType: "custom",
    ssr: { external: true },
    plugins: [loadFallbackPlugin({ fs, root: pathToFileURL(root) })]
  });
  return viteServer;
}
async function loadConfigWithVite({
  configPath,
  fs,
  root
}) {
  if (/\.[cm]?js$/.test(configPath)) {
    try {
      const config = await import(pathToFileURL(configPath).toString() + "?t=" + Date.now());
      return config.default ?? {};
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && e.code === "ERR_DLOPEN_DISABLED") {
        throw e;
      }
      debug("Failed to load config with Node", e);
    }
  }
  let server;
  try {
    server = await createViteServer(root, fs);
    const mod = await server.ssrLoadModule(configPath, { fixStacktrace: true });
    return mod.default ?? {};
  } finally {
    if (server) {
      await server.close();
    }
  }
}
export {
  loadConfigWithVite
};
