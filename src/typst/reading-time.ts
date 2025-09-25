// Utilities to compute word count and reading time for Typst content.
// This compiles a Typst entry to HTML (HAST), extracts visible text, and
// computes reading-time. It also follows `<tfile file="...">` references if present.

import path from "node:path";
import process from "node:process";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import type { Element, Nodes as HastNode, Parents, Properties, Text } from "hast";
import type { ReadTimeResults } from "reading-time";
import getReadingTime from "reading-time";
import { getEnvFlag } from "../utils/env.ts";

function isTextNode(n: HastNode): n is Text {
  return (n as Partial<Text>)?.type === "text";
}
function isElementNode(n: HastNode): n is Element {
  return (n as Partial<Element>)?.type === "element";
}
function hasChildren(n: HastNode): n is Parents {
  return Array.isArray((n as Partial<Parents>)?.children);
}

let _compiler: NodeCompiler | undefined;
const STATS_DEBUG: boolean = getEnvFlag("TYPST_STATS_DEBUG");
const _textCache = new Map<string, string>(); // absolute filePath -> extracted text

// Clear cache when in debug mode to force recalculation
function clearCacheIfDebug() {
  if (getEnvFlag("TYPST_STATS_DEBUG")) {
    _textCache.clear();
  }
}
function ensureCompiler(): NodeCompiler {
  if (!_compiler) {
    _compiler = NodeCompiler.create({ workspace: "./" });
  }
  return _compiler;
}

function gatherTextAndTfiles(hast: HastNode): {
  text: string;
  tfiles: string[];
} {
  const tfiles: string[] = [];
  function walk(node: HastNode): string {
    if (!node) return "";
    if (isTextNode(node)) return String(node.value ?? "");
    if (isElementNode(node)) {
      const tag = String(node.tagName || "").toLowerCase();
      if (tag === "script" || tag === "style") return "";
      if (tag === "tfile") {
        const p = (node.properties || {}) as Properties & Record<string, unknown>;
        const file = p?.file;
        if (typeof file === "string") tfiles.push(file);
      }
      let s = "";
      const children = Array.isArray(node.children) ? node.children : [];
      for (const c of children) s += ` ${walk(c as unknown as HastNode)}`;
      return s;
    }
    if (hasChildren(node)) return (node.children as unknown as HastNode[]).map(walk).join(" ");
    return "";
  }
  const text = walk(hast).replace(/\s+/g, " ").trim();
  return { text, tfiles };
}

function stripSvgText(svg: string): string {
  // very lightweight extraction of textual content inside <text>…</text>
  try {
    const out: string[] = [];
    const re = /<text\b[^>]*>([\s\S]*?)<\/text>/gi;
    let m: RegExpExecArray | null = re.exec(svg);
    while (m) {
      const raw = m[1]
        .replace(/<[^>]+>/g, " ") // drop nested tspan etc.
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

      // Skip very short text (likely technical symbols) and mathematical symbols
      if (raw && raw.length > 2 && !raw.match(/^[0-9\-+=*/^().,\s]*$/)) {
        out.push(raw);
      }
      m = re.exec(svg);
    }
    return out.join(" ");
  } catch {
    return "";
  }
}

