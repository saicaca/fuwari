const virtualModuleId = "astro:container";
function astroContainer() {
  return {
    name: "astro:container",
    enforce: "pre",
    resolveId(id) {
      if (id === virtualModuleId) {
        return this.resolve("astro/virtual-modules/container.js");
      }
    }
  };
}
export {
  astroContainer as default
};
