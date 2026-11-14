import fs from "node:fs";
import path from "node:path";
import { getPagefindVersion } from "./pagefind-version.mjs";

const version = getPagefindVersion();
const dist = path.resolve("dist");
const expectedBase = `/pagefind-${version}/`;
const expectedScript = `${expectedBase}pagefind.js`;
const legacyScript = "/pagefind/pagefind.js";

const failures = [];

if (!fs.existsSync(path.join(dist, `pagefind-${version}`, "pagefind.js"))) {
	failures.push(
		`missing ${path.join("dist", `pagefind-${version}`, "pagefind.js")}`,
	);
}
if (
	!fs.existsSync(path.join(dist, `pagefind-${version}`, "pagefind-entry.json"))
) {
	failures.push(
		`missing ${path.join("dist", `pagefind-${version}`, "pagefind-entry.json")}`,
	);
}
if (fs.existsSync(path.join(dist, "pagefind"))) {
	failures.push("legacy dist/pagefind directory still exists");
}

const htmlFiles = fs
	.readdirSync(dist, { recursive: true })
	.filter((file) => file.endsWith(".html"));

let references = 0;
for (const file of htmlFiles) {
	const content = fs.readFileSync(path.join(dist, file), "utf8");
	if (!content.includes("pagefind")) continue;
	references += 1;
	if (!content.includes(expectedScript)) {
		failures.push(`${file} does not reference ${expectedScript}`);
	}
	if (content.includes(legacyScript)) {
		failures.push(`${file} still references ${legacyScript}`);
	}
	if (!content.includes(expectedBase)) {
		failures.push(
			`${file} does not pass ${expectedBase} as the Pagefind base path`,
		);
	}
}

if (references === 0) {
	failures.push("no generated page references Pagefind");
}

if (failures.length > 0) {
	console.error(failures.join("\n"));
	process.exit(1);
}

console.log(
	`OK: ${references} page(s) reference Pagefind ${version} under ${expectedBase}`,
);
