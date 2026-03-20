import type { APIRoute } from "astro";
import type {
	ImportConflictDetail,
	ImportDocNode,
	ImportFolderItem,
	ImportHistoryEntry,
	ImportJobRequest,
	ImportJobResult,
	ImportPreviewItem,
	ImportRequestMetadata,
	SyncMode,
} from "@/types/admin";
import { downloadAndRewriteAssets } from "@/utils/admin/assets";
import { removeImportDraft } from "@/utils/admin/drafts";
import {
	buildManagedImportContent,
	buildTargetPath,
	normalizeRequestMetadata,
	summarizeImportItems,
} from "@/utils/admin/import-workflow";
import { appendImportHistory } from "@/utils/admin/history";
import { getErrorMessage, jsonError, jsonOk } from "@/utils/admin/http";
import {
	buildLocalImportIndex,
	type LocalImportedPost,
	writeImportedPost,
} from "@/utils/admin/posts";
import { triggerPublishBuild } from "@/utils/admin/publish";
import {
	exportDocMarkdown,
	getDocsByIds,
	listDocTree,
} from "@/utils/admin/siyuan";

export const prerender = false;

interface ImportPlan {
	item: ImportPreviewItem;
	nextContent?: string;
	nextRelativePath?: string;
	previousRelativePath?: string;
	canWrite: boolean;
	removeDraftAfterWrite?: boolean;
}

function toJobTimestamp() {
	return new Intl.DateTimeFormat("zh-CN", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "Asia/Shanghai",
	}).format(new Date());
}

async function persistImportHistory(input: {
	job: ImportJobResult["job"];
	items: ImportPreviewItem[];
	summary: ImportJobResult["summary"];
	dryRun: boolean;
	syncMode: SyncMode;
}) {
	const entry: ImportHistoryEntry = {
		job: input.job,
		items: input.items,
		summary: input.summary,
		dryRun: input.dryRun,
		syncMode: input.syncMode,
		createdAt: new Date().toISOString(),
	};

	await appendImportHistory(entry);
}

function buildPreviewItem(input: {
	doc: ImportDocNode;
	status: ImportPreviewItem["status"];
	action: ImportPreviewItem["action"];
	reason: string;
	targetPath: string;
	existingPath?: string;
	suggestedSlug: string;
	syncStrategy: ImportPreviewItem["syncStrategy"];
	conflictType?: ImportPreviewItem["conflictType"];
	conflictDetail?: ImportConflictDetail;
	existing?: LocalImportedPost;
}) {
	return {
		docId: input.doc.id,
		title: input.doc.title,
		notebookName: input.doc.notebookName,
		hPath: input.doc.hPath,
		status: input.status,
		action: input.action,
		reason: input.reason,
		targetPath: input.targetPath,
		existingPath: input.existingPath ?? "",
		suggestedSlug: input.suggestedSlug,
		updatedLabel: input.doc.updatedLabel,
		tags: input.doc.tags,
		syncStrategy: input.syncStrategy,
		conflictType: input.conflictType,
		conflictDetail: input.conflictDetail,
		existingTitle: input.existing?.title ?? "",
		existingDocId: input.existing?.docId ?? "",
		protectedBlockState: input.existing?.protectedBlockState,
	} satisfies ImportPreviewItem;
}

function buildSlugConflictDetail(input: {
	doc: ImportDocNode;
	targetPath: string;
	existing: LocalImportedPost;
}): ImportConflictDetail {
	return {
		type: "slug_occupied",
		message: "目标路径已被其他文章占用，需要先调整 slug。",
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
		message: "本地文章缺少完整保护区块，当前不会直接覆盖。",
		targetPath: input.targetPath,
		existingPath: input.existing.relativePath,
		existingTitle: input.existing.title,
		existingDocId: input.existing.docId,
		protectedBlockState: input.existing.protectedBlockState,
	};
}

