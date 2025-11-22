'use strict';

const defaults = require('@iconify/utils/lib/icon/defaults');
const colors_detect = require('../colors/detect.cjs');
require('../colors/parse.cjs');
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
require('../colors/attribs.cjs');
require('../svg/data/attributes.cjs');
require('../svg/analyse.cjs');
require('../svg/analyse/error.cjs');

const paletteTags = {
  monotone: "Monotone",
  palette: "Has Colors"
};
const sizeTags = {
  square: "Square",
  gridPrefix: "Grid: ",
  heightPrefix: "Height: "
};
function addTagsToIconSet(iconSet, customTags) {
  const info = iconSet.info;
  const tags = [];
  const iconNames = Object.keys(iconSet.entries).filter((key) => {
    const item = iconSet.entries[key];
    if (item.type !== "icon") {
      return false;
    }
    if (item.props.hidden) {
      return false;
    }
    return true;
  });
  if (iconNames.length) {
    let hasPalette = info?.palette;
    if (hasPalette === void 0) {
      hasPalette = colors_detect.detectIconSetPalette(iconSet);
    }
    if (hasPalette === true) {
      tags.push(paletteTags.palette);
    }
    if (hasPalette === false) {
      tags.push(paletteTags.monotone);
    }
    let isSquare = true;
    let height;
    for (let i = 0; i < iconNames.length; i++) {
      const icon = iconSet.entries[iconNames[i]];
      if (icon.type !== "icon") {
        continue;
      }
      const iconProps = icon.props;
      const iconWidth = iconProps.width || defaults.defaultIconDimensions.width;
      const iconHeight = iconProps.height || defaults.defaultIconDimensions.height;
      if (isSquare && iconWidth !== iconHeight) {
        isSquare = false;
      }
      if (height === void 0) {
        height = iconHeight;
      } else if (height && iconHeight !== height) {
        height = null;
      }
      if (!height && !isSquare) {
        break;
      }
    }
    if (height && Math.round(height) === height) {
      tags.push(
        (isSquare ? sizeTags.gridPrefix : sizeTags.heightPrefix) + height.toString()
      );
    }
    if (isSquare) {
      tags.push(sizeTags.square);
    }
  }
  const result = tags.concat(customTags || []);
  if (info) {
    info.tags = result;
  }
  return result;
}

exports.addTagsToIconSet = addTagsToIconSet;
exports.paletteTags = paletteTags;
exports.sizeTags = sizeTags;
