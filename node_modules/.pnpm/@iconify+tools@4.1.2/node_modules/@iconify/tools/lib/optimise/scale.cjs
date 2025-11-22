'use strict';

const optimise_origin = require('./origin.cjs');
const optimise_svgo = require('./svgo.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');

function scaleSVG(svg, scale) {
  optimise_origin.resetSVGOrigin(svg);
  if (scale !== 1) {
    const viewBox = svg.viewBox;
    const width = viewBox.width * scale;
    const height = viewBox.height * scale;
    const content = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="scale(${scale})">${svg.getBody()}</g></svg>`;
    svg.load(content);
    optimise_svgo.runSVGO(svg, {
      plugins: [
        "collapseGroups",
        "convertTransform",
        "convertPathData",
        "sortAttrs"
      ]
    });
  }
}

exports.scaleSVG = scaleSVG;
