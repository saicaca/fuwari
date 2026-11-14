import fs from "node:fs";
import path from "node:path";

export function getPagefindVersion() {
	const pkg = JSON.parse(
		fs.readFileSync(path.resolve("node_modules/pagefind/package.json"), "utf8"),
	);
	return pkg.version;
}
