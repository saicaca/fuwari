import MagicString from "magic-string";
import { normalizePath } from "vite";
import { isPage } from "../core/util.js";
import { PAGE_SSR_SCRIPT_ID } from "./index.js";
function astroScriptsPostPlugin({
  settings
}) {
  return {
    name: "astro:scripts:page-ssr",
    enforce: "post",
    transform(code, id, options) {
      if (!options?.ssr) return;
      const hasInjectedScript = settings.scripts.some((s2) => s2.stage === "page-ssr");
      if (!hasInjectedScript) return;
      const filename = normalizePath(id);
      let fileURL;
      try {
        fileURL = new URL(`file://${filename}`);
      } catch {
        return;
      }
      const fileIsPage = isPage(fileURL, settings);
      if (!fileIsPage) return;
      const s = new MagicString(code, { filename });
      s.prepend(`import '${PAGE_SSR_SCRIPT_ID}';
`);
      return {
        code: s.toString(),
        map: s.generateMap({ hires: "boundary" })
      };
    }
  };
}
export {
  astroScriptsPostPlugin as default
};
