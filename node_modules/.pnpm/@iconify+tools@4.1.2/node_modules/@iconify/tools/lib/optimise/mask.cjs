'use strict';

const colors_parse = require('../colors/parse.cjs');
const utils = require('@iconify/utils');
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

const defaultBlackColors = ["black", "#000", "#000000"];
const defaultWhiteColors = ["white", "#fff", "#ffffff"];
const defaultOptions = {
  color: "currentColor",
  solid: [...defaultBlackColors, "currentcolor"],
  transparent: defaultWhiteColors,
  force: false,
  id: "mask"
};
function convertSVGToMask(svg, options = {}) {
  const props = {
    ...defaultOptions,
    ...options
  };
  const check = (test, value, color) => {
    if (typeof test === "string") {
      return value.toLowerCase() === test;
    }
    if (test instanceof Array) {
      return test.includes(value.toLowerCase());
    }
    return test(value, color);
  };
  let foundSolid = false;
  let foundTransparent = false;
  let failed = false;
  let hasCustomValue = false;
  const backup = svg.toString();
  colors_parse.parseColors(svg, {
    callback: (attr, colorStr, color) => {
      if (!color || colors_parse.isEmptyColor(color)) {
        return colorStr;
      }
      if (props.custom) {
        let customValue = props.custom(colorStr.toLowerCase(), color);
        if (typeof customValue === "number") {
          const num = Math.max(
            Math.min(Math.round(customValue * 255), 255),
            0
          );
          let str = num.toString(16);
          if (str.length < 2) {
            str = "0" + str;
          }
          if (str[0] === str[1]) {
            str = str[0];
          }
          customValue = "#" + str + str + str;
        }
        if (typeof customValue === "string") {
          if (defaultBlackColors.includes(customValue)) {
            foundSolid = true;
          } else if (defaultWhiteColors.includes(customValue)) {
            foundTransparent = true;
          } else {
            hasCustomValue = true;
          }
          return customValue;
        }
      }
      if (check(props.solid, colorStr, color)) {
        foundSolid = true;
        return "#fff";
      }
      if (check(props.transparent, colorStr, color)) {
        foundTransparent = true;
        return "#000";
      }
      failed = true;
      console.warn("Unexpected color:", colorStr);
      return color;
    }
  });
  const hasColors = hasCustomValue || foundSolid && foundTransparent;
  if (failed || !hasColors && !props.force) {
    svg.load(backup);
    return false;
  }
  const parsed = utils.parseSVGContent(svg.toString());
  if (!parsed) {
    return false;
  }
  const { defs, content } = utils.splitSVGDefs(parsed.body);
  const newBody = `<defs>${defs}<mask id="${props.id}">${content}</mask></defs><rect mask="url(#${props.id})" ${svg.viewBox.left ? `x=${svg.viewBox.left} ` : ""}${svg.viewBox.top ? `y=${svg.viewBox.top} ` : ""}width="${svg.viewBox.width}" height="${svg.viewBox.height}" fill="${props.color}" />`;
  const newContent = utils.iconToHTML(newBody, parsed.attribs);
  svg.load(newContent);
  return true;
}

exports.convertSVGToMask = convertSVGToMask;
