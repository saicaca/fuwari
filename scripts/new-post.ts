/**
 * Create a new post file with front‑matter (Deno + TypeScript).
 *
 * Usage:
 *   deno run -A scripts/new-post.ts <filename>
 *   # If no extension is provided, .html.typ will be added.
 */

// Prefer import-map alias from deno.json for better editor support
import { dirname, extname, join } from "@std/path";

function getDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ensureTypstName(name: string): string {
  const ext = extname(name).toLowerCase();
  if (ext === ".typ") return name;
  if (ext === "") return `${name}.html.typ`;
  if (ext === ".md" || ext === ".mdx") {
    return `${name.slice(0, -ext.length)}.html.typ`;
  }
  // Any other extension -> append .html.typ
  return `${name}.html.typ`;
}

const args = [...Deno.args];

if (args.length === 0) {
  console.error(
    "Error: No filename argument provided\nUsage: deno run -A scripts/new-post.ts <filename>",
  );
  Deno.exit(1);
}

const rawName = args[0];
const fileName = ensureTypstName(rawName);

const targetDir = "./src/content/posts/";
const fullPath = join(targetDir, fileName);

// Check if file exists
try {
  await Deno.lstat(fullPath);
  console.error(`Error: File ${fullPath} already exists`);
  Deno.exit(1);
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) throw err;
}

// Ensure directory exists (recursive for nested paths)
await Deno.mkdir(dirname(fullPath), { recursive: true });

const content = `//# New Typst post for Fuwari (HTML target)\n#let desc = [Replace this with a short description]\n#metadata((\n  title: "${rawName}",\n  published: "${getDate()}",\n  description: desc,\n  image: "",\n  tags: (),\n  category: "",\n  draft: false,\n  lang: "",\n),)<frontmatter>\n\n= ${rawName}\n\nYour content here.\n`;

await Deno.writeTextFile(fullPath, content);

console.log(`Post ${fullPath} created`);
