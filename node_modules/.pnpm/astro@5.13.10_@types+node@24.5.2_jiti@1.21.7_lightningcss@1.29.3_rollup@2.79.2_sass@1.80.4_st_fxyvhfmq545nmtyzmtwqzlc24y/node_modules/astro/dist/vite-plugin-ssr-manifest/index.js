const manifestVirtualModuleId = "astro:ssr-manifest";
const resolvedManifestVirtualModuleId = "\0" + manifestVirtualModuleId;
function vitePluginSSRManifest() {
  return {
    name: "@astrojs/vite-plugin-astro-ssr-manifest",
    enforce: "post",
    resolveId(id) {
      if (id === manifestVirtualModuleId) {
        return resolvedManifestVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedManifestVirtualModuleId) {
        return {
          code: `export let manifest = {};
export function _privateSetManifestDontUseThis(ssrManifest) {
  manifest = ssrManifest;
}`
        };
      }
    }
  };
}
export {
  vitePluginSSRManifest
};
