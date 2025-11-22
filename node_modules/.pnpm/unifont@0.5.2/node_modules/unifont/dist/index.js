import { hash } from 'ohash';
import { findAll, parse, generate } from 'css-tree';
import { ofetch } from 'ofetch';

const version = "0.5.2";

function memoryStorage() {
  const cache = /* @__PURE__ */ new Map();
  return {
    getItem(key) {
      return cache.get(key);
    },
    setItem(key, value) {
      cache.set(key, value);
    }
  };
}
const ONE_WEEK = 1e3 * 60 * 60 * 24 * 7;
function createAsyncStorage(storage) {
  return {
    async getItem(key, init) {
      const now = Date.now();
      const res = await storage.getItem(key);
      if (res && res.expires > now && res.version === version) {
        return res.data;
      }
      if (!init) {
        return null;
      }
      const data = await init();
      await storage.setItem(key, { expires: now + ONE_WEEK, version, data });
      return data;
    },
    async setItem(key, data) {
      await storage.setItem(key, { expires: Date.now() + ONE_WEEK, version, data });
    }
  };
}

const extractableKeyMap = {
  "src": "src",
  "font-display": "display",
  "font-weight": "weight",
  "font-style": "style",
  "font-feature-settings": "featureSettings",
  "font-variations-settings": "variationSettings",
  "unicode-range": "unicodeRange"
};
const formatMap = {
  woff2: "woff2",
  woff: "woff",
  otf: "opentype",
  ttf: "truetype",
  eot: "embedded-opentype",
  svg: "svg"
};
const formatPriorityList = Object.values(formatMap);
function extractFontFaceData(css, family) {
  const fontFaces = [];
  for (const node of findAll(parse(css), (node2) => node2.type === "Atrule" && node2.name === "font-face")) {
    if (node.type !== "Atrule" || node.name !== "font-face") {
      continue;
    }
    if (family) {
      const isCorrectFontFace = node.block?.children.some((child) => {
        if (child.type !== "Declaration" || child.property !== "font-family") {
          return false;
        }
        const value = extractCSSValue(child);
        const slug = family.toLowerCase();
        if (typeof value === "string" && value.toLowerCase() === slug) {
          return true;
        }
        if (Array.isArray(value) && value.length > 0 && value.some((v) => v.toLowerCase() === slug)) {
          return true;
        }
        return false;
      });
      if (!isCorrectFontFace) {
        continue;
      }
    }
    const data = {};
    for (const child of node.block?.children || []) {
      if (child.type === "Declaration" && child.property in extractableKeyMap) {
        const value = extractCSSValue(child);
        data[extractableKeyMap[child.property]] = ["src", "unicode-range"].includes(child.property) && !Array.isArray(value) ? [value] : value;
      }
    }
    if (!data.src) {
      continue;
    }
    fontFaces.push(data);
  }
  return mergeFontSources(fontFaces);
}
function processRawValue(value) {
  return value.split(",").map((v) => v.trim().replace(/^(?<quote>['"])(.*)\k<quote>$/, "$2"));
}
function extractCSSValue(node) {
  if (node.value.type === "Raw") {
    return processRawValue(node.value.value);
  }
  const values = [];
  let buffer = "";
  for (const child of node.value.children) {
    if (child.type === "Function") {
      if (child.name === "local" && child.children.first?.type === "String") {
        values.push({ name: child.children.first.value });
      }
      if (child.name === "format") {
        if (child.children.first?.type === "String") {
          values.at(-1).format = child.children.first.value;
        } else if (child.children.first?.type === "Identifier") {
          values.at(-1).format = child.children.first.name;
        }
      }
      if (child.name === "tech") {
        if (child.children.first?.type === "String") {
          values.at(-1).tech = child.children.first.value;
        } else if (child.children.first?.type === "Identifier") {
          values.at(-1).tech = child.children.first.name;
        }
      }
    }
    if (child.type === "Url") {
      values.push({ url: child.value });
    }
    if (child.type === "Identifier") {
      buffer = buffer ? `${buffer} ${child.name}` : child.name;
    }
    if (child.type === "String") {
      values.push(child.value);
    }
    if (child.type === "Dimension") {
      const dimensionValue = child.value + child.unit;
      buffer = buffer ? `${buffer} ${dimensionValue}` : dimensionValue;
    }
    if (child.type === "Operator" && child.value === "," && buffer) {
      values.push(buffer);
      buffer = "";
    }
    if (child.type === "UnicodeRange") {
      values.push(child.value);
    }
    if (child.type === "Number") {
      values.push(Number(child.value));
    }
  }
  if (buffer) {
    values.push(buffer);
  }
  if (values.length === 1) {
    return values[0];
  }
  return values;
}
function mergeFontSources(data) {
  const mergedData = [];
  for (const face of data) {
    const keys = Object.keys(face).filter((k) => k !== "src");
    const existing = mergedData.find((f) => Object.keys(f).length === keys.length + 1 && keys.every((key) => f[key]?.toString() === face[key]?.toString()));
    if (existing) {
      for (const s of face.src) {
        if (existing.src.every((src) => "url" in src ? !("url" in s) || s.url !== src.url : !("name" in s) || s.name !== src.name)) {
          existing.src.push(s);
        }
      }
    } else {
      mergedData.push(face);
    }
  }
  for (const face of mergedData) {
    face.src.sort((a, b) => {
      const aIndex = "format" in a ? formatPriorityList.indexOf(a.format || "woff2") : -2;
      const bIndex = "format" in b ? formatPriorityList.indexOf(b.format || "woff2") : -2;
      return aIndex - bIndex;
    });
  }
  return mergedData;
}

function mini$fetch(url, options) {
  const retries = options?.retries ?? 3;
  const retryDelay = options?.retryDelay ?? 1e3;
  return ofetch(url, {
    baseURL: options?.baseURL,
    query: options?.query,
    responseType: options?.responseType ?? "text",
    headers: options?.headers,
    retry: false
  }).catch((err) => {
    if (retries <= 0) {
      throw err;
    }
    console.warn(`Could not fetch from \`${(options?.baseURL ?? "") + url}\`. Will retry in \`${retryDelay}ms\`. \`${retries}\` retries left.`);
    return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(() => mini$fetch(url, { ...options, retries: retries - 1 }));
  });
}
const $fetch = Object.assign(mini$fetch, {
  create: (defaults) => (url, options) => mini$fetch(url, {
    ...defaults,
    ...options
  })
});

function defineFontProvider(name, provider) {
  return (options) => Object.assign(provider.bind(null, options || {}), { _name: name });
}
function prepareWeights({
  inputWeights,
  weights,
  hasVariableWeights
}) {
  const collectedWeights = [];
  for (const weight of inputWeights) {
    if (weight.includes(" ")) {
      if (hasVariableWeights) {
        collectedWeights.push(weight);
        continue;
      }
      const [min, max] = weight.split(" ");
      collectedWeights.push(
        ...weights.filter((_w) => {
          const w = Number(_w);
          return w >= Number(min) && w <= Number(max);
        }).map((w) => String(w))
      );
      continue;
    }
    if (weights.includes(weight)) {
      collectedWeights.push(weight);
    }
  }
  return [...new Set(collectedWeights)].map((weight) => ({
    weight,
    variable: weight.includes(" ")
  }));
}

const fontCSSAPI = $fetch.create({ baseURL: "https://use.typekit.net" });
async function getAdobeFontMeta(id) {
  const { kit } = await $fetch(`https://typekit.com/api/v1/json/kits/${id}/published`, { responseType: "json" });
  return kit;
}
const KIT_REFRESH_TIMEOUT = 5 * 60 * 1e3;
const adobe = defineFontProvider("adobe", async (options, ctx) => {
  if (!options.id) {
    return;
  }
  const familyMap = /* @__PURE__ */ new Map();
  const notFoundFamilies = /* @__PURE__ */ new Set();
  const fonts = {
    kits: []
  };
  let lastRefreshKitTime;
  const kits = typeof options.id === "string" ? [options.id] : options.id;
  await fetchKits();
  async function fetchKits(bypassCache = false) {
    familyMap.clear();
    notFoundFamilies.clear();
    fonts.kits = [];
    await Promise.all(kits.map(async (id) => {
      let meta;
      const key = `adobe:meta-${id}.json`;
      if (bypassCache) {
        meta = await getAdobeFontMeta(id);
        await ctx.storage.setItem(key, meta);
      } else {
        meta = await ctx.storage.getItem(key, () => getAdobeFontMeta(id));
      }
      if (!meta) {
        throw new TypeError("No font metadata found in adobe response.");
      }
      fonts.kits.push(meta);
      for (const family of meta.families) {
        familyMap.set(family.name, family.id);
      }
    }));
  }
  async function getFontDetails(family, options2) {
    options2.weights = options2.weights.map(String);
    for (const kit of fonts.kits) {
      const font = kit.families.find((f) => f.name === family);
      if (!font) {
        continue;
      }
      const weights = prepareWeights({
        inputWeights: options2.weights,
        hasVariableWeights: false,
        weights: font.variations.map((v) => `${v.slice(-1)}00`)
      }).map((w) => w.weight);
      const styles = [];
      for (const style of font.variations) {
        if (style.includes("i") && !options2.styles.includes("italic")) {
          continue;
        }
        if (!weights.includes(String(`${style.slice(-1)}00`))) {
          continue;
        }
        styles.push(style);
      }
      if (styles.length === 0) {
        continue;
      }
      const css = await fontCSSAPI(`/${kit.id}.css`);
      const cssName = font.css_names[0] ?? family.toLowerCase().split(" ").join("-");
      return extractFontFaceData(css, cssName).filter((font2) => {
        const [lowerWeight, upperWeight] = Array.isArray(font2.weight) ? font2.weight : [0, 0];
        return (!options2.styles || !font2.style || options2.styles.includes(font2.style)) && (!weights || !font2.weight || Array.isArray(font2.weight) ? weights.some((weight) => Number(weight) <= upperWeight || Number(weight) >= lowerWeight) : weights.includes(String(font2.weight)));
      });
    }
    return [];
  }
  return {
    listFonts() {
      return [...familyMap.keys()];
    },
    async resolveFont(family, options2) {
      if (notFoundFamilies.has(family)) {
        return;
      }
      if (!familyMap.has(family)) {
        const lastRefetch = lastRefreshKitTime || 0;
        const now = Date.now();
        if (now - lastRefetch > KIT_REFRESH_TIMEOUT) {
          lastRefreshKitTime = Date.now();
          await fetchKits(true);
        }
      }
      if (!familyMap.has(family)) {
        notFoundFamilies.add(family);
        return;
      }
      const fonts2 = await ctx.storage.getItem(`adobe:${family}-${hash(options2)}-data.json`, () => getFontDetails(family, options2));
      return { fonts: fonts2 };
    }
  };
});

const fontAPI$2 = $fetch.create({ baseURL: "https://fonts.bunny.net" });
const bunny = defineFontProvider("bunny", async (_options, ctx) => {
  const familyMap = /* @__PURE__ */ new Map();
  const fonts = await ctx.storage.getItem("bunny:meta.json", () => fontAPI$2("/list", { responseType: "json" }));
  for (const [id, family] of Object.entries(fonts)) {
    familyMap.set(family.familyName, id);
  }
  async function getFontDetails(family, options) {
    const id = familyMap.get(family);
    const font = fonts[id];
    const weights = prepareWeights({
      inputWeights: options.weights,
      hasVariableWeights: false,
      weights: font.weights.map(String)
    });
    const styleMap = {
      italic: "i",
      oblique: "i",
      normal: ""
    };
    const styles = new Set(options.styles.map((i) => styleMap[i]));
    if (weights.length === 0 || styles.size === 0)
      return [];
    const resolvedVariants = weights.flatMap((w) => [...styles].map((s) => `${w.weight}${s}`));
    const css = await fontAPI$2("/css", {
      query: {
        family: `${id}:${resolvedVariants.join(",")}`
      }
    });
    return extractFontFaceData(css);
  }
  return {
    listFonts() {
      return [...familyMap.keys()];
    },
    async resolveFont(fontFamily, defaults) {
      if (!familyMap.has(fontFamily)) {
        return;
      }
      const fonts2 = await ctx.storage.getItem(`bunny:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults));
      return { fonts: fonts2 };
    }
  };
});

const fontAPI$1 = $fetch.create({ baseURL: "https://api.fontshare.com/v2" });
const fontshare = defineFontProvider("fontshare", async (_options, ctx) => {
  const fontshareFamilies = /* @__PURE__ */ new Set();
  const fonts = await ctx.storage.getItem("fontshare:meta.json", async () => {
    const fonts2 = [];
    let offset = 0;
    let chunk;
    do {
      chunk = await fontAPI$1("/fonts", {
        responseType: "json",
        query: {
          offset,
          limit: 100
        }
      });
      fonts2.push(...chunk.fonts);
      offset++;
    } while (chunk.has_more);
    return fonts2;
  });
  for (const font of fonts) {
    fontshareFamilies.add(font.name);
  }
  async function getFontDetails(family, options) {
    const font = fonts.find((f) => f.name === family);
    const numbers = [];
    const weights = prepareWeights({
      inputWeights: options.weights,
      hasVariableWeights: false,
      weights: font.styles.map((s) => String(s.weight.weight))
    }).map((w) => w.weight);
    for (const style of font.styles) {
      if (style.is_italic && !options.styles.includes("italic")) {
        continue;
      }
      if (!style.is_italic && !options.styles.includes("normal")) {
        continue;
      }
      if (!weights.includes(String(style.weight.weight))) {
        continue;
      }
      numbers.push(style.weight.number);
    }
    if (numbers.length === 0)
      return [];
    const css = await fontAPI$1(`/css?f[]=${`${font.slug}@${numbers.join(",")}`}`);
    return extractFontFaceData(css);
  }
  return {
    listFonts() {
      return [...fontshareFamilies];
    },
    async resolveFont(fontFamily, defaults) {
      if (!fontshareFamilies.has(fontFamily)) {
        return;
      }
      const fonts2 = await ctx.storage.getItem(`fontshare:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults));
      return { fonts: fonts2 };
    }
  };
});

const fontAPI = $fetch.create({ baseURL: "https://api.fontsource.org/v1" });
const fontsource = defineFontProvider("fontsource", async (_options, ctx) => {
  const fonts = await ctx.storage.getItem("fontsource:meta.json", () => fontAPI("/fonts", { responseType: "json" }));
  const familyMap = /* @__PURE__ */ new Map();
  for (const meta of fonts) {
    familyMap.set(meta.family, meta);
  }
  async function getFontDetails(family, options) {
    const font = familyMap.get(family);
    const weights = prepareWeights({
      inputWeights: options.weights,
      hasVariableWeights: font.variable,
      weights: font.weights.map(String)
    });
    const styles = options.styles.filter((style) => font.styles.includes(style));
    const subsets = options.subsets ? options.subsets.filter((subset) => font.subsets.includes(subset)) : [font.defSubset];
    if (weights.length === 0 || styles.length === 0)
      return [];
    const fontDetail = await fontAPI(`/fonts/${font.id}`, { responseType: "json" });
    const fontFaceData = [];
    for (const subset of subsets) {
      for (const style of styles) {
        for (const { weight, variable } of weights) {
          if (variable) {
            try {
              const variableAxes = await ctx.storage.getItem(`fontsource:${font.family}-axes.json`, () => fontAPI(`/variable/${font.id}`, { responseType: "json" }));
              if (variableAxes && variableAxes.axes.wght) {
                fontFaceData.push({
                  style,
                  weight: [Number(variableAxes.axes.wght.min), Number(variableAxes.axes.wght.max)],
                  src: [
                    { url: `https://cdn.jsdelivr.net/fontsource/fonts/${font.id}:vf@latest/${subset}-wght-${style}.woff2`, format: "woff2" }
                  ],
                  unicodeRange: fontDetail.unicodeRange[subset]?.split(",")
                });
              }
            } catch {
              console.error(`Could not download variable axes metadata for \`${font.family}\` from \`fontsource\`. \`unifont\` will not be able to inject variable axes for ${font.family}.`);
            }
            continue;
          }
          const variantUrl = fontDetail.variants[weight][style][subset].url;
          fontFaceData.push({
            style,
            weight,
            src: Object.entries(variantUrl).map(([format, url]) => ({ url, format })),
            unicodeRange: fontDetail.unicodeRange[subset]?.split(",")
          });
        }
      }
    }
    return fontFaceData;
  }
  return {
    listFonts() {
      return [...familyMap.keys()];
    },
    async resolveFont(fontFamily, options) {
      if (!familyMap.has(fontFamily)) {
        return;
      }
      const fonts2 = await ctx.storage.getItem(`fontsource:${fontFamily}-${hash(options)}-data.json`, () => getFontDetails(fontFamily, options));
      return { fonts: fonts2 };
    }
  };
});

function splitCssIntoSubsets(input) {
  const data = [];
  const comments = [];
  const nodes = findAll(
    parse(input, {
      positions: true,
      // Comments are not part of the tree. We rely on the positions to infer the subset
      onComment(value, loc) {
        comments.push({ value: value.trim(), endLine: loc.end.line });
      }
    }),
    (node) => node.type === "Atrule" && node.name === "font-face"
  );
  if (comments.length === 0) {
    return [{ subset: null, css: input }];
  }
  for (const node of nodes) {
    const comment = comments.filter((comment2) => comment2.endLine < node.loc.start.line).at(-1);
    if (!comment)
      continue;
    data.push({ subset: comment.value, css: generate(node) });
  }
  return data;
}
const google = defineFontProvider("google", async (_options = {}, ctx) => {
  const googleFonts = await ctx.storage.getItem("google:meta.json", () => $fetch("https://fonts.google.com/metadata/fonts", { responseType: "json" }).then((r) => r.familyMetadataList));
  const styleMap = {
    italic: "1",
    oblique: "1",
    normal: "0"
  };
  const userAgents = {
    woff2: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    ttf: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.54.16 (KHTML, like Gecko) Version/5.1.4 Safari/534.54.16"
    // eot: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
    // woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    // svg: 'Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3',
  };
  async function getFontDetails(family, options) {
    const font = googleFonts.find((font2) => font2.family === family);
    const styles = [...new Set(options.styles.map((i) => styleMap[i]))].sort();
    const glyphs = _options.experimental?.glyphs?.[family]?.join("");
    const weights = prepareWeights({
      inputWeights: options.weights,
      hasVariableWeights: font.axes.some((a) => a.tag === "wght"),
      weights: Object.keys(font.fonts)
    }).map((v) => v.variable ? {
      weight: v.weight.replace(" ", ".."),
      variable: v.variable
    } : v);
    if (weights.length === 0 || styles.length === 0)
      return [];
    const resolvedAxes = [];
    let resolvedVariants = [];
    for (const axis of ["wght", "ital", ...Object.keys(_options?.experimental?.variableAxis?.[family] ?? {})].sort(googleFlavoredSorting)) {
      const axisValue = {
        wght: weights.map((v) => v.weight),
        ital: styles
      }[axis] ?? _options.experimental.variableAxis[family][axis].map((v) => Array.isArray(v) ? `${v[0]}..${v[1]}` : v);
      if (resolvedVariants.length === 0) {
        resolvedVariants = axisValue;
      } else {
        resolvedVariants = resolvedVariants.flatMap((v) => [...axisValue].map((o) => [v, o].join(","))).sort();
      }
      resolvedAxes.push(axis);
    }
    let priority = 0;
    const resolvedFontFaceData = [];
    for (const extension in userAgents) {
      const rawCss = await $fetch("/css2", {
        baseURL: "https://fonts.googleapis.com",
        headers: {
          "user-agent": userAgents[extension]
        },
        query: {
          family: `${family}:${resolvedAxes.join(",")}@${resolvedVariants.join(
            ";"
          )}`,
          ...glyphs && { text: glyphs }
        }
      });
      const groups = splitCssIntoSubsets(rawCss).filter((group) => group.subset ? options.subsets.includes(group.subset) : true);
      for (const group of groups) {
        const data = extractFontFaceData(group.css);
        data.map((f) => {
          f.meta ??= {};
          f.meta.priority = priority;
          return f;
        });
        resolvedFontFaceData.push(...data);
      }
      priority++;
    }
    return resolvedFontFaceData;
  }
  return {
    listFonts() {
      return googleFonts.map((font) => font.family);
    },
    async resolveFont(fontFamily, options) {
      if (!googleFonts.some((font) => font.family === fontFamily)) {
        return;
      }
      const fonts = await ctx.storage.getItem(`google:${fontFamily}-${hash(options)}-data.json`, () => getFontDetails(fontFamily, options));
      return { fonts };
    }
  };
});
function googleFlavoredSorting(a, b) {
  const isALowercase = a.charAt(0) === a.charAt(0).toLowerCase();
  const isBLowercase = b.charAt(0) === b.charAt(0).toLowerCase();
  if (isALowercase !== isBLowercase) {
    return Number(isBLowercase) - Number(isALowercase);
  } else {
    return a.localeCompare(b);
  }
}

const googleicons = defineFontProvider("googleicons", async (_options, ctx) => {
  const googleIcons = await ctx.storage.getItem("googleicons:meta.json", async () => {
    const response = JSON.parse((await $fetch(
      "https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true"
    )).split("\n").slice(1).join("\n"));
    return response.families;
  });
  const userAgents = {
    woff2: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    ttf: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.54.16 (KHTML, like Gecko) Version/5.1.4 Safari/534.54.16"
    // eot: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
    // woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    // svg: 'Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3',
  };
  async function getFontDetails(family) {
    const iconNames = _options.experimental?.glyphs?.[family]?.sort().join(",");
    let css = "";
    for (const extension in userAgents) {
      if (family.includes("Icons")) {
        css += await $fetch("/icon", {
          baseURL: "https://fonts.googleapis.com",
          headers: { "user-agent": userAgents[extension] },
          query: {
            family
          }
        });
      } else {
        css += await $fetch("/css2", {
          baseURL: "https://fonts.googleapis.com",
          headers: { "user-agent": userAgents[extension] },
          query: {
            family: `${family}:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`,
            ...iconNames && { icon_names: iconNames }
          }
        });
      }
    }
    return extractFontFaceData(css);
  }
  return {
    listFonts() {
      return googleIcons;
    },
    async resolveFont(fontFamily, options) {
      if (!googleIcons.includes(fontFamily)) {
        return;
      }
      const fonts = await ctx.storage.getItem(`googleicons:${fontFamily}-${hash(options)}-data.json`, () => getFontDetails(fontFamily));
      return { fonts };
    }
  };
});

const providers = {
  __proto__: null,
  adobe: adobe,
  bunny: bunny,
  fontshare: fontshare,
  fontsource: fontsource,
  google: google,
  googleicons: googleicons
};

const defaultResolveOptions = {
  weights: ["400"],
  styles: ["normal", "italic"],
  subsets: [
    "cyrillic-ext",
    "cyrillic",
    "greek-ext",
    "greek",
    "vietnamese",
    "latin-ext",
    "latin"
  ]
};
async function createUnifont(providers2, options) {
  const stack = {};
  const unifontContext = {
    storage: createAsyncStorage(options?.storage ?? memoryStorage())
  };
  for (const provider of providers2) {
    stack[provider._name] = void 0;
  }
  await Promise.all(providers2.map(async (provider) => {
    try {
      const initializedProvider = await provider(unifontContext);
      if (initializedProvider)
        stack[provider._name] = initializedProvider;
    } catch (err) {
      console.error(`Could not initialize provider \`${provider._name}\`. \`unifont\` will not be able to process fonts provided by this provider.`, err);
    }
    if (!stack[provider._name]?.resolveFont) {
      delete stack[provider._name];
    }
  }));
  const allProviders = Object.keys(stack);
  async function resolveFont(fontFamily, options2, providers3 = allProviders) {
    const mergedOptions = { ...defaultResolveOptions, ...options2 };
    for (const id of providers3) {
      const provider = stack[id];
      try {
        const result = await provider?.resolveFont(fontFamily, mergedOptions);
        if (result) {
          return {
            provider: id,
            ...result
          };
        }
      } catch (err) {
        console.error(`Could not resolve font face for \`${fontFamily}\` from \`${id}\` provider.`, err);
      }
    }
    return { fonts: [] };
  }
  async function listFonts(providers3 = allProviders) {
    let names;
    for (const id of providers3) {
      const provider = stack[id];
      try {
        const result = await provider?.listFonts?.();
        if (result) {
          names ??= [];
          names.push(...result);
        }
      } catch (err) {
        console.error(`Could not list names from \`${id}\` provider.`, err);
      }
    }
    return names;
  }
  return {
    resolveFont,
    // TODO: remove before v1
    resolveFontFace: resolveFont,
    listFonts
  };
}

export { createUnifont, defaultResolveOptions, defineFontProvider, providers };
