'use strict';

const commonColorAttributes = ["color"];
const shapeColorAttributes = ["fill", "stroke"];
const specialColorAttributes = [
  "stop-color",
  "flood-color"
];
const defaultBlackColor = {
  type: "rgb",
  r: 0,
  g: 0,
  b: 0,
  alpha: 1
};
const defaultColorValues = {
  "color": { type: "current" },
  "fill": defaultBlackColor,
  "stroke": { type: "none" },
  "stop-color": defaultBlackColor,
  "flood-color": defaultBlackColor
};
const allowDefaultColorValue = {
  "stop-color": true,
  "flood-color": "flood-opacity"
};

exports.allowDefaultColorValue = allowDefaultColorValue;
exports.commonColorAttributes = commonColorAttributes;
exports.defaultBlackColor = defaultBlackColor;
exports.defaultColorValues = defaultColorValues;
exports.shapeColorAttributes = shapeColorAttributes;
exports.specialColorAttributes = specialColorAttributes;
