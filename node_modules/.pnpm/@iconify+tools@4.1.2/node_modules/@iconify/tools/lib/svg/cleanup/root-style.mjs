import { parseSVGStyle } from '../parse-style.mjs';
import '../../css/parse.mjs';
import '../../css/parser/tokens.mjs';
import '../../css/parser/error.mjs';
import '../../css/parser/strings.mjs';
import '../../css/parser/text.mjs';
import '../../css/parser/export.mjs';
import '../../css/parser/tree.mjs';
import '../parse.mjs';

function cleanupRootStyle(svg) {
  const result = {};
  parseSVGStyle(svg, (item) => {
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

export { cleanupRootStyle };
