import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

export function pathsEqual(path1: string, path2: string): boolean {
  const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
  const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
  return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
  const joined = parts.join("/");
  return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
  return url(`/posts/${slug}/`);
}

export function getTagUrl(tag: string): string {
  if (!tag) return url("/archive/");
  return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`);
}

export function getCategoryUrl(category: string | null): string {
  if (
    !category ||
    category.trim() === "" ||
    category.trim().toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase()
  ) {
    return url("/archive/?uncategorized=true");
  }
  return url(`/archive/?category=${encodeURIComponent(category.trim())}`);
}

export function getDir(path: string): string {
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex < 0) {
    return ""; // top-level file has no subdir
  }
  return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string): string {
  return joinUrl("", import.meta.env.BASE_URL, path);
}

// Derive content base path (e.g., for images) from an entry id and optional filePath.
// Handles Windows paths and nested posts like content/posts/foo/index.typ
export function deriveContentBasePath(entryId: string, filePath?: string): string {
  if (!filePath || typeof filePath !== "string") {
    const slash = entryId.lastIndexOf("/");
    const dir = slash >= 0 ? entryId.slice(0, slash + 1) : `${entryId}/`;
    return `content/posts/${dir}`;
  }
  const norm = filePath.replace(/\\\\/g, "/");
  let idx = norm.lastIndexOf("/src/");
  let cut = "/src/".length;
  if (idx === -1) {
    idx = norm.indexOf("src/");
    cut = "src/".length;
  }
  const rel = idx >= 0 ? norm.slice(idx + cut) : norm; // content/posts/.../index.*
  const dir = rel.slice(0, rel.lastIndexOf("/") + 1);
  return dir;
}
