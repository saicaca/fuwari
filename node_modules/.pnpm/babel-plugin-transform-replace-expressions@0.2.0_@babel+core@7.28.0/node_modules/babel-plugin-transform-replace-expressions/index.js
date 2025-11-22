const { parseExpression } = require("@babel/parser");

module.exports = function({ types: t }, options = {}) {
  const replace = options.replace || {};
  const allowConflictingReplacements = !!options.allowConflictingReplacements;

  function asArray(obj) {
    if (Array.isArray(obj)) {
      return obj;
    }
    return Object.keys(obj).map(key => [key, obj[key]]);
  }

  const types = new Map();
  asArray(replace).forEach(([key, value]) => {
    const kNode = parseExpression(key);
    const vNode = parseExpression(value);

    const candidates = types.get(kNode.type) || [];
    candidates.push({ key: kNode, value: vNode, originalKey: key });
    types.set(kNode.type, candidates);

    for (let i = 0; i < candidates.length - 1; i++) {
      if (!t.isNodesEquivalent(candidates[i].key, kNode)) {
        continue;
      }

      if (allowConflictingReplacements) {
        candidates[i] = candidates.pop();
        break;
      }

      throw new Error(
        `Expressions ${JSON.stringify(
          candidates[i].originalKey
        )} and ${JSON.stringify(key)} conflict`
      );
    }
  });

  const values = new Set();
  types.forEach(candidates => {
    candidates.forEach(candidate => {
      values.add(candidate.value);
    });
  });

  return {
    name: "transform-replace-expressions",
    visitor: {
      Expression(path) {
        if (values.has(path.node)) {
          path.skip();
          return;
        }

        const candidates = types.get(path.node.type);
        if (!candidates) {
          return;
        }

        for (const { key, value } of candidates) {
          if (t.isNodesEquivalent(key, path.node)) {
            try {
              t.validate(path.parent, path.key, value);
            } catch (err) {
              if (!(err instanceof TypeError)) {
                throw err;
              }
              path.skip();
              return;
            }

            path.replaceWith(value);
            return;
          }
        }
      }
    }
  };
};
