'use strict';

const svg_parse = require('../parse.cjs');
const svg_data_tags = require('../data/tags.cjs');

const requiredParentTags = /* @__PURE__ */ new Map();
requiredParentTags.set(
  /* @__PURE__ */ new Set(["feComponentTransfer"]),
  svg_data_tags.feComponentTransferChildTag
);
requiredParentTags.set(/* @__PURE__ */ new Set(["feMerge"]), svg_data_tags.feMergeChildTags);
requiredParentTags.set(svg_data_tags.feLightningTags, svg_data_tags.feLightningChildTags);
requiredParentTags.set(svg_data_tags.filterTag, svg_data_tags.filterChildTags);
requiredParentTags.set(svg_data_tags.gradientTags, svg_data_tags.gradientChildTags);
requiredParentTags.set(/* @__PURE__ */ new Set(["animateMotion"]), svg_data_tags.animateMotionChildTags);
const defaultOptions = {
  keepTitles: false
};
function checkBadTags(svg, options) {
  const { keepTitles } = {
    ...defaultOptions,
    ...options
  };
  svg_parse.parseSVG(svg, (item) => {
    const tagName = item.tagName;
    const $element = item.$element;
    if (tagName === "svg") {
      if (item.parents.length) {
        throw new Error(`Unexpected element: <${tagName}>`);
      }
      return;
    }
    if (keepTitles && tagName === "title") {
      const content = $element.html();
      if (content?.includes("<") || content?.includes(">")) {
        $element.remove();
        item.testChildren = false;
      }
      return;
    }
    if (svg_data_tags.unsupportedTags.has(tagName)) {
      $element.remove();
      item.testChildren = false;
      return;
    }
    if (svg_data_tags.badTags.has(tagName) || !svg_data_tags.allValidTags.has(tagName)) {
      const parts = tagName.split(":");
      if (parts.length > 1) {
        $element.remove();
        item.testChildren = false;
        return;
      }
      throw new Error(`Unexpected element: <${tagName}>`);
    }
    const parentTagName = item.parents[0]?.tagName;
    for (const [parents, children] of requiredParentTags) {
      if (children.has(tagName)) {
        if (!parents.has(parentTagName)) {
          throw new Error(
            `Element <${tagName}> has wrong parent element`
          );
        }
        return;
      }
    }
  });
}

exports.checkBadTags = checkBadTags;
