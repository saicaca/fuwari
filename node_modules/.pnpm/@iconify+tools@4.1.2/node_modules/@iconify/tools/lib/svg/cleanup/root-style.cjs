'use strict';

const svg_parseStyle = require('../parse-style.cjs');
require('../../css/parse.cjs');
require('../../css/parser/tokens.cjs');
require('../../css/parser/error.cjs');
require('../../css/parser/strings.cjs');
require('../../css/parser/text.cjs');
require('../../css/parser/export.cjs');
require('../../css/parser/tree.cjs');
require('../parse.cjs');

function cleanupRootStyle(svg) {
  const result = {};
  svg_parseStyle.parseSVGStyle(svg, (item) => {
    switch (item.type) {
      case "inline":
        return item.value;
      case "global":
        return item.value;
      case "at-rule":
        (result.removedAtRules || (result.removedAtRules = /* @__PURE__ */ new Set())).add(item.prop);
        return;
      case "keyframes":
        (result.animations || (result.animations = /* @__PURE__ */ new Set())).add(
          item.value
        );
        return item.value;
    }
  });
  return result;
}

exports.cleanupRootStyle = cleanupRootStyle;
