'use strict';

const svg_data_tags = require('./tags.cjs');

const badAttributes = /* @__PURE__ */ new Set([
  "cursor",
  "pointer-events",
  "shape-rendering",
  "tabindex",
  "requiredExtensions",
  "requiredFeatures",
  "systemLanguage",
  "role",
  "title"
]);
const junkSVGAttributes = /* @__PURE__ */ new Set([
  "xmlns:xlink",
  "baseProfile",
  "contentScriptType",
  "contentStyleType",
  "version",
  "x",
  "y",
  "zoomAndPan"
]);
const badSoftwareAttributes = /* @__PURE__ */ new Set([
  "isolation",
  "enable-background",
  "overflow",
  "marker",
  "white-space",
  // Font stuff
  "direction"
]);
const badAttributePrefixes = /* @__PURE__ */ new Set([
  "image",
  "mix",
  "block",
  "data",
  "aria",
  // Font stuff
  "text",
  "font",
  "letter",
  "baseline",
  "word",
  "line",
  "writing",
  // Prefix for browser specific stuff
  ""
]);
const commonAttributes = /* @__PURE__ */ new Set(["id"]);
const stylingAttributes = /* @__PURE__ */ new Set(["class", "style"]);
const insideClipPathAttributes = /* @__PURE__ */ new Set(["clip-rule"]);
const fillPresentationalAttributes = /* @__PURE__ */ new Set([
  "fill-opacity",
  "fill-rule"
]);
const strokePresentationalAttributes = /* @__PURE__ */ new Set([
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width"
]);
const urlPresentationalAttributes = /* @__PURE__ */ new Set([
  "clip-path",
  "filter",
  "mask"
]);
const visibilityPresentationalAttributes = /* @__PURE__ */ new Set([
  "display",
  "opacity",
  "visibility"
]);
const commonColorPresentationalAttributes = /* @__PURE__ */ new Set([
  "color",
  "fill",
  "stroke"
]);
const otherPresentationalAttributes = /* @__PURE__ */ new Set([
  "color-interpolation",
  "color-rendering",
  "transform",
  "vector-effect"
]);
const presentationalAttributes = /* @__PURE__ */ new Set([
  ...fillPresentationalAttributes,
  ...strokePresentationalAttributes,
  ...urlPresentationalAttributes,
  ...visibilityPresentationalAttributes,
  ...commonColorPresentationalAttributes,
  ...otherPresentationalAttributes
]);
const markerAttributes = /* @__PURE__ */ new Set([
  "marker-start",
  "marker-mid",
  "marker-end"
]);
const otherShapeAttributes = /* @__PURE__ */ new Set(["pathLength"]);
const animationTimingAttributes = /* @__PURE__ */ new Set([
  "begin",
  "dur",
  "end",
  "min",
  "max",
  "restart",
  "repeatCount",
  "repeatDur",
  "fill"
]);
const animationValueAttributes = /* @__PURE__ */ new Set([
  "calcMode",
  "values",
  "keyTimes",
  "keySplines",
  "from",
  "to",
  "by"
]);
const otherAnimationAttributes = /* @__PURE__ */ new Set([
  "attributeName",
  "additive",
  "accumulate"
]);
const commonGradientAttributes = /* @__PURE__ */ new Set([
  "gradientUnits",
  "gradientTransform",
  "href",
  "spreadMethod"
]);
const commonFeAttributes = /* @__PURE__ */ new Set([
  "x",
  "y",
  "width",
  "height",
  "color-interpolation-filters"
]);
const feFuncAttributes = /* @__PURE__ */ new Set([
  "type",
  "tableValues",
  "slope",
  "intercept",
  "amplitude",
  "exponent",
  "offset",
  ...commonFeAttributes
]);
const tagSpecificAnimatedAttributes = {
  circle: /* @__PURE__ */ new Set(["cx", "cy", "r"]),
  ellipse: /* @__PURE__ */ new Set(["cx", "cy", "rx", "ry"]),
  line: /* @__PURE__ */ new Set(["x1", "x2", "y1", "y2"]),
  path: /* @__PURE__ */ new Set(["d"]),
  polygon: /* @__PURE__ */ new Set(["points"]),
  polyline: /* @__PURE__ */ new Set(["points"]),
  rect: /* @__PURE__ */ new Set(["x", "y", "width", "height", "rx", "ry"])
};
const tagSpecificPresentationalAttributes = {
  // SVG
  svg: /* @__PURE__ */ new Set(["width", "height", ...presentationalAttributes]),
  // Defnitions, containers and masks
  clipPath: /* @__PURE__ */ new Set([...presentationalAttributes]),
  defs: /* @__PURE__ */ new Set([]),
  g: /* @__PURE__ */ new Set([...presentationalAttributes]),
  mask: /* @__PURE__ */ new Set(["x", "y", "width", "height", ...presentationalAttributes]),
  symbol: /* @__PURE__ */ new Set(["x", "y", "width", "height", ...presentationalAttributes]),
  // Use
  use: /* @__PURE__ */ new Set([
    "x",
    "y",
    "width",
    "height",
    "refX",
    "refY",
    ...presentationalAttributes
  ]),
  // Marker
  marker: /* @__PURE__ */ new Set([...presentationalAttributes]),
  // Gradients
  linearGradient: /* @__PURE__ */ new Set([
    "x1",
    "x2",
    "y1",
    "y2",
    ...presentationalAttributes
  ]),
  radialGradient: /* @__PURE__ */ new Set([
    "cx",
    "cy",
    "fr",
    "fx",
    "fy",
    "r",
    ...presentationalAttributes
  ]),
  stop: /* @__PURE__ */ new Set(["offset", "stop-color", "stop-opacity"]),
  // Filters
  feFlood: /* @__PURE__ */ new Set(["flood-color", "flood-opacity"]),
  feDropShadow: /* @__PURE__ */ new Set(["flood-color", "flood-opacity"])
};
svg_data_tags.shapeTags.forEach((tag) => {
  tagSpecificPresentationalAttributes[tag] = /* @__PURE__ */ new Set([
    ...presentationalAttributes,
    ...markerAttributes,
    ...tagSpecificPresentationalAttributes[tag] || []
  ]);
});
svg_data_tags.filterChildTags.forEach((tag) => {
  tagSpecificPresentationalAttributes[tag] = /* @__PURE__ */ new Set([
    ...commonFeAttributes,
    ...tagSpecificPresentationalAttributes[tag] || []
  ]);
});
const tagSpecificNonPresentationalAttributes = {
  // SVG
  svg: /* @__PURE__ */ new Set(["xmlns", "viewBox", "preserveAspectRatio"]),
  // Defnitions, containers and masks
  clipPath: /* @__PURE__ */ new Set(["clipPathUnits"]),
  mask: /* @__PURE__ */ new Set(["maskContentUnits", "maskUnits"]),
  symbol: /* @__PURE__ */ new Set(["viewBox", "preserveAspectRatio"]),
  // Shapes
  circle: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  ellipse: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  line: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  path: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  polygon: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  polyline: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  rect: /* @__PURE__ */ new Set([...otherShapeAttributes]),
  // Use
  use: /* @__PURE__ */ new Set(["href"]),
  // Marker
  marker: /* @__PURE__ */ new Set([
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "orient",
    "preserveAspectRatio",
    "refX",
    "refY",
    "viewBox"
  ]),
  // Animations
  animate: /* @__PURE__ */ new Set([
    ...animationTimingAttributes,
    ...animationValueAttributes,
    ...otherAnimationAttributes
  ]),
  animateMotion: /* @__PURE__ */ new Set([
    "keyPoints",
    "path",
    "rotate",
    ...animationTimingAttributes,
    ...animationValueAttributes,
    ...otherAnimationAttributes
  ]),
  animateTransform: /* @__PURE__ */ new Set([
    "by",
    "from",
    "to",
    "type",
    ...animationTimingAttributes,
    ...animationValueAttributes,
    ...otherAnimationAttributes
  ]),
  discard: /* @__PURE__ */ new Set(["begin", "href"]),
  set: /* @__PURE__ */ new Set([
    "to",
    ...animationTimingAttributes,
    ...otherAnimationAttributes
  ]),
  mpath: /* @__PURE__ */ new Set(["href"]),
  // Gradients
  linearGradient: /* @__PURE__ */ new Set([...commonGradientAttributes]),
  radialGradient: /* @__PURE__ */ new Set([...commonGradientAttributes]),
  // Filters
  feSpotLight: /* @__PURE__ */ new Set([
    "x",
    "y",
    "z",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "specularExponent",
    "limitingConeAngle"
  ]),
  feBlend: /* @__PURE__ */ new Set(["in", "in2", "mode"]),
  feColorMatrix: /* @__PURE__ */ new Set(["in", "type", "values"]),
  feComponentTransfer: /* @__PURE__ */ new Set(["in"]),
  feComposite: /* @__PURE__ */ new Set(["in", "in2", "operator", "k1", "k2", "k3", "k4"]),
  feConvolveMatrix: /* @__PURE__ */ new Set([
    "in",
    "order",
    "kernelMatrix",
    "divisor",
    "bias",
    "targetX",
    "targetY",
    "edgeMode",
    "kernelUnitLength",
    "preserveAlpha"
  ]),
  feDiffuseLighting: /* @__PURE__ */ new Set([
    "in",
    "surfaceScale",
    "diffuseConstant",
    "kernelUnitLength"
  ]),
  feDisplacementMap: /* @__PURE__ */ new Set([
    "in",
    "in2",
    "scale",
    "xChannelSelector",
    "yChannelSelector"
  ]),
  feDistantLight: /* @__PURE__ */ new Set(["azimuth", "elevation"]),
  feDropShadow: /* @__PURE__ */ new Set(["dx", "dy", "stdDeviation"]),
  feGaussianBlur: /* @__PURE__ */ new Set(["in", "stdDeviation", "edgeMode"]),
  feFuncA: feFuncAttributes,
  feFuncR: feFuncAttributes,
  feFuncG: feFuncAttributes,
  feFuncB: feFuncAttributes,
  feMergeNode: /* @__PURE__ */ new Set(["in"]),
  feMorphology: /* @__PURE__ */ new Set(["in", "operator", "radius"]),
  feOffset: /* @__PURE__ */ new Set(["in", "dx", "dy"]),
  fePointLight: /* @__PURE__ */ new Set(["x", "y", "z"]),
  feSpecularLighting: /* @__PURE__ */ new Set([
    "in",
    "surfaceScale",
    "specularConstant",
    "specularExponent",
    "kernelUnitLength"
  ]),
  feTile: /* @__PURE__ */ new Set(["in"]),
  feTurbulence: /* @__PURE__ */ new Set([
    "baseFrequency",
    "numOctaves",
    "seed",
    "stitchTiles",
    "type"
  ])
};
const tagSpecificInlineStyles = {
  mask: /* @__PURE__ */ new Set(["mask-type"])
};

