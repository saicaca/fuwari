import path from "node:path";
import type {
	ImportDocNode,
	ImportJobResult,
	ImportRequestMetadata,
} from "@/types/admin";
import type { LocalImportedPost } from "./posts";
import {
	buildLocalOverrideDocument,
	buildManagedDocument,
	mergeManagedDocument,
} from "./protected-blocks";

export function normalizeText(value: string) {
	return value.trim();
}

export function formatImportDate(raw: string) {
	if (!/^\d{14}$/.test(raw)) {
		return raw;
	}

	return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

export function buildImportSlug(title: string, docId: string, manualSlug = "") {
	const preferred = manualSlug.trim() || title;
	const normalized = preferred
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return normalized || `doc-${docId}`;
}

export function normalizeRequestMetadata(
	metadata: Partial<ImportRequestMetadata> | undefined,
): ImportRequestMetadata {
	return {
		category: normalizeText(metadata?.category ?? ""),
		tags: (metadata?.tags ?? []).map(normalizeText).filter(Boolean),
		publishedAt: normalizeText(metadata?.publishedAt ?? ""),
		slug: normalizeText(metadata?.slug ?? ""),
		slugPolicy: metadata?.slugPolicy ?? "stable",
		draft: Boolean(metadata?.draft),
		localBlockNote: metadata?.localBlockNote?.trim() ?? "",
	};
}

export function getSlugFromRelativePath(relativePath: string) {
	const withoutExt = relativePath.replace(/\.(md|mdx)$/i, "");
	return withoutExt.endsWith("/index")
		? withoutExt.slice(0, -"/index".length)
		: withoutExt;
}

export function buildTargetPath(
	doc: ImportDocNode,
	metadata: ImportRequestMetadata,
	singleDoc: boolean,
	existing?: LocalImportedPost,
) {
	const preferredSlug =
		metadata.slugPolicy === "manual" && singleDoc ? metadata.slug : "";
	const generatedSlug = buildImportSlug(doc.title, doc.id, preferredSlug);

	if (existing && metadata.slugPolicy === "stable") {
		return {
			suggestedSlug:
				existing.slug || getSlugFromRelativePath(existing.relativePath),
			targetPath: existing.relativePath,
		};
	}

	return {
		suggestedSlug: generatedSlug,
		targetPath: path.posix.join("imported", `${generatedSlug}.md`),
	};
}

function buildCommonDocumentInput(input: {
	doc: ImportDocNode;
	metadata: ImportRequestMetadata;
	suggestedSlug: string;
	exportHPath: string;
	exportContent: string;
}) {
	const publishedAt =
		input.metadata.publishedAt || formatImportDate(input.doc.updated);
	const category = input.metadata.category || input.doc.notebookName;
	const tags =
		input.metadata.tags.length > 0 ? input.metadata.tags : input.doc.tags;

	return {
		title: input.doc.title,
		publishedAt,
		updatedAt: formatImportDate(input.doc.updated),
		description: "",
		tags,
		category,
		draft: input.metadata.draft,
		slug: input.suggestedSlug,
		siyuanDocId: input.doc.id,
		siyuanNotebook: input.doc.notebookName,
		siyuanNotebookId: input.doc.notebookId,
		siyuanPath: input.exportHPath || input.doc.hPath,
		siyuanUpdated: input.doc.updated,
		siyuanHash: input.doc.hash,
		syncContent: input.exportContent,
	};
}

export function buildManagedImportContent(input: {
	doc: ImportDocNode;
	metadata: ImportRequestMetadata;
	suggestedSlug: string;
	exportContent: string;
	exportHPath: string;
	existing?: LocalImportedPost;
}) {
	const common = buildCommonDocumentInput(input);

	if (!input.existing) {
		return buildManagedDocument({
			...common,
			localContent: input.metadata.localBlockNote,
		});
	}

	return mergeManagedDocument({
		...common,
		existingContent: input.existing.content,
		defaultLocalContent: input.metadata.localBlockNote,
	});
}

export function buildLocalOverrideImportContent(input: {
	doc: ImportDocNode;
	metadata: ImportRequestMetadata;
	suggestedSlug: string;
	exportContent: string;
	exportHPath: string;
}) {
	const common = buildCommonDocumentInput(input);
	return buildLocalOverrideDocument({
		...common,
		bodyContent: input.exportContent,
	});
}

export function summarizeImportItems(
	items: Array<{ status: string; action?: string }>,
): ImportJobResult["summary"] {
	return {
		total: items.length,
		newCount: items.filter((item) => item.action === "create").length,
		updatedCount: items.filter((item) => item.action === "update").length,
		skipCount: items.filter((item) => item.action === "skip").length,
		conflictCount: items.filter((item) => item.action === "block").length,
		writtenCount: 0,
	};
}