function markDuplicateTargetPathConflicts(plans: ImportPlan[]) {
	const docsByPath = new Map<
		string,
		Array<{ docId: string; title: string; hPath: string; targetPath: string }>
	>();

	for (const plan of plans) {
		if (!plan.item.targetPath || plan.item.action === "block") {
			continue;
		}

		const current = docsByPath.get(plan.item.targetPath) ?? [];
		current.push({
			docId: plan.item.docId,
			title: plan.item.title,
			hPath: plan.item.hPath,
			targetPath: plan.item.targetPath,
		});
		docsByPath.set(plan.item.targetPath, current);
	}

	return plans.map((plan) => {
		const duplicates = docsByPath.get(plan.item.targetPath) ?? [];
		if (duplicates.length <= 1) {
			return plan;
		}

		const relatedDocs = duplicates.filter(
			(item) => item.docId !== plan.item.docId,
		);
		return {
			...plan,
			item: {
				...plan.item,
				status: "conflict",
				action: "block",
				reason: "本批次有多个文档会落到同一个 slug，请先处理冲突。",
				conflictType: "batch_duplicate_slug",
				conflictDetail: {
					type: "batch_duplicate_slug",
					message: "本批次内存在重复目标 slug，需要先改开。",
					targetPath: plan.item.targetPath,
					relatedDocs,
				},
			},
			canWrite: false,
		} satisfies ImportPlan;
	});
}

