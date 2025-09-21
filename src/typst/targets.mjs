// Centralized Typst integration config: target resolution & options
// Helps keep astro.config.mjs concise and maintainable.

/**
 * Decide whether a .typ file renders to HTML or SVG.
 * Rules:
 *  - *.svg.typ or a path segment "/svg/" => svg (best for complex math)
 *  - *.html.typ or a path segment "/html/" => html (enables rehype plugins & components)
 *  - Files in src/content/posts default to svg (robust layout)
 *  - Everything else defaults to html
 */
export function typstTarget(p) {
  const s = String(p || "");
  const isPost = /[\\/]src[\\/]content[\\/]posts[\\/].*\\.typ$/.test(s);
  if (s.endsWith(".svg.typ") || s.includes("/svg/")) return "svg";
  if (s.endsWith(".html.typ") || s.includes("/html/")) return "html";
  if (isPost) return "svg";
  return "html";
}

export const typstOptions = { remPx: 14 };
