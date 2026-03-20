import type { APIRoute } from "astro";
import type {
	ImportEditorResponse,
	ImportEditorSaveRequest,
} from "@/types/admin";
import {
	discardImportEditorState,
	loadImportEditorState,
	saveImportEditorState,
	toEditorErrorMessage,
} from "@/utils/admin/editor";
import { jsonError, jsonOk } from "@/utils/admin/http";

export const prerender = false;

function readDocId(url: URL) {
	return url.searchParams.get("id")?.trim() ?? "";
}

export const GET: APIRoute = async ({ url }) => {
	const docId = readDocId(url);
	if (!docId) {
		return jsonError("缺少 docId。", 400);
	}

	try {
		const editor = await loadImportEditorState({ docId });
		return jsonOk<ImportEditorResponse>({ editor });
	} catch (error) {
		return jsonError(toEditorErrorMessage(error));
	}
};

export const PUT: APIRoute = async ({ request }) => {
	let payload: ImportEditorSaveRequest;

	try {
		payload = (await request.json()) as ImportEditorSaveRequest;
	} catch {
		return jsonError("请求体不是合法 JSON。", 400);
	}

	const docId = payload.docId?.trim() ?? "";
	if (!docId) {
		return jsonError("缺少 docId。", 400);
	}

	if (typeof payload.content !== "string") {
		return jsonError("缺少 Markdown 内容。", 400);
	}

	try {
		const editor = await saveImportEditorState({
			docId,
			content: payload.content,
		});
		return jsonOk<ImportEditorResponse>({ editor });
	} catch (error) {
		return jsonError(toEditorErrorMessage(error));
	}
};

export const DELETE: APIRoute = async ({ url }) => {
	const docId = readDocId(url);
	if (!docId) {
		return jsonError("缺少 docId。", 400);
	}

	try {
		await discardImportEditorState(docId);
		return jsonOk({ message: "草稿已丢弃。" });
	} catch (error) {
		return jsonError(toEditorErrorMessage(error));
	}
};
