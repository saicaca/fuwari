'use strict';

function tokensTree(tokens) {
  const result = [];
  let index = 0;
  function parse(target) {
    while (index < tokens.length) {
      const token = tokens[index];
      index++;
      switch (token.type) {
        case "close":
          return;
        case "selector":
        case "at-rule": {
          const newItem = {
            ...token,
            children: []
          };
          target.push(newItem);
          parse(newItem.children);
          if (!newItem.children.length) {
            const index2 = target.indexOf(newItem);
            if (index2 !== -1) {
              target.splice(index2, 1);
            }
          }
          break;
        }
        default:
          target.push(token);
      }
    }
  }
  while (index < tokens.length) {
    parse(result);
  }
  return result;
}

exports.tokensTree = tokensTree;
