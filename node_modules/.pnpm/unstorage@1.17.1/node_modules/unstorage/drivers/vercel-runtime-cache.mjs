import { defineDriver, normalizeKey, joinKeys } from "./utils/index.mjs";
const DRIVER_NAME = "vercel-runtime-cache";
export default defineDriver((opts) => {
  const base = normalizeKey(opts?.base);
  const r = (...keys) => joinKeys(base, ...keys);
  let _cache;
  const getClient = () => {
    if (!_cache) {
      _cache = getCache();
    }
    return _cache;
  };
  return {
    name: DRIVER_NAME,
    getInstance: getClient,
    async hasItem(key) {
      const value = await getClient().get(r(key));
      return value !== void 0 && value !== null;
    },
    async getItem(key) {
      const value = await getClient().get(r(key));
      return value === void 0 ? null : value;
    },
    async setItem(key, value, tOptions) {
      const ttl = tOptions?.ttl ?? opts?.ttl;
      const tags = [...tOptions?.tags || [], ...opts?.tags || []].filter(
        Boolean
      );
      await getClient().set(r(key), value, {
        ttl,
        tags
      });
    },
    async removeItem(key) {
      await getClient().delete(r(key));
    },
    async getKeys(_base) {
      return [];
    },
    async clear(_base) {
      if (opts?.tags && opts.tags.length > 0) {
        await getClient().expireTag(opts.tags);
      }
    }
  };
});
const SYMBOL_FOR_REQ_CONTEXT = /* @__PURE__ */ Symbol.for(
  "@vercel/request-context"
);
function getContext() {
  const fromSymbol = globalThis;
  return fromSymbol[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
}
function getCache() {
  const cache = getContext()?.cache || tryRequireVCFunctions()?.getCache?.({
    keyHashFunction: (key) => key,
    namespaceSeparator: ":"
  });
  if (!cache) {
    throw new Error("Runtime cache is not available!");
  }
  return cache;
}
let _vcFunctionsLib;
function tryRequireVCFunctions() {
  if (!_vcFunctionsLib) {
    const { createRequire } = globalThis.process?.getBuiltinModule?.("node:module") || {};
    _vcFunctionsLib = createRequire?.(import.meta.url)("@vercel/functions");
  }
  return _vcFunctionsLib;
}
