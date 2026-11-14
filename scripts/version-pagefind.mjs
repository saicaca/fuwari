import fs from "node:fs";
import path from "node:path";
import { getPagefindVersion } from "./pagefind-version.mjs";

const version = getPagefindVersion();
const source = path.resolve("dist", "pagefind");
const target = path.resolve("dist", `pagefind-${version}`);

if (!fs.existsSync(path.join(source, "pagefind.js"))) {
	console.error(`Pagefind output not found at ${source}. Run pagefind first.`);
	process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.renameSync(source, target);

console.log(
	`Moved Pagefind ${version} output to ${path.relative(process.cwd(), target)}`,
);
