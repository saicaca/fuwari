// Convert Typst frontmatter description (might be inline content/sequence)
// into a plain string for cards/meta/RSS. Keep it intentionally small.

function toText(node: unknown): string {
  if (node == null) return "";
  const t = typeof node;
  if (t === "string" || t === "number" || t === "boolean") return String(node);
  if (Array.isArray(node)) return node.map((n) => toText(n)).join(" ");
  if (t === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.text === "string") return o.text;
    if (typeof o.value === "string") return o.value;
    const ch = o.children;
    if (Array.isArray(ch)) return (ch as unknown[]).map((c) => toText(c)).join(" ");
  }
  return "";
}

export function coerceDescriptionToString(desc: unknown): string {
  return toText(desc).replace(/\s+/g, " ").trim();
}
