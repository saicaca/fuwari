import { attachContentServerListeners } from "../content/server-listeners.js";
function astroContentListenPlugin({
  settings,
  logger,
  fs
}) {
  let server;
  return {
    name: "astro:content-listen",
    apply: "serve",
    configureServer(_server) {
      server = _server;
    },
    async buildStart() {
      await attachContentServerListeners({
        fs,
        settings,
        logger,
        viteServer: server
      });
    }
  };
}
export {
  astroContentListenPlugin
};
