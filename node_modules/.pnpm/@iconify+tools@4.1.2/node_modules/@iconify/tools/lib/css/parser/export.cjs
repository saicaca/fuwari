'use strict';

const tab = "	";
const nl = "\n";
function tokensToString(tree) {
  let compact = true;
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].type !== "rule") {
      compact = false;
      break;
    }
  }
  return tree.map((token) => {
    return parseToken(token, compact, 0);
  }).join("");
}
function parseToken(token, compact, depth) {
  let content;
  switch (token.type) {
    case "rule": {
      return (compact ? "" : tab.repeat(depth)) + token.prop + (compact ? ":" : ": ") + token.value + ";" + (compact ? "" : nl);
    }
    case "at-rule": {
      content = `@${token.rule} ${token.value}`.trim();
      break;
    }
    case "selector": {
      content = token.selectors.join(compact ? "," : ", ");
    }
  }
  const children = token.children.map((item) => {
    return parseToken(item, compact, depth + 1);
  });
  return (compact ? "" : tab.repeat(depth)) + content + (compact ? "{" : " {" + nl) + children.join("") + (compact ? "}" : tab.repeat(depth) + "}" + nl);
}

exports.tokensToString = tokensToString;
