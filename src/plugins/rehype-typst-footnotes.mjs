// Transform simple Typst-rendered footnote paragraphs into
// a semantic footnotes section like remark-footnotes produces.
//
// Input (from Typst HTML posts):
//   <p>Footnotes: <a id="fn1">1</a> Footnote text goes here.</p>
// Output:
//   <section data-footnotes class="footnotes">
//     <h2 class="sr-only" id="footnote-label">Footnotes</h2>
//     <ol>
//       <li id="user-content-fn-1">
//         <p>Footnote text goes here. <a href="#user-content-fnref-1" data-footnote-backref aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
//       </li>
//     </ol>
//   </section>

import process from "node:process";
import { visit } from "unist-util-visit";

function isFootnoteParagraph(node) {
  if (!node || node.type !== "element" || node.tagName !== "p") return false;
  const firstText = (node.children?.find?.((c) => c.type === "text")?.value || "").trim();
  if (!/^Footnotes:?$/i.test(firstText.split(/\s+/)[0] || "")) return false;
  // Require an <a id="fnN"> child
  const a = node.children?.find?.(
    (c) => c.type === "element" && c.tagName === "a" && typeof c.properties?.id === "string",
  );
  if (!a) return false;
  // id can be "fn1" or "fn-1"
  return /^fn-?\d+$/i.test(String(a.properties.id));
}

function transformFootnoteNode(targetNode, targetIndex, targetParent, DEBUG) {
  const children = targetNode.children || [];
  // Find anchor and trailing text after it
  const aIdx = children.findIndex(
    (c) =>
      c.type === "element" &&
      c.tagName === "a" &&
      /^fn-?\d+$/i.test(String(c.properties?.id || "")),
  );
  if (aIdx < 0) return;
  const a = children[aIdx];
  const numText = (a.children?.find?.((c) => c.type === "text")?.value || "").trim();
  const num = Number.parseInt(numText, 10);
  if (!Number.isFinite(num)) return;

  // Collect trailing nodes after the anchor to form the footnote body text
  const trailing = children.slice(aIdx + 1);
  // Remove a purely-empty spacer like "" or ":" (but keep real text)
  while (
    trailing.length &&
    trailing[0].type === "text" &&
    /^\s*:?\s*$/.test(String(trailing[0].value || ""))
  ) {
    trailing.shift();
  }

  const footnotePara = {
    type: "element",
    tagName: "p",
    properties: {},
    children: [
      ...trailing,
      {
        type: "text",
        value: " ",
      },
      {
        type: "element",
        tagName: "a",
        properties: {
          href: `#user-content-fnref-${num}`,
          "data-footnote-backref": "",
          "aria-label": `Back to reference ${num}`,
          className: ["data-footnote-backref"],
        },
        children: [{ type: "text", value: "↩" }],
      },
    ],
  };

  const ol = {
    type: "element",
    tagName: "ol",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "li",
        properties: { id: `user-content-fn-${num}` },
        children: [footnotePara],
      },
    ],
  };

  const section = {
    type: "element",
    tagName: "section",
    properties: { className: ["footnotes"], "data-footnotes": "" },
    children: [
      {
        type: "element",
        tagName: "h2",
        properties: { className: ["sr-only"], id: "footnote-label" },
        children: [{ type: "text", value: "Footnotes" }],
      },
      ol,
    ],
  };

  try {
    targetParent.children.splice(targetIndex, 1, section);
  } catch (e) {
    if (DEBUG) {
      try {
        console.warn("[rehype-typst-footnotes] failed to replace footnotes", e);
      } catch {}
    }
  }
}

export function rehypeTypstFootnotes() {
  return function transformer(tree) {
    const DEBUG = (() => {
      try {
        return String(process?.env?.TYPST_FOOT_DEBUG || "") === "1";
      } catch {
        return false;
      }
    })();
    if (DEBUG) {
      try {
        console.log("[rehype-typst-footnotes] run transformer");
      } catch {}
    }
    let pLogged = 0;
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.type === "element" && node.tagName === "p") {
        const textFull = (node.children || [])
          .map((c) => (c.type === "text" ? c.value : c.tagName ? `<${c.tagName}>` : ""))
          .join("");
        if (DEBUG) {
          if (/Footnotes/i.test(textFull)) {
            try {
              console.log("[rehype-typst-footnotes] p contains Footnotes:", textFull.slice(0, 160));
            } catch {}
          } else if (pLogged < 3) {
            try {
              console.log("[rehype-typst-footnotes] p:", textFull.slice(0, 80));
            } catch {}
            pLogged++;
          }
        }
      }
      // Direct match on a paragraph that begins with "Footnotes:" pattern
      if (isFootnoteParagraph(node)) {
        transformFootnoteNode(node, index, parent, DEBUG);
      } else if (
        node.type === "element" &&
        node.tagName === "a" &&
        typeof node.properties?.id === "string" &&
        /^fn-?\d+$/i.test(node.properties.id)
      ) {
        // Fallback: Typst source sometimes produces just <p>...<a id="fn1">1</a> text...</p> without a leading text node
        // Find the parent paragraph to transform
        const p = parent.tagName === "p" ? parent : null;
        if (!p) return;
        const parentOfP = parent.parent || parent;
        const indexOfP = parentOfP.children?.indexOf?.(p);
        if (typeof indexOfP !== "number" || indexOfP < 0) return;
        transformFootnoteNode(p, indexOfP, parentOfP, DEBUG);
      }
    });
  };
}
