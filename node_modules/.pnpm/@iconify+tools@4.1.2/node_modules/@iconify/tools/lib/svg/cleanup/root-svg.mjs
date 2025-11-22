import { commonAttributes, badAttributes, junkSVGAttributes, badSoftwareAttributes, badAttributePrefixes, tagSpecificNonPresentationalAttributes, tagSpecificPresentationalAttributes, stylingAttributes } from '../data/attributes.mjs';
import { reusableElementsWithPalette, maskTags } from '../data/tags.mjs';

function cleanupSVGRoot(svg) {
  const cheerio = svg.$svg;
  const $root = svg.$svg(":root");
  const root = $root.get(0);
  const tagName = "svg";
  if (root.tagName !== tagName) {
    throw new Error(`Unexpected root tag <${root.tagName}>`);
  }
  const attribs = root.attribs;
  const moveToChildren = {};
  Object.keys(attribs).forEach((attr) => {
    const value = attribs[attr];
    if (commonAttributes.has(attr) || badAttributes.has(attr) || junkSVGAttributes.has(attr) || badSoftwareAttributes.has(attr) || badAttributePrefixes.has(attr.split("-").shift()) || attr.split(":").length > 1) {
      $root.removeAttr(attr);
      return;
    }
    switch (attr) {
      case "width":
      case "height":
        if (value.slice(-2) === "px") {
          const num = value.replace("px", "");
          if (parseFloat(num).toString() === num) {
            $root.attr(attr, num);
          }
        }
        return;
    }
    if (tagSpecificNonPresentationalAttributes[tagName]?.has(attr)) {
      return;
    }
    if (tagSpecificPresentationalAttributes[tagName]?.has(attr) && tagSpecificPresentationalAttributes.g.has(attr)) {
      moveToChildren[attr] = value;
      $root.removeAttr(attr);
      return;
    }
    if (stylingAttributes.has(attr)) {
      switch (attr) {
        case "style":
          return;
        case "class":
          $root.removeAttr(attr);
          return;
      }
      throw new Error(`Unexpected attribute "${attr}" on <${tagName}>`);
    }
    if (
      // Events
      attr.slice(0, 2) === "on" || // aria-stuff
      attr.slice(0, 5) === "aria-" || // Junk
      attr.slice(0, 6) === "xmlns:"
    ) {
      $root.removeAttr(attr);
      return;
    }
    console.warn(`Removing unexpected attribute on SVG: ${attr}`);
    $root.removeAttr(attr);
  });
  if (Object.keys(moveToChildren).length) {
    const $wrapper = cheerio("<g />");
    for (const key in moveToChildren) {
      $wrapper.attr(key, moveToChildren[key]);
    }
    $root.children().each((_index, child) => {
      const $child = cheerio(child);
      if (child.type !== "tag") {
        $child.appendTo($wrapper);
        return;
      }
      const tagName2 = child.tagName;
      if (tagName2 === "style" || tagName2 === "title" || reusableElementsWithPalette.has(tagName2) || maskTags.has(tagName2)) {
        return;
      }
      $child.appendTo($wrapper);
    });
    $wrapper.appendTo($root);
  }
}

export { cleanupSVGRoot };
