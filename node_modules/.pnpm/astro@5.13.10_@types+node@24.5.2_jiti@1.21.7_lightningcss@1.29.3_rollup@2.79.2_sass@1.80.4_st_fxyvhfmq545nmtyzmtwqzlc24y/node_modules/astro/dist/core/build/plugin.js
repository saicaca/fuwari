function createPluginContainer(options, internals) {
  const plugins = /* @__PURE__ */ new Map();
  const allPlugins = /* @__PURE__ */ new Set();
  for (const target of ["client", "server"]) {
    plugins.set(target, []);
  }
  return {
    options,
    internals,
    register(plugin) {
      allPlugins.add(plugin);
      for (const target of plugin.targets) {
        const targetPlugins = plugins.get(target) ?? [];
        targetPlugins.push(plugin);
        plugins.set(target, targetPlugins);
      }
    },
    // Hooks
    async runBeforeHook(target, input) {
      let targetPlugins = plugins.get(target) ?? [];
      let vitePlugins = [];
      let lastVitePlugins = [];
      for (const plugin of targetPlugins) {
        if (plugin.hooks?.["build:before"]) {
          let result = await plugin.hooks["build:before"]({ target, input });
          if (result.vitePlugin) {
            vitePlugins.push(result.vitePlugin);
          }
        }
      }
      return {
        vitePlugins,
        lastVitePlugins
      };
    },
    async runPostHook(ssrOutputs, clientOutputs) {
      const mutations = /* @__PURE__ */ new Map();
      const mutate = (chunk, targets, newCode) => {
        chunk.code = newCode;
        mutations.set(chunk.fileName, {
          targets,
          code: newCode
        });
      };
      for (const plugin of allPlugins) {
        const postHook = plugin.hooks?.["build:post"];
        if (postHook) {
          await postHook({
            ssrOutputs,
            clientOutputs,
            mutate
          });
        }
      }
      return mutations;
    }
  };
}
export {
  createPluginContainer
};
