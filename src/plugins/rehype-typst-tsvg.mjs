import { visit } from "unist-util-visit";
import { TypstSvgComponent } from "../typst/components/tsvg.mjs";

// Render <tsvg> elements by directly replacing them with compiled SVG HAST.
// Simplified: only handle explicit <tsvg> tags.
export function rehypeTypstTsvg() {
  return function transformer(tree) {
    if (!tree || typeof tree !== "object") return;
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (!node || node.type !== "element") return;
      const tag = String(node.tagName || "").toLowerCase();
      if (tag !== "tsvg") return;
      try {
        const props = node.properties || {};
        const children = Array.isArray(node.children) ? node.children : [];
        const rep = TypstSvgComponent(props, children);
        const arr = Array.isArray(rep) ? rep : [rep];
        parent.children.splice(index, 1, ...arr);
      } catch (e) {
        try {
          console.warn("[rehype-typst-tsvg] failed to render tsvg", e);
        } catch (_e) {
          /* ignore logging errors */
        }
      }
    });
  };
}
