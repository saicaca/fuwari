'use strict';

const svg_parse = require('./parse.cjs');
const svg_data_attributes = require('./data/attributes.cjs');
const svg_data_tags = require('./data/tags.cjs');
const svg_analyse_error = require('./analyse/error.cjs');

function analyseSVGStructure(svg, options = {}) {
  const fixErrors = options.fixErrors;
  let root = svg.$svg(":root").get(0);
  if (root._parsed) {
    svg.load(svg.toString());
    root = svg.$svg(":root").get(0);
  }
  root._parsed = true;
  const cheerio = svg.$svg;
  const elements = /* @__PURE__ */ new Map();
  const ids = /* @__PURE__ */ Object.create(null);
  let links = [];
  function addID(element, id) {
    if (ids[id]) {
      throw new Error(`Duplicate id "${id}"`);
    }
    element._id = id;
    ids[id] = element._index;
    return true;
  }
  function gotElementWithID(element, id, isMask) {
    addID(element, id);
    if (!element._belongsTo) {
      element._belongsTo = [];
    }
    element._belongsTo.push({
      id,
      isMask,
      indexes: /* @__PURE__ */ new Set([element._index])
    });
    return;
  }
  function gotReusableElement(item, isMask) {
    const element = item.element;
    const attribs = element.attribs;
    const index2 = element._index;
    const id = attribs["id"];
    if (typeof id !== "string") {
      const message = `Definition element ${svg_analyse_error.analyseTagError(
        element
      )} does not have id`;
      if (fixErrors) {
        item.removeNode = true;
        item.testChildren = false;
        console.warn(message);
        return false;
      }
      throw new Error(message);
    }
    if (ids[id] && fixErrors) {
      console.warn(`Duplicate id "${id}"`);
      item.removeNode = true;
      item.testChildren = false;
      return false;
    }
    element._reusableElement = {
      id,
      isMask,
      index: index2
    };
    gotElementWithID(element, id, isMask);
    return true;
  }
  function gotElementReference(item, id, usedAsMask) {
    const element = item.element;
    const usedByIndex = element._index;
    const link = {
      id,
      usedByIndex,
      usedAsMask
    };
    links.push(link);
    if (!element._linksTo) {
      element._linksTo = [];
    }
    element._linksTo.push(link);
  }
  let index = 0;
  svg_parse.parseSVG(svg, (item) => {
    const { tagName, parents } = item;
    if (svg_data_tags.styleTag.has(tagName)) {
      item.testChildren = false;
      return;
    }
    const element = item.element;
    const attribs = element.attribs;
    index++;
    element._index = index;
    elements.set(index, element);
    if (!parents.length) {
      element._usedAsMask = false;
      element._usedAsPaint = true;
      return;
    }
    element._usedAsMask = false;
    element._usedAsPaint = false;
    const parentItem = parents[0];
    const parentElement = parentItem.element;
    if (svg_data_tags.maskTags.has(tagName)) {
      if (!gotReusableElement(item, true)) {
        return;
      }
    } else if (svg_data_tags.reusableElementsWithPalette.has(tagName)) {
      if (!gotReusableElement(item, false)) {
        return;
      }
    } else if (svg_data_tags.defsTag.has(parentItem.tagName)) {
      if (!gotReusableElement(item, false)) {
        return;
      }
    } else if (!svg_data_tags.defsTag.has(tagName)) {
      element._usedAsMask = parentElement._usedAsMask;
      element._usedAsPaint = parentElement._usedAsPaint;
      element._parentElement = parentElement._index;
      if (!parentElement._childElements) {
        parentElement._childElements = [];
      }
      parentElement._childElements.push(index);
      const parentReusableElement = parentElement._reusableElement;
      if (parentReusableElement) {
        if (element._reusableElement) {
          throw new Error(
            `Reusable element ${svg_analyse_error.analyseTagError(
              element
            )} is inside another reusable element id="${parentReusableElement.id}"`
          );
        }
        element._reusableElement = parentReusableElement;
      }
      const parentBelongsTo = parentElement._belongsTo;
      if (parentBelongsTo) {
        const list = element._belongsTo || (element._belongsTo = []);
        parentBelongsTo.forEach((item2) => {
          item2.indexes.add(index);
          list.push(item2);
        });
      }
      if (element._id === void 0) {
        const id = attribs["id"];
        if (typeof id === "string") {
          if (ids[id] && fixErrors) {
            console.warn(`Duplicate id "${id}"`);
            cheerio(element).removeAttr("id");
          } else {
            gotElementWithID(element, id, false);
          }
        }
      }
    }
    if (svg_data_attributes.tagSpecificNonPresentationalAttributes[tagName]?.has("href")) {
      const href = attribs["href"] || attribs["xlink:href"];
      if (typeof href === "string") {
        if (href.slice(0, 1) !== "#") {
          throw new Error(
            `Invalid link in ${svg_analyse_error.analyseTagError(element)}`
          );
        }
        const id = href.slice(1);
        gotElementReference(item, id, false);
      }
    }
    Object.keys(attribs).forEach((attr) => {
      let value = attribs[attr];
      if (value.slice(0, 5).toLowerCase() !== "url(#") {
        return;
      }
      value = value.slice(5);
      if (value.slice(-1) !== ")") {
        return;
      }
      const id = value.slice(0, value.length - 1).trim();
      if (svg_data_attributes.urlPresentationalAttributes.has(attr)) {
        gotElementReference(item, id, attr !== "filter");
        return;
      }
      if (svg_data_attributes.commonColorPresentationalAttributes.has(attr) || svg_data_attributes.markerAttributes.has(attr)) {
        gotElementReference(item, id, false);
        return;
      }
    });
  });
  links = links.filter((item) => {
    const id = item.id;
    if (ids[id]) {
      return true;
    }
    function fix() {
      const index2 = item.usedByIndex;
      const element = elements.get(index2);
      const tagName = element.tagName;
      function remove() {
        const $element = cheerio(element);
        const parent = element.parent;
        if (parent) {
          if (parent._childElements) {
            parent._childElements = parent._childElements.filter(
              (num) => num !== index2
            );
          }
          parent._belongsTo?.forEach((list) => {
            list.indexes.delete(index2);
          });
        }
        $element.remove();
      }
      if (element._linksTo) {
        element._linksTo = element._linksTo.filter(
          (item2) => item2.id !== id
        );
      }
      if (!element.children.length) {
        if (svg_data_tags.useTag.has(tagName)) {
          remove();
          return;
        }
      }
      const matches = /* @__PURE__ */ new Set(["#" + id, "url(#" + id + ")"]);
      const attribs = element.attribs;
      for (const attr in attribs) {
        if (matches.has(attribs[attr])) {
          cheerio(element).removeAttr(attr);
        }
      }
    }
    const message = `Missing element with id="${id}"`;
    if (fixErrors) {
      fix();
      console.warn(message);
    } else {
      throw new Error(message);
    }
    return false;
  });
  function hasChildItem(tree2, child, canThrow) {
    const item = tree2.children.find(
      (item2) => item2.index === child.index && item2.usedAsMask === child.usedAsMask
    );
    if (item && canThrow) {
      throw new Error("Recursion");
    }
    return !!item;
  }
  const tree = {
    index: 1,
    usedAsMask: false,
    children: []
  };
  function parseTreeItem(tree2, usedItems, inMask) {
    const element = elements.get(tree2.index);
    if (tree2.usedAsMask || inMask) {
      element._usedAsMask = true;
      inMask = true;
    } else {
      element._usedAsPaint = true;
    }
    usedItems = usedItems.slice(0);
    usedItems.push(element._index);
    element._childElements?.forEach((childIndex) => {
      if (usedItems.includes(childIndex)) {
        throw new Error("Recursion");
      }
      const childItem = {
        index: childIndex,
        usedAsMask: false,
        children: [],
        parent: tree2
      };
      tree2.children.push(childItem);
      parseTreeItem(childItem, usedItems, inMask);
    });
    element._linksTo?.forEach((link) => {
      const linkIndex = ids[link.id];
      const usedAsMask = link.usedAsMask;
      const childItem = {
        index: linkIndex,
        usedAsMask,
        children: [],
        parent: tree2
      };
      if (hasChildItem(tree2, childItem, false)) {
        return;
      }
      tree2.children.push(childItem);
      parseTreeItem(childItem, usedItems, inMask || usedAsMask);
    });
  }
  parseTreeItem(tree, [0], false);
  return {
    elements,
    ids,
    links,
    tree
  };
}

exports.analyseSVGStructure = analyseSVGStructure;
