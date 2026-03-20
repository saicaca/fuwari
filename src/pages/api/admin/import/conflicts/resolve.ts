import type { APIRoute } from "astro";
import type {
	ImportConflictResolveRequest,
	ImportConflictResolveResponse,
} from "@/types/admin";
import {
	loadImportEditorState,
	restoreManagedSync,
	takeoverImportConflict,
	toEditorErrorMessage,
} from "@/utils/admin/editor";
import {
	buildLocalImportIndex,
	resolveImportStatus,
} from "@/utils/admin/posts";
import { getDocsByIds } from "@/utils/admin/siyuan";
import { jsonError, jsonOk } from "@/utils/admin/http";

export const prerender = false;

async function resolveCurrentStatus(docId: string) {
	const [doc] = await getDocsByIds([docId]);
	if (!doc) {
		return "new" as const;
	}

	const index = await buildLocalImportIndex();
	return resolveImportStatus(docId, doc.hash, index);
}

export const POST: APIRoute = async ({ request }) => {
	let payload: ImportConflictResolveRequest;

	try {
		payload = (await request.json()) as ImportConflictResolveRequest;
	} catch {
		return jsonError("请求体不是合法 JSON。", 400);
	}

	const docId = payload.docId?.trim() ?? "";
	if (!docId) {
		return jsonError("缺少 docId。", 400);
	}

	try {
		if (payload.action === "takeover_existing") {
			const editor = await takeoverImportConflict(docId);
			return jsonOk<ImportConflictResolveResponse>({
				message: "已接管现有文件，并切换到本地优先。",
				status: editor.status,
				editor,
			});
		}

		if (payload.action === "restore_managed_sync") {
			await restoreManagedSync(docId);
			const status = await resolveCurrentStatus(docId);
			let editor = null;
			if (status !== "new") {
				editor = await loadImportEditorState({ docId });
			}

			return jsonOk<ImportConflictResolveResponse>({
				message: "已恢复思源同步。",
				status,
				editor,
			});
		}

		return jsonError("不支持的冲突处理动作。", 400);
	} catch (error) {
		return jsonError(toEditorErrorMessage(error));
	}
};
