import { stringToColor, colorToString, compareColors } from '@iconify/utils/lib/colors';
import { animateTags, shapeTags } from '../svg/data/tags.mjs';
import { parseSVGStyle } from '../svg/parse-style.mjs';
import { specialColorAttributes, defaultBlackColor, defaultColorValues, shapeColorAttributes, allowDefaultColorValue } from './attribs.mjs';
import { tagSpecificPresentationalAttributes } from '../svg/data/attributes.mjs';
import { analyseSVGStructure } from '../svg/analyse.mjs';
import '../css/parse.mjs';
import '../css/parser/tokens.mjs';
import '../css/parser/error.mjs';
import '../css/parser/strings.mjs';
import '../css/parser/text.mjs';
import '../css/parser/export.mjs';
import '../css/parser/tree.mjs';
import '../svg/parse.mjs';
import '../svg/analyse/error.mjs';

const propsToCheck = Object.keys(defaultColorValues);
const animatePropsToCheck = ["from", "to", "values"];
function parseColors(svg, options = {}) {
  const result = {
    colors: [],
    hasUnsetColor: false,
    hasGlobalStyle: false
  };
  const defaultColor = typeof options.defaultColor === "string" ? stringToColor(options.defaultColor) : options.defaultColor;
  function findColor(color, add = false) {
    const isString = typeof color === "string";
    for (let i = 0; i < result.colors.length; i++) {
      const item = result.colors[i];
      if (item === color) {
        return item;
      }
      if (!isString && typeof item !== "string" && compareColors(item, color)) {
        return item;
      }
    }
    if (add) {
      result.colors.push(color);
      return color;
    }
    return null;
  }
  function addColorToItem(prop, color, item, add = true) {
    const addedColor = findColor(color, add !== false);
    if (item) {
      const itemColors = item._colors || (item._colors = {});
      itemColors[prop] = addedColor === null ? color : addedColor;
    }
  }
  function getElementColor(prop, item, elements2) {
    function find(prop2) {
      let currentItem = item;
      const allowDefaultColor = allowDefaultColorValue[prop2];
      while (currentItem) {
        const element = elements2.get(
          currentItem.index
        );
        const color = element._colors?.[prop2];
        if (color !== void 0) {
          return color;
        }
        if (allowDefaultColor) {
          if (allowDefaultColor === true || element.attribs[allowDefaultColor]) {
            return null;
          }
        }
        currentItem = currentItem.parent;
        if (currentItem?.usedAsMask) {
          return defaultColorValues[prop2];
        }
      }
      return defaultColorValues[prop2];
    }
    let propColor = find(prop);
    if (propColor !== null && typeof propColor === "object" && propColor.type === "current" && prop !== "color") {
      propColor = find("color");
    }
    return propColor;
  }
  function checkColor(prop, value, item) {
    switch (value.trim().toLowerCase()) {
      case "":
      case "inherit":
        return;
    }
    const parsedColor = stringToColor(value);
    const defaultValue = parsedColor || value;
    if (parsedColor?.type === "function" && parsedColor.func === "url") {
      addColorToItem(prop, defaultValue, item, false);
      return value;
    }
    if (!options.callback) {
      addColorToItem(prop, defaultValue, item);
      return value;
    }
    const callbackResult = options.callback(
      prop,
      value,
      parsedColor,
      item?.tagName,
      item
    );
    if (callbackResult instanceof Promise) {
      throw new Error("parseColors does not support async callbacks");
    }
    switch (callbackResult) {
      case "remove": {
        return item ? callbackResult : void 0;
      }
      case "unset":
        return;
    }
    if (callbackResult === value || parsedColor && callbackResult === parsedColor) {
      addColorToItem(prop, defaultValue, item);
      return value;
    }
    if (typeof callbackResult === "string") {
      const newColor = stringToColor(callbackResult);
      addColorToItem(prop, newColor || callbackResult, item);
      return callbackResult;
    }
    const newValue = colorToString(callbackResult);
    addColorToItem(prop, callbackResult, item);
    return newValue;
  }
  parseSVGStyle(svg, (item) => {
    const prop = item.prop;
    const value = item.value;
    if (!propsToCheck.includes(prop)) {
      return value;
    }
    const attr = prop;
    const newValue = checkColor(attr, value);
    if (newValue === void 0) {
      return newValue;
    }
    if (item.type === "global") {
      result.hasGlobalStyle = true;
    }
    return newValue;
  });
  const iconData = analyseSVGStructure(svg, options);
  const { elements, tree } = iconData;
  const cheerio = svg.$svg;
  const removedElements = /* @__PURE__ */ new Set();
  const parsedElements = /* @__PURE__ */ new Set();
  function removeElement(index, element) {
    function removeChildren(element2) {
      element2.children.forEach((item) => {
        if (item.type !== "tag") {
          return;
        }
        const element3 = item;
        const index2 = element3._index;
        if (index2 && !removedElements.has(index2)) {
          element3._removed = true;
          removedElements.add(index2);
          removeChildren(element3);
        }
      });
    }
    element._removed = true;
    removedElements.add(index);
    removeChildren(element);
    cheerio(element).remove();
  }
  function parseTreeItem(item) {
    const index = item.index;
    if (removedElements.has(index) || parsedElements.has(index)) {
      return;
    }
    parsedElements.add(index);
    const element = elements.get(index);
    if (element._removed) {
      return;
    }
    const { tagName, attribs } = element;
    if (item.parent) {
      const parentIndex = item.parent.index;
      const parentElement = elements.get(
        parentIndex
      );
      if (parentElement._colors) {
        element._colors = {
          ...parentElement._colors
        };
      }
    }
    for (let i = 0; i < propsToCheck.length; i++) {
      const prop = propsToCheck[i];
      if (prop === "fill" && animateTags.has(tagName)) {
        continue;
      }
      const value = attribs[prop];
      if (value !== void 0) {
        const newValue = checkColor(prop, value, element);
        if (newValue !== value) {
          if (newValue === void 0) {
            cheerio(element).removeAttr(prop);
            if (element._colors) {
              delete element._colors[prop];
            }
          } else if (newValue === "remove") {
            removeElement(index, element);
            return;
          } else {
            cheerio(element).attr(prop, newValue);
          }
        }
      }
    }
    if (animateTags.has(tagName)) {
      const attr = attribs.attributeName;
      if (propsToCheck.includes(attr)) {
        for (let i = 0; i < animatePropsToCheck.length; i++) {
          const elementProp = animatePropsToCheck[i];
          const fullValue = attribs[elementProp];
          if (typeof fullValue !== "string") {
            continue;
          }
          const splitValues = fullValue.split(";");
          let updatedValues = false;
          for (let j = 0; j < splitValues.length; j++) {
            const value = splitValues[j];
            if (value !== void 0) {
              const newValue = checkColor(
                elementProp,
                value
                // Do not pass third parameter
              );
              if (newValue !== value) {
                updatedValues = true;
                splitValues[j] = typeof newValue === "string" ? newValue : "";
              }
            }
          }
          if (updatedValues) {
            cheerio(element).attr(
              elementProp,
              splitValues.join(";")
            );
          }
        }
      }
    }
    if (!result.hasGlobalStyle) {
      let requiredProps;
      if (shapeTags.has(tagName)) {
        requiredProps = shapeColorAttributes;
      }
      specialColorAttributes.forEach((attr) => {
        if (tagSpecificPresentationalAttributes[tagName]?.has(attr)) {
          requiredProps = [attr];
        }
      });
      if (requiredProps) {
        const itemColors = element._colors || (element._colors = {});
        for (let i = 0; i < requiredProps.length; i++) {
          const prop = requiredProps[i];
          const color = getElementColor(prop, item, elements);
          if (color === defaultBlackColor) {
            if (defaultColor) {
              const defaultColorValue = typeof defaultColor === "function" ? defaultColor(
                prop,
                element,
                item,
                iconData
              ) : defaultColor;
              findColor(defaultColorValue, true);
              cheerio(element).attr(
                prop,
                colorToString(defaultColorValue)
              );
              itemColors[prop] = defaultColorValue;
            } else {
              result.hasUnsetColor = true;
            }
          }
        }
      }
    }
    for (let i = 0; i < item.children.length; i++) {
      const childItem = item.children[i];
      if (!childItem.usedAsMask) {
        parseTreeItem(childItem);
      }
    }
  }
  parseTreeItem(tree);
  return result;
}
function isEmptyColor(color) {
  const type = color.type;
  return type === "none" || type === "transparent";
}

export { isEmptyColor, parseColors };
