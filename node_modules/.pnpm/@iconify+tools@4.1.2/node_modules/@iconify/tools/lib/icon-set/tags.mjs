import { defaultIconDimensions } from '@iconify/utils/lib/icon/defaults';
import { detectIconSetPalette } from '../colors/detect.mjs';
import '../colors/parse.mjs';
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
import '../colors/attribs.mjs';
import '../svg/data/attributes.mjs';
import '../svg/analyse.mjs';
import '../svg/analyse/error.mjs';

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
      hasPalette = detectIconSetPalette(iconSet);
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
      const iconWidth = iconProps.width || defaultIconDimensions.width;
      const iconHeight = iconProps.height || defaultIconDimensions.height;
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

export { addTagsToIconSet, paletteTags, sizeTags };
