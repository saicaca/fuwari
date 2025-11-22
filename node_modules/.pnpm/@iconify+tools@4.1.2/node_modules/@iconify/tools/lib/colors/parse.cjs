'use strict';

const colors = require('@iconify/utils/lib/colors');
const svg_data_tags = require('../svg/data/tags.cjs');
const svg_parseStyle = require('../svg/parse-style.cjs');
const colors_attribs = require('./attribs.cjs');
const svg_data_attributes = require('../svg/data/attributes.cjs');
const svg_analyse = require('../svg/analyse.cjs');
require('../css/parse.cjs');
require('../css/parser/tokens.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');
require('../css/parser/export.cjs');
require('../css/parser/tree.cjs');
require('../svg/parse.cjs');
require('../svg/analyse/error.cjs');

const propsToCheck = Object.keys(colors_attribs.defaultColorValues);
const animatePropsToCheck = ["from", "to", "values"];
function parseColors(svg, options = {}) {
  const result = {
    colors: [],
    hasUnsetColor: false,
    hasGlobalStyle: false
  };
  const defaultColor = typeof options.defaultColor === "string" ? colors.stringToColor(options.defaultColor) : options.defaultColor;
  function findColor(color, add = false) {
    const isString = typeof color === "string";
    for (let i = 0; i < result.colors.length; i++) {
      const item = result.colors[i];
      if (item === color) {
        return item;
      }
      if (!isString && typeof item !== "string" && colors.compareColors(item, color)) {
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
      const allowDefaultColor = colors_attribs.allowDefaultColorValue[prop2];
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
          return colors_attribs.defaultColorValues[prop2];
        }
      }
      return colors_attribs.defaultColorValues[prop2];
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
    const parsedColor = colors.stringToColor(value);
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
      const newColor = colors.stringToColor(callbackResult);
      addColorToItem(prop, newColor || callbackResult, item);
      return callbackResult;
    }
    const newValue = colors.colorToString(callbackResult);
    addColorToItem(prop, callbackResult, item);
    return newValue;
  }
  svg_parseStyle.parseSVGStyle(svg, (item) => {
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
  const iconData = svg_analyse.analyseSVGStructure(svg, options);
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
      if (prop === "fill" && svg_data_tags.animateTags.has(tagName)) {
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
    if (svg_data_tags.animateTags.has(tagName)) {
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
      if (svg_data_tags.shapeTags.has(tagName)) {
        requiredProps = colors_attribs.shapeColorAttributes;
      }
      colors_attribs.specialColorAttributes.forEach((attr) => {
        if (svg_data_attributes.tagSpecificPresentationalAttributes[tagName]?.has(attr)) {
          requiredProps = [attr];
        }
      });
      if (requiredProps) {
        const itemColors = element._colors || (element._colors = {});
        for (let i = 0; i < requiredProps.length; i++) {
          const prop = requiredProps[i];
          const color = getElementColor(prop, item, elements);
          if (color === colors_attribs.defaultBlackColor) {
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
                colors.colorToString(defaultColorValue)
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

exports.isEmptyColor = isEmptyColor;
exports.parseColors = parseColors;
