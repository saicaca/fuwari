import { FONTS_TYPES_FILE } from "./constants.js";
function syncFonts(settings) {
  if (!settings.config.experimental.fonts) {
    return;
  }
  settings.injectedTypes.push({
    filename: FONTS_TYPES_FILE,
    content: `declare module 'astro:assets' {
	/** @internal */
	export type FontFamily = (${JSON.stringify(settings.config.experimental.fonts.map((family) => family.cssVariable))})[number];
}
`
  });
}
export {
  syncFonts
};
