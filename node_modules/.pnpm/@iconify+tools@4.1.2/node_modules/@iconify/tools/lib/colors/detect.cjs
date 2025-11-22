'use strict';

const colors_parse = require('./parse.cjs');
require('@iconify/utils/lib/colors');
require('../svg/data/tags.cjs');
require('../svg/parse-style.cjs');
require('../css/parse.cjs');
require('../css/parser/tokens.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');
require('../css/parser/export.cjs');
require('../css/parser/tree.cjs');
require('../svg/parse.cjs');
require('./attribs.cjs');
require('../svg/data/attributes.cjs');
require('../svg/analyse.cjs');
require('../svg/analyse/error.cjs');

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
      colors_parse.parseColors(svg, {
        callback: (attr, colorStr, color) => {
          if (!color) {
            iconPalette = null;
            return colorStr;
          }
          if (iconPalette === null || colors_parse.isEmptyColor(color)) {
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

exports.detectIconSetPalette = detectIconSetPalette;
