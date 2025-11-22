'use strict';

function mergeTextTokens(tokens) {
  return tokens.map((token) => token.text).join("").trim();
}
function getSelectors(tokens) {
  const selectors = [];
  let selector = "";
  tokens.forEach((token) => {
    if (token.type !== "chunk") {
      selector += token.text;
      return;
    }
    const list = token.text.split(",");
    selector += list.shift();
    while (list.length > 0) {
      selectors.push(selector.trim());
      selector = list.shift();
    }
  });
  selectors.push(selector.trim());
  return selectors.filter((item) => item.length > 0);
}
function textTokensToRule(tokens) {
  let prop = "";
  let value = "";
  let isProp = true;
  let error = false;
  tokens.forEach((token) => {
    if (error) {
      return;
    }
    if (token.type !== "chunk") {
      if (isProp) {
        error = true;
      } else {
        value += token.text;
      }
      return;
    }
    const pairs = token.text.split(":");
    if (pairs.length > 2) {
      error = true;
      return;
    }
    if (pairs.length === 2) {
      if (!isProp) {
        error = true;
        return;
      }
      prop += pairs[0];
      value = pairs[1];
      isProp = false;
      return;
    }
    if (isProp) {
      prop += token.text;
    } else {
      value += token.text;
    }
  });
  if (error || isProp) {
    return null;
  }
  prop = prop.trim();
  value = value.trim();
  if (!prop.length || !value.length) {
    return null;
  }
  const result = {
    type: "rule",
    prop: prop.toLowerCase(),
    value,
    index: tokens[0].index
  };
  ["important"].forEach((word) => {
    if (result.value.slice(-1 - word.length).toLowerCase() === "!" + word) {
      result[word] = true;
      result.value = result.value.slice(0, -1 - word.length).trim();
    }
  });
  return result.value.length ? result : null;
}
function textTokensToSelector(tokens) {
  const selectors = getSelectors(tokens);
  const code = mergeTextTokens(tokens);
  const index = tokens[0].index;
  if (!selectors.length) {
    return null;
  }
  if (code.charAt(0) === "@") {
    const parts = code.split(/\s+/);
    const rule = parts.shift().slice(1);
    const value = parts.join(" ").trim();
    return {
      type: "at-rule",
      index,
      rule,
      value
    };
  } else {
    return {
      type: "selector",
      code,
      index,
      selectors
    };
  }
}

exports.getSelectors = getSelectors;
exports.mergeTextTokens = mergeTextTokens;
exports.textTokensToRule = textTokensToRule;
exports.textTokensToSelector = textTokensToSelector;
