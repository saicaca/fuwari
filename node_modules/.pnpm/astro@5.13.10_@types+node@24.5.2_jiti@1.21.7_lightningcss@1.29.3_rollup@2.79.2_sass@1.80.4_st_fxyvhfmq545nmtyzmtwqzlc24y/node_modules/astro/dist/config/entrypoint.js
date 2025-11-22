import { defineAstroFontProvider, fontProviders } from "../assets/fonts/providers/index.js";
import { mergeConfig } from "../core/config/merge.js";
import { validateConfig } from "../core/config/validate.js";
import { envField } from "../env/config.js";
import { defineConfig, getViteConfig } from "./index.js";
function sharpImageService(config = {}) {
  return {
    entrypoint: "astro/assets/services/sharp",
    config
  };
}
function passthroughImageService() {
  return {
    entrypoint: "astro/assets/services/noop",
    config: {}
  };
}
export {
  defineAstroFontProvider,
  defineConfig,
  envField,
  fontProviders,
  getViteConfig,
  mergeConfig,
  passthroughImageService,
  sharpImageService,
  validateConfig
};
