import type {
	ImportConflictDetail,
	ImportDocNode,
	ImportEditorState,
	ImportRequestMetadata,
	ImportStatus,
	ImportSyncStrategy,
} from "@/types/admin";
import { downloadAndRewriteAssets } from "./assets";
import { getErrorMessage } from "./http";
import {
	buildImportSlug,
	buildLocalOverrideImportContent,
	buildManagedImportContent,
	buildTargetPath,
	formatImportDate,
	normalizeRequestMetadata,
} from "./import-workflow";
import {
	readFrontmatterBoolean,
	readFrontmatterField,
	readFrontmatterStringArray,
	toYamlStringArrayLiteral,
	toYamlStringLiteral,
	upsertFrontmatterFields,
} from "./frontmatter";
import { inspectProtectedBlocks } from "./protected-blocks";
import {
	buildImportedRelativePath,
	buildLocalImportIndex,
	resolveImportStatus,
	resolveTargetPathFromContent,
	type LocalImportedPost,
	writeImportedPost,
} from "./posts";
import {
	readImportDraftMap,
	removeImportDraft,
	upsertImportDraft,
} from "./drafts";
import { exportDocMarkdown, getDocsByIds } from "./siyuan";

const DEFAULT_LOCAL_BLOCK_NOTE =
	"尾部补充说明、相关阅读和 CTA 固定放在 LOCAL 区块。";

function buildSlugConflictDetail(input: {
	targetPath: string;
	existing: LocalImportedPost;
}): ImportConflictDetail {
	return {
		type: "slug_occupied",
		message: "目标路径已被其他文章占用，先调整 slug 再保存。",
		targetPath: input.targetPath,
		existingPath: input.existing.relativePath,
		existingTitle: input.existing.title,
		existingDocId: input.existing.docId,
		relatedDocs: [
			{
				docId: input.existing.docId,
				title: input.existing.title || input.existing.relativePath,
				hPath: "",
				targetPath: input.existing.relativePath,
			},
		],
	};
}

function buildProtectedBlockConflictDetail(input: {
	targetPath: string;
	existing: LocalImportedPost;
}): ImportConflictDetail {
	return {
		type: "protected_blocks_invalid",
		message: "本地文章缺少完整保护区块，需要先接管后再继续同步。",
		targetPath: input.targetPath,
		existingPath: input.existing.relativePath,
		existingTitle: input.existing.title,
		existingDocId: input.existing.docId,
		protectedBlockState: input.existing.protectedBlockState,
	};
}

function buildEditorState(input: {
	doc: ImportDocNode;
	content: string;
	origin: ImportEditorState["origin"];
	status: ImportStatus;
	targetPath: string;
	existingPath?: string;
	syncStrategy: ImportSyncStrategy;
	conflictDetail?: ImportConflictDetail | null;
	protectedBlockState?: ImportEditorState["protectedBlockState"];
}) {
	return {
		docId: input.doc.id,
		title: input.doc.title,
		notebookName: input.doc.notebookName,
		hPath: input.doc.hPath,
		updatedLabel: input.doc.updatedLabel,
		status: input.status,
		origin: input.origin,
		targetPath: input.targetPath,
		existingPath: input.existingPath ?? "",
		content: input.content,
		syncStrategy: input.syncStrategy,
		conflictDetail: input.conflictDetail ?? null,
		protectedBlockState: input.protectedBlockState,
	} satisfies ImportEditorState;
}

function buildFallbackMetadata(
	doc: ImportDocNode,
	source = "",
	metadata?: Partial<ImportRequestMetadata>,
) {
	const normalized = normalizeRequestMetadata(metadata);
	const suggestedSlug =
		readFrontmatterField(source, "slug") ||
		normalized.slug ||
		buildImportSlug(doc.title, doc.id);
	return {
		category:
			normalized.category ||
			readFrontmatterField(source, "category") ||
			doc.notebookName,
		tags:
			normalized.tags.length > 0
				? normalized.tags
				: readFrontmatterStringArray(source, "tags").length > 0
					? readFrontmatterStringArray(source, "tags")
					: doc.tags,
		publishedAt:
			normalized.publishedAt ||
			readFrontmatterField(source, "published") ||
			formatImportDate(doc.updated),
		slug: suggestedSlug,
		slugPolicy: "manual" as const,
		draft: metadata?.draft ?? readFrontmatterBoolean(source, "draft", false),
		localBlockNote:
			normalized.localBlockNote ||
			inspectProtectedBlocks(source).localContent ||
			DEFAULT_LOCAL_BLOCK_NOTE,
	};
}

