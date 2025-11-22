import { FONT_FORMATS } from "../constants.js";
function normalizeRemoteFontFaces({
  fonts,
  urlProxy,
  fontTypeExtractor
}) {
  return fonts.filter((font) => typeof font.meta?.priority === "number" ? font.meta.priority === 0 : true).map((font) => {
    let index = 0;
    return {
      ...font,
      src: font.src.map((source) => {
        if ("name" in source) {
          return source;
        }
        const url = source.url.startsWith("//") ? `https:${source.url}` : source.url;
        const proxied = {
          ...source,
          originalURL: url,
          url: urlProxy.proxy({
            url,
            type: FONT_FORMATS.find((e) => e.format === source.format)?.type ?? fontTypeExtractor.extract(source.url),
            // We only collect the first URL to avoid preloading fallback sources (eg. we only
            // preload woff2 if woff is available)
            collectPreload: index === 0,
            data: {
              weight: font.weight,
              style: font.style
            },
            init: font.meta?.init ?? null
          })
        };
        index++;
        return proxied;
      })
    };
  });
}
export {
  normalizeRemoteFontFaces
};
