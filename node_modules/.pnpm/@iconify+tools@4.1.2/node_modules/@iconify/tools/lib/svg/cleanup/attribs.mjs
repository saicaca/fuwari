import { badAttributes, badSoftwareAttributes, badAttributePrefixes, tagSpecificPresentationalAttributes } from '../data/attributes.mjs';
import { defsTag } from '../data/tags.mjs';
import { parseSVG } from '../parse.mjs';

function removeBadAttributes(svg) {
  parseSVG(svg, (item) => {
    const tagName = item.tagName;
    const attribs = item.element.attribs;
    const $element = item.$element;
    Object.keys(attribs).forEach((attr) => {
      if (attr.slice(0, 2) === "on" || badAttributes.has(attr) || badSoftwareAttributes.has(attr) || badAttributePrefixes.has(attr.split("-").shift())) {
        $element.removeAttr(attr);
        return;
      }
      if (defsTag.has(tagName) && !tagSpecificPresentationalAttributes[tagName].has(attr)) {
        $element.removeAttr(attr);
        return;
      }
      const nsParts = attr.split(":");
      if (nsParts.length > 1) {
        const namespace = nsParts.shift();
        const newAttr = nsParts.join(":");
        switch (namespace) {
          case "xlink": {
            if (attribs[newAttr] === void 0) {
              $element.attr(newAttr, attribs[attr]);
            }
            break;
          }
        }
        $element.removeAttr(attr);
      }
    });
  });
}

export { removeBadAttributes };
