function hmrReload() {
  return {
    name: "astro:hmr-reload",
    enforce: "post",
    hotUpdate: {
      order: "post",
      handler({ modules, server, timestamp }) {
        if (this.environment.name !== "ssr") return;
        let hasSsrOnlyModules = false;
        const invalidatedModules = /* @__PURE__ */ new Set();
        for (const mod of modules) {
          if (mod.id == null) continue;
          const clientModule = server.environments.client.moduleGraph.getModuleById(mod.id);
          if (clientModule != null) continue;
          this.environment.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
          hasSsrOnlyModules = true;
        }
        if (hasSsrOnlyModules) {
          server.ws.send({ type: "full-reload" });
          return [];
        }
      }
    }
  };
}
export {
  hmrReload as default
};
