import { extendManualChunks } from "./util.js";
function vitePluginChunks() {
  return {
    name: "astro:chunks",
    outputOptions(outputOptions) {
      extendManualChunks(outputOptions, {
        after(id) {
          if (id.includes("astro/dist/runtime/server/")) {
            return "astro/server";
          }
          if (id.includes("astro/dist/runtime")) {
            return "astro";
          }
        }
      });
    }
  };
}
function pluginChunks() {
  return {
    targets: ["server"],
    hooks: {
      "build:before": () => {
        return {
          vitePlugin: vitePluginChunks()
        };
      }
    }
  };
}
export {
  pluginChunks
};
