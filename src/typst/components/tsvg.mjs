import { h } from "hastscript";
import {
  deterministicId,
  getCompiler,
  makeInlineDocElements,
  svgAddClass,
  toBase64,
} from "../common.mjs";

function extractText(node) {
  let out = "";
  if (!node) return out;
  const walk = (n) => {
    if (!n) return;
    if (typeof n === "string") {
      out += n;
      return;
    }
    if (n.type === "text") {
      out += n.value || "";
      return;
    }
    if (Array.isArray(n.children)) {
      for (const c of n.children) walk(c);
      if (n.tagName && ["p", "div", "pre", "code", "section", "br"].includes(n.tagName)) {
        out += "\n";
      }
    }
  };
  walk(node);
  return out.replace(/\r?\n\s*\r?\n/g, "\n\n").trim();
}

/**
 * <tsvg> component: compile inline Typst content to SVG and embed.
 *
 * Usage in Typst HTML (.html.typ):
 *   #html.elem("tsvg")[ $ a^2 + b^2 = c^2 $ ]
 *   #html.elem("tsvg", attrs: (size: "2em", embed: "inline"))[ $ E = mc^2 $ ]
 *   #html.elem("tsvg", attrs: (embed: "img", alt: "formula"))[ $ ... $ ]
 *
 * Supported attributes:
 *   - code: string (alternative to children)
 *   - size: CSS height for the SVG (e.g., "1.6em"). Defaults to 2em if omitted.
 *   - embed: "inline" (default) or "img" (base64 <img>)
 *   - class: extra class on holder/img
 *   - alt: alt text if using <img>
 *   - plain: override plain text for clipboard copy
 */
export function TypstSvgComponent(properties, children) {
  try {
    const props = properties || {};
    let code = typeof props.code === "string" && props.code.trim() ? props.code : "";
    if (!code) {
      // Extract Typst code from children if no explicit code attr
      const fake = { type: "root", children: Array.isArray(children) ? children : [] };
      code = extractText(fake);
    }
    if (!code || !code.trim()) {
      return h("span", { class: "hidden" }, "tsvg: empty code");
    }
    const trimmed = String(code).trim();

    const $typ = getCompiler();
    const mainFileContent = `${trimmed}\n`;
    const res = $typ.compile({ mainFileContent });
    if (!res.result) {
      res.printDiagnostics?.();
      return h("span", { class: "hidden" }, "Typst compile error");
    }
    let svg = $typ.svg(res.result);

    // Normalize class to match <tfile> behavior
    const combinedClass = `typst-doc inline-doc${props.class ? ` ${props.class}` : ""}`;
    svg = svgAddClass(svg, combinedClass);

    const wantInline = (props.embed ?? "inline") === "inline";
    if (!wantInline) {
      const b64 = toBase64(svg);
      return h("img", {
        class: props.class ? `typst-doc ${props.class}` : "typst-doc",
        alt: props.alt || trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : ""),
        src: `data:image/svg+xml;base64,${b64}`,
        decoding: "async",
        loading: "lazy",
      });
    }

    const id = deterministicId("TD", svg);
    const [holder, script] = makeInlineDocElements({
      id,
      className: props.class ? `typst-doc ${props.class}` : "typst-doc",
      svg,
      tag: "div",
    });
    return [holder, script];
  } catch (err) {
    try {
      console.warn("[tsvg] Compile error:", err);
    } catch (_e) {
      /* ignore logging errors */
    }
    return h("span", { class: "hidden" }, "Typst compile error");
  }
}
