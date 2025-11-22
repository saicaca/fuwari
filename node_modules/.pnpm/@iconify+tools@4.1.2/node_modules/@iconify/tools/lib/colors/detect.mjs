import { parseColors, isEmptyColor } from './parse.mjs';
import '@iconify/utils/lib/colors';
import '../svg/data/tags.mjs';
import '../svg/parse-style.mjs';
import '../css/parse.mjs';
import '../css/parser/tokens.mjs';
import '../css/parser/error.mjs';
import '../css/parser/strings.mjs';
import '../css/parser/text.mjs';
import '../css/parser/export.mjs';
import '../css/parser/tree.mjs';
import '../svg/parse.mjs';
import './attribs.mjs';
import '../svg/data/attributes.mjs';
import '../svg/analyse.mjs';
import '../svg/analyse/error.mjs';

function detectIconSetPalette(iconSet) {
  let palette;
  iconSet.forEachSync(
    (name) => {
      if (palette === null) {
        return;
      }
      const svg = iconSet.toSVG(name);
      if (!svg) {
        return;
      }
      let iconPalette;
      parseColors(svg, {
        callback: (attr, colorStr, color) => {
          if (!color) {
            iconPalette = null;
            return colorStr;
          }
          if (iconPalette === null || isEmptyColor(color)) {
            return color;
          }
          const isColor = color.type !== "current";
          if (iconPalette === void 0) {
            iconPalette = isColor;
            return color;
          }
          if (iconPalette !== isColor) {
            iconPalette = null;
          }
          return color;
        }
      });
      if (iconPalette === void 0) {
        iconPalette = null;
      }
      if (palette === void 0) {
        palette = iconPalette;
      } else if (palette !== iconPalette) {
        palette = null;
      }
    },
    ["icon"]
  );
  return palette ?? null;
}

export { detectIconSetPalette };
