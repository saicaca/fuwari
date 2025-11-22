'use strict';

const svg_data_attributes = require('../data/attributes.cjs');
const svg_parseStyle = require('../parse-style.cjs');
const optimise_svgo = require('../../optimise/svgo.cjs');
require('../data/tags.cjs');
require('../../css/parse.cjs');
require('../../css/parser/tokens.cjs');
require('../../css/parser/error.cjs');
require('../../css/parser/strings.cjs');
require('../../css/parser/text.cjs');
require('../../css/parser/export.cjs');
require('../../css/parser/tree.cjs');
require('../parse.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');

function convertStyleToAttrs(svg) {
  let hasStyle = false;
  svg_parseStyle.parseSVGStyle(svg, (item) => {
    if (item.type !== "inline" && item.type !== "global") {
      return item.value;
    }
    const prop = item.prop;
    if (
      // Attributes / properties now allowed
      svg_data_attributes.badAttributes.has(prop) || svg_data_attributes.badSoftwareAttributes.has(prop) || svg_data_attributes.badAttributePrefixes.has(prop.split("-").shift())
    ) {
      return;
    }
    hasStyle = true;
    return item.value;
  });
  if (!hasStyle) {
    return;
  }
  optimise_svgo.runSVGO(svg, {
    plugins: ["convertStyleToAttrs", "inlineStyles"],
    multipass: true
  });
}

exports.convertStyleToAttrs = convertStyleToAttrs;
