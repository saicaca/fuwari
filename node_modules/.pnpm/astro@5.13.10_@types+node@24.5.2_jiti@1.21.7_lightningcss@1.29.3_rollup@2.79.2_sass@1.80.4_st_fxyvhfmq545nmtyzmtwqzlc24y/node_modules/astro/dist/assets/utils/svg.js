import { parse, renderSync } from "ultrahtml";
import { dropAttributes } from "../runtime.js";
function parseSvg(contents) {
  const root = parse(contents);
  const svgNode = root.children.find(
    ({ name, type }) => type === 1 && name === "svg"
  );
  if (!svgNode) {
    throw new Error("SVG file does not contain an <svg> element");
  }
  const { attributes, children } = svgNode;
  const body = renderSync({ ...root, children });
  return { attributes, body };
}
function makeSvgComponent(meta, contents) {
  const file = typeof contents === "string" ? contents : contents.toString("utf-8");
  const { attributes, body: children } = parseSvg(file);
  const props = {
    meta,
    attributes: dropAttributes(attributes),
    children
  };
  return `import { createSvgComponent } from 'astro/assets/runtime';
export default createSvgComponent(${JSON.stringify(props)})`;
}
export {
  makeSvgComponent
};
