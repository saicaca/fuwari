import { LOCAL_PROVIDER_NAME } from "../constants.js";
function extractUnifontProviders({
  families,
  hasher
}) {
  const hashes = /* @__PURE__ */ new Set();
  const providers = [];
  for (const { provider } of families) {
    if (provider === LOCAL_PROVIDER_NAME) {
      continue;
    }
    const unifontProvider = provider.provider(provider.config);
    const hash = hasher.hashObject({
      name: unifontProvider._name,
      ...provider.config
    });
    unifontProvider._name += `-${hash}`;
    provider.name = unifontProvider._name;
    if (!hashes.has(hash)) {
      hashes.add(hash);
      providers.push(unifontProvider);
    }
  }
  return { families, providers };
}
export {
  extractUnifontProviders
};