exports.animationTimingAttributes = animationTimingAttributes;
exports.animationValueAttributes = animationValueAttributes;
exports.badAttributePrefixes = badAttributePrefixes;
exports.badAttributes = badAttributes;
exports.badSoftwareAttributes = badSoftwareAttributes;
exports.commonAttributes = commonAttributes;
exports.commonColorPresentationalAttributes = commonColorPresentationalAttributes;
exports.commonFeAttributes = commonFeAttributes;
exports.commonGradientAttributes = commonGradientAttributes;
exports.feFuncAttributes = feFuncAttributes;
exports.fillPresentationalAttributes = fillPresentationalAttributes;
exports.insideClipPathAttributes = insideClipPathAttributes;
exports.junkSVGAttributes = junkSVGAttributes;
exports.markerAttributes = markerAttributes;
exports.otherAnimationAttributes = otherAnimationAttributes;
exports.otherPresentationalAttributes = otherPresentationalAttributes;
exports.otherShapeAttributes = otherShapeAttributes;
exports.presentationalAttributes = presentationalAttributes;
exports.strokePresentationalAttributes = strokePresentationalAttributes;
exports.stylingAttributes = stylingAttributes;
exports.tagSpecificAnimatedAttributes = tagSpecificAnimatedAttributes;
exports.tagSpecificInlineStyles = tagSpecificInlineStyles;
exports.tagSpecificNonPresentationalAttributes = tagSpecificNonPresentationalAttributes;
exports.tagSpecificPresentationalAttributes = tagSpecificPresentationalAttributes;
exports.urlPresentationalAttributes = urlPresentationalAttributes;
exports.visibilityPresentationalAttributes = visibilityPresentationalAttributes;
