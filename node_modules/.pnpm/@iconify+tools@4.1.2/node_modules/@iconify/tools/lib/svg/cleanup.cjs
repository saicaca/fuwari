'use strict';

const svg_cleanup_attribs = require('./cleanup/attribs.cjs');
const svg_cleanup_badTags = require('./cleanup/bad-tags.cjs');
const svg_cleanup_inlineStyle = require('./cleanup/inline-style.cjs');
const svg_cleanup_rootStyle = require('./cleanup/root-style.cjs');
const svg_cleanup_rootSvg = require('./cleanup/root-svg.cjs');
const svg_cleanup_svgoStyle = require('./cleanup/svgo-style.cjs');
require('./data/attributes.cjs');
require('./data/tags.cjs');
require('./parse.cjs');
require('../css/parse.cjs');
require('../css/parser/tokens.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');
require('./parse-style.cjs');
require('../css/parser/export.cjs');
require('../css/parser/tree.cjs');
require('../optimise/svgo.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');

function cleanupSVG(svg, options) {
  svg_cleanup_inlineStyle.cleanupInlineStyle(svg);
  svg_cleanup_svgoStyle.convertStyleToAttrs(svg);
  svg_cleanup_rootSvg.cleanupSVGRoot(svg);
  svg_cleanup_badTags.checkBadTags(svg, options);
  svg_cleanup_attribs.removeBadAttributes(svg);
  svg_cleanup_rootStyle.cleanupRootStyle(svg);
}

exports.cleanupSVG = cleanupSVG;