function ensureLocalOverrideContent(input: {
	content: string;
	doc: ImportDocNode;
	metadata?: Partial<ImportRequestMetadata>;
	fallbackRelativePath?: string;
}) {
	const fallback = buildFallbackMetadata(
		input.doc,
		input.content,
		input.metadata,
	);
	let nextContent = input.content.trim();
	if (!nextContent.startsWith("---")) {
		nextContent = buildLocalOverrideImportContent({
			doc: input.doc,
			metadata: fallback,
			suggestedSlug: fallback.slug,
			exportContent: nextContent,
			exportHPath: input.doc.hPath,
		});
	}

	nextContent = upsertFrontmatterFields(nextContent, {
		title: toYamlStringLiteral(
			readFrontmatterField(nextContent, "title") || input.doc.title,
		),
		published: toYamlStringLiteral(
			readFrontmatterField(nextContent, "published") || fallback.publishedAt,
		),
		updated: toYamlStringLiteral(
			readFrontmatterField(nextContent, "updated") ||
				formatImportDate(input.doc.updated),
		),
		description: toYamlStringLiteral(
			readFrontmatterField(nextContent, "description"),
		),
		image: toYamlStringLiteral(readFrontmatterField(nextContent, "image")),
		tags: toYamlStringArrayLiteral(
			readFrontmatterStringArray(nextContent, "tags").length > 0
				? readFrontmatterStringArray(nextContent, "tags")
				: fallback.tags,
		),
		category: toYamlStringLiteral(
			readFrontmatterField(nextContent, "category") || fallback.category,
		),
		draft: readFrontmatterBoolean(nextContent, "draft", fallback.draft)
			? "true"
			: "false",
		lang: toYamlStringLiteral(readFrontmatterField(nextContent, "lang")),
		slug: toYamlStringLiteral(
			readFrontmatterField(nextContent, "slug") || fallback.slug,
		),
		source: toYamlStringLiteral("siyuan"),
		siyuanDocId: toYamlStringLiteral(input.doc.id),
		siyuanNotebook: toYamlStringLiteral(input.doc.notebookName),
		siyuanNotebookId: toYamlStringLiteral(input.doc.notebookId),
		siyuanPath: toYamlStringLiteral(input.doc.hPath),
		siyuanUpdated: toYamlStringLiteral(input.doc.updated),
		siyuanHash: toYamlStringLiteral(input.doc.hash),
		siyuanSyncStrategy: toYamlStringLiteral("local_override"),
		prevTitle: toYamlStringLiteral(
			readFrontmatterField(nextContent, "prevTitle"),
		),
		prevSlug: toYamlStringLiteral(
			readFrontmatterField(nextContent, "prevSlug"),
		),
		nextTitle: toYamlStringLiteral(
			readFrontmatterField(nextContent, "nextTitle"),
		),
		nextSlug: toYamlStringLiteral(
			readFrontmatterField(nextContent, "nextSlug"),
		),
	});

	const fallbackSlug =
		fallback.slug ||
		(input.fallbackRelativePath
			? input.fallbackRelativePath.replace(/^imported\/|\.md$/g, "")
			: buildImportSlug(input.doc.title, input.doc.id));
	const targetPath = resolveTargetPathFromContent(
		nextContent,
		fallbackSlug,
		input.fallbackRelativePath,
	);

	return {
		content: nextContent,
		targetPath,
		suggestedSlug: readFrontmatterField(nextContent, "slug") || fallbackSlug,
	};
}

async function getSingleDoc(docId: string) {
	const docs = await getDocsByIds([docId]);
	const doc = docs[0];
	if (!doc) {
		throw new Error("没有找到对应的思源文档。");
	}
	return doc;
}

function detectEditorConflict(input: {
	doc: ImportDocNode;
	targetPath: string;
	existing?: LocalImportedPost;
	occupied?: LocalImportedPost;
}): ImportConflictDetail | null {
	if (input.occupied?.docId && input.occupied.docId !== input.doc.id) {
		return buildSlugConflictDetail({
			targetPath: input.targetPath,
			existing: input.occupied,
		});
	}

	if (
		input.existing &&
		input.existing.syncStrategy !== "local_override" &&
		input.existing.protectedBlockState !== "managed"
	) {
		return buildProtectedBlockConflictDetail({
			targetPath: input.targetPath,
			existing: input.existing,
		});
	}

	return null;
}

export async function loadImportEditorState(input: {
	docId: string;
	metadata?: Partial<ImportRequestMetadata>;
}) {
	const doc = await getSingleDoc(input.docId);
	const index = await buildLocalImportIndex();
	const existing = index.byDocId.get(doc.id);
	const draft = index.draftsByDocId.get(doc.id);

	if (existing) {
		const targetPath = resolveTargetPathFromContent(
			existing.content,
			existing.slug || buildImportSlug(doc.title, doc.id),
			existing.relativePath,
		);
		const conflictDetail = detectEditorConflict({
			doc,
			targetPath,
			existing,
			occupied: index.byRelativePath.get(targetPath),
		});
		return buildEditorState({
			doc,
			content: existing.content,
			origin: "existing",
			status: resolveImportStatus(doc.id, doc.hash, index),
			targetPath,
			existingPath: existing.relativePath,
			syncStrategy: existing.syncStrategy,
			conflictDetail,
			protectedBlockState: existing.protectedBlockState,
		});
	}

	if (draft) {
		const occupied = index.byRelativePath.get(draft.targetPath);
		return buildEditorState({
			doc,
			content: draft.content,
			origin: "draft",
			status: "local_override",
			targetPath: draft.targetPath,
			syncStrategy: "local_override",
			conflictDetail: detectEditorConflict({
				doc,
				targetPath: draft.targetPath,
				occupied,
			}),
		});
	}

	const metadata = buildFallbackMetadata(doc, "", input.metadata);
	const exportData = await exportDocMarkdown(doc.id);
	const content = buildLocalOverrideImportContent({
		doc,
		metadata,
		suggestedSlug: metadata.slug,
		exportContent: exportData.content,
		exportHPath: exportData.hPath,
	});
	const targetPath = buildImportedRelativePath(metadata.slug);
	return buildEditorState({
		doc,
		content,
		origin: "generated",
		status: "new",
		targetPath,
		syncStrategy: "local_override",
		conflictDetail: detectEditorConflict({
			doc,
			targetPath,
			occupied: index.byRelativePath.get(targetPath),
		}),
	});
}

