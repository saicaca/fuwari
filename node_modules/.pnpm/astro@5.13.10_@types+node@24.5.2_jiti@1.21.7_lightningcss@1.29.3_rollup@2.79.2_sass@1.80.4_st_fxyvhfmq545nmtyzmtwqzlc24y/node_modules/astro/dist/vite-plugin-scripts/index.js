const SCRIPT_ID_PREFIX = `astro:scripts/`;
const BEFORE_HYDRATION_SCRIPT_ID = `${SCRIPT_ID_PREFIX}${"before-hydration"}.js`;
const PAGE_SCRIPT_ID = `${SCRIPT_ID_PREFIX}${"page"}.js`;
const PAGE_SSR_SCRIPT_ID = `${SCRIPT_ID_PREFIX}${"page-ssr"}.js`;
function astroScriptsPlugin({ settings }) {
  let env = void 0;
  return {
    name: "astro:scripts",
    config(_config, _env) {
      env = _env;
    },
    async resolveId(id) {
      if (id.startsWith(SCRIPT_ID_PREFIX)) {
        return id;
      }
      return void 0;
    },
    async load(id) {
      if (id === BEFORE_HYDRATION_SCRIPT_ID) {
        return {
          code: settings.scripts.filter((s) => s.stage === "before-hydration").map((s) => s.content).join("\n")
        };
      }
      if (id === PAGE_SCRIPT_ID) {
        return {
          code: settings.scripts.filter((s) => s.stage === "page").map((s) => s.content).join("\n")
        };
      }
      if (id === PAGE_SSR_SCRIPT_ID) {
        return {
          code: settings.scripts.filter((s) => s.stage === "page-ssr").map((s) => s.content).join("\n")
        };
      }
      return null;
    },
    buildStart() {
      const hasHydrationScripts = settings.scripts.some((s) => s.stage === "before-hydration");
      const isSsrBuild = env?.isSsrBuild;
      if (hasHydrationScripts && env?.command === "build" && !isSsrBuild) {
        this.emitFile({
          type: "chunk",
          id: BEFORE_HYDRATION_SCRIPT_ID,
          name: BEFORE_HYDRATION_SCRIPT_ID
        });
      }
    }
  };
}
export {
  BEFORE_HYDRATION_SCRIPT_ID,
  PAGE_SCRIPT_ID,
  PAGE_SSR_SCRIPT_ID,
  astroScriptsPlugin as default
};
