import process from "node:process";
import { ExpressiveCodeEngine } from "@expressive-code/core";
import { loadShikiTheme } from "@expressive-code/plugin-shiki";
import { h } from "hastscript";
import { visit } from "unist-util-visit";
import { expressiveCodeConfig } from "../config.ts";
import {
  ecDefaultProps,
  ecEnginePlugins,
  ecStyleOverrides,
} from "./expressive-code/shared-config.ts";

let enginePromise;
let sharedAssetsPromise;
const DEBUG = (() => {
  try {
    // Prefer explicit env; tolerate absence quietly
    return String(process?.env?.TYPST_EC_DEBUG || "") === "1";
  } catch {
    return false;
  }
})();
function ensureEngine() {
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    const themeObj = await loadShikiTheme(expressiveCodeConfig.theme);
    const eng = new ExpressiveCodeEngine({
      themes: [themeObj, themeObj],
      plugins: ecEnginePlugins(),
      defaultProps: ecDefaultProps,
      styleOverrides: ecStyleOverrides,
    });
    return eng;
  })();
  return enginePromise;
}

function ensureSharedAssets(engine) {
  if (sharedAssetsPromise) return sharedAssetsPromise;
  sharedAssetsPromise = (async () => {
    try {
      const [baseStyles, themeStyles, jsModules] = await Promise.all([
        engine.getBaseStyles(),
        engine.getThemeStyles(),
        engine.getJsModules(),
      ]);
      return {
        baseStyles: baseStyles || "",
        themeStyles: themeStyles || "",
        jsModules: Array.isArray(jsModules) ? jsModules : [],
      };
    } catch (err) {
      try {
        console.warn("[rehype-typst-ec] failed to load Expressive Code assets", err);
      } catch {
        // ignore: logging failures should not break rendering
      }
      return { baseStyles: "", themeStyles: "", jsModules: [] };
    }
  })();
  return sharedAssetsPromise;
}

function coerceBoolean(value) {
  if (typeof value !== "string") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function coerceNumber(value) {
  if (typeof value !== "string") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseJsonLike(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

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
      // Paragraph separation: add newline between block children
      if (n.tagName && ["p", "div", "pre", "code", "section", "br"].includes(n.tagName)) {
        out += "\n";
      }
    }
  };
  walk(node);
  return out.replace(/\r?\n\s*\r?\n/g, "\n\n").trim();
}

function decodeAnsiShorthand(str) {
  if (typeof str !== "string") return str;
  try {
    // Replace textual escape sequences with actual ESC (\x1b)
    // Handles both "\\x1b" and "\\u001b" that may come from Typst attribute strings
    return str.replace(/\\x1b/gi, "\x1b").replace(/\\u001b/gi, "\x1b");
  } catch {
    return str;
  }
}

