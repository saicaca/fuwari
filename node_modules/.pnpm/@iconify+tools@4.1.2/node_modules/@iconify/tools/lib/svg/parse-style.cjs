'use strict';

const css_parse = require('../css/parse.cjs');
const css_parser_export = require('../css/parser/export.cjs');
const css_parser_tokens = require('../css/parser/tokens.cjs');
const css_parser_tree = require('../css/parser/tree.cjs');
const svg_parse = require('./parse.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');

function assertNotOldCode(value) {
  if (value instanceof Promise) {
    throw new Error("parseSVGStyle does not support async callbacks");
  }
}
function parseSVGStyle(svg, callback) {
  svg_parse.parseSVG(svg, (item) => {
    const tagName = item.tagName;
    const $element = item.$element;
    function parseStyleItem() {
      const content = $element.text();
      if (typeof content !== "string") {
        $element.remove();
        return;
      }
      const tokens = css_parser_tokens.getTokens(content);
      if (!(tokens instanceof Array)) {
        throw new Error("Error parsing style");
      }
      let changed2 = false;
      const selectorStart = [];
      let newTokens = [];
      while (tokens.length) {
        const token = tokens.shift();
        if (!token) {
          break;
        }
        switch (token.type) {
          case "selector":
            selectorStart.push(newTokens.length);
            newTokens.push(token);
            break;
          case "close":
            selectorStart.pop();
            newTokens.push(token);
            break;
          case "at-rule": {
            selectorStart.push(newTokens.length);
            const prop = token.rule;
            const value = token.value;
            const isAnimation = prop === "keyframes" || prop.slice(0, 1) === "-" && prop.split("-").pop() === "keyframes";
            const childTokens = [];
            const animationRules = /* @__PURE__ */ Object.create(null);
            let depth = 1;
            let index = 0;
            let isFrom = false;
            while (depth > 0) {
              const childToken = tokens[index];
              index++;
              if (!childToken) {
                throw new Error(
                  "Something went wrong parsing CSS"
                );
              }
              childTokens.push(childToken);
              switch (childToken.type) {
                case "close": {
                  depth--;
                  isFrom = false;
                  break;
                }
                case "selector": {
                  depth++;
                  if (isAnimation) {
                    const rule = childToken.code;
                    if (rule === "from" || rule === "0%") {
                      isFrom = true;
                    }
                  }
                  break;
                }
                case "at-rule": {
                  depth++;
                  if (isAnimation) {
                    throw new Error(
                      "Nested at-rule in keyframes ???"
                    );
                  }
                  break;
                }
                case "rule": {
                  if (isAnimation && isFrom) {
                    animationRules[childToken.prop] = childToken.value;
                  }
                  break;
                }
              }
            }
            const skipCount = childTokens.length;
            const result = callback(
              isAnimation ? {
                type: "keyframes",
                prop,
                value,
                token,
                childTokens,
                from: animationRules,
                prevTokens: newTokens,
                nextTokens: tokens.slice(0)
              } : {
                type: "at-rule",
                prop,
                value,
                token,
                childTokens,
                prevTokens: newTokens,
                nextTokens: tokens.slice(0)
              }
            );
            if (result !== void 0) {
              assertNotOldCode(result);
              if (isAnimation) {
                if (result !== value) {
                  changed2 = true;
                  token.value = result;
                }
                newTokens.push(token);
                for (let i = 0; i < skipCount; i++) {
                  tokens.shift();
                }
                newTokens = newTokens.concat(childTokens);
              } else {
                if (result !== value) {
                  throw new Error(
                    "Changing value for at-rule is not supported"
                  );
                }
                newTokens.push(token);
              }
            } else {
              changed2 = true;
              for (let i = 0; i < skipCount; i++) {
                tokens.shift();
              }
            }
            break;
          }
          case "rule": {
            const value = token.value;
            const selectorTokens = selectorStart.map((index) => newTokens[index]).filter((item2) => item2 !== null);
            const result = callback({
              type: "global",
              prop: token.prop,
              value,
              token,
              selectorTokens,
              selectors: selectorTokens.reduce(
                (prev, current) => {
                  switch (current.type) {
                    case "selector": {
                      return prev.concat(
                        current.selectors
                      );
                    }
                  }
                  return prev;
                },
                []
              ),
              prevTokens: newTokens,
              nextTokens: tokens.slice(0)
            });
            if (result !== void 0) {
              assertNotOldCode(result);
              if (result !== value) {
                changed2 = true;
                token.value = result;
              }
              newTokens.push(token);
            } else {
              changed2 = true;
            }
            break;
          }
        }
      }
      if (changed2) {
        const tree = css_parser_tree.tokensTree(
          newTokens.filter((token) => token !== null)
        );
        if (!tree.length) {
          $element.remove();
        } else {
          const newContent = css_parser_export.tokensToString(tree);
          item.$element.text("\n" + newContent);
        }
      }
    }
    if (tagName === "style") {
      parseStyleItem();
      return;
    }
    const attribs = item.element.attribs;
    if (attribs.style === void 0) {
      return;
    }
    const parsedStyle = css_parse.parseInlineStyle(attribs.style);
    if (parsedStyle === null) {
      $element.removeAttr("style");
      return;
    }
    let changed = false;
    for (const prop in parsedStyle) {
      const value = parsedStyle[prop];
      const result = callback({
        type: "inline",
        prop,
        value,
        item
      });
      assertNotOldCode(result);
      if (result !== value) {
        changed = true;
        if (result === void 0) {
          delete parsedStyle[prop];
        } else {
          parsedStyle[prop] = result;
        }
      }
    }
    if (changed) {
      const newStyle = Object.keys(parsedStyle).map((key) => key + ":" + parsedStyle[key] + ";").join("");
      if (!newStyle.length) {
        $element.removeAttr("style");
      } else {
        $element.attr("style", newStyle);
      }
    }
  });
}

exports.parseSVGStyle = parseSVGStyle;
