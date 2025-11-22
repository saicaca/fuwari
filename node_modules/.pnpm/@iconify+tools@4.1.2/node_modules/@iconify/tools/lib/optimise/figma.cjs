'use strict';

const utils = require('@iconify/utils');
const svg_cleanup_inlineStyle = require('../svg/cleanup/inline-style.cjs');
const svg_data_tags = require('../svg/data/tags.cjs');
const svg_parse = require('../svg/parse.cjs');
const optimise_unwrap = require('./unwrap.cjs');
require('../css/parse.cjs');
require('../css/parser/tokens.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');
require('../svg/data/attributes.cjs');

function isTinyNumber(value, limit) {
  const num = parseInt(value);
  return !isNaN(num) && Math.abs(num) < limit;
}
function checkClipPathNode(clipNode, expectedWidth, expectedHeight) {
  for (const attr in clipNode.attribs) {
    if (attr !== "id") {
      return false;
    }
  }
  const children = clipNode.children.filter((node) => node.type !== "text");
  if (children.length !== 1) {
    return false;
  }
  const childNode = children[0];
  if (childNode.type !== "tag" || childNode.children.length) {
    return false;
  }
  const attribs = {
    ...childNode.attribs
  };
  delete attribs["fill"];
  const fill = childNode.attribs["fill"];
  const colorValue = fill ? utils.stringToColor(fill) : null;
  const colorString = colorValue ? utils.colorToString(colorValue) : null;
  if (fill && colorString !== "#fff") {
    console.warn(
      "Unxepected fill on clip path:",
      childNode.attribs["fill"]
    );
    return false;
  }
  switch (childNode.tagName) {
    case "rect": {
      const width = parseInt(childNode.attribs["width"]);
      const height = parseInt(childNode.attribs["height"]);
      if (width !== expectedWidth || height !== expectedHeight) {
        console.warn("Invalid size of clip path");
        return false;
      }
      delete attribs["width"];
      delete attribs["height"];
      break;
    }
    default:
      console.warn(
        "Unexpected tag in Figma clip path:",
        childNode.tagName
      );
      return false;
  }
  Object.keys(attribs).forEach((attr) => {
    const value = attribs[attr];
    switch (attr) {
      case "transform": {
        const translateStart = "translate(";
        const translateEnd = ")";
        if (value.startsWith(translateStart) && value.endsWith(translateEnd)) {
          const translateParts = value.slice(translateStart.length, 0 - translateEnd.length).split(/\s+/);
          const limit = Math.min(expectedWidth, expectedHeight) / 1e3;
          if (translateParts.length === 2 && isTinyNumber(translateParts[0], limit) && isTinyNumber(translateParts[1], limit)) {
            delete attribs[attr];
          }
        }
      }
    }
  });
  return {
    node: clipNode,
    attribs
  };
}
const urlStart = "url(#";
const urlEnd = ")";
function remove(svg) {
  optimise_unwrap.unwrapEmptyGroup(svg);
  let content = svg.toString();
  const backup = content;
  const isPenpot = content.includes("frame-clip-def");
  if (isPenpot) {
    svg_cleanup_inlineStyle.cleanupInlineStyle(svg);
    svg_parse.parseSVG(svg, (item) => {
      const tagName = item.tagName;
      for (const attr in item.element.attribs) {
        const value = item.element.attribs[attr];
        switch (attr) {
          case "id":
            if (!svg_data_tags.maskTags.has(tagName) && !svg_data_tags.symbolTag.has(tagName)) {
              item.$element.removeAttr(attr);
            }
            break;
          case "class":
          case "xmlns:xlink":
          case "version":
            item.$element.removeAttr(attr);
            break;
          case "transform": {
            const trimmed = value.replace(/\s+/g, "").replace(/\.0+/g, "");
            if (!trimmed || trimmed === "matrix(1,0,0,1,0,0)") {
              item.$element.removeAttr(attr);
            }
            break;
          }
          case "rx":
          case "ry":
          case "x":
          case "y":
            if (value === "0") {
              item.$element.removeAttr(attr);
            }
            break;
          case "fill-opacity":
          case "stroke-opacity":
          case "opacity":
            if (value === "1") {
              item.$element.removeAttr(attr);
            }
            break;
          case "fill":
          case "stroke": {
            const colorValue = utils.stringToColor(value);
            if (colorValue?.type === "rgb") {
              item.$element.attr(attr, utils.colorToString(colorValue));
            }
          }
        }
      }
    });
    content = svg.toString();
  }
  const clipPathBlocks = content.match(
    /<clipPath[^>]*>[\s\S]+?<\/clipPath>/g
  );
  if (clipPathBlocks?.length === 2 && clipPathBlocks[0] === clipPathBlocks[1]) {
    const split = clipPathBlocks[0];
    const lines = content.split(split);
    content = lines.shift() + split + lines.join("");
  }
  if (content.includes("<defs>")) {
    content = content.replace(/<\/?defs>/g, "");
  }
  if (content !== backup) {
    svg.load(content);
  }
  const cheerio = svg.$svg;
  const $root = svg.$svg(":root");
  const children = $root.children();
  const shapesToClip = [];
  let clipID;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type === "tag") {
      const tagName = node.tagName;
      if (!svg_data_tags.defsTag.has(tagName) && !svg_data_tags.maskTags.has(tagName) && !svg_data_tags.symbolTag.has(tagName)) {
        const clipPath2 = node.attribs["clip-path"];
        if (!clipPath2 || !clipPath2.startsWith(urlStart) || !clipPath2.endsWith(urlEnd)) {
          return false;
        }
        const id = clipPath2.slice(urlStart.length, 0 - urlEnd.length);
        if (typeof clipID === "string" && clipID !== id) {
          return false;
        }
        clipID = id;
        shapesToClip.push(node);
      }
    }
  }
  if (typeof clipID !== "string") {
    return false;
  }
  const findClipPath = () => {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type === "tag" && node.tagName === "clipPath") {
        const id = node.attribs["id"];
        if (id === clipID) {
          const result = checkClipPathNode(
            node,
            svg.viewBox.width,
            svg.viewBox.height
          );
          cheerio(node).remove();
          return result;
        }
        return;
      }
    }
  };
  const clipPath = findClipPath();
  if (!clipPath) {
    return false;
  }
  const attribs = clipPath.attribs;
  for (let i = 0; i < shapesToClip.length; i++) {
    const node = shapesToClip[i];
    cheerio(node).removeAttr("clip-path");
    for (const attr in attribs) {
      if (node.attribs[attr] !== void 0) {
        return false;
      }
      cheerio(node).attr(attr, attribs[attr]);
    }
  }
  return true;
}
function removeFigmaClipPathFromSVG(svg) {
  const backup = svg.toString();
  try {
    if (remove(svg)) {
      return true;
    }
  } catch {
  }
  svg.load(backup);
  return false;
}

exports.removeFigmaClipPathFromSVG = removeFigmaClipPathFromSVG;
