import { FONT_FORMATS } from "../constants.js";
function resolveLocalFont({
  family,
  urlProxy,
  fontTypeExtractor,
  fontFileReader
}) {
  return {
    fonts: family.variants.map((variant) => {
      const shouldInfer = variant.weight === void 0 || variant.style === void 0;
      const data = {
        // If it should be inferred, we don't want to set the value
        weight: variant.weight,
        style: variant.style,
        src: [],
        unicodeRange: variant.unicodeRange,
        display: variant.display,
        stretch: variant.stretch,
        featureSettings: variant.featureSettings,
        variationSettings: variant.variationSettings
      };
      data.src = variant.src.map((source, index) => {
        if (shouldInfer && index === 0) {
          const result = fontFileReader.extract({ family: family.name, url: source.url });
          if (variant.weight === void 0) data.weight = result.weight;
          if (variant.style === void 0) data.style = result.style;
        }
        const type = fontTypeExtractor.extract(source.url);
        return {
          originalURL: source.url,
          url: urlProxy.proxy({
            url: source.url,
            type,
            // We only use the first source for preloading. For example if woff2 and woff
            // are available, we only keep woff2.
            collectPreload: index === 0,
            data: {
              weight: data.weight,
              style: data.style
            },
            init: null
          }),
          format: FONT_FORMATS.find((e) => e.type === type)?.format,
          tech: source.tech
        };
      });
      return data;
    })
  };
}
export {
  resolveLocalFont
};