export function rehypeTypstEc() {
  return async function transformer(tree) {
    if (!tree || typeof tree !== "object") return;
    if (DEBUG) {
      try {
        console.log("[rehype-typst-ec] run transformer");
      } catch (_err) {
        // ignore logging failures in non-TTY SSR environments
      }
    }
    const ec = await ensureEngine();
    const nodesToReplace = [];
    let firstEcContainer;
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return;
      if (String(node.tagName).toLowerCase() !== "ec") return;
      if (DEBUG) {
        try {
          const props = node.properties || {};
          if (props && (props.showLineNumbers || props.startLineNumber)) {
            const preview = Array.isArray(node.children)
              ? node.children
                  .map((c) => (c?.type === "text" ? c.value : c?.tagName ? `<${c.tagName}>` : ""))
                  .join("")
              : "";
            console.log(
              "[rehype-typst-ec] ec node props=%j childPreview=%j",
              props,
              preview.slice(0, 120),
            );
          }
        } catch (_err) {
          // ignore logging failures in non-TTY SSR environments
        }
      }
      nodesToReplace.push({ node, index, parent });
    });

    if (!nodesToReplace.length) return;

    const { baseStyles, themeStyles, jsModules } = await ensureSharedAssets(ec);
    const styleSet = new Set();
    const scriptSet = new Set();
    if (baseStyles) styleSet.add(baseStyles);
    if (themeStyles) styleSet.add(themeStyles);
    if (Array.isArray(jsModules)) {
      for (const mod of jsModules) {
        if (typeof mod === "string" && mod.trim()) scriptSet.add(mod);
      }
    }

    // Only add a tiny fallback if baseStyles/themeStyles could not be loaded
    if (!baseStyles?.trim() && !themeStyles?.trim()) {
      const fallbackFrameCss = `
        .expressive-code .frame{position:relative;border-radius:var(--ec-brdRad);overflow:hidden;background:var(--ec-frm-edBg)}
        .expressive-code .frame.is-terminal{background:var(--ec-frm-trmBg)}
        .expressive-code .frame .header{display:flex;align-items:center;gap:.5rem;min-height:2.25rem;padding:.5rem 1rem;color:#fff;background:var(--ec-frm-edTabBarBg);border-bottom:1px solid var(--ec-frm-edTabBarBrdBtmCol)}
        .expressive-code .frame.is-terminal .header{background:var(--ec-frm-trmTtbBg);border-bottom:1px solid var(--ec-frm-trmTtbBrdBtmCol)}
        .expressive-code .frame .header .title{font-weight:600}
        .expressive-code .frame.has-title pre{border-top-left-radius:0;border-top-right-radius:0}
      `;
      styleSet.add(fallbackFrameCss);
    }

    let replacedCount = 0;
    for (const { node, index, parent } of nodesToReplace) {
      try {
        const props = node.properties || {};
        const lang = typeof props.lang === "string" ? props.lang : "text";
        const blockProps = {};
        const attrMap = {
          title: (value) => (typeof value === "string" && value.trim() ? value : undefined),
          frame: (value) => (typeof value === "string" && value.trim() ? value : undefined),
          code: (value) => (typeof value === "string" ? value : undefined),
          wrap: (value) => coerceBoolean(value),
          showLineNumbers: (value) => coerceBoolean(value),
          startLineNumber: (value) => coerceNumber(value),
          preserveIndent: (value) => coerceBoolean(value),
          hangingIndent: (value) => coerceBoolean(value),
          collapsePreserveIndent: (value) => coerceBoolean(value),
          collapseStyle: (value) => (typeof value === "string" && value.trim() ? value : undefined),
          collapse: (value) => (typeof value === "string" && value.trim() ? value : undefined),
          // Text & line markers (accept simple strings or JSON-like maps)
          mark: (value) => parseJsonLike(value) ?? (value?.trim() || undefined),
          ins: (value) => parseJsonLike(value) ?? (value?.trim() || undefined),
          del: (value) => parseJsonLike(value) ?? (value?.trim() || undefined),
        };
        for (const [key, getter] of Object.entries(attrMap)) {
          const raw = props[key];
          if (raw == null) continue;
          const resolved = getter(String(raw));
          if (resolved !== undefined) blockProps[key] = resolved;
        }
        let code =
          typeof blockProps.code === "string" && blockProps.code.length
            ? blockProps.code
            : extractText(node);
        // Debug: help diagnose missing line breaks when Typst content is provided via children
        if (DEBUG) {
          try {
            const dbg = String(code);
            if (
              !blockProps.code &&
              (/Greetings from line 5|Greetings from line 2/.test(dbg) ||
                typeof props?.startLineNumber !== "undefined")
            ) {
              console.log(
                "[rehype-typst-ec] extracted code (len=%d) for lang=%s props=%j => %j",
                dbg.length,
                lang,
                props,
                dbg,
              );
            }
          } catch (_err) {
            // ignore logging failures in non-TTY SSR environments
          }
        }
        if (typeof code === "string") {
          // If ANSI content was provided using textual escapes, normalize to ESC
          // Always run the replacement to be safe
          code = decodeAnsiShorthand(code);
        }
        const { renderedGroupAst, renderedGroupContents, styles } = await ec.render({
          code,
          language: lang,
          props: blockProps,
        });
        const ecBlockProps = renderedGroupContents?.[0]?.codeBlock?.props ?? blockProps;
        const frameType =
          typeof ecBlockProps.frame === "string" && ecBlockProps.frame.trim()
            ? ecBlockProps.frame.trim()
            : "code";
        const finalTitle =
          typeof ecBlockProps.title === "string" && ecBlockProps.title.trim()
            ? ecBlockProps.title
            : undefined;
        if (styles?.size) {
          for (const css of styles) {
            if (typeof css === "string" && css.trim()) styleSet.add(css);
          }
        }

        if (renderedGroupAst && renderedGroupAst.tagName === "div") {
          const root = renderedGroupAst;
          const children = Array.isArray(root.children) ? root.children : [];
          const hasFigure = children.some((child) => child?.tagName === "figure");
          if (!hasFigure) {
            const isBlockChild = (child) =>
              child?.type === "element" && (child.tagName === "pre" || child.tagName === "button");
            let figureInserted = false;
            const rebuiltChildren = [];
            for (let idx = 0; idx < children.length; idx++) {
              const child = children[idx];
              if (!figureInserted && isBlockChild(child)) {
                const blockNodes = [];
                let cursor = idx;
                while (cursor < children.length && isBlockChild(children[cursor])) {
                  blockNodes.push(children[cursor]);
                  cursor++;
                }
                const figureClasses = ["frame"];
                if (frameType === "terminal") figureClasses.push("is-terminal");
                if (finalTitle) figureClasses.push("has-title");
                const figcaptionChildren = [];
                if (finalTitle) {
                  figcaptionChildren.push(h("span", { class: "title" }, String(finalTitle)));
                } else if (frameType === "terminal") {
                  figcaptionChildren.push(h("span", { class: "sr-only" }, "Terminal window"));
                }
                const figcaption = h("figcaption", { class: "header" }, figcaptionChildren);
                const figure = h("figure", { class: figureClasses.join(" ") }, [
                  figcaption,
                  ...blockNodes,
                ]);
                rebuiltChildren.push(figure);
                figureInserted = true;
                idx = cursor - 1;
              } else {
                rebuiltChildren.push(child);
              }
            }
            root.children = rebuiltChildren;
          }
        }

        if (!firstEcContainer) firstEcContainer = renderedGroupAst;
        parent.children.splice(index, 1, renderedGroupAst);
        replacedCount++;
      } catch (_err) {
        try {
          const code = extractText(node);
          const pre = h("pre", { class: "language-text" }, [h("code", code)]);
          parent.children.splice(index, 1, pre);
        } catch {
          // ignore: replace error fallback should not throw
        }
      }
    }

    if (!replacedCount) return;
    if (!firstEcContainer) return;

    const styleContent = Array.from(styleSet)
      .map((css) => (typeof css === "string" ? css.trim() : ""))
      .filter((css) => css.length)
      .join("\n");
    const scriptContent = Array.from(scriptSet)
      .map((js) => (typeof js === "string" ? js.trim() : ""))
      .filter((js) => js.length)
      .join("\n");

    if (!styleContent && !scriptContent) return;

    if (!Array.isArray(firstEcContainer.children)) firstEcContainer.children = [];

    const assetNodes = [];
    if (styleContent) {
      assetNodes.push(h("style", { type: "text/css", "data-typst-ec": "inline" }, styleContent));
    }
    if (scriptContent) {
      assetNodes.push(h("script", { type: "module", "data-typst-ec": "inline" }, scriptContent));
    }

    if (assetNodes.length) {
      firstEcContainer.children = [...assetNodes, ...firstEcContainer.children];
    }
  };
}