async function collectTextFromFile(
  filePath: string,
  visited: Set<string>,
  depth = 0,
): Promise<string> {
  const abs = path.resolve(process.cwd(), filePath);
  if (visited.has(abs)) return "";
  visited.add(abs);
  const cached = _textCache.get(abs);
  if (cached) return cached;

  const $typ = ensureCompiler();
  let merged = "";
  try {
    const res = $typ.compileHtml({ mainFilePath: abs });
    const html = res?.result ? $typ.tryHtml(res.result) : undefined;
    type TryHtmlResult = { result?: { hast?: () => unknown } };
    const maybe = html as TryHtmlResult | undefined;
    const hast =
      typeof maybe?.result?.hast === "function"
        ? (maybe.result.hast() as unknown as HastNode)
        : undefined;
    if (hast) {
      const { text, tfiles } = gatherTextAndTfiles(hast);
      merged += text ? ` ${text}` : "";
      if (Array.isArray(tfiles) && tfiles.length && depth < 3) {
        for (const p of tfiles) {
          try {
            // Skip certain file types that shouldn't contribute to word count
            const ext = path.extname(p).toLowerCase();
            if ([".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif"].includes(ext)) {
              continue;
            }

            // For .typ files, only include if they seem to be content files
            if (ext === ".typ") {
              // Skip files that are primarily for SVG generation (contain math/diagrams)
              const fileName = path.basename(p, ext);
              if (
                fileName.includes(".svg") ||
                fileName.includes("math") ||
                fileName.includes("diagram")
              ) {
                continue;
              }
            }

            const childText = await collectTextFromFile(p, visited, depth + 1);
            // Limit the contribution of each included file to prevent inflation
            if (childText && childText.length > 10) {
              const trimmedChild =
                childText.length > 500 ? `${childText.slice(0, 500)}...` : childText;
              merged += ` ${trimmedChild}`;
            }
          } catch {
            // ignore: failing a referenced file should not abort collection
          }
        }
      }
    }
  } catch {
    // ignore: the HTML pass is a best-effort
  }

  // If we still have too little text, try compiling to SVG and strip text nodes
  if (!merged.trim()) {
    try {
      const res = ensureCompiler().compile({ mainFilePath: abs });
      if (res?.result) {
        const svg = ensureCompiler().svg(res.result);
        const t = stripSvgText(svg);
        if (t) merged += ` ${t}`;
      }
    } catch {
      // ignore: optional fallback
    }
  }

  // Final fallback: extract rough text directly from Typst source (handles SVG with outlines)
  if (!merged.trim()) {
    try {
      const fs = await import("node:fs");
      const src = fs.readFileSync(abs, "utf-8");
      let s = src;

      // Remove comments first
      s = s.replace(/^\s*\/\/.*$/gm, " ");

      // Remove code blocks (preserve content but remove markup)
      s = s.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => ` ${code} `);

      // Remove frontmatter metadata block
      s = s.replace(/<frontmatter>[\s\S]*?<\/frontmatter>/g, " ");

      // Remove imports and complex Typst directives
      s = s.replace(/^\s*#import\s+.*$/gm, " ");
      s = s.replace(/^\s*#let\s+.*$/gm, " ");
      s = s.replace(/^\s*#set\s+.*$/gm, " ");
      s = s.replace(/^\s*#show\s+.*$/gm, " ");
      s = s.replace(/#metadata\s*\([\s\S]*?\)\s*<frontmatter>/g, " ");

      // Remove function calls and directives but preserve content in brackets
      s = s.replace(/#[a-zA-Z_][\w-]*\s*\([^)]*\)\s*\[([^\]]*)\]/g, (_, content) => ` ${content} `);
      s = s.replace(/#[a-zA-Z_][\w-]*\s*\([^)]*\)/g, " ");
      s = s.replace(/#[a-zA-Z_][\w-]*\s+/g, " ");

      // Clean up brackets but preserve text content inside them
      s = s.replace(/\[([^\]]*)\]/g, (_, content) => ` ${content} `);
      s = s.replace(/[{}()]/g, " ");

      // Clean up multiple spaces
      s = s.replace(/\s+/g, " ").trim();

      // Additional filtering for very short or suspicious content
      if (s.length < 10) {
        merged = "";
      } else {
        merged = s;
        if (merged && STATS_DEBUG) {
          try {
            console.log("[typst-reading-time:trace] source-fallback", abs, "len", merged.length);
          } catch (_err) {
            // ignore logging failures in non-TTY SSR environments
          }
        }
      }
    } catch {
      // ignore: fs or parsing fallback errors
    }
  }

  merged = merged.replace(/\s+/g, " ").trim();
  _textCache.set(abs, merged);
  if (STATS_DEBUG) {
    try {
      console.log("[typst-reading-time:trace] file", abs, "len", merged.length, "depth", depth);
    } catch (_err) {
      // ignore logging failures in non-TTY SSR environments
    }
  }
  return merged;
}

export async function getTypstReadingStats(
  mainFilePath: string,
): Promise<{ words: number; minutes: number } | null> {
  try {
    clearCacheIfDebug();
    const visited = new Set<string>();
    const text = await collectTextFromFile(mainFilePath, visited, 0);
    const rt: ReadTimeResults = getReadingTime(text || "");
    let words = rt.words ?? 0;
    let minutes = Math.max(1, Math.round(rt.minutes ?? 0));

    // Sanity check: if word count is suspiciously high, apply conservative limits
    if (words > 10000) {
      // This is likely due to including too much technical content
      // Apply a more conservative estimate based on file size and content type
      try {
        const fs = await import("node:fs");
        const stats = fs.statSync(path.resolve(process.cwd(), mainFilePath));
        const fileSizeKB = stats.size / 1024;

        // Estimate: typical blog post is 5-10 words per KB of source
        const estimatedWords = Math.max(100, Math.min(2000, Math.round(fileSizeKB * 8)));
        words = estimatedWords;
        minutes = Math.max(1, Math.round(words / 200)); // 200 words per minute reading speed

        if (STATS_DEBUG) {
          try {
            console.log(
              `[typst-reading-time] Applied sanity limit: ${words} words (was ${rt.words})`,
            );
          } catch (_err) {
            // ignore logging failures
          }
        }
      } catch {
        // fallback if file stats fail
        words = 500;
        minutes = 3;
      }
    }

    if (STATS_DEBUG) {
      try {
        console.log("[typst-reading-time]", {
          mainFilePath,
          words,
          minutes,
          textLen: text?.length,
        });
      } catch (_err) {
        // ignore logging failures in non-TTY SSR environments
      }
    }
    return { words, minutes };
  } catch (e) {
    if (STATS_DEBUG) {
      try {
        console.warn("[typst-reading-time] failed", mainFilePath, e);
      } catch (_err) {
        // ignore logging failures in non-TTY SSR environments
      }
    }
    return null;
  }
}

export async function extractTypstText(mainFilePath: string): Promise<string> {
  try {
    const visited = new Set<string>();
    const text = await collectTextFromFile(mainFilePath, visited, 0);
    return text || "";
  } catch {
    return "";
  }
}

export async function extractTypstExcerpt(mainFilePath: string): Promise<string> {
  function firstParagraph(node: HastNode): string | null {
    if (!node) return null;
    if (isElementNode(node) && (node.tagName || "").toLowerCase() === "p") {
      // Collect text from this paragraph only
      const children = Array.isArray(node.children) ? node.children : [];
      let s = "";
      for (const c of children) {
        const nodeC = c as unknown as HastNode;
        if (isTextNode(nodeC)) s += String((nodeC as Text).value ?? "");
        else if (isElementNode(nodeC)) {
          const cc = nodeC as unknown as Element;
          const grand = Array.isArray(cc.children) ? cc.children : [];
          for (const g of grand) {
            const nodeG = g as unknown as HastNode;
            if (isTextNode(nodeG)) s += String((nodeG as Text).value ?? "");
          }
        }
      }
      return s.replace(/\s+/g, " ").trim();
    }
    if (hasChildren(node)) {
      const cs = (node as Parents).children as unknown as HastNode[];
      for (const c of cs) {
        const found = firstParagraph(c);
        if (found) return found;
      }
    }
    return null;
  }
  try {
    const abs = path.resolve(process.cwd(), mainFilePath);
    const $typ = ensureCompiler();
    const res = $typ.compileHtml({ mainFilePath: abs });
    const html = res?.result ? $typ.tryHtml(res.result) : undefined;
    type TryHtmlResult = { result?: { hast?: () => unknown } };
    const maybe = html as TryHtmlResult | undefined;
    const hast =
      typeof maybe?.result?.hast === "function"
        ? (maybe.result.hast() as unknown as HastNode)
        : undefined;
    if (!hast) return await Promise.resolve("");
    // Wrap in Promise.resolve so this function remains truly async for callers
    return await Promise.resolve(firstParagraph(hast) || "");
  } catch {
    return await Promise.resolve("");
  }
}
