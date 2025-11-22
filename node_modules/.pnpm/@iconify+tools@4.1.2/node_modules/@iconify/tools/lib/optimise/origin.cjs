'use strict';

const optimise_svgo = require('./svgo.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');

function resetSVGOrigin(svg) {
  const viewBox = svg.viewBox;
  if (viewBox.left !== 0 || viewBox.top !== 0) {
    const content = `<svg width="${viewBox.width}" height="${viewBox.height}" viewBox="0 0 ${viewBox.width} ${viewBox.height}"><g transform="translate(${0 - viewBox.left} ${0 - viewBox.top})">${svg.getBody()}</g></svg>`;
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

exports.resetSVGOrigin = resetSVGOrigin;
