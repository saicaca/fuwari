import { visit } from "unist-util-visit";
import { TypstFileComponent } from "../typst/components/tfile.mjs";

// Ensure <tfile file="..."> gets rendered even if rehype-components
// does not handle it for Typst HTML. This directly replaces <tfile>
// nodes with the HAST produced by TypstFileComponent.
export function rehypeTypstTfile() {
  return function transformer(tree) {
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (!node || node.type !== "element" || String(node.tagName).toLowerCase() !== "tfile")
        return;
      try {
        const props = node.properties || {};
        const rep = TypstFileComponent(props);
        const arr = Array.isArray(rep) ? rep : [rep];
        parent.children.splice(index, 1, ...arr);
      } catch (e) {
        try {
          console.warn("[rehype-typst-tfile] failed to render tfile", e);
        } catch {}
      }
    });
  };
}
