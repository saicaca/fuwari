// src/hast.ts
import { toHtml } from "hast-util-to-html";
import { toText } from "hast-util-to-text";
import { matches, select, selectAll } from "hast-util-select";
import { visit } from "unist-util-visit";
import { visitParents, CONTINUE, EXIT, SKIP } from "unist-util-visit-parents";
import { h, s } from "hastscript";
import postcss, { Declaration } from "postcss";

// src/internal/escaping.ts
function serializeCssStringValue(value, quoteStyle = "single") {
  const quote = quoteStyle === "single" ? "'" : '"';
  const escapedValue = Array.from(value).map((char) => {
    const code = char.charCodeAt(0);
    switch (true) {
      case code === 0:
        return "\uFFFD";
      case (code >= 1 && code <= 31 || code === 127):
        return `\\${code.toString(16)} `;
      case (char === quote || char === "\\"):
        return `\\${char}`;
      default:
        return char;
    }
  }).join("");
  return `${quote}${escapedValue}${quote}`;
}

// src/hast.ts
function setProperty(node, propertyName, value) {
  const properties = node.properties || {};
  node.properties = properties;
  if (value !== null) {
    properties[propertyName] = value;
  } else {
    delete properties[propertyName];
  }
}
function getClassNames(node) {
  const stringOrArr = node.properties?.className;
  if (!stringOrArr || stringOrArr === true)
    return [];
  if (Array.isArray(stringOrArr))
    return stringOrArr.map((className) => className.toString());
  return stringOrArr.toString().split(" ");
}
function addClassName(node, className) {
  const classNames = getClassNames(node);
  if (classNames.indexOf(className) === -1)
    classNames.push(className);
  setProperty(node, "className", classNames);
}
function removeClassName(node, className) {
  const classNames = getClassNames(node);
  const index = classNames.indexOf(className);
  if (index === -1)
    return;
  classNames.splice(index, 1);
  setProperty(node, "className", classNames);
}
function getInlineStyles(node) {
  const styles = /* @__PURE__ */ new Map();
  const styleString = node.properties?.style?.toString().trim() || "";
  if (!styleString)
    return styles;
  const postCssOptions = { from: void 0 };
  try {
    const root = postcss.parse(styleString, postCssOptions);
    root.each((node2) => {
      if (node2.type === "decl")
        styles.set(node2.prop, node2.value);
    });
  } catch (error) {
  }
  return styles;
}
function setInlineStyles(node, styles) {
  const styleString = [...styles].map(
    ([prop, value]) => new Declaration({
      prop,
      value,
      raws: {
        between: ":"
      }
    }).toString()
  ).join(";");
  setProperty(node, "style", styleString);
}
function setInlineStyle(node, cssProperty, value, valueFormat = "raw") {
  const styles = getInlineStyles(node);
  if (value !== null) {
    styles.set(cssProperty, valueFormat === "string" ? serializeCssStringValue(value) : value);
  } else {
    styles.delete(cssProperty);
  }
  setInlineStyles(node, styles);
}
export {
  CONTINUE,
  EXIT,
  SKIP,
  addClassName,
  getClassNames,
  getInlineStyles,
  h,
  matches,
  removeClassName,
  s,
  select,
  selectAll,
  setInlineStyle,
  setInlineStyles,
  setProperty,
  toHtml,
  toText,
  visit,
  visitParents
};
//# sourceMappingURL=hast.js.map