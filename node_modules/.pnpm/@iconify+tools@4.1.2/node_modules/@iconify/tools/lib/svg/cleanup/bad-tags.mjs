import { parseSVG } from '../parse.mjs';
import { feComponentTransferChildTag, feMergeChildTags, feLightningTags, feLightningChildTags, filterTag, filterChildTags, gradientTags, gradientChildTags, animateMotionChildTags, unsupportedTags, badTags, allValidTags } from '../data/tags.mjs';

const requiredParentTags = /* @__PURE__ */ new Map();
requiredParentTags.set(
  /* @__PURE__ */ new Set(["feComponentTransfer"]),
  feComponentTransferChildTag
);
requiredParentTags.set(/* @__PURE__ */ new Set(["feMerge"]), feMergeChildTags);
requiredParentTags.set(feLightningTags, feLightningChildTags);
requiredParentTags.set(filterTag, filterChildTags);
requiredParentTags.set(gradientTags, gradientChildTags);
requiredParentTags.set(/* @__PURE__ */ new Set(["animateMotion"]), animateMotionChildTags);
const defaultOptions = {
  keepTitles: false
};
function checkBadTags(svg, options) {
  const { keepTitles } = {
    ...defaultOptions,
    ...options
  };
  parseSVG(svg, (item) => {
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
    if (unsupportedTags.has(tagName)) {
      $element.remove();
      item.testChildren = false;
      return;
    }
    if (badTags.has(tagName) || !allValidTags.has(tagName)) {
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

export { checkBadTags };
