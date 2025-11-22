import { getTokens } from './parser/tokens.mjs';
import './parser/error.mjs';
import './parser/strings.mjs';
import './parser/text.mjs';

function parseInlineStyle(style) {
  const tokens = getTokens(style);
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

export { parseInlineStyle };
