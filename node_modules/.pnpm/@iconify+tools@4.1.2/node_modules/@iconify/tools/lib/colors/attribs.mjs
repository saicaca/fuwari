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

export { allowDefaultColorValue, commonColorAttributes, defaultBlackColor, defaultColorValues, shapeColorAttributes, specialColorAttributes };
