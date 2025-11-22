const badTags = /* @__PURE__ */ new Set([
  // Nasty stuff or external resource
  "foreignObject",
  "script",
  "image",
  "feImage",
  // Deprecated
  "animateColor",
  "altGlyph",
  // Text
  "text",
  "tspan",
  "switch",
  "textPath",
  // Font
  "font",
  "font-face",
  "glyph",
  "missing-glyph",
  "hkern",
  "vhern",
  // View
  "view",
  // Link
  "a"
]);
const unsupportedTags = /* @__PURE__ */ new Set(["metadata", "desc", "title"]);
const styleTag = /* @__PURE__ */ new Set(["style"]);
const defsTag = /* @__PURE__ */ new Set(["defs"]);
const maskTags = /* @__PURE__ */ new Set(["clipPath", "mask"]);
const symbolTag = /* @__PURE__ */ new Set(["symbol"]);
const shapeTags = /* @__PURE__ */ new Set([
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect"
]);
const useTag = /* @__PURE__ */ new Set(["use"]);
const groupTag = /* @__PURE__ */ new Set(["g"]);
const markerTag = /* @__PURE__ */ new Set(["marker"]);
const animateTags = /* @__PURE__ */ new Set([
  "animate",
  "animateMotion",
  "animateTransform",
  "discard",
  "set"
]);
const animateMotionChildTags = /* @__PURE__ */ new Set(["mpath"]);
const gradientTags = /* @__PURE__ */ new Set(["linearGradient", "radialGradient"]);
const gradientChildTags = /* @__PURE__ */ new Set(["stop"]);
const patternTag = /* @__PURE__ */ new Set(["pattern"]);
const filterTag = /* @__PURE__ */ new Set(["filter"]);
const feLightningTags = /* @__PURE__ */ new Set([
  "feDiffuseLighting",
  "feSpecularLighting"
]);
const filterChildTags = /* @__PURE__ */ new Set([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDisplacementMap",
  "feDropShadow",
  "feFlood",
  "feGaussianBlur",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feTile",
  "feTurbulence",
  ...feLightningTags
]);
const feComponentTransferChildTag = /* @__PURE__ */ new Set([
  "feFuncR",
  "feFuncG",
  "feFuncB",
  "feFuncA"
]);
const feLightningChildTags = /* @__PURE__ */ new Set([
  "feSpotLight",
  "fePointLight",
  "feDistantLight"
]);
const feMergeChildTags = /* @__PURE__ */ new Set(["feMergeNode"]);
const reusableElementsWithPalette = /* @__PURE__ */ new Set([
  ...gradientTags,
  ...patternTag,
  ...markerTag,
  ...symbolTag,
  ...filterTag
]);
const allValidTags = /* @__PURE__ */ new Set([
  ...styleTag,
  ...defsTag,
  ...maskTags,
  ...symbolTag,
  ...shapeTags,
  ...useTag,
  ...groupTag,
  ...markerTag,
  ...animateTags,
  ...animateMotionChildTags,
  ...gradientTags,
  ...gradientChildTags,
  ...patternTag,
  ...filterTag,
  ...filterChildTags,
  ...feComponentTransferChildTag,
  ...feLightningChildTags,
  ...feMergeChildTags
]);

export { allValidTags, animateMotionChildTags, animateTags, badTags, defsTag, feComponentTransferChildTag, feLightningChildTags, feLightningTags, feMergeChildTags, filterChildTags, filterTag, gradientChildTags, gradientTags, groupTag, markerTag, maskTags, patternTag, reusableElementsWithPalette, shapeTags, styleTag, symbolTag, unsupportedTags, useTag };
