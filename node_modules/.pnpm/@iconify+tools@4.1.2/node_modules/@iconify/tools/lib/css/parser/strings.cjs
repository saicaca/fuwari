'use strict';

const css_parser_error = require('./error.cjs');

function findEndOfQuotedString(code, quote, start) {
  let nextEscape = code.indexOf("\\", start + 1);
  let end = code.indexOf(quote, start + 1);
  if (end === -1) {
    return null;
  }
  while (nextEscape !== -1 && nextEscape < end) {
    if (end === nextEscape + 1) {
      end = code.indexOf(quote, end + 1);
      if (end === -1) {
        return null;
      }
    }
    nextEscape = code.indexOf("\\", nextEscape + 2);
  }
  return end + 1;
}
function findEndOfURL(code, start) {
  let index = (start || 0) + 4;
  const length = code.length;
  while (true) {
    if (index >= length) {
      return css_parser_error.styleParseError("Cannot find end of URL", code, start);
    }
    let next = code.charAt(index);
    switch (next) {
      case '"':
      case "'": {
        let end = findEndOfQuotedString(code, next, index);
        if (end === null) {
          return css_parser_error.styleParseError("Incomplete string", code, index);
        }
        end = code.indexOf(")", end);
        return end === -1 ? css_parser_error.styleParseError("Cannot find end of URL", code, start) : end + 1;
      }
      case " ":
      case "	":
      case "\r":
      case "\n":
        index++;
        break;
      default:
        while (true) {
          switch (next) {
            case ")":
              return index + 1;
            case '"':
            case "'":
            case "(":
            case " ":
            case "	":
            case "\r":
            case "\n":
              return css_parser_error.styleParseError("Invalid URL", code, start);
            default:
              if (code.charCodeAt(index) < 32) {
                return css_parser_error.styleParseError(
                  "Invalid URL",
                  code,
                  start
                );
              }
          }
          index++;
          if (index >= length) {
            return css_parser_error.styleParseError(
              "Cannot find end of URL",
              code,
              start
            );
          }
          next = code.charAt(index);
        }
    }
  }
}

exports.findEndOfQuotedString = findEndOfQuotedString;
exports.findEndOfURL = findEndOfURL;