export async function saveImportEditorState(input: {
	docId: string;
	content: string;
	metadata?: Partial<ImportRequestMetadata>;
}) {
	const doc = await getSingleDoc(input.docId);
	const index = await buildLocalImportIndex();
	const existing = index.byDocId.get(doc.id);
	const prepared = ensureLocalOverrideContent({
		content: input.content,
		doc,
		metadata: input.metadata,
		fallbackRelativePath: existing?.relativePath,
	});
	const occupied = index.byRelativePath.get(prepared.targetPath);
	if (occupied?.docId && occupied.docId !== doc.id) {
		throw new Error("目标 slug 已被其他文章占用，先调整后再保存。");
	}

	if (existing) {
		await writeImportedPost({
			relativePath: prepared.targetPath,
			previousRelativePath: existing.relativePath,
			content: prepared.content,
		});
		await removeImportDraft(doc.id);
	} else {
		await upsertImportDraft({
			docId: doc.id,
			content: prepared.content,
			targetPath: prepared.targetPath,
			suggestedSlug: prepared.suggestedSlug,
			updatedAt: new Date().toISOString(),
		});
	}

	return loadImportEditorState({
		docId: input.docId,
		metadata: input.metadata,
	});
}

export async function discardImportEditorState(docId: string) {
	const index = await buildLocalImportIndex();
	const existing = index.byDocId.get(docId);
	if (!existing) {
		await removeImportDraft(docId);
		return;
	}

	if (existing.syncStrategy === "local_override") {
		throw new Error("已导入的本地优先文章不能直接丢弃，请使用恢复思源同步。");
	}
}

export async function takeoverImportConflict(docId: string) {
	const doc = await getSingleDoc(docId);
	const index = await buildLocalImportIndex();
	const existing = index.byDocId.get(docId);
	if (!existing) {
		throw new Error("没有找到可接管的本地文章。");
	}

	const prepared = ensureLocalOverrideContent({
		content: existing.content,
		doc,
		fallbackRelativePath: existing.relativePath,
	});
	await writeImportedPost({
		relativePath: prepared.targetPath,
		previousRelativePath: existing.relativePath,
		content: prepared.content,
	});
	await removeImportDraft(docId);
	return loadImportEditorState({ docId });
}

export async function restoreManagedSync(docId: string) {
	const doc = await getSingleDoc(docId);
	const index = await buildLocalImportIndex();
	const existing = index.byDocId.get(docId);
	const draftMap = await readImportDraftMap();
	const draft = draftMap.get(docId);

	if (!existing && draft) {
		await removeImportDraft(docId);
		return;
	}

	if (!existing) {
		return;
	}

	const metadata = normalizeRequestMetadata({
		category:
			readFrontmatterField(existing.content, "category") || doc.notebookName,
		tags:
			readFrontmatterStringArray(existing.content, "tags").length > 0
				? readFrontmatterStringArray(existing.content, "tags")
				: doc.tags,
		publishedAt:
			readFrontmatterField(existing.content, "published") ||
			formatImportDate(doc.updated),
		slug:
			readFrontmatterField(existing.content, "slug") ||
			existing.slug ||
			buildImportSlug(doc.title, doc.id),
		slugPolicy: "manual",
		draft: readFrontmatterBoolean(existing.content, "draft", false),
		localBlockNote: DEFAULT_LOCAL_BLOCK_NOTE,
	});
	const exportData = await exportDocMarkdown(doc.id);
	const assets = await downloadAndRewriteAssets(
		exportData.content,
		metadata.slug,
	);
	const target = buildTargetPath(doc, metadata, true);
	const managedContent = buildManagedImportContent({
		doc,
		metadata,
		suggestedSlug: metadata.slug,
		exportContent: assets.content,
		exportHPath: exportData.hPath,
	});

	await writeImportedPost({
		relativePath: target.targetPath,
		previousRelativePath: existing.relativePath,
		content: managedContent,
	});
	await removeImportDraft(docId);
}

export function toEditorErrorMessage(error: unknown) {
	return getErrorMessage(error);
}
