import { allValidTags, animateTags } from '../svg/data/tags.mjs';
import { parseSVG } from '../svg/parse.mjs';
import { parseSVGStyle } from '../svg/parse-style.mjs';
import '../css/parse.mjs';
import '../css/parser/tokens.mjs';
import '../css/parser/error.mjs';
import '../css/parser/strings.mjs';
import '../css/parser/text.mjs';
import '../css/parser/export.mjs';
import '../css/parser/tree.mjs';

function getClassList(value) {
  return value?.split(/\s+/);
}
const tempDataAttrbiute = "data-gstyle-temp";
function cleanupGlobalStyle(svg) {
  const backup = svg.toString();
  let containsTempAttr = false;
  const animatedClasses = /* @__PURE__ */ new Set();
  parseSVG(svg, (item) => {
    if (!animateTags.has(item.tagName)) {
      return;
    }
    const $element = item.$element;
    if ($element.attr("attributeName") !== "class") {
      return;
    }
    ["from", "to", "values"].forEach((attr) => {
      const value = $element.attr(attr);
      if (typeof value !== "string") {
        return;
      }
      value.split(";").forEach((item2) => {
        getClassList(item2).forEach((className) => {
          animatedClasses.add(className);
        });
      });
    });
  });
  const removeClasses = /* @__PURE__ */ new Set();
  try {
    parseSVGStyle(svg, (styleItem) => {
      const returnValue = styleItem.value;
      if (styleItem.type !== "global") {
        return returnValue;
      }
      const selectorTokens = styleItem.selectorTokens;
      for (let i = 0; i < selectorTokens.length; i++) {
        const selectorToken = selectorTokens[i];
        if (selectorToken.type !== "selector") {
          return returnValue;
        }
      }
      const selectors = styleItem.selectors;
      const matches = [];
      for (let i = 0; i < selectors.length; i++) {
        const selector = styleItem.selectors[i];
        const firstChar = selector.charAt(0);
        let matchType;
        if (firstChar === ".") {
          matchType = "class";
        } else if (firstChar === "#") {
          matchType = "id";
        } else if (allValidTags.has(selector)) {
          matchType = "tag";
        } else {
          return returnValue;
        }
        const valueMatch = matchType === "tag" ? selector : selector.slice(1);
        if (matchType === "class" && animatedClasses.has(valueMatch)) {
          return returnValue;
        }
        matches.push({
          type: matchType,
          value: valueMatch
        });
      }
      const isMatch = (tagName, $element) => {
        for (let i = 0; i < matches.length; i++) {
          const { type, value } = matches[i];
          switch (type) {
            case "id":
              if ($element.attr("id") === value) {
                return true;
              }
              break;
            case "tag":
              if (tagName === value) {
                return true;
              }
              break;
            case "class": {
              const className = $element.attr("class");
              if (className && getClassList(className).includes(value)) {
                return true;
              }
            }
          }
        }
        return false;
      };
      parseSVG(svg, (svgItem) => {
        const tagName = svgItem.tagName;
        const $element = svgItem.$element;
        if (!isMatch(tagName, $element)) {
          return;
        }
        const addedAttributes = new Set(
          $element.attr(tempDataAttrbiute)?.split(/\s+/)
        );
        const prop = styleItem.prop;
        if ($element.attr(prop) !== void 0) {
          if (addedAttributes.has(prop)) {
            throw new Error("Duplicate attribute");
          }
        }
        $element.attr(prop, styleItem.value);
        addedAttributes.add(prop);
        $element.attr(
          tempDataAttrbiute,
          Array.from(addedAttributes).join(" ")
        );
        containsTempAttr = true;
      });
      matches.forEach((match) => {
        if (match.type === "class") {
          removeClasses.add(match.value);
        }
      });
    });
    parseSVG(svg, (svgItem) => {
      const $element = svgItem.$element;
      const classList = getClassList($element.attr("class"));
      if (!classList) {
        return;
      }
      const filtered = classList.filter(
        (item) => !removeClasses.has(item)
      );
      if (!filtered.length) {
        $element.removeAttr("class");
      } else {
        $element.attr("class", filtered.join(" "));
      }
    });
    if (containsTempAttr) {
      parseSVG(svg, (item) => {
        item.$element.removeAttr(tempDataAttrbiute);
      });
    }
  } catch (err) {
    svg.load(backup);
  }
}

export { cleanupGlobalStyle };
