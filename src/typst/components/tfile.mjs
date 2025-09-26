import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { h } from "hastscript";
import {
  deterministicId,
  getCompiler,
  makeInlineDocElements,
  svgAddClass,
  toBase64,
} from "../common.mjs";

/**
 * <tfile> component: compile another .typ file to SVG and embed.
 *
 * Usage in Typst HTML (.html.typ):
 *   #html.elem("tfile", attrs: (file: "src/content/posts/typst-math.svg.typ"))
 *   #html.elem("tfile", attrs: (file: "...", embed: "inline")) // inline selectable SVG
 */
export function TypstFileComponent(props) {
  try {
    const file = typeof props?.file === "string" ? props.file : undefined;
    if (!file) {
      return h("span", { class: "hidden" }, "tfile: missing 'file' attribute");
    }
    // Resolve file path robustly. Users sometimes pass paths relative to the
    // Typst document location (e.g. "../posts/guide/cover.jpeg") or project root
    // (e.g. "src/content/posts/typst-math.svg.typ"). Try a series of candidates.
    const cwd = process.cwd();
    const candidates = [];
    const norm = String(file).replace(/\\/g, "/");
    if (path.isAbsolute(file)) candidates.push(file);
    // As-is from project root
    candidates.push(path.resolve(cwd, file));
    // If author used paths relative to content roots, try common bases
    candidates.push(path.resolve(cwd, "src", file));
    candidates.push(path.resolve(cwd, "src/content", file));
    candidates.push(path.resolve(cwd, "src/content/posts", file));
    // If path starts with ../, strip leading ../ segments and try under src/content
    if (norm.startsWith("../")) {
      const stripped = norm.replace(/^\.\/+/, "");
      candidates.push(path.resolve(cwd, "src/content", stripped));
    }
    const filePath = candidates.find((p) => {
      try {
        return fs.existsSync(p);
      } catch (_) {
        return false;
      }
    });
    if (!filePath) {
      return h("span", { class: "hidden" }, `tfile: file not found: ${file}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const isTyp = ext === ".typ";
    const _isSvg = ext === ".svg";
    const _isRaster = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif"].includes(ext);
    const mimeOf = (p) => {
      switch (path.extname(p).toLowerCase()) {
        case ".svg":
          return "image/svg+xml";
        case ".png":
          return "image/png";
        case ".jpg":
        case ".jpeg":
          return "image/jpeg";
        case ".gif":
          return "image/gif";
        case ".webp":
          return "image/webp";
        case ".bmp":
          return "image/bmp";
        case ".avif":
          return "image/avif";
        default:
          return "application/octet-stream";
      }
    };

    // Branch by file type
    if (isTyp) {
      const $typ = getCompiler();
      const res = $typ.compile({ mainFilePath: filePath });
      if (!res.result) {
        res.printDiagnostics?.();
        return h("span", { class: "hidden" }, "Typst compile error");
      }

      // Render to SVG and add a recognizable class for styling
      let svg = $typ.svg(res.result);
      const combinedClass = `typst-doc imported-doc${props?.class ? ` ${props.class}` : ""}`;
      svg = svgAddClass(svg, combinedClass);

      const wantInline = (props?.embed ?? "inline") === "inline";
      if (!wantInline) {
        const b64 = toBase64(svg);
        return h("img", {
          class: props?.class ? `typst-doc ${props.class}` : "typst-doc",
          alt: props?.alt || file,
          src: `data:image/svg+xml;base64,${b64}`,
          decoding: "async",
          loading: "lazy",
        });
      }

      // Inline selectable SVG: inject at runtime to avoid raw HTML nodes in HAST
      // Deterministic id from rendered SVG content for stable builds
      const id = deterministicId("TF", svg);
      const [holder, script] = makeInlineDocElements({
        id,
        className: props?.class ? `typst-doc ${props.class}` : "typst-doc",
        svg,
        tag: "div",
      });
      return [holder, script];
    }

    // Non-Typst file: embed as <img> using a data URI for reliability.
    // - For .svg text we base64-encode its content.
    // - For raster formats read as binary and base64 encode.
    try {
      const buf = fs.readFileSync(filePath);
      const b64 = Buffer.from(buf).toString("base64");
      const mime = mimeOf(filePath);
      return h("img", {
        class: props?.class ? `typst-asset ${props.class}` : "typst-asset",
        alt: props?.alt || path.basename(filePath),
        src: `data:${mime};base64,${b64}`,
        decoding: "async",
        loading: "lazy",
      });
    } catch (e) {
      console.warn("[tfile] Failed to read asset:", filePath, e);
      return h("span", { class: "hidden" }, "tfile: failed to read asset");
    }
  } catch (err) {
    console.warn("[tfile] Compile error:", err);
    return h("span", { class: "hidden" }, "Typst compile error");
  }
}
