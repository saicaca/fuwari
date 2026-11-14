import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slug as slugify } from "github-slugger";
import { visit } from "unist-util-visit";

const POST_EXTENSION = /\.mdx?$/i;
const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const DEFAULT_POSTS_DIR = fileURLToPath(
	new URL("../content/posts", import.meta.url),
);

function resolveSourcePath(file) {
	const sourcePath = file.history?.[0] ?? file.path;
	if (!sourcePath) {
		return undefined;
	}
	if (sourcePath instanceof URL) {
		return fileURLToPath(sourcePath);
	}
	return sourcePath.startsWith("file:")
		? fileURLToPath(sourcePath)
		: path.resolve(sourcePath);
}

function toPostSlug(postsDir, filePath) {
	const relative = path.relative(postsDir, filePath).replace(/\\/g, "/");
	if (
		!relative ||
		relative === ".." ||
		relative.startsWith("../") ||
		path.isAbsolute(relative)
	) {
		return undefined;
	}

	const segments = relative
		.replace(POST_EXTENSION, "")
		.split("/")
		.filter(Boolean)
		.map((segment) => slugify(segment));
	const slug = segments.join("/").replace(/\/index$/, "");
	return slug || undefined;
}

function splitUrl(url) {
	const hashIndex = url.indexOf("#");
	const withoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
	const hash = hashIndex === -1 ? "" : url.slice(hashIndex);

	const queryIndex = withoutHash.indexOf("?");
	const pathname =
		queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
	const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);

	return { pathname, query, hash };
}

export function createRemarkPostLinks({
	postsDir = DEFAULT_POSTS_DIR,
	base = "/",
} = {}) {
	const resolvedPostsDir = path.resolve(postsDir);
	const normalizedBase = base.startsWith("/") ? base : `/${base}`;
	const baseUrl = normalizedBase.endsWith("/")
		? normalizedBase
		: `${normalizedBase}/`;

	return (tree, file) => {
		const absoluteSource = resolveSourcePath(file);
		if (!absoluteSource) {
			return;
		}

		if (toPostSlug(resolvedPostsDir, absoluteSource) === undefined) {
			return;
		}

		visit(tree, "link", (node) => {
			const url = node.url;
			if (
				!url ||
				URL_SCHEME.test(url) ||
				url.startsWith("/") ||
				url.startsWith("#")
			) {
				return;
			}

			const { pathname, query, hash } = splitUrl(url);
			if (!POST_EXTENSION.test(pathname)) {
				return;
			}

			let targetPath;
			try {
				targetPath = path.resolve(
					path.dirname(absoluteSource),
					decodeURIComponent(pathname),
				);
			} catch {
				return;
			}

			if (!fs.existsSync(targetPath)) {
				return;
			}

			const slug = toPostSlug(resolvedPostsDir, targetPath);
			if (slug === undefined) {
				return;
			}

			node.url = `${baseUrl}posts/${slug}/${query}${hash}`;
		});
	};
}

export function remarkPostLinks(options) {
	return createRemarkPostLinks(options);
}
