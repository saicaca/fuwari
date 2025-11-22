import { removeBadAttributes } from './cleanup/attribs.mjs';
import { checkBadTags } from './cleanup/bad-tags.mjs';
import { cleanupInlineStyle } from './cleanup/inline-style.mjs';
import { cleanupRootStyle } from './cleanup/root-style.mjs';
import { cleanupSVGRoot } from './cleanup/root-svg.mjs';
import { convertStyleToAttrs } from './cleanup/svgo-style.mjs';
import './data/attributes.mjs';
import './data/tags.mjs';
import './parse.mjs';
import '../css/parse.mjs';
import '../css/parser/tokens.mjs';
import '../css/parser/error.mjs';
import '../css/parser/strings.mjs';
import '../css/parser/text.mjs';
import './parse-style.mjs';
import '../css/parser/export.mjs';
import '../css/parser/tree.mjs';
import '../optimise/svgo.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';

function cleanupSVG(svg, options) {
  cleanupInlineStyle(svg);
  convertStyleToAttrs(svg);
  cleanupSVGRoot(svg);
  checkBadTags(svg, options);
  removeBadAttributes(svg);
  cleanupRootStyle(svg);
}

export { cleanupSVG };
