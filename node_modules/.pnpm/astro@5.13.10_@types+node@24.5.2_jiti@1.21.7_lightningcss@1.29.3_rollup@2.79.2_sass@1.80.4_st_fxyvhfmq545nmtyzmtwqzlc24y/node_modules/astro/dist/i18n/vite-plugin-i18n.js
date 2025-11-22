import { AstroError } from "../core/errors/errors.js";
import { AstroErrorData } from "../core/errors/index.js";
const virtualModuleId = "astro:i18n";
function astroInternationalization({
  settings
}) {
  const {
    base,
    build: { format },
    i18n,
    site,
    trailingSlash
  } = settings.config;
  return {
    name: "astro:i18n",
    enforce: "pre",
    config(_config, { command }) {
      const i18nConfig = {
        base,
        format,
        site,
        trailingSlash,
        i18n,
        isBuild: command === "build"
      };
      return {
        define: {
          __ASTRO_INTERNAL_I18N_CONFIG__: JSON.stringify(i18nConfig)
        }
      };
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        if (i18n === void 0) throw new AstroError(AstroErrorData.i18nNotEnabled);
        return this.resolve("astro/virtual-modules/i18n.js");
      }
    }
  };
}
export {
  astroInternationalization as default
};
