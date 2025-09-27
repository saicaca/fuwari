import { visit } from "unist-util-visit";

// Normalize Typst-generated HTML fragments:
// - Unwrap any nested <body> element that slips into the content tree
// - Normalize heading levels so the smallest becomes <h1>
export function rehypeTypstNormalize() {
  return function transformer(tree) {
    if (!tree || typeof tree !== "object") return;

    // 1) Unwrap any <body> elements anywhere in the subtree
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return;
      if (String(node.tagName).toLowerCase() !== "body") return;
      const bodyKids = Array.isArray(node.children) ? node.children : [];
      try {
        parent.children.splice(index, 1, ...bodyKids);
        // Skip traversing the now-replaced children; visit will continue safely
      } catch {
        // leave node as-is on failure
      }
    });

    // 2) Gather heading depths and compute minimal level
    const depths = [];
    visit(tree, "element", (node) => {
      if (!node || typeof node.tagName !== "string") return;
      const m = /^h([1-6])$/i.exec(node.tagName);
      if (!m) return;
      depths.push(Number(m[1]));
    });
    if (!depths.length) return;
    const min = Math.min(...depths);
    if (!(min > 1)) return; // already starts at h1

    const shift = min - 1; // shift levels up so min => 1
    visit(tree, "element", (node) => {
      if (!node || typeof node.tagName !== "string") return;
      const m = /^h([1-6])$/i.exec(node.tagName);
      if (!m) return;
      const n = Number(m[1]);
      const newLevel = Math.max(1, Math.min(6, n - shift));
      node.tagName = `h${String(newLevel)}`;
    });
  };
}
