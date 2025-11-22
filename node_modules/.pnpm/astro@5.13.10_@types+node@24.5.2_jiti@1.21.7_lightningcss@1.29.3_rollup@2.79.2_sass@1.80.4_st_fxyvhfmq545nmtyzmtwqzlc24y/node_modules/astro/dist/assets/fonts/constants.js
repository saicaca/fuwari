const LOCAL_PROVIDER_NAME = "local";
const DEFAULTS = {
  weights: ["400"],
  styles: ["normal", "italic"],
  subsets: ["cyrillic-ext", "cyrillic", "greek-ext", "greek", "vietnamese", "latin-ext", "latin"],
  // Technically serif is the browser default but most websites these days use sans-serif
  fallbacks: ["sans-serif"],
  optimizedFallbacks: true
};
const VIRTUAL_MODULE_ID = "virtual:astro:assets/fonts/internal";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;
const ASSETS_DIR = "fonts";
const CACHE_DIR = "./fonts/";
const FONT_TYPES = ["woff2", "woff", "otf", "ttf", "eot"];
const FONT_FORMATS = [
  { type: "woff2", format: "woff2" },
  { type: "woff", format: "woff" },
  { type: "otf", format: "opentype" },
  { type: "ttf", format: "truetype" },
  { type: "eot", format: "embedded-opentype" }
];
const GENERIC_FALLBACK_NAMES = [
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong"
];
const FONTS_TYPES_FILE = "fonts.d.ts";
export {
  ASSETS_DIR,
  CACHE_DIR,
  DEFAULTS,
  FONTS_TYPES_FILE,
  FONT_FORMATS,
  FONT_TYPES,
  GENERIC_FALLBACK_NAMES,
  LOCAL_PROVIDER_NAME,
  RESOLVED_VIRTUAL_MODULE_ID,
  VIRTUAL_MODULE_ID
};
