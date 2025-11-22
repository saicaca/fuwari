'use strict';

const css_parser_error = require('./error.cjs');
const css_parser_strings = require('./strings.cjs');
const css_parser_text = require('./text.cjs');

function findTokens(code, tokens) {
  const list = [];
  const lc = code.toLowerCase();
  tokens.forEach((token) => {
    let index = 0;
    while (true) {
      index = lc.indexOf(token, index);
      if (index === -1) {
        return;
      }
      list.push({
        token,
        index
      });
      index++;
    }
  });
  list.sort((a, b) => a.index - b.index);
  return list;
}
function getTokens(css) {
  const items = [];
  let textQueue = [];
  let start = 0;
  let depth = 0;
  try {
    const checkRule = (text) => {
      if (!textQueue.length) {
        return;
      }
      const item = css_parser_text.textTokensToRule(textQueue);
      if (item) {
        items.push(item);
        return;
      }
      const value = css_parser_text.mergeTextTokens(textQueue) + text;
      if (!value.length) {
        return;
      }
      throw css_parser_error.styleParseError("Invalid css rule", css, textQueue[0]?.index);
    };
    findTokens(css, ['"', "'", "/*", "{", "}", ";", "url(", "\\"]).forEach(
      (token) => {
        if (token.index < start) {
          return;
        }
        switch (token.token) {
          case "/*": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            start = token.index;
            const end = css.indexOf("*/", start + 2);
            if (end === -1) {
              throw css_parser_error.styleParseError(
                "Missing comment closing statement",
                css,
                start
              );
            }
            start = end + 2;
            break;
          }
          case "\\":
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index + 2),
              index: start
            });
            start = token.index + 2;
            break;
          case "url(": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            start = token.index;
            const end = css_parser_strings.findEndOfURL(css, start);
            if (typeof end !== "number") {
              throw end;
            }
            textQueue.push({
              type: "url",
              text: css.slice(start, end),
              index: start
            });
            start = end;
            break;
          }
          case '"':
          case "'": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            start = token.index;
            const end = css_parser_strings.findEndOfQuotedString(
              css,
              token.token,
              start
            );
            if (end === null) {
              throw css_parser_error.styleParseError(
                "Missing closing " + token.token,
                css,
                start
              );
            }
            textQueue.push({
              type: "quoted-string",
              text: css.slice(start, end),
              index: start
            });
            start = end;
            break;
          }
          case ";": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            checkRule(token.token);
            start = token.index + 1;
            textQueue = [];
            break;
          }
          case "{": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            const item = css_parser_text.textTokensToSelector(textQueue);
            if (!item) {
              throw css_parser_error.styleParseError(
                "Invalid css rule",
                css,
                start
              );
            }
            items.push(item);
            start = token.index + 1;
            textQueue = [];
            depth++;
            break;
          }
          case "}": {
            textQueue.push({
              type: "chunk",
              text: css.slice(start, token.index),
              index: start
            });
            checkRule("");
            items.push({
              type: "close",
              index: token.index
            });
            if (!depth) {
              throw css_parser_error.styleParseError(
                "Unexpected }",
                css,
                token.index
              );
            }
            depth--;
            start = token.index + 1;
            textQueue = [];
            break;
          }
          default:
            throw new Error(
              `Forgot to parse token: ${token.token}`
            );
        }
      }
    );
    if (depth) {
      return css_parser_error.styleParseError("Missing }", css);
    }
    textQueue.push({
      type: "chunk",
      text: css.slice(start),
      index: start
    });
    checkRule("");
  } catch (err) {
    if (typeof err === "object" && err.type === "style-parse-error") {
      return err;
    }
    throw err;
  }
  return items;
}

exports.getTokens = getTokens;
