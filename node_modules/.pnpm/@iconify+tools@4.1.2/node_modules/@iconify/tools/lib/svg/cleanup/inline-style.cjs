'use strict';

const css_parse = require('../../css/parse.cjs');
const svg_data_attributes = require('../data/attributes.cjs');
const svg_parse = require('../parse.cjs');
require('../../css/parser/tokens.cjs');
require('../../css/parser/error.cjs');
require('../../css/parser/strings.cjs');
require('../../css/parser/text.cjs');
require('../data/tags.cjs');

const allowedStyleRules = /* @__PURE__ */ new Set([
  // Animations
  "animation",
  "animation*",
  "offset",
  "offset*",
  // Transformations
  "transform",
  "transform*",
  "translate",
  // Transitions
  "transition",
  "transition*"
]);
const knownIgnoredRules = /* @__PURE__ */ new Set([
  // Illustrator / Inkscape junk
  "solid*",
  "paint*",
  "shape*",
  "color-interpolation-filters",
  "stop-opacity"
]);
function cleanupInlineStyle(svg) {
  svg_parse.parseSVG(svg, (item) => {
    const $element = item.$element;
    const attribs = item.element.attribs;
    const tagName = item.tagName;
    if (attribs.style) {
      const parsedStyle = css_parse.parseInlineStyle(attribs.style);
      if (parsedStyle === null) {
        $element.removeAttr("style");
      } else {
        const newStyle = /* @__PURE__ */ Object.create(null);
        const checkRule = (prop, value) => {
          function warn() {
            console.warn(
              `Removing unexpected style on "${tagName}": ${prop}`
            );
          }
          if (svg_data_attributes.badAttributes.has(prop) || svg_data_attributes.tagSpecificNonPresentationalAttributes[tagName]?.has(
            prop
          )) {
            return;
          }
          if (svg_data_attributes.tagSpecificAnimatedAttributes[tagName]?.has(prop) || svg_data_attributes.tagSpecificPresentationalAttributes[tagName]?.has(prop)) {
            $element.attr(prop, value);
            return;
          }
          const partial = prop.split("-").shift() + "*";
          if (svg_data_attributes.tagSpecificInlineStyles[tagName]?.has(prop) || allowedStyleRules.has(prop) || allowedStyleRules.has(partial)) {
            newStyle[prop] = value;
            return;
          }
          if (svg_data_attributes.insideClipPathAttributes.has(prop)) {
            if (item.parents.find(
              (item2) => item2.tagName === "clipPath"
            )) {
              $element.attr(prop, value);
            }
            return;
          }
          if (svg_data_attributes.badSoftwareAttributes.has(prop) || svg_data_attributes.badAttributePrefixes.has(
            prop.split("-").shift()
          ) || knownIgnoredRules.has(prop) || knownIgnoredRules.has(partial)) {
            return;
          }
          if (prop.slice(0, 1) === "-") {
            return;
          }
          warn();
        };
        for (const prop in parsedStyle) {
          checkRule(prop, parsedStyle[prop]);
        }
        const newStyleStr = Object.keys(newStyle).map((key) => key + ":" + newStyle[key] + ";").join("");
        if (newStyleStr.length) {
          $element.attr("style", newStyleStr);
        } else {
          $element.removeAttr("style");
        }
      }
    }
  });
}

exports.cleanupInlineStyle = cleanupInlineStyle;
