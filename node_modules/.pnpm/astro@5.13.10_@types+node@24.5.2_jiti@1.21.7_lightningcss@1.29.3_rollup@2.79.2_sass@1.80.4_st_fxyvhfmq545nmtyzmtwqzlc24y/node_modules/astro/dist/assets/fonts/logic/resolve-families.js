import { LOCAL_PROVIDER_NAME } from "../constants.js";
import { dedupe, withoutQuotes } from "../utils.js";
function resolveVariants({
  variants,
  localProviderUrlResolver
}) {
  return variants.map((variant) => ({
    ...variant,
    weight: variant.weight?.toString(),
    src: variant.src.map((value) => {
      const isValue = typeof value === "string" || value instanceof URL;
      const url = (isValue ? value : value.url).toString();
      const tech = isValue ? void 0 : value.tech;
      return {
        url: localProviderUrlResolver.resolve(url),
        tech
      };
    })
  }));
}
async function resolveFamily({
  family,
  hasher,
  remoteFontProviderResolver,
  localProviderUrlResolver
}) {
  const name = withoutQuotes(family.name);
  const nameWithHash = `${name}-${hasher.hashObject(family)}`;
  if (family.provider === LOCAL_PROVIDER_NAME) {
    return {
      ...family,
      name,
      nameWithHash,
      variants: resolveVariants({ variants: family.variants, localProviderUrlResolver }),
      fallbacks: family.fallbacks ? dedupe(family.fallbacks) : void 0
    };
  }
  return {
    ...family,
    name,
    nameWithHash,
    weights: family.weights ? dedupe(family.weights.map((weight) => weight.toString())) : void 0,
    styles: family.styles ? dedupe(family.styles) : void 0,
    subsets: family.subsets ? dedupe(family.subsets) : void 0,
    fallbacks: family.fallbacks ? dedupe(family.fallbacks) : void 0,
    unicodeRange: family.unicodeRange ? dedupe(family.unicodeRange) : void 0,
    // This will be Astro specific eventually
    provider: await remoteFontProviderResolver.resolve(family.provider)
  };
}
async function resolveFamilies({
  families,
  ...dependencies
}) {
  return await Promise.all(
    families.map(
      (family) => resolveFamily({
        family,
        ...dependencies
      })
    )
  );
}
export {
  resolveFamilies,
  resolveFamily
};
