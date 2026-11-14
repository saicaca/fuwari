import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { createRemarkPostLinks } from "../src/plugins/remark-post-links.mjs";

function link(url) {
	return { type: "link", url, children: [] };
}

function run(plugin, source, links) {
	const tree = { type: "root", children: links };
	plugin(tree, { history: [source] });
	return tree.children.map((node) => node.url);
}

async function makePostsDir() {
	const postsDir = await mkdtemp(path.join(os.tmpdir(), "fuwari-post-links-"));
	await writeFile(path.join(postsDir, "A.md"), "");
	await writeFile(path.join(postsDir, "B.md"), "");
	await mkdir(path.join(postsDir, "sub"));
	await writeFile(path.join(postsDir, "sub", "C.md"), "");
	await writeFile(path.join(postsDir, "sub", "index.md"), "");
	return postsDir;
}

test("maps relative post links to their generated post URLs", async () => {
	const postsDir = await makePostsDir();
	const plugin = createRemarkPostLinks({ postsDir });
	const source = pathToFileURL(path.join(postsDir, "A.md"));

	const urls = run(plugin, source, [
		link("B.md"),
		link("sub/C.md"),
		link("sub/index.md"),
		link("B.md#section"),
		link("B.md?preview=1#section"),
	]);

	assert.deepEqual(urls, [
		"/posts/b/",
		"/posts/sub/c/",
		"/posts/sub/",
		"/posts/b/#section",
		"/posts/b/?preview=1#section",
	]);

	await rm(postsDir, { recursive: true, force: true });
});

test("resolves links from nested posts and respects the configured base", async () => {
	const postsDir = await makePostsDir();
	const source = path.join(postsDir, "sub", "C.md");

	const urls = run(
		createRemarkPostLinks({ postsDir, base: "/blog/" }),
		source,
		[link("../B.md"), link("index.md")],
	);

	assert.deepEqual(urls, ["/blog/posts/b/", "/blog/posts/sub/"]);

	await rm(postsDir, { recursive: true, force: true });
});

test("leaves external, absolute, missing and non-markdown links alone", async () => {
	const postsDir = await makePostsDir();
	const plugin = createRemarkPostLinks({ postsDir });
	const source = path.join(postsDir, "A.md");

	const links = [
		link("https://example.com/B.md"),
		link("/posts/B/"),
		link("#section"),
		link("missing.md"),
		link("image.png"),
		link("../outside.md"),
	];
	const urls = run(plugin, source, links);

	assert.deepEqual(
		urls,
		links.map((node) => node.url),
	);

	await rm(postsDir, { recursive: true, force: true });
});

test("does not rewrite links outside the posts collection", async () => {
	const postsDir = await makePostsDir();
	const plugin = createRemarkPostLinks({ postsDir });
	const source = path.join(postsDir, "..", "spec", "about.md");

	const urls = run(plugin, source, [link("../posts/B.md")]);
	assert.deepEqual(urls, ["../posts/B.md"]);

	await rm(postsDir, { recursive: true, force: true });
});
