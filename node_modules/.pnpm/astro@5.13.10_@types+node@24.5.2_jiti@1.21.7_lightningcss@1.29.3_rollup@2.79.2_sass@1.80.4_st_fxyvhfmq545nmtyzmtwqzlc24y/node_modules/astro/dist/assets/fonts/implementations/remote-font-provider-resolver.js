import { resolveEntrypoint } from "../utils.js";
function validateMod({
  mod,
  entrypoint,
  errorHandler
}) {
  try {
    if (typeof mod !== "object" || mod === null) {
      throw new Error(`Expected an object for the module, but received ${typeof mod}.`);
    }
    if (typeof mod.provider !== "function") {
      throw new Error(`Invalid provider export in module, expected a function.`);
    }
    return {
      provider: mod.provider
    };
  } catch (cause) {
    throw errorHandler.handle({
      type: "cannot-load-font-provider",
      data: {
        entrypoint
      },
      cause
    });
  }
}
function createRemoteFontProviderResolver({
  root,
  modResolver,
  errorHandler
}) {
  return {
    async resolve({ entrypoint, config }) {
      const id = resolveEntrypoint(root, entrypoint.toString()).href;
      const mod = await modResolver.resolve(id);
      const { provider } = validateMod({
        mod,
        entrypoint: id,
        errorHandler
      });
      return { config, provider };
    }
  };
}
export {
  createRemoteFontProviderResolver
};
