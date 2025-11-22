'use strict';

const svg_data_attributes = require('../data/attributes.cjs');
const svg_data_tags = require('../data/tags.cjs');
const svg_parse = require('../parse.cjs');

function removeBadAttributes(svg) {
  svg_parse.parseSVG(svg, (item) => {
    const tagName = item.tagName;
    const attribs = item.element.attribs;
    const $element = item.$element;
    Object.keys(attribs).forEach((attr) => {
      if (attr.slice(0, 2) === "on" || svg_data_attributes.badAttributes.has(attr) || svg_data_attributes.badSoftwareAttributes.has(attr) || svg_data_attributes.badAttributePrefixes.has(attr.split("-").shift())) {
        $element.removeAttr(attr);
        return;
      }
      if (svg_data_tags.defsTag.has(tagName) && !svg_data_attributes.tagSpecificPresentationalAttributes[tagName].has(attr)) {
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

exports.removeBadAttributes = removeBadAttributes;
