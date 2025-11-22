import { badAttributes, badSoftwareAttributes, badAttributePrefixes } from '../data/attributes.mjs';
import { parseSVGStyle } from '../parse-style.mjs';
import { runSVGO } from '../../optimise/svgo.mjs';
import '../data/tags.mjs';
import '../../css/parse.mjs';
import '../../css/parser/tokens.mjs';
import '../../css/parser/error.mjs';
import '../../css/parser/strings.mjs';
import '../../css/parser/text.mjs';
import '../../css/parser/export.mjs';
import '../../css/parser/tree.mjs';
import '../parse.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';

function convertStyleToAttrs(svg) {
  let hasStyle = false;
  parseSVGStyle(svg, (item) => {
    if (item.type !== "inline" && item.type !== "global") {
      return item.value;
    }
    const prop = item.prop;
    if (
      // Attributes / properties now allowed
      badAttributes.has(prop) || badSoftwareAttributes.has(prop) || badAttributePrefixes.has(prop.split("-").shift())
    ) {
      return;
    }
    hasStyle = true;
    return item.value;
  });
  if (!hasStyle) {
    return;
  }
  runSVGO(svg, {
    plugins: ["convertStyleToAttrs", "inlineStyles"],
    multipass: true
  });
}

export { convertStyleToAttrs };
