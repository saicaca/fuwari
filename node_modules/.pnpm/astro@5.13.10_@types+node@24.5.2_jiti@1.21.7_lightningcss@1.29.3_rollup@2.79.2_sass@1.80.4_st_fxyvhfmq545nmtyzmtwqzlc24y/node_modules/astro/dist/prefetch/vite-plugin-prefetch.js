const virtualModuleId = "astro:prefetch";
const resolvedVirtualModuleId = "\0" + virtualModuleId;
const prefetchInternalModuleFsSubpath = "astro/dist/prefetch/index.js";
const prefetchCode = `import { init } from 'astro/virtual-modules/prefetch.js';init()`;
function astroPrefetch({ settings }) {
  const prefetchOption = settings.config.prefetch;
  const prefetch = prefetchOption ? typeof prefetchOption === "object" ? prefetchOption : {} : void 0;
  if (prefetch && settings.scripts.every((s) => s.content !== prefetchCode)) {
    settings.scripts.push({
      stage: "page",
      content: `import { init } from 'astro/virtual-modules/prefetch.js';init()`
    });
  }
  const throwPrefetchNotEnabledError = () => {
    throw new Error("You need to enable the `prefetch` Astro config to import `astro:prefetch`");
  };
  return {
    name: "astro:prefetch",
    async resolveId(id) {
      if (id === virtualModuleId) {
        if (!prefetch) throwPrefetchNotEnabledError();
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        if (!prefetch) throwPrefetchNotEnabledError();
        return { code: `export { prefetch } from "astro/virtual-modules/prefetch.js";` };
      }
    },
    transform(code, id) {
      if (id.includes(prefetchInternalModuleFsSubpath)) {
        code = code.replace(
          "__PREFETCH_PREFETCH_ALL__",
          // length: 25
          `${JSON.stringify(prefetch?.prefetchAll)}`.padEnd(25)
        ).replace(
          "__PREFETCH_DEFAULT_STRATEGY__",
          // length: 29
          `${JSON.stringify(prefetch?.defaultStrategy)}`.padEnd(29)
        ).replace(
          "__EXPERIMENTAL_CLIENT_PRERENDER__",
          // length: 33
          `${JSON.stringify(settings.config.experimental.clientPrerender)}`.padEnd(33)
        );
        return { code, map: null };
      }
    }
  };
}
export {
  astroPrefetch as default
};
