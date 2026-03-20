import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImportDraftRecord } from "@/types/admin";

const RUNTIME_DIR = path.join(process.cwd(), ".runtime", "admin");
const DRAFTS_FILE = path.join(RUNTIME_DIR, "import-drafts.json");

async function ensureDraftDir() {
	await mkdir(RUNTIME_DIR, { recursive: true });
}

export async function readImportDrafts(): Promise<ImportDraftRecord[]> {
	try {
		const content = await readFile(DRAFTS_FILE, "utf8");
		const parsed = JSON.parse(content) as ImportDraftRecord[];
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}

		throw error;
	}
}

export async function readImportDraftMap() {
	const drafts = await readImportDrafts();
	return new Map(drafts.map((draft) => [draft.docId, draft]));
}

export async function upsertImportDraft(draft: ImportDraftRecord) {
	await ensureDraftDir();
	const current = await readImportDrafts();
	const next = current.filter((item) => item.docId !== draft.docId);
	next.unshift(draft);
	await writeFile(DRAFTS_FILE, JSON.stringify(next, null, 2), "utf8");
	return draft;
}

export async function removeImportDraft(docId: string) {
	await ensureDraftDir();
	const current = await readImportDrafts();
	const next = current.filter((item) => item.docId !== docId);
	await writeFile(DRAFTS_FILE, JSON.stringify(next, null, 2), "utf8");
}
