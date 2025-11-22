import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { FONT_TYPES, GENERIC_FALLBACK_NAMES, LOCAL_PROVIDER_NAME } from "./constants.js";
function unifontFontFaceDataToProperties(font) {
  return {
    src: font.src ? renderFontSrc(font.src) : void 0,
    "font-display": font.display ?? "swap",
    "unicode-range": font.unicodeRange?.length ? font.unicodeRange.join(",") : void 0,
    "font-weight": Array.isArray(font.weight) ? font.weight.join(" ") : font.weight?.toString(),
    "font-style": font.style,
    "font-stretch": font.stretch,
    "font-feature-settings": font.featureSettings,
    "font-variation-settings": font.variationSettings
  };
}
function renderFontSrc(sources) {
  return sources.map((src) => {
    if ("name" in src) {
      return `local("${src.name}")`;
    }
    let rendered = `url("${src.url}")`;
    if (src.format) {
      rendered += ` format("${src.format}")`;
    }
    if (src.tech) {
      rendered += ` tech(${src.tech})`;
    }
    return rendered;
  }).join(", ");
}
const QUOTES_RE = /^["']|["']$/g;
function withoutQuotes(str) {
  return str.trim().replace(QUOTES_RE, "");
}
function isFontType(str) {
  return FONT_TYPES.includes(str);
}
async function cache(storage, key, cb) {
  const existing = await storage.getItemRaw(key);
  if (existing) {
    return existing;
  }
  const data = await cb();
  await storage.setItemRaw(key, data);
  return data;
}
function isGenericFontFamily(str) {
  return GENERIC_FALLBACK_NAMES.includes(str);
}
function dedupe(arr) {
  return [...new Set(arr)];
}
function sortObjectByKey(unordered) {
  const ordered = Object.keys(unordered).sort().reduce((obj, key) => {
    const value = unordered[key];
    obj[key] = Array.isArray(value) ? value.map((v) => typeof v === "object" && v !== null ? sortObjectByKey(v) : v) : typeof value === "object" && value !== null ? sortObjectByKey(value) : value;
    return obj;
  }, {});
  return ordered;
}
function resolveEntrypoint(root, entrypoint) {
  const require2 = createRequire(root);
  try {
    return pathToFileURL(require2.resolve(entrypoint));
  } catch {
    return new URL(entrypoint, root);
  }
}
function pickFontFaceProperty(property, { data, family }) {
  return data[property] ?? (family.provider === LOCAL_PROVIDER_NAME ? void 0 : family[property]);
}
export {
  cache,
  dedupe,
  isFontType,
  isGenericFontFamily,
  pickFontFaceProperty,
  renderFontSrc,
  resolveEntrypoint,
  sortObjectByKey,
  unifontFontFaceDataToProperties,
  withoutQuotes
};
