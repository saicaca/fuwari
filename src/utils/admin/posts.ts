import {
	mkdir,
	readdir,
	readFile,
	rmdir,
	unlink,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import type {
	ImportDocNode,
	ImportStatus,
	ImportSyncStrategy,
} from "@/types/admin";
import { readImportDraftMap } from "./drafts";
import { readFrontmatterField } from "./frontmatter";
import { inspectProtectedBlocks } from "./protected-blocks";

export const POSTS_ROOT = path.join(process.cwd(), "src", "content", "posts");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

export interface LocalImportedPost {
	docId: string;
	filePath: string;
	relativePath: string;
	slug: string;
	title: string;
	hash: string;
	updated: string;
	syncStrategy: ImportSyncStrategy;
	protectedBlockState: ReturnType<typeof inspectProtectedBlocks>["state"];
	content: string;
}

export interface LocalImportIndex {
	byDocId: Map<string, LocalImportedPost>;
	byRelativePath: Map<string, LocalImportedPost>;
	draftsByDocId: Awaited<ReturnType<typeof readImportDraftMap>>;
}

export interface WriteImportedPostInput {
	relativePath: string;
	content: string;
	previousRelativePath?: string;
}

function normalizeRelativePath(filePath: string) {
	return path.relative(POSTS_ROOT, filePath).split(path.sep).join("/");
}

function resolveAbsolutePath(relativePath: string) {
	return path.join(POSTS_ROOT, ...relativePath.split("/"));
}

function getSlugFromRelativePath(relativePath: string) {
	const withoutExt = relativePath.replace(/\.(md|mdx)$/i, "");

	if (withoutExt.endsWith("/index")) {
		return withoutExt.slice(0, -"/index".length);
	}

	return withoutExt;
}

export function buildImportedRelativePath(slug: string) {
	return path.posix.join("imported", `${slug}.md`);
}

export function resolveSlugFromContent(
	content: string,
	fallbackSlug: string,
	fallbackRelativePath = "",
) {
	const slug =
		readFrontmatterField(content, "slug") ||
		(fallbackRelativePath
			? getSlugFromRelativePath(fallbackRelativePath)
			: "") ||
		fallbackSlug;

	return slug.trim() || fallbackSlug;
}

export function resolveTargetPathFromContent(
	content: string,
	fallbackSlug: string,
	fallbackRelativePath = "",
) {
	return buildImportedRelativePath(
		resolveSlugFromContent(content, fallbackSlug, fallbackRelativePath),
	);
}

async function walkMarkdownFiles(dirPath: string): Promise<string[]> {
	const entries = await readdir(dirPath, { withFileTypes: true });
	const result: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			result.push(...(await walkMarkdownFiles(fullPath)));
			continue;
		}

		if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			result.push(fullPath);
		}
	}

	return result;
}

async function removeEmptyDirectories(startDirPath: string) {
	let currentDir = startDirPath;

	while (currentDir.startsWith(POSTS_ROOT) && currentDir !== POSTS_ROOT) {
		const entries = await readdir(currentDir);
		if (entries.length > 0) {
			return;
		}

		await rmdir(currentDir);
		currentDir = path.dirname(currentDir);
	}
}

export async function buildLocalImportIndex(): Promise<LocalImportIndex> {
	const files = await walkMarkdownFiles(POSTS_ROOT);
	const byDocId = new Map<string, LocalImportedPost>();
	const byRelativePath = new Map<string, LocalImportedPost>();
	const draftsByDocId = await readImportDraftMap();

	for (const filePath of files) {
		const content = await readFile(filePath, "utf8");
		const docId = readFrontmatterField(content, "siyuanDocId");
		const relativePath = normalizeRelativePath(filePath);
		const record: LocalImportedPost = {
			docId,
			filePath,
			relativePath,
			slug:
				readFrontmatterField(content, "slug") ||
				getSlugFromRelativePath(relativePath),
			title: readFrontmatterField(content, "title"),
			hash: readFrontmatterField(content, "siyuanHash"),
			updated: readFrontmatterField(content, "siyuanUpdated"),
			syncStrategy:
				readFrontmatterField(content, "siyuanSyncStrategy") === "local_override"
					? "local_override"
					: "managed",
			protectedBlockState: inspectProtectedBlocks(content).state,
			content,
		};

		if (docId) {
			byDocId.set(docId, record);
		}

		byRelativePath.set(relativePath, record);
	}

	return {
		byDocId,
		byRelativePath,
		draftsByDocId,
	};
}

export async function writeImportedPost(input: WriteImportedPostInput) {
	const targetPath = resolveAbsolutePath(input.relativePath);
	await mkdir(path.dirname(targetPath), { recursive: true });
	await writeFile(targetPath, input.content, "utf8");

	if (
		input.previousRelativePath &&
		input.previousRelativePath !== input.relativePath
	) {
		const previousPath = resolveAbsolutePath(input.previousRelativePath);
		try {
			await unlink(previousPath);
			await removeEmptyDirectories(path.dirname(previousPath));
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw error;
			}
		}
	}

	return targetPath;
}

export function resolveImportStatus(
	docId: string,
	hash: string,
	index: LocalImportIndex,
): ImportStatus {
	const existing = index.byDocId.get(docId);

	if (!existing) {
		if (index.draftsByDocId.has(docId)) {
			return "local_override";
		}
		return "new";
	}

	if (existing.syncStrategy === "local_override") {
		return "local_override";
	}

	if (existing.protectedBlockState !== "managed") {
		return "conflict";
	}

	if (existing.hash === hash) {
		return "synced";
	}

	return "updated";
}

export function attachImportStatus(
	nodes: ImportDocNode[],
	index: LocalImportIndex,
): ImportDocNode[] {
	return nodes.map((node) => ({
		...node,
		status: resolveImportStatus(node.id, node.hash, index),
		children: attachImportStatus(node.children, index),
	}));
}
