import path from "node:path";
import { normalizePath } from "vite";
const getConfigAlias = (settings) => {
  const { tsConfig, tsConfigPath } = settings;
  if (!tsConfig || !tsConfigPath || !tsConfig.compilerOptions) return null;
  const { baseUrl, paths } = tsConfig.compilerOptions;
  const effectiveBaseUrl = baseUrl ?? (paths ? "." : void 0);
  if (!effectiveBaseUrl) return null;
  const resolvedBaseUrl = path.resolve(path.dirname(tsConfigPath), effectiveBaseUrl);
  const aliases = [];
  if (paths) {
    for (const [alias, values] of Object.entries(paths)) {
      const find = new RegExp(
        `^${[...alias].map(
          (segment) => segment === "*" ? "(.+)" : segment.replace(/[\\^$*+?.()|[\]{}]/, "\\$&")
        ).join("")}$`
      );
      for (const value of values) {
        let matchId = 0;
        const replacement = [...normalizePath(path.resolve(resolvedBaseUrl, value))].map((segment) => segment === "*" ? `$${++matchId}` : segment === "$" ? "$$" : segment).join("");
        aliases.push({ find, replacement });
      }
    }
  }
  if (baseUrl) {
    aliases.push({
      find: /^(?!\.*\/|\.*$|\w:)(.+)$/,
      replacement: `${[...normalizePath(resolvedBaseUrl)].map((segment) => segment === "$" ? "$$" : segment).join("")}/$1`
    });
  }
  return aliases;
};
function configAliasVitePlugin({
  settings
}) {
  const configAlias = getConfigAlias(settings);
  if (!configAlias) return null;
  const plugin = {
    name: "astro:tsconfig-alias",
    // use post to only resolve ids that all other plugins before it can't
    enforce: "post",
    configResolved(config) {
      patchCreateResolver(config, plugin);
    },
    async resolveId(id, importer, options) {
      if (isVirtualId(id)) return;
      for (const alias of configAlias) {
        if (alias.find.test(id)) {
          const updatedId = id.replace(alias.find, alias.replacement);
          if (updatedId.includes("*")) {
            return updatedId;
          }
          const resolved = await this.resolve(updatedId, importer, { skipSelf: true, ...options });
          if (resolved) return resolved;
        }
      }
    }
  };
  return plugin;
}
function patchCreateResolver(config, postPlugin) {
  const _createResolver = config.createResolver;
  config.createResolver = function(...args1) {
    const resolver = _createResolver.apply(config, args1);
    return async function(...args2) {
      const id = args2[0];
      const importer = args2[1];
      const ssr = args2[3];
      if (importer?.includes("node_modules")) {
        return resolver.apply(_createResolver, args2);
      }
      const fakePluginContext = {
        resolve: (_id, _importer) => resolver(_id, _importer, false, ssr)
      };
      const fakeResolveIdOpts = {
        assertions: {},
        isEntry: false,
        ssr
      };
      const result = await resolver.apply(_createResolver, args2);
      if (result) return result;
      const resolved = await postPlugin.resolveId.apply(fakePluginContext, [
        id,
        importer,
        fakeResolveIdOpts
      ]);
      if (resolved) return resolved;
    };
  };
}
function isVirtualId(id) {
  return id.includes("\0") || id.startsWith("virtual:") || id.startsWith("astro:");
}
export {
  configAliasVitePlugin as default
};
