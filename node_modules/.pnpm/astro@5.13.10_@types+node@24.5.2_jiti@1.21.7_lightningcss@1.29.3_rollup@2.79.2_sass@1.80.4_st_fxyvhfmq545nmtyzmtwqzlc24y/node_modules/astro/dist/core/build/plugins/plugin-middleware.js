import { vitePluginMiddlewareBuild } from "../../middleware/vite-plugin.js";
function pluginMiddleware(opts, internals) {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginMiddlewareBuild(opts, internals)
        };
      }
    }
  };
}
export {
  pluginMiddleware
};
