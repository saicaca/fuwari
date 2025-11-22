import { bold } from "kleur/colors";
import * as unifont from "unifont";
import { LOCAL_PROVIDER_NAME } from "./constants.js";
import { extractUnifontProviders } from "./logic/extract-unifont-providers.js";
import { normalizeRemoteFontFaces } from "./logic/normalize-remote-font-faces.js";
import { optimizeFallbacks } from "./logic/optimize-fallbacks.js";
import { resolveFamilies } from "./logic/resolve-families.js";
import { resolveLocalFont } from "./providers/local.js";
import { pickFontFaceProperty, unifontFontFaceDataToProperties } from "./utils.js";
async function orchestrate({
  families,
  hasher,
  remoteFontProviderResolver,
  localProviderUrlResolver,
  storage,
  cssRenderer,
  systemFallbacksProvider,
  fontMetricsResolver,
  fontTypeExtractor,
  fontFileReader,
  logger,
  createUrlProxy,
  defaults
}) {
  let resolvedFamilies = await resolveFamilies({
    families,
    hasher,
    remoteFontProviderResolver,
    localProviderUrlResolver
  });
  const extractedUnifontProvidersResult = extractUnifontProviders({
    families: resolvedFamilies,
    hasher
  });
  resolvedFamilies = extractedUnifontProvidersResult.families;
  const unifontProviders = extractedUnifontProvidersResult.providers;
  const { resolveFont } = await unifont.createUnifont(unifontProviders, {
    storage
  });
  const fontFileDataMap = /* @__PURE__ */ new Map();
  const consumableMap = /* @__PURE__ */ new Map();
  for (const family of resolvedFamilies) {
    const preloadData = [];
    let css = "";
    const collectedFonts = [];
    const fallbacks = family.fallbacks ?? defaults.fallbacks ?? [];
    const urlProxy = createUrlProxy({
      local: family.provider === LOCAL_PROVIDER_NAME,
      hasUrl: (hash) => fontFileDataMap.has(hash),
      saveUrl: ({ hash, url, init }) => {
        fontFileDataMap.set(hash, { url, init });
      },
      savePreload: (preload) => {
        preloadData.push(preload);
      },
      saveFontData: (collected) => {
        if (fallbacks && fallbacks.length > 0 && // If the same data has already been sent for this family, we don't want to have
        // duplicated fallbacks. Such scenario can occur with unicode ranges.
        !collectedFonts.some((f) => JSON.stringify(f.data) === JSON.stringify(collected.data))) {
          collectedFonts.push(collected);
        }
      }
    });
    let fonts;
    if (family.provider === LOCAL_PROVIDER_NAME) {
      const result = resolveLocalFont({
        family,
        urlProxy,
        fontTypeExtractor,
        fontFileReader
      });
      fonts = result.fonts;
    } else {
      const result = await resolveFont(
        family.name,
        // We do not merge the defaults, we only provide defaults as a fallback
        {
          weights: family.weights ?? defaults.weights,
          styles: family.styles ?? defaults.styles,
          subsets: family.subsets ?? defaults.subsets,
          fallbacks: family.fallbacks ?? defaults.fallbacks
        },
        // By default, unifont goes through all providers. We use a different approach where
        // we specify a provider per font. Name has been set while extracting unifont providers
        // from families (inside extractUnifontProviders).
        [family.provider.name]
      );
      if (result.fonts.length === 0) {
        logger.warn(
          "assets",
          `No data found for font family ${bold(family.name)}. Review your configuration`
        );
      }
      fonts = normalizeRemoteFontFaces({ fonts: result.fonts, urlProxy, fontTypeExtractor });
    }
    for (const data of fonts) {
      css += cssRenderer.generateFontFace(
        family.nameWithHash,
        unifontFontFaceDataToProperties({
          src: data.src,
          weight: data.weight,
          style: data.style,
          // User settings override the generated font settings. We use a helper function
          // because local and remote providers store this data in different places.
          display: pickFontFaceProperty("display", { data, family }),
          unicodeRange: pickFontFaceProperty("unicodeRange", { data, family }),
          stretch: pickFontFaceProperty("stretch", { data, family }),
          featureSettings: pickFontFaceProperty("featureSettings", { data, family }),
          variationSettings: pickFontFaceProperty("variationSettings", { data, family })
        })
      );
    }
    const cssVarValues = [family.nameWithHash];
    const optimizeFallbacksResult = await optimizeFallbacks({
      family,
      fallbacks,
      collectedFonts,
      enabled: family.optimizedFallbacks ?? defaults.optimizedFallbacks ?? false,
      systemFallbacksProvider,
      fontMetricsResolver
    });
    if (optimizeFallbacksResult) {
      css += optimizeFallbacksResult.css;
      cssVarValues.push(...optimizeFallbacksResult.fallbacks);
    } else {
      cssVarValues.push(...fallbacks);
    }
    css += cssRenderer.generateCssVariable(family.cssVariable, cssVarValues);
    consumableMap.set(family.cssVariable, { preloadData, css });
  }
  return { fontFileDataMap, consumableMap };
}
export {
  orchestrate
};
