'use strict';

const css_parser_tokens = require('./parser/tokens.cjs');
require('./parser/error.cjs');
require('./parser/strings.cjs');
require('./parser/text.cjs');

function parseInlineStyle(style) {
  const tokens = css_parser_tokens.getTokens(style);
  if (!(tokens instanceof Array)) {
    return null;
  }
  const results = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== "rule") {
      return null;
    }
    results[token.prop] = token.value;
  }
  return results;
}

exports.parseInlineStyle = parseInlineStyle;