async function buildPlan(input: {
	doc: ImportDocNode;
	importIndex: Awaited<ReturnType<typeof buildLocalImportIndex>>;
	metadata: ImportRequestMetadata;
	singleDoc: boolean;
	syncMode: SyncMode;
	dryRun: boolean;
}) {
	const { doc, importIndex, metadata, singleDoc, syncMode, dryRun } = input;
	const existing = importIndex.byDocId.get(doc.id);
	const draft = importIndex.draftsByDocId.get(doc.id);

	if (existing?.syncStrategy === "local_override") {
		return {
			item: buildPreviewItem({
				doc,
				status: "local_override",
				action: "skip",
				reason: "该文章已切到本地优先，当前不会再用思源正文覆盖。",
				targetPath: existing.relativePath,
				existingPath: existing.relativePath,
				suggestedSlug: existing.slug,
				syncStrategy: "local_override",
				existing,
			}),
			canWrite: false,
		} satisfies ImportPlan;
	}

	if (draft && !existing) {
		const occupied = importIndex.byRelativePath.get(draft.targetPath);
		if (occupied?.docId && occupied.docId !== doc.id) {
			const conflictDetail = buildSlugConflictDetail({
				doc,
				targetPath: draft.targetPath,
				existing: occupied,
			});
			return {
				item: buildPreviewItem({
					doc,
					status: "conflict",
					action: "block",
					reason: conflictDetail.message,
					targetPath: draft.targetPath,
					existingPath: occupied.relativePath,
					suggestedSlug: draft.suggestedSlug,
					syncStrategy: "local_override",
					conflictType: "slug_occupied",
					conflictDetail,
					existing: occupied,
				}),
				canWrite: false,
			} satisfies ImportPlan;
		}

		return {
			item: buildPreviewItem({
				doc,
				status: "new",
				action: "create",
				reason: "检测到本地全文草稿，会按草稿内容创建并切到本地优先。",
				targetPath: draft.targetPath,
				suggestedSlug: draft.suggestedSlug,
				syncStrategy: "local_override",
			}),
			nextContent: draft.content,
			nextRelativePath: draft.targetPath,
			canWrite: true,
			removeDraftAfterWrite: true,
		} satisfies ImportPlan;
	}

	const target = buildTargetPath(doc, metadata, singleDoc, existing);
	const occupied = importIndex.byRelativePath.get(target.targetPath);

	if (occupied?.docId && occupied.docId !== doc.id) {
		const conflictDetail = buildSlugConflictDetail({
			doc,
			targetPath: target.targetPath,
			existing: occupied,
		});
		return {
			item: buildPreviewItem({
				doc,
				status: "conflict",
				action: "block",
				reason: conflictDetail.message,
				targetPath: target.targetPath,
				existingPath: occupied.relativePath,
				suggestedSlug: target.suggestedSlug,
				syncStrategy: existing?.syncStrategy ?? "managed",
				conflictType: "slug_occupied",
				conflictDetail,
				existing: occupied,
			}),
			canWrite: false,
		} satisfies ImportPlan;
	}

	if (existing && existing.protectedBlockState !== "managed") {
		const conflictDetail = buildProtectedBlockConflictDetail({
			targetPath: target.targetPath,
			existing,
		});
		return {
			item: buildPreviewItem({
				doc,
				status: "conflict",
				action: "block",
				reason: conflictDetail.message,
				targetPath: target.targetPath,
				existingPath: existing.relativePath,
				suggestedSlug: target.suggestedSlug,
				syncStrategy: "managed",
				conflictType: "protected_blocks_invalid",
				conflictDetail,
				existing,
			}),
			canWrite: false,
		} satisfies ImportPlan;
	}

	const exportData = await exportDocMarkdown(doc.id);
	let exportContent = exportData.content;
	if (!dryRun) {
		const assets = await downloadAndRewriteAssets(
			exportContent,
			target.suggestedSlug,
		);
		exportContent = assets.content;
	}

	if (!existing) {
		return {
			item: buildPreviewItem({
				doc,
				status: "new",
				action: "create",
				reason: "本地还没有这篇文章，会按受控结构创建。",
				targetPath: target.targetPath,
				suggestedSlug: target.suggestedSlug,
				syncStrategy: "managed",
			}),
			nextContent: buildManagedImportContent({
				doc,
				metadata,
				suggestedSlug: target.suggestedSlug,
				exportContent,
				exportHPath: exportData.hPath,
			}),
			nextRelativePath: target.targetPath,
			canWrite: true,
		} satisfies ImportPlan;
	}

	const docStatus = existing.hash === doc.hash ? "synced" : "updated";

	if (syncMode === "create_only") {
		return {
			item: buildPreviewItem({
				doc,
				status: docStatus,
				action: "skip",
				reason: "当前是仅创建新文章模式，已存在文章全部跳过。",
				targetPath: target.targetPath,
				existingPath: existing.relativePath,
				suggestedSlug: target.suggestedSlug,
				syncStrategy: "managed",
				existing,
			}),
			canWrite: false,
		} satisfies ImportPlan;
	}

	if (existing.hash === doc.hash && syncMode !== "force_overwrite") {
		return {
			item: buildPreviewItem({
				doc,
				status: "synced",
				action: "skip",
				reason: "本地受控文章和思源 hash 一致，本次可以跳过。",
				targetPath: target.targetPath,
				existingPath: existing.relativePath,
				suggestedSlug: target.suggestedSlug,
				syncStrategy: "managed",
				existing,
			}),
			canWrite: false,
		} satisfies ImportPlan;
	}

	const forceRewrite = syncMode === "force_overwrite";
	const reason =
		forceRewrite && existing.hash === doc.hash
			? "当前是强制覆盖同步区模式，会重新写入受控内容。"
			: forceRewrite
				? "当前是强制覆盖同步区模式，会按最新思源内容重写 SYNC 区块。"
				: "检测到思源内容已更新，会重写 SYNC 区块并保留 LOCAL 区块。";

	return {
		item: buildPreviewItem({
			doc,
			status: docStatus,
			action: "update",
			reason,
			targetPath: target.targetPath,
			existingPath: existing.relativePath,
			suggestedSlug: target.suggestedSlug,
			syncStrategy: "managed",
			existing,
		}),
		nextContent: buildManagedImportContent({
			doc,
			metadata,
			suggestedSlug: target.suggestedSlug,
			exportContent,
			exportHPath: exportData.hPath,
			existing,
		}),
		nextRelativePath: target.targetPath,
		previousRelativePath: existing.relativePath,
		canWrite: true,
	} satisfies ImportPlan;
}

function collectDocIds(nodes: ImportDocNode[]): string[] {
	return nodes.flatMap((node) => [node.id, ...collectDocIds(node.children)]);
}

async function expandFolders(folders: ImportFolderItem[]): Promise<string[]> {
	if (folders.length === 0) {
		return [];
	}

	const results = await Promise.all(
		folders.map((folder) =>
			listDocTree({
				notebookId: folder.notebookId.trim(),
				path: folder.path?.trim() || "/",
				recursive: folder.recursive ?? true,
			}),
		),
	);

	return results.flatMap(collectDocIds);
}

