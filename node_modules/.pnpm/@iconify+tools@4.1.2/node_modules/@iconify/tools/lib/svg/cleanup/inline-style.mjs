import { parseInlineStyle } from '../../css/parse.mjs';
import { badAttributes, tagSpecificNonPresentationalAttributes, tagSpecificAnimatedAttributes, tagSpecificPresentationalAttributes, tagSpecificInlineStyles, insideClipPathAttributes, badSoftwareAttributes, badAttributePrefixes } from '../data/attributes.mjs';
import { parseSVG } from '../parse.mjs';
import '../../css/parser/tokens.mjs';
import '../../css/parser/error.mjs';
import '../../css/parser/strings.mjs';
import '../../css/parser/text.mjs';
import '../data/tags.mjs';

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
  parseSVG(svg, (item) => {
    const $element = item.$element;
    const attribs = item.element.attribs;
    const tagName = item.tagName;
    if (attribs.style) {
      const parsedStyle = parseInlineStyle(attribs.style);
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
          if (badAttributes.has(prop) || tagSpecificNonPresentationalAttributes[tagName]?.has(
            prop
          )) {
            return;
          }
          if (tagSpecificAnimatedAttributes[tagName]?.has(prop) || tagSpecificPresentationalAttributes[tagName]?.has(prop)) {
            $element.attr(prop, value);
            return;
          }
          const partial = prop.split("-").shift() + "*";
          if (tagSpecificInlineStyles[tagName]?.has(prop) || allowedStyleRules.has(prop) || allowedStyleRules.has(partial)) {
            newStyle[prop] = value;
            return;
          }
          if (insideClipPathAttributes.has(prop)) {
            if (item.parents.find(
              (item2) => item2.tagName === "clipPath"
            )) {
              $element.attr(prop, value);
            }
            return;
          }
          if (badSoftwareAttributes.has(prop) || badAttributePrefixes.has(
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

export { cleanupInlineStyle };
