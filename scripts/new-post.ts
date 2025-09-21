/**
 * Create a new post file with front‑matter (Deno + TypeScript).
 *
 * Usage:
 *   deno run -A scripts/new-post.ts <filename>
 *   # If no extension is provided, .md will be added.
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

function hasMarkdownExt(name: string): boolean {
  const ext = extname(name).toLowerCase();
  return ext === ".md" || ext === ".mdx";
}

const args = [...Deno.args];

if (args.length === 0) {
  console.error(
    "Error: No filename argument provided\nUsage: deno run -A scripts/new-post.ts <filename>",
  );
  Deno.exit(1);
}

const rawName = args[0];
let fileName = rawName;
if (!hasMarkdownExt(fileName)) fileName += ".md";

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

const content =
  "---\n" +
  `title: ${rawName}\n` +
  `published: ${getDate()}\n` +
  `description: ''\n` +
  `image: ''\n` +
  "tags: []\n" +
  `category: ''\n` +
  "draft: false \n" +
  `lang: ''\n` +
  "---\n";

await Deno.writeTextFile(fullPath, content);

console.log(`Post ${fullPath} created`);