export const POST: APIRoute = async ({ request }) => {
	let payload: ImportJobRequest;

	try {
		payload = (await request.json()) as ImportJobRequest;
	} catch {
		return jsonError("请求体不是合法 JSON。", 400);
	}

	const directIds = (payload.docIds ?? [])
		.map((id) => id.trim())
		.filter(Boolean);
	const folders: ImportFolderItem[] = (payload.folders ?? []).filter((folder) =>
		folder.notebookId?.trim(),
	);

	try {
		const folderDocIds = await expandFolders(folders);
		const docIds = Array.from(new Set([...directIds, ...folderDocIds]));
		if (docIds.length === 0) {
			return jsonError("至少选择 1 篇文档后再执行。", 400);
		}

		const metadata = normalizeRequestMetadata(payload.metadata);
		const [docs, importIndex] = await Promise.all([
			getDocsByIds(docIds),
			buildLocalImportIndex(),
		]);

		if (docs.length === 0) {
			return jsonError("没有拉到可导入的思源文档。", 404);
		}

		const singleDoc = docs.length === 1;
		const rawPlans = await Promise.all(
			docs.map((doc) =>
				buildPlan({
					doc,
					importIndex,
					metadata,
					singleDoc,
					syncMode: payload.syncMode,
					dryRun: payload.dryRun,
				}),
			),
		);
		const plans = markDuplicateTargetPathConflicts(rawPlans);
		const items = plans.map((plan) => plan.item);
		const summary = summarizeImportItems(items);
		const writable = true;

		if (payload.dryRun) {
			const dryRunSummary = {
				...summary,
				writtenCount: 0,
			};
			const result: ImportJobResult = {
				job: {
					id: `JOB-${Date.now().toString().slice(-6)}`,
					label: "导入预演完成",
					status: summary.conflictCount > 0 ? "attention" : "success",
					detail: `共 ${summary.total} 篇，新增 ${summary.newCount}，更新 ${summary.updatedCount}，跳过 ${summary.skipCount}，冲突 ${summary.conflictCount}。`,
					timestamp: toJobTimestamp(),
				},
				items,
				summary: dryRunSummary,
				writable,
			};

			await persistImportHistory({
				job: result.job,
				items: result.items,
				summary: result.summary,
				dryRun: true,
				syncMode: payload.syncMode,
			});

			return jsonOk(result);
		}

		let writtenCount = 0;
		for (const plan of plans) {
			if (!plan.canWrite || !plan.nextContent || !plan.nextRelativePath) {
				continue;
			}

			await writeImportedPost({
				relativePath: plan.nextRelativePath,
				content: plan.nextContent,
				previousRelativePath: plan.previousRelativePath,
			});
			writtenCount += 1;

			if (plan.removeDraftAfterWrite) {
				await removeImportDraft(plan.item.docId);
			}
		}

		let publishMessage = "当前环境未启用自动发布。";
		if (writtenCount > 0) {
			try {
				publishMessage = triggerPublishBuild().message;
			} catch (error) {
				publishMessage = `后台发布任务触发失败：${getErrorMessage(error)}`;
			}
		}

		const finalSummary = {
			...summary,
			writtenCount,
		};

		const result: ImportJobResult = {
			job: {
				id: `JOB-${Date.now().toString().slice(-6)}`,
				label:
					finalSummary.conflictCount > 0 ? "同步执行部分完成" : "同步执行完成",
				status: finalSummary.conflictCount > 0 ? "attention" : "success",
				detail:
					finalSummary.conflictCount > 0
						? `已写入 ${writtenCount} 篇，新增 ${finalSummary.newCount}，更新 ${finalSummary.updatedCount}，跳过 ${finalSummary.skipCount}，冲突 ${finalSummary.conflictCount}。${publishMessage}`
						: `已写入 ${writtenCount} 篇，新增 ${finalSummary.newCount}，更新 ${finalSummary.updatedCount}，跳过 ${finalSummary.skipCount}。${publishMessage}`,
				timestamp: toJobTimestamp(),
			},
			items,
			summary: finalSummary,
			writable,
		};

		await persistImportHistory({
			job: result.job,
			items: result.items,
			summary: result.summary,
			dryRun: false,
			syncMode: payload.syncMode,
		});

		return jsonOk(result);
	} catch (error) {
		return jsonError(getErrorMessage(error));
	}
};
