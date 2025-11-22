import { resetSVGOrigin } from './origin.mjs';
import { runSVGO } from './svgo.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';

function scaleSVG(svg, scale) {
  resetSVGOrigin(svg);
  if (scale !== 1) {
    const viewBox = svg.viewBox;
    const width = viewBox.width * scale;
    const height = viewBox.height * scale;
    const content = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="scale(${scale})">${svg.getBody()}</g></svg>`;
    svg.load(content);
    runSVGO(svg, {
      plugins: [
        "collapseGroups",
        "convertTransform",
        "convertPathData",
        "sortAttrs"
      ]
    });
  }
}

export { scaleSVG };
