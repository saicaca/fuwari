<script lang="ts">
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { onDestroy, onMount } from "svelte";
import type {
	AdminSessionResponse,
	ApiResponse,
	ImportConflictResolveResponse,
	ImportDocNode,
	ImportEditorResponse,
	ImportEditorState,
	ImportHistoryEntry,
	ImportHistoryResponse,
	ImportJobRecord,
	ImportJobResult,
	ImportPreviewItem,
	ImportStatus,
	ImportTreeNode,
	NotebooksResponse,
	SearchResponse,
	SlugPolicy,
	SyncMode,
	TreeResponse,
} from "@/types/admin";
import { url } from "@/utils/url-utils";

type TreeRow = { node: ImportTreeNode; depth: number };
type WorkspaceMode = "batch" | "editor";
type ConflictState = { item: ImportPreviewItem; originLabel: string } | null;

export let adminUser = "";

const statusMeta: Record<
	ImportStatus,
	{ label: string; tone: string; dot: string }
> = {
	new: {
		label: "未导入",
		tone: "border-[#d6d3c9] bg-[#f3f0e7] text-[#4a4a42] dark:border-[#2f3733] dark:bg-[#1c221f] dark:text-[#d7ddd7]",
		dot: "bg-[#7f7d74] dark:bg-[#b4beb4]",
	},
	synced: {
		label: "已同步",
		tone: "border-[#cfe1d3] bg-[#edf5ef] text-[#29503a] dark:border-[#254334] dark:bg-[#18241d] dark:text-[#acd1bc]",
		dot: "bg-[#3f7b57] dark:bg-[#69a07f]",
	},
	updated: {
		label: "源有更新",
		tone: "border-[#e4d2b8] bg-[#f7efe3] text-[#7b5622] dark:border-[#4b3720] dark:bg-[#241d15] dark:text-[#d7b37f]",
		dot: "bg-[#ac7a38] dark:bg-[#d3a86f]",
	},
	conflict: {
		label: "需人工处理",
		tone: "border-[#e5c5c5] bg-[#f8ecec] text-[#7f3535] dark:border-[#4a2626] dark:bg-[#261818] dark:text-[#d79d9d]",
		dot: "bg-[#aa4f4f] dark:bg-[#d18a8a]",
	},
	local_override: {
		label: "本地优先",
		tone: "border-[#cfd4db] bg-[#eef1f4] text-[#304252] dark:border-[#29343f] dark:bg-[#141b21] dark:text-[#b8c6d3]",
		dot: "bg-[#4e6578] dark:bg-[#92a8bb]",
	},
};

const syncModeMeta: Record<SyncMode, { title: string; desc: string }> = {
	sync: { title: "增量同步", desc: "有变化就更新，无变化就跳过。" },
	create_only: { title: "仅创建新文章", desc: "已导入文章不再处理。" },
	force_overwrite: {
		title: "强制覆盖同步区",
		desc: "重写 SYNC 区块，保留 LOCAL 区块。",
	},
};

const jobStatusMeta: Record<
	ImportJobRecord["status"],
	{ label: string; tone: string; dot: string }
> = {
	queued: {
		label: "待执行",
		tone: "border-[#d7d2c6] bg-[#f3f0e7] text-[#5f5a50] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#b7c1b8]",
		dot: "bg-[#8b867c] dark:bg-[#93a097]",
	},
	running: {
		label: "执行中",
		tone: "border-[#d7d2c6] bg-[#f6f2e7] text-[#6f5a2e] dark:border-[#383329] dark:bg-[#211d14] dark:text-[#d0b583]",
		dot: "bg-[#9d7c34] dark:bg-[#c29e62]",
	},
	success: {
		label: "成功",
		tone: "border-[#c8d6ce] bg-[#edf2ee] text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]",
		dot: "bg-[#446e5c] dark:bg-[#7ea48f]",
	},
	attention: {
		label: "需关注",
		tone: "border-[#e1caca] bg-[#f6ecec] text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]",
		dot: "bg-[#aa6666] dark:bg-[#d09595]",
	},
};

const syncModeOrder: SyncMode[] = ["sync", "create_only", "force_overwrite"];

const slugPolicyOptions: Array<{
	value: SlugPolicy;
	label: string;
	desc: string;
}> = [
	{
		value: "stable",
		label: "首次生成后固定",
		desc: "适合长期维护，避免二次导入把地址打乱。",
	},
	{
		value: "manual",
		label: "单篇手动指定",
		desc: "只在单文档场景开放，路径由你自己控。",
	},
	{
		value: "title",
		label: "跟随标题重算",
		desc: "适合内容频繁重命名，但会放大路径变更风险。",
	},
];

const conflictTypeMeta = {
	slug_occupied: {
		label: "Slug 被占用",
		desc: "改 frontmatter 里的 slug，再保存。",
	},
	batch_duplicate_slug: {
		label: "批次内重复 slug",
		desc: "同一批有多篇会撞到同一路径。",
	},
	protected_blocks_invalid: {
		label: "保护区块损坏",
		desc: "先接管现有文件，再决定怎么改。",
	},
} as const;

const editorOriginMeta = {
	existing: "本地真实文件",
	generated: "思源生成草稿",
	draft: "已保存草稿",
} as const;

const syncStrategyMeta = {
	managed: {
		label: "受控同步",
		desc: "后续仍会由思源同步正文。",
	},
	local_override: {
		label: "本地优先",
		desc: "正文以后以本地为准，不再自动被思源覆盖。",
	},
} as const;

const protectedStateMeta = {
	managed: "保护区块完整",
	broken: "保护区块损坏",
	absent: "保护区块缺失",
} as const;

const panelClass =
	"overflow-hidden rounded-[2rem] border border-[#ddd7ca] bg-[#f8f6f0] shadow-[0_24px_60px_-32px_rgba(17,24,18,0.24)] dark:border-[#222924] dark:bg-[#141815]";
const surfaceClass =
	"rounded-[1.5rem] border border-[#dfd9cc] bg-[#fcfbf7] dark:border-[#29302b] dark:bg-[#111512]";
const inputClass =
	"w-full rounded-[1.15rem] border border-[#d9d3c6] bg-[#fcfbf7] px-4 py-3 text-sm text-[#181a18] outline-none transition duration-200 placeholder:text-[#938d80] focus:border-[#355b4b] focus:shadow-[0_0_0_4px_rgba(53,91,75,0.08)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#29302b] dark:bg-[#111512] dark:text-[#edf1ec] dark:placeholder:text-[#758176] dark:focus:border-[#84a594] dark:focus:shadow-[0_0_0_4px_rgba(132,165,148,0.14)]";
const textareaClass = `${inputClass} min-h-[120px] resize-y leading-7`;
const quietButtonClass =
	"inline-flex items-center justify-center rounded-full border border-[#d6d0c3] bg-[#fcfbf7] px-4 py-2.5 text-sm text-[#4f4b43] transition duration-200 hover:border-[#c5cfc8] hover:bg-[#f2f0e9] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#303833] dark:bg-[#111512] dark:text-[#b8c2b9] dark:hover:border-[#405047] dark:hover:bg-[#171c18]";
const primaryButtonClass =
	"inline-flex items-center justify-center rounded-full border border-[#355b4b] bg-[#355b4b] px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-[#2f5143] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#446e5c] dark:bg-[#446e5c] dark:hover:bg-[#507d68]";
const editorTextareaClass = `${inputClass} min-h-[420px] resize-y font-mono text-[13px] leading-7`;
const helperTextClass = "text-xs leading-6 text-[#6f6a5f] dark:text-[#9aa69d]";
const sectionLabelClass =
	"text-[11px] uppercase tracking-[0.28em] text-[#7f796d] dark:text-[#8b9a8f]";
const metricTileClass =
	"rounded-[1.35rem] border border-[#ddd7ca] bg-[#fcfbf7] p-4 dark:border-[#29302b] dark:bg-[#111512]";
const HISTORY_PREVIEW_LIMIT = 4;

const notebooksApiPath = url("/api/admin/siyuan/notebooks/");
const historyApiPath = url("/api/admin/import/history/");
const treeApiPath = url("/api/admin/siyuan/tree/");
const jobsApiPath = url("/api/admin/import/jobs/");
const logoutApiPath = url("/api/admin/auth/logout/");
const searchApiPath = url("/api/admin/siyuan/search/");
const tagsAiApiPath = url("/api/admin/ai/tags/");
const loginPagePath = url("/admin/login/");
const previewApiPath = url("/api/admin/siyuan/preview/");
const editorApiPath = url("/api/admin/import/editor/");
const conflictResolveApiPath = url("/api/admin/import/conflicts/resolve/");

let ready = false;
let query = "";
let recursive = true;
let syncMode: SyncMode = "sync";
let draft = false;
let slugPolicy: SlugPolicy = "stable";
let category = "";
let tagsInput = "";
let publishedAt = "";
let slug = "";
let localBlockNote = "";
let tagAiLoading = false;
let tagAiError = "";

let notebooks: ImportTreeNode[] = [];
let expandedIds: string[] = [];
let loadingNodeIds: string[] = [];
let treeError = "";
let notebooksLoading = true;

let searchResults: ImportDocNode[] = [];
let searchError = "";
let searchLoading = false;
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let searchController: AbortController | null = null;
let historyLoading = true;
let historyError = "";
let loggingOut = false;
let historyEntries: ImportHistoryEntry[] = [];
let activeHistoryJobId: string | null = null;
let activeHistoryEntry: ImportHistoryEntry | null = null;
let latestHistoryEntry: ImportHistoryEntry | null = null;
let visibleHistoryEntries: ImportHistoryEntry[] = [];
let historyHiddenCount = 0;
let historyExpanded = false;
let activityMessage = "";
let planDirty = false;

let selectionSources: Record<string, string[]> = {};
let selectedDocsById: Record<string, ImportDocNode> = {};
let activeBranchKeys: string[] = [];
let rows: TreeRow[] = [];
let selectedDocs: ImportDocNode[] = [];
let recommendedTags: string[] = [];
let notebookNames: string[] = [];
let stats: {
	newCount: number;
	updatedCount: number;
	conflictCount: number;
	localOverrideCount: number;
} = {
	newCount: 0,
	updatedCount: 0,
	conflictCount: 0,
	localOverrideCount: 0,
};

let jobs: ImportJobRecord[] = [];
let previewItems: ImportPreviewItem[] = [];
let latestSummary: ImportJobResult["summary"] | null = null;
let writable = true;
let runningAction: "dryRun" | "sync" | null = null;
let previewOpen = false;
let previewLoading = false;
let previewError = "";
let previewDocId: string | null = null;
let previewTitle = "";
let previewHPath = "";
let previewHtml = "";
let previewCache: Record<
	string,
	{ title: string; hPath: string; html: string }
> = {};
let searchActive = false;
let latestJob: ImportJobRecord | null = null;
let primarySelectedDoc: ImportDocNode | null = null;
let workspaceMode: WorkspaceMode = "batch";
let activeEditorDocId: string | null = null;
let editorState: ImportEditorState | null = null;
let editorContent = "";
let editorLoading = false;
let editorSaving = false;
let editorError = "";
let editorMessage = "";
let editorDirty = false;
let editorTargetPathPreview = "";
let conflictState: ConflictState = null;
let conflictActionLoading = false;
let conflictActionError = "";

const touched = { category: false, tags: false, published: false, slug: false };

const errorMessage = (error: unknown) =>
	error instanceof Error ? error.message : "请求失败，请稍后重试。";

const parseTags = (input: string) =>
	input
		.split(/[,\n]/)
		.map((item) => item.trim())
		.filter(Boolean);

const formatDate = (raw: string) =>
	/^\d{14}$/.test(raw)
		? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
		: raw;

const buildSlug = (title: string, docId: string) => {
	const normalized = title
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return normalized || `doc-${docId}`;
};

const extractFrontmatterField = (source: string, fieldName: string) => {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		return "";
	}

	const fieldMatch = match[1].match(new RegExp(`^${fieldName}:\\s*(.+)$`, "m"));
	if (!fieldMatch) {
		return "";
	}

	return fieldMatch[1].trim().replace(/^['"]|['"]$/g, "");
};

const buildImportedPath = (slugValue: string) =>
	`imported/${slugValue.replace(/^\/+|\/+$/g, "")}.md`;

const deriveTargetPathFromEditor = (content: string, fallbackPath: string) => {
	const fallbackSlug =
		fallbackPath.replace(/^imported\//, "").replace(/\.md$/i, "") || "draft";
	const contentSlug = extractFrontmatterField(content, "slug") || fallbackSlug;
	return buildImportedPath(contentSlug);
};

const getEditorSaveLabel = (state: ImportEditorState | null) => {
	if (!state) {
		return "保存草稿";
	}

	if (state.origin === "existing") {
		return state.syncStrategy === "managed"
			? "保存文件并切本地优先"
			: "保存文件";
	}

	return "保存草稿";
};

const markdownRenderer = new MarkdownIt({
	html: false,
	linkify: true,
	breaks: true,
});

const sanitizeOptions = {
	allowedTags: [
		"a",
		"img",
		"p",
		"br",
		"strong",
		"em",
		"code",
		"pre",
		"blockquote",
		"ul",
		"ol",
		"li",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"hr",
		"table",
		"thead",
		"tbody",
		"tr",
		"th",
		"td",
	],
	allowedAttributes: {
		a: ["href", "title", "target", "rel"],
		code: ["class"],
		img: ["src", "alt", "title", "width", "height", "loading"],
		pre: ["class"],
	},
	allowedSchemesByTag: {
		img: ["http", "https", "data"],
	},
};

const renderMarkdown = (content: string) =>
	sanitizeHtml(markdownRenderer.render(content), sanitizeOptions);

const collectDocs = (nodes: ImportTreeNode[]): ImportDocNode[] =>
	nodes.flatMap((node) =>
		node.kind === "notebook"
			? collectDocs(node.children)
			: [node, ...collectDocs(node.children)],
	);

const flattenTree = (
	nodes: ImportTreeNode[],
	expanded: string[],
	depth = 0,
): TreeRow[] =>
	nodes.flatMap((node) => {
		const rows = [{ node, depth }];
		return expanded.includes(node.id) && node.children.length > 0
			? [...rows, ...flattenTree(node.children, expanded, depth + 1)]
			: rows;
	});

const updateNode = (
	nodes: ImportTreeNode[],
	targetId: string,
	updater: (node: ImportTreeNode) => ImportTreeNode,
): ImportTreeNode[] =>
	nodes.map((node) =>
		node.id === targetId
			? updater(node)
			: node.children.length === 0
				? node
				: {
						...node,
						children: updateNode(
							node.children,
							targetId,
							updater,
						) as ImportDocNode[],
					},
	);

const setNodeLoading = (nodeId: string, loading: boolean) => {
	loadingNodeIds = loading
		? Array.from(new Set([...loadingNodeIds, nodeId]))
		: loadingNodeIds.filter((id) => id !== nodeId);
};

async function readJson<T>(response: Response) {
	const payload = (await response.json()) as ApiResponse<T>;
	if (!payload.ok) throw new Error(payload.error);
	return payload.data;
}

function syncSelectedDocs(nodes: ImportDocNode[]) {
	if (Object.keys(selectedDocsById).length === 0) return;
	const next = { ...selectedDocsById };
	let changed = false;
	for (const node of nodes) {
		if (next[node.id]) {
			next[node.id] = node;
			changed = true;
		}
	}
	if (changed) selectedDocsById = next;
}

async function loadNotebooks() {
	notebooksLoading = true;
	treeError = "";
	try {
		const response = await fetch(notebooksApiPath);
		const data = await readJson<NotebooksResponse>(response);
		notebooks = data.notebooks;
		syncSelectedDocs(collectDocs(data.notebooks));
	} catch (error) {
		treeError = errorMessage(error);
	} finally {
		notebooksLoading = false;
	}
}

async function loadHistory() {
	historyLoading = true;
	historyError = "";
	try {
		const response = await fetch(historyApiPath);
		const data = await readJson<ImportHistoryResponse>(response);
		historyEntries = data.entries;
		jobs = data.entries.map((entry) => entry.job);
		selectHistoryEntry(
			activeHistoryJobId &&
				data.entries.some((entry) => entry.job.id === activeHistoryJobId)
				? activeHistoryJobId
				: (data.entries[0]?.job.id ?? null),
		);
	} catch (error) {
		historyError = errorMessage(error);
	} finally {
		historyLoading = false;
	}
}

async function loadTree(node: ImportTreeNode, forceRecursive = false) {
	if (!forceRecursive && node.childrenLoaded) return node.children;
	setNodeLoading(node.id, true);
	try {
		const params = new URLSearchParams({
			notebookId: node.notebookId,
			path: node.path,
			recursive: forceRecursive ? "1" : "0",
		});
		const response = await fetch(`${treeApiPath}?${params.toString()}`);
		const data = await readJson<TreeResponse>(response);
		notebooks = updateNode(notebooks, node.id, (current) => ({
			...current,
			children: data.nodes,
			childrenLoaded: true,
		}));
		syncSelectedDocs(collectDocs(data.nodes));
		return data.nodes;
	} finally {
		setNodeLoading(node.id, false);
	}
}

async function toggleExpand(node: ImportTreeNode) {
	if (expandedIds.includes(node.id)) {
		expandedIds = expandedIds.filter((id) => id !== node.id);
		return;
	}
	expandedIds = [...expandedIds, node.id];
	if (node.kind === "notebook" || node.hasChildren) await loadTree(node);
}

function addSource(doc: ImportDocNode, sourceKey: string) {
	const sources = new Set(selectionSources[doc.id] ?? []);
	sources.add(sourceKey);
	selectionSources = { ...selectionSources, [doc.id]: [...sources] };
	selectedDocsById = { ...selectedDocsById, [doc.id]: doc };
}

function removeSource(docId: string, sourceKey: string) {
	const sources = new Set(selectionSources[docId] ?? []);
	if (!sources.has(sourceKey)) return;
	sources.delete(sourceKey);
	const nextSources = { ...selectionSources };
	const nextDocs = { ...selectedDocsById };
	if (sources.size === 0) {
		delete nextSources[docId];
		delete nextDocs[docId];
	} else {
		nextSources[docId] = [...sources];
	}
	selectionSources = nextSources;
	selectedDocsById = nextDocs;
}

function clearBranch(sourceKey: string) {
	for (const docId of Object.keys(selectionSources))
		removeSource(docId, sourceKey);
	activeBranchKeys = activeBranchKeys.filter((item) => item !== sourceKey);
}

function clearAllSelection() {
	selectionSources = {};
	selectedDocsById = {};
	activeBranchKeys = [];
}

async function toggleSelection(node: ImportTreeNode) {
	const branchKey = `branch:${node.id}:${recursive ? "r" : "d"}`;
	if (
		node.kind === "notebook" ||
		(node.kind === "doc" && recursive && node.hasChildren)
	) {
		if (activeBranchKeys.includes(branchKey)) {
			clearBranch(branchKey);
			return;
		}
		const docs =
			node.kind === "notebook"
				? collectDocs(await loadTree(node, recursive))
				: [node, ...collectDocs(await loadTree(node, true))];
		for (const doc of docs) addSource(doc, branchKey);
		activeBranchKeys = [...activeBranchKeys, branchKey];
		return;
	}

	const sourceKey = `doc:${node.id}`;
	if (selectionSources[node.id]?.includes(sourceKey)) {
		removeSource(node.id, sourceKey);
		return;
	}
	if (node.kind === "doc") addSource(node, sourceKey);
}

function isSelected(
	node: ImportTreeNode,
	selectedDocs: Record<string, ImportDocNode>,
	branches: string[],
) {
	return node.kind === "notebook"
		? branches.some((key) => key.startsWith(`branch:${node.id}:`))
		: Boolean(selectedDocs[node.id]);
}

function applyPreviewStatus(items: ImportPreviewItem[]) {
	const statusMap = new Map(items.map((item) => [item.docId, item.status]));
	const patch = (node: ImportTreeNode): ImportTreeNode =>
		node.kind === "notebook"
			? {
					...node,
					children: node.children.map((child) => patch(child) as ImportDocNode),
				}
			: {
					...node,
					status: statusMap.get(node.id) ?? node.status,
					children: node.children.map((child) => patch(child) as ImportDocNode),
				};
	notebooks = notebooks.map((node) => patch(node));
	searchResults = searchResults.map((node) => ({
		...node,
		status: statusMap.get(node.id) ?? node.status,
	}));
	selectedDocsById = Object.fromEntries(
		Object.values(selectedDocsById).map((doc) => [
			doc.id,
			{ ...doc, status: statusMap.get(doc.id) ?? doc.status },
		]),
	);
}

function applyDocStatus(docId: string, status: ImportStatus) {
	const patch = (node: ImportTreeNode): ImportTreeNode =>
		node.kind === "notebook"
			? {
					...node,
					children: node.children.map((child) => patch(child) as ImportDocNode),
				}
			: {
					...node,
					status: node.id === docId ? status : node.status,
					children: node.children.map((child) => patch(child) as ImportDocNode),
				};

	notebooks = notebooks.map((node) => patch(node));
	searchResults = searchResults.map((doc) =>
		doc.id === docId ? { ...doc, status } : doc,
	);
	selectedDocsById = Object.fromEntries(
		Object.values(selectedDocsById).map((doc) => [
			doc.id,
			doc.id === docId ? { ...doc, status } : doc,
		]),
	);
	if (editorState?.docId === docId) {
		editorState = { ...editorState, status };
	}
}

function selectHistoryEntry(jobId: string | null) {
	activeHistoryJobId = jobId;
	const entry =
		(jobId
			? historyEntries.find((item) => item.job.id === jobId)
			: undefined) ?? historyEntries[0];
	activeHistoryEntry = entry ?? null;
	previewItems = entry?.items ?? [];
	latestSummary = entry?.summary ?? null;
}

function createHistoryEntry(
	result: ImportJobResult,
	dryRunValue: boolean,
	syncModeValue: SyncMode,
): ImportHistoryEntry {
	return {
		job: result.job,
		items: result.items,
		summary: result.summary,
		dryRun: dryRunValue,
		syncMode: syncModeValue,
		createdAt: new Date().toISOString(),
	};
}

function setEditorStateFromResponse(next: ImportEditorState, message = "") {
	editorState = next;
	editorContent = next.content;
	editorError = "";
	editorMessage = message;
	editorLoading = false;
	activeEditorDocId = next.docId;
	workspaceMode = "editor";
	applyDocStatus(next.docId, next.status);
}

function clearEditorWorkspace() {
	activeEditorDocId = null;
	editorState = null;
	editorContent = "";
	editorLoading = false;
	editorSaving = false;
	editorError = "";
	editorMessage = "";
	workspaceMode = "batch";
}

function openConflict(item: ImportPreviewItem, originLabel: string) {
	conflictState = { item, originLabel };
	conflictActionError = "";
}

function closeConflict() {
	conflictState = null;
	conflictActionError = "";
}

async function extractTags() {
	tagAiError = "";
	if (selectedDocs.length === 0) {
		tagAiError = "请先选择至少 1 篇文档。";
		return;
	}
	tagAiLoading = true;
	try {
		const response = await fetch(tagsAiApiPath, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				docIds: selectedDocs.map((doc) => doc.id),
			}),
		});
		const data = await readJson<{ tags: string[] }>(response);
		const currentTags = new Set(parseTags(tagsInput));
		for (const tag of data.tags ?? []) {
			currentTags.add(tag);
		}
		tagsInput = Array.from(currentTags).join(", ");
		touched.tags = true;
	} catch (error) {
		tagAiError = errorMessage(error);
	} finally {
		tagAiLoading = false;
	}
}

function closePreview() {
	previewOpen = false;
}

async function openPreview(node: ImportTreeNode) {
	if (node.kind !== "doc") return;
	const docId = node.id;
	previewOpen = true;
	previewError = "";
	previewDocId = docId;
	previewTitle = node.title;
	previewHPath = node.hPath;

	const cached = previewCache[docId];
	if (cached) {
		previewTitle = cached.title;
		previewHPath = cached.hPath;
		previewHtml = cached.html;
		previewLoading = false;
		return;
	}

	previewHtml = "";
	previewLoading = true;
	try {
		const response = await fetch(
			`${previewApiPath}?id=${encodeURIComponent(docId)}`,
		);
		const data = await readJson<{ content: string; hPath: string }>(response);
		if (previewDocId !== docId) return;
		const html = renderMarkdown(data.content ?? "");
		previewHtml = html;
		previewHPath = data.hPath || node.hPath;
		previewCache = {
			...previewCache,
			[docId]: {
				title: node.title,
				hPath: previewHPath,
				html,
			},
		};
	} catch (error) {
		if (previewDocId !== docId) return;
		previewError = errorMessage(error);
	} finally {
		if (previewDocId === docId) previewLoading = false;
	}
}

async function loadEditor(docId: string) {
	activeEditorDocId = docId;
	editorLoading = true;
	editorError = "";
	editorMessage = "";
	workspaceMode = "editor";
	try {
		const response = await fetch(
			`${editorApiPath}?id=${encodeURIComponent(docId)}`,
		);
		const data = await readJson<ImportEditorResponse>(response);
		if (activeEditorDocId !== docId) return;
		setEditorStateFromResponse(data.editor);
	} catch (error) {
		if (activeEditorDocId === docId) {
			editorError = errorMessage(error);
			editorLoading = false;
		}
	}
}

async function saveEditor() {
	if (!editorState) return;
	editorSaving = true;
	editorError = "";
	try {
		const response = await fetch(editorApiPath, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				docId: editorState.docId,
				content: editorContent,
			}),
		});
		const data = await readJson<ImportEditorResponse>(response);
		setEditorStateFromResponse(
			data.editor,
			data.editor.origin === "existing"
				? "真实文件已保存，正文已切到本地优先。"
				: "全文草稿已保存，后续导入会优先使用这份内容。",
		);
		planDirty = true;
		activityMessage = "当前计划结果已过期，重新 Dry Run 一次再执行。";
	} catch (error) {
		editorError = errorMessage(error);
	} finally {
		editorSaving = false;
	}
}

async function discardEditorDraft() {
	if (!editorState) return;
	editorSaving = true;
	editorError = "";
	try {
		await readJson<{ message: string }>(
			await fetch(
				`${editorApiPath}?id=${encodeURIComponent(editorState.docId)}`,
				{
					method: "DELETE",
				},
			),
		);
		applyDocStatus(editorState.docId, "new");
		clearEditorWorkspace();
		planDirty = true;
		activityMessage = "草稿已丢弃。建议重新 Dry Run 看最新计划。";
	} catch (error) {
		editorError = errorMessage(error);
	} finally {
		editorSaving = false;
	}
}

async function resolveConflictAction(
	action: "takeover_existing" | "restore_managed_sync",
	docId: string,
) {
	conflictActionLoading = true;
	conflictActionError = "";
	try {
		const response = await fetch(conflictResolveApiPath, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ docId, action }),
		});
		const data = await readJson<ImportConflictResolveResponse>(response);
		applyDocStatus(docId, data.status);
		if (data.editor) {
			setEditorStateFromResponse(data.editor, data.message);
		} else if (activeEditorDocId === docId) {
			clearEditorWorkspace();
		}
		closeConflict();
		planDirty = true;
		activityMessage = `${data.message} 当前计划结果已过期，重新 Dry Run。`;
	} catch (error) {
		conflictActionError = errorMessage(error);
	} finally {
		conflictActionLoading = false;
	}
}

async function runJob(dryRun: boolean) {
	if (selectedDocs.length === 0) {
		activityMessage = "请先选择至少 1 篇文档。";
		return;
	}
	runningAction = dryRun ? "dryRun" : "sync";
	try {
		const response = await fetch(jobsApiPath, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				dryRun,
				syncMode,
				docIds: selectedDocs.map((doc) => doc.id),
				metadata: {
					category: category.trim(),
					tags: parseTags(tagsInput),
					publishedAt,
					slug: slug.trim(),
					slugPolicy,
					draft,
					localBlockNote: localBlockNote.trim(),
				},
			}),
		});
		const result = await readJson<ImportJobResult>(response);
		const entry = createHistoryEntry(result, dryRun, syncMode);
		historyEntries = [
			entry,
			...historyEntries.filter((item) => item.job.id !== entry.job.id),
		];
		jobs = [result.job, ...jobs];
		selectHistoryEntry(entry.job.id);
		writable = result.writable;
		applyPreviewStatus(result.items);
		planDirty = false;
		activityMessage = dryRun
			? "预演结果已刷新，先把冲突处理干净再执行。"
			: result.job.status === "attention"
				? "本次执行是部分成功，冲突项没写入。"
				: "本次执行已完成。";
	} catch (error) {
		activityMessage = errorMessage(error);
	} finally {
		runningAction = null;
	}
}

async function logout() {
	loggingOut = true;
	try {
		const response = await fetch(logoutApiPath, {
			method: "POST",
		});
		const payload =
			(await response.json()) as ApiResponse<AdminSessionResponse>;
		if (!payload.ok) {
			throw new Error(payload.error);
		}
		window.location.href = loginPagePath;
	} catch (error) {
		activityMessage = errorMessage(error);
		loggingOut = false;
	}
}

async function runSearch(keyword: string) {
	searchController?.abort();
	const controller = new AbortController();
	searchController = controller;
	searchLoading = true;
	searchError = "";
	try {
		const response = await fetch(
			`${searchApiPath}?keyword=${encodeURIComponent(keyword)}`,
			{
				signal: controller.signal,
			},
		);
		const data = await readJson<SearchResponse>(response);
		searchResults = data.items;
		syncSelectedDocs(data.items);
	} catch (error) {
		if ((error as Error).name !== "AbortError") {
			searchResults = [];
			searchError = errorMessage(error);
		}
	} finally {
		if (searchController === controller) searchLoading = false;
	}
}

onMount(() => {
	ready = true;
	void Promise.all([loadNotebooks(), loadHistory()]);
});

onDestroy(() => {
	if (searchTimer) clearTimeout(searchTimer);
	searchController?.abort();
});

$: if (ready) {
	const keyword = query.trim();
	if (searchTimer) clearTimeout(searchTimer);
	if (keyword.length < 2) {
		searchController?.abort();
		searchLoading = false;
		searchError = "";
		searchResults = [];
	} else {
		searchTimer = setTimeout(() => void runSearch(keyword), 260);
	}
}

$: rows = flattenTree(notebooks, expandedIds);
$: selectedDocs = Object.values(selectedDocsById).sort((a, b) =>
	b.updated.localeCompare(a.updated),
);
$: searchActive = query.trim().length >= 2;
$: latestJob = historyEntries[0]?.job ?? jobs[0] ?? null;
$: latestHistoryEntry = historyEntries[0] ?? null;
$: primarySelectedDoc = selectedDocs[0] ?? null;
$: recommendedTags = Array.from(
	new Set(selectedDocs.flatMap((node) => node.tags)),
);
$: notebookNames = Array.from(
	new Set(selectedDocs.map((node) => node.notebookName)),
);
$: stats = {
	newCount: selectedDocs.filter((node) => node.status === "new").length,
	updatedCount: selectedDocs.filter((node) => node.status === "updated").length,
	conflictCount: selectedDocs.filter((node) => node.status === "conflict")
		.length,
	localOverrideCount: selectedDocs.filter(
		(node) => node.status === "local_override",
	).length,
};
$: if (!touched.category)
	category =
		selectedDocs.length === 0
			? ""
			: notebookNames.length === 1
				? notebookNames[0]
				: "批量导入";
$: if (!touched.tags) tagsInput = recommendedTags.join(", ");
$: if (!touched.published)
	publishedAt = selectedDocs[0] ? formatDate(selectedDocs[0].updated) : "";
$: if (!touched.slug)
	slug =
		selectedDocs.length === 1
			? buildSlug(selectedDocs[0].title, selectedDocs[0].id)
			: "";
$: activeHistoryEntry =
	(activeHistoryJobId
		? historyEntries.find((entry) => entry.job.id === activeHistoryJobId)
		: undefined) ??
	historyEntries[0] ??
	null;
$: historyHiddenCount = Math.max(historyEntries.length - HISTORY_PREVIEW_LIMIT, 0);
$: visibleHistoryEntries = historyExpanded
	? historyEntries
	: historyEntries.slice(0, HISTORY_PREVIEW_LIMIT);
$: if (activeHistoryEntry) {
	previewItems = activeHistoryEntry.items;
	latestSummary = activeHistoryEntry.summary;
} else {
	previewItems = [];
	latestSummary = null;
}
$: editorDirty = Boolean(editorState) && editorContent !== editorState.content;
$: editorTargetPathPreview = editorState
	? deriveTargetPathFromEditor(editorContent, editorState.targetPath)
	: "";
</script>

<section class="min-h-[100dvh] bg-[#efede7] px-4 py-4 text-[#171918] dark:bg-[#0f1210] dark:text-[#edf1ec] sm:px-6 lg:px-8">
	<div class="mx-auto max-w-[1400px]">
		<div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
			<div class="space-y-6">
				<header class={`${panelClass} p-5 sm:p-6`}>
					<div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
						<div class="space-y-5">
							<div class="flex flex-wrap items-center gap-2.5 text-xs">
								<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5c574d] dark:border-[#2f3732] dark:bg-[#111512] dark:text-[#b8c2b9]">Import Console</span>
								<span class="rounded-full border border-[#d7d1c4] bg-[#f3f0e7] px-3 py-1 text-[#5c574d] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#b8c2b9]">后台受保护</span>
								<span class={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${recursive ? "border-[#c8d6ce] bg-[#edf2ee] text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]" : "border-[#d7d2c6] bg-[#f3f0e7] text-[#5f5a50] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#b7c1b8]"}`}>
									{recursive ? "recursive on" : "recursive off"}
								</span>
							</div>

							<div class="max-w-[42rem]">
								<p class={sectionLabelClass}>思源文档到博客内容库</p>
								<h1 class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#141715] dark:text-[#f0f4ef] sm:text-4xl">导入后台</h1>
								<p class="mt-4 text-sm leading-7 text-[#5f5a50] dark:text-[#a4aea5]">
									左侧只做检索和选择，右侧只做规则和执行。把路径、标签、时间和同步策略压成一个稳定工作流，别再在一堆松散卡片里反复横跳。
								</p>
							</div>

							<div class="grid gap-3 md:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
								<div class={`${metricTileClass} space-y-4`}>
									<div class="flex items-start justify-between gap-4">
										<div>
											<p class={sectionLabelClass}>当前焦点</p>
											<div class="mt-3 flex items-end gap-3">
												<span class="font-mono text-4xl tracking-[-0.05em] text-[#171918] dark:text-[#f0f4ef]">{selectedDocs.length}</span>
												<span class="pb-1 text-sm text-[#6f695f] dark:text-[#9ba79d]">篇待处理文档</span>
											</div>
										</div>
										<span class="rounded-full border border-[#d7d1c4] bg-[#f3f0e7] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6a655c] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#98a49b]">
											{selectedDocs.length === 1 ? "single" : "batch"}
										</span>
									</div>
									<p class="text-sm leading-7 text-[#5f5a50] dark:text-[#a4aea5]">
										{#if selectedDocs.length === 0}
											先从左侧选文档，自动回填才会开始工作。
										{:else}
											主要来源：{notebookNames.join(" / ") || "未识别"}。{#if primarySelectedDoc}首篇文档是《{primarySelectedDoc.title}》。{/if}
										{/if}
									</p>
									<div class="flex flex-wrap gap-2">
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta.new.tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta.new.dot}`}></span>未导入 {stats.newCount}</span>
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta.updated.tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta.updated.dot}`}></span>待更新 {stats.updatedCount}</span>
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta.local_override.tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta.local_override.dot}`}></span>本地优先 {stats.localOverrideCount}</span>
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta.conflict.tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta.conflict.dot}`}></span>风险 {stats.conflictCount}</span>
									</div>
								</div>

								<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
									<div class={metricTileClass}>
										<p class={sectionLabelClass}>待同步变化</p>
										<div class="mt-3 font-mono text-3xl tracking-[-0.05em] text-[#171918] dark:text-[#f0f4ef]">{stats.updatedCount}</div>
										<p class="mt-2 text-sm leading-6 text-[#6f695f] dark:text-[#9ba79d]">源内容已变更，执行时会进入更新通道。</p>
									</div>
									<div class={metricTileClass}>
										<p class={sectionLabelClass}>冲突风险</p>
										<div class="mt-3 font-mono text-3xl tracking-[-0.05em] text-[#171918] dark:text-[#f0f4ef]">{stats.conflictCount}</div>
										<p class="mt-2 text-sm leading-6 text-[#6f695f] dark:text-[#9ba79d]">先跑 Dry Run，别拿正式执行去试错。</p>
									</div>
								</div>
							</div>
						</div>

						<div class={`${surfaceClass} p-5`}>
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class={sectionLabelClass}>会话与执行器</p>
									<h2 class="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#f0f4ef]">操作面板状态</h2>
								</div>
								<div class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{adminUser || "admin"}</div>
							</div>

							<div class="mt-5 space-y-3 text-sm">
								<div class="flex items-center justify-between gap-4 border-b border-[#e5dfd2] pb-3 dark:border-[#212824]">
									<span class="text-[#6f695f] dark:text-[#9ba79d]">同步策略</span>
									<span class="font-medium text-[#171918] dark:text-[#eef2ed]">{syncModeMeta[syncMode].title}</span>
								</div>
								<div class="flex items-center justify-between gap-4 border-b border-[#e5dfd2] pb-3 dark:border-[#212824]">
									<span class="text-[#6f695f] dark:text-[#9ba79d]">Slug 策略</span>
									<span class="font-medium text-[#171918] dark:text-[#eef2ed]">{slugPolicyOptions.find((option) => option.value === slugPolicy)?.label}</span>
								</div>
								<div class="flex items-center justify-between gap-4 border-b border-[#e5dfd2] pb-3 dark:border-[#212824]">
									<span class="text-[#6f695f] dark:text-[#9ba79d]">最近任务</span>
									{#if latestJob}
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${jobStatusMeta[latestJob.status].tone}`}><span class={`h-2 w-2 rounded-full ${jobStatusMeta[latestJob.status].dot}`}></span>{jobStatusMeta[latestJob.status].label}</span>
									{:else}
										<span class="text-[#171918] dark:text-[#eef2ed]">等待第一次执行</span>
									{/if}
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-[#6f695f] dark:text-[#9ba79d]">写入能力</span>
									<span class="font-medium text-[#171918] dark:text-[#eef2ed]">
										{#if latestSummary}
											{writable ? "真实写入已接入" : "当前只输出计划"}
										{:else}
											待最近一次任务确认
										{/if}
									</span>
								</div>
							</div>

							{#if recommendedTags.length > 0}
								<div class="mt-5 border-t border-[#e5dfd2] pt-4 dark:border-[#212824]">
									<p class={sectionLabelClass}>推荐标签</p>
									<div class="mt-3 flex flex-wrap gap-2">
										{#each recommendedTags.slice(0, 8) as tag}
											<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{tag}</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</header>

				<section class={`${panelClass} p-5 sm:p-6`}>
					<div class="grid gap-4 border-b border-[#e5dfd2] pb-5 dark:border-[#212824] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
						<div class="space-y-3">
							<div>
								<p class={sectionLabelClass}>选择源文档</p>
								<h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#f0f4ef]">检索与目录树</h2>
							</div>
							<p class="max-w-[44rem] text-sm leading-7 text-[#5f5a50] dark:text-[#a4aea5]">
								搜索命中后可以直接勾选；目录节点支持整支递归选择；单篇文档支持即时预览。交互应该干净利落，不该让你来回猜它到底会处理什么。
							</p>
						</div>

						<div class="flex flex-wrap gap-3 lg:justify-end">
							{#if selectedDocs.length > 0}
								<button class={quietButtonClass} on:click={clearAllSelection} type="button">清空选择</button>
							{/if}
							<label class="inline-flex items-center gap-3 rounded-full border border-[#d6d0c3] bg-[#fcfbf7] px-4 py-2.5 text-sm text-[#4f4b43] dark:border-[#303833] dark:bg-[#111512] dark:text-[#b8c2b9]">
								<input bind:checked={recursive} class="h-4 w-4 accent-[#355b4b] dark:accent-[#84a594]" type="checkbox" />
								<span>目录递归</span>
							</label>
						</div>
					</div>

					<div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
						<label class="grid gap-2">
							<span class={sectionLabelClass}>搜索</span>
							<div class="relative">
								<input bind:value={query} class={`${inputClass} pr-24`} placeholder="搜索标题、路径或标签，至少 2 个字符" type="text" />
								<span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">/search</span>
							</div>
							<span class={helperTextClass}>关键词会走防抖请求，不会每敲一个字就把接口打爆。</span>
						</label>

						<div class={`${surfaceClass} flex flex-col justify-between p-4`}>
							<p class={sectionLabelClass}>当前视图</p>
							<div class="mt-3 font-mono text-3xl tracking-[-0.05em] text-[#171918] dark:text-[#f0f4ef]">{searchActive ? searchResults.length : rows.length}</div>
							<p class="mt-2 text-sm leading-6 text-[#6f695f] dark:text-[#9ba79d]">
								{#if searchActive}
									{searchLoading ? "正在返回搜索结果。" : "当前显示搜索命中。"}
								{:else}
									{rows.length} 个可见节点，目录按需展开。
								{/if}
							</p>
						</div>
					</div>

				{#if searchActive}
					<div class={`${surfaceClass} mt-5 p-4`}>
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class={sectionLabelClass}>搜索结果</p>
								<h3 class="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">关键词 “{query.trim()}”</h3>
							</div>
							<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">
								{searchLoading ? "loading" : `${searchResults.length} hits`}
							</div>
						</div>

						<div class="mt-4">
							{#if searchError}
								<div class="rounded-[1.2rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{searchError}</div>
							{:else if searchLoading}
								<div class="space-y-2">
									{#each Array.from({ length: 3 }) as _}
										<div class={`${surfaceClass} animate-pulse p-4`} aria-hidden="true">
											<div class="h-4 w-1/3 rounded bg-[#e7e1d5] dark:bg-[#202621]"></div>
											<div class="mt-3 h-3 w-2/3 rounded bg-[#ece6da] dark:bg-[#1b211d]"></div>
											<div class="mt-3 h-3 w-5/6 rounded bg-[#ece6da] dark:bg-[#1b211d]"></div>
										</div>
									{/each}
								</div>
							{:else if searchResults.length === 0}
								<div class="rounded-[1.2rem] border border-[#ddd7ca] bg-[#fcfbf7] p-5 text-sm leading-7 text-[#6f695f] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#9ba79d]">
									没命中。先别怀疑系统，八成是关键词太短、太泛，或者路径层级和标签没对上。
								</div>
							{:else}
								<div class="space-y-2">
									{#each searchResults as item}
										<div
											aria-pressed={isSelected(item, selectedDocsById, activeBranchKeys)}
											class={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition duration-200 ${isSelected(item, selectedDocsById, activeBranchKeys) ? "border-[#99b3a6] bg-[#eef2ed] dark:border-[#355447] dark:bg-[#151c18]" : "border-[#dfd9cc] bg-[#fcfbf7] hover:border-[#c5cfc8] hover:bg-[#f5f3ed] dark:border-[#29302b] dark:bg-[#111512] dark:hover:border-[#3a4840] dark:hover:bg-[#151917]"}`}
											role="button"
											tabindex="0"
											on:click={() => toggleSelection(item)}
											on:keydown={(event) => {
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													toggleSelection(item);
												}
											}}
										>
											<div class="flex flex-wrap items-start justify-between gap-3">
												<div class="min-w-0 flex-1">
													<div class="truncate text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{item.title}</div>
													<div class="mt-1 truncate text-xs text-[#7a7569] dark:text-[#8d998f]">{item.notebookName} · {item.updatedLabel}</div>
													<div class="mt-3 truncate font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{item.hPath}</div>
												</div>
												<div class="flex flex-wrap items-center gap-2">
													<button class={quietButtonClass} on:click|stopPropagation={() => openPreview(item)} type="button">预览</button>
													<button class={quietButtonClass} on:click|stopPropagation={() => loadEditor(item.id)} type="button">编辑</button>
													<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[item.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[item.status].dot}`}></span>{statusMeta[item.status].label}</span>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<div class="mt-5">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class={sectionLabelClass}>目录工作区</p>
							<h3 class="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">目录与文档</h3>
						</div>
						<div class="text-right">
							<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{rows.length} visible</div>
							{#if expandedIds.length > 0}
								<div class="mt-1 text-xs text-[#6f695f] dark:text-[#9ba79d]">已展开 {expandedIds.length} 个分支</div>
							{/if}
						</div>
					</div>

					<div class="mt-4 rounded-[1.6rem] border border-[#ddd7ca] bg-[#f5f2ea] p-3 dark:border-[#29302b] dark:bg-[#101411]">
						{#if treeError}
							<div class="rounded-[1.25rem] border border-[#e1caca] bg-[#f6ecec] p-5 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">
								<div class="font-medium">目录加载失败</div>
								<div class="mt-2 leading-7">{treeError}</div>
								<button class={`${quietButtonClass} mt-4`} on:click={loadNotebooks} type="button">重新加载</button>
							</div>
						{:else if notebooksLoading}
							<div class="space-y-2">
								{#each Array.from({ length: 7 }) as _}
									<div class={`${surfaceClass} animate-pulse p-4`} aria-hidden="true">
										<div class="flex items-center gap-3">
											<div class="h-8 w-8 rounded-full bg-[#e5dfd2] dark:bg-[#1b211d]"></div>
											<div class="flex-1">
												<div class="h-4 w-1/3 rounded bg-[#e5dfd2] dark:bg-[#1b211d]"></div>
												<div class="mt-3 h-3 w-2/3 rounded bg-[#ece6da] dark:bg-[#202621]"></div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else if rows.length === 0}
							<div class="rounded-[1.25rem] border border-[#ddd7ca] bg-[#fcfbf7] p-5 text-sm leading-7 text-[#6f695f] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#9ba79d]">
								当前没有可展示的目录节点。先确认思源接口、笔记本权限和返回数据，不要在空列表上硬猜前端问题。
							</div>
						{:else}
							<div class="space-y-2 lg:max-h-[780px] lg:overflow-y-auto lg:pr-1">
								{#each rows as row (row.node.id)}
									<div class={`rounded-[1.35rem] border px-3 py-3.5 transition duration-200 ${isSelected(row.node, selectedDocsById, activeBranchKeys) ? "border-[#99b3a6] bg-[#eef2ed] dark:border-[#355447] dark:bg-[#151c18]" : "border-[#ddd7ca] bg-[#fcfbf7] dark:border-[#29302b] dark:bg-[#111512]"}`} style={`padding-left:${row.depth * 18 + 12}px`}>
										<div class="flex items-start gap-3">
											{#if row.node.kind === "notebook" || row.node.hasChildren}
												<button class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d6d0c3] bg-[#fcfbf7] text-[#5c574d] transition duration-200 hover:bg-[#f2f0e9] active:translate-y-px dark:border-[#303833] dark:bg-[#111512] dark:text-[#b8c2b9] dark:hover:bg-[#171c18]" on:click={() => toggleExpand(row.node)} type="button">
													<svg class={`h-3.5 w-3.5 transition ${expandedIds.includes(row.node.id) ? "rotate-90" : ""}`} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 16 16">
														<path d="M6 3.5 10.5 8 6 12.5"></path>
													</svg>
												</button>
											{:else}
												<div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-[#8d867a] dark:text-[#7f8c82]">
													<div class="h-2.5 w-2.5 rounded-full border border-current"></div>
												</div>
											{/if}

											<button class={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition duration-200 ${isSelected(row.node, selectedDocsById, activeBranchKeys) ? "border-[#355b4b] bg-[#355b4b] text-white dark:border-[#60846f] dark:bg-[#60846f]" : "border-[#bdb6a9] text-transparent dark:border-[#49544c]"}`} on:click={() => toggleSelection(row.node)} type="button">
												<svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewBox="0 0 16 16">
													<path d="m3.5 8.25 3 3L12.5 5.5"></path>
												</svg>
											</button>

											<div
												class="min-w-0 flex-1 cursor-pointer text-left"
												role="button"
												tabindex="0"
												on:click={() => toggleSelection(row.node)}
												on:keydown={(event) => {
													if (event.key === "Enter" || event.key === " ") {
														event.preventDefault();
														toggleSelection(row.node);
													}
												}}
											>
												<div class="flex flex-wrap items-start justify-between gap-3">
													<div class="min-w-0 flex-1">
														<div class="truncate text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{row.node.title}</div>
														<div class="mt-1 truncate text-xs text-[#7a7569] dark:text-[#8d998f]">
															{row.node.notebookName}
															{#if row.node.kind === "doc"}
																· {row.node.updatedLabel}
																{#if row.node.hasChildren}
																	· {row.node.childCount} 个子项
																{/if}
															{/if}
														</div>
														<div class="mt-3 truncate font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{row.node.kind === "notebook" ? `/${row.node.notebookName}` : row.node.hPath}</div>
													</div>

													<div class="flex flex-wrap items-center gap-2">
														{#if loadingNodeIds.includes(row.node.id)}
															<span class="rounded-full border border-[#d7d2c6] bg-[#f3f0e7] px-3 py-1 text-xs text-[#5f5a50] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#b7c1b8]">加载中</span>
														{/if}

														{#if row.node.kind === "doc"}
															<button class={quietButtonClass} on:click|stopPropagation={() => openPreview(row.node)} type="button">预览</button>
															<button class={quietButtonClass} on:click|stopPropagation={() => loadEditor(row.node.id)} type="button">编辑</button>
															<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[row.node.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[row.node.status].dot}`}></span>{statusMeta[row.node.status].label}</span>
														{:else}
															<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">笔记本</span>
														{/if}
													</div>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</section>

			<aside class="space-y-6 xl:sticky xl:top-6 self-start">
				<section class={`${panelClass} p-5 sm:p-6`}>
					<div class="flex items-start justify-between gap-4 border-b border-[#e5dfd2] pb-5 dark:border-[#212824]">
						<div>
							<p class={sectionLabelClass}>工作区</p>
							<h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#f0f4ef]">
								{workspaceMode === "editor" && (editorState || editorLoading)
									? "单篇文档工作区"
									: "批量默认配置"}
							</h2>
						</div>
						<div class="inline-flex rounded-full border border-[#d6d0c3] bg-[#f2efe7] p-1 dark:border-[#303833] dark:bg-[#171c18]">
							<button class={`rounded-full px-4 py-2 text-sm transition ${workspaceMode === "batch" ? "bg-[#fcfbf7] text-[#171918] dark:bg-[#111512] dark:text-[#eef2ed]" : "text-[#6a655c] dark:text-[#98a49b]"}`} on:click={() => (workspaceMode = "batch")} type="button">批量</button>
							<button class={`rounded-full px-4 py-2 text-sm transition ${workspaceMode === "editor" ? "bg-[#fcfbf7] text-[#171918] dark:bg-[#111512] dark:text-[#eef2ed]" : "text-[#6a655c] dark:text-[#98a49b]"}`} disabled={!editorState && !editorLoading} on:click={() => { if (editorState || editorLoading) workspaceMode = "editor"; }} type="button">单篇</button>
						</div>
					</div>

					{#if workspaceMode === "editor" && (editorState || editorLoading)}
						<div class="space-y-5 pt-5">
							{#if editorLoading}
								<div class={`${surfaceClass} animate-pulse p-5`} aria-hidden="true">
									<div class="h-4 w-1/3 rounded bg-[#e5dfd2] dark:bg-[#1b211d]"></div>
									<div class="mt-4 h-3 w-5/6 rounded bg-[#ece6da] dark:bg-[#202621]"></div>
									<div class="mt-5 h-[360px] rounded-[1.2rem] bg-[#efe9dc] dark:bg-[#181e1a]"></div>
								</div>
							{:else if editorState}
								<div class={`${surfaceClass} p-4`}>
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<p class={sectionLabelClass}>目标文档</p>
											<div class="mt-2 truncate text-xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">{editorState.title}</div>
											<div class="mt-2 truncate text-sm text-[#6f695f] dark:text-[#9ba79d]">{editorState.notebookName} · {editorState.updatedLabel}</div>
											<div class="mt-2 truncate font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{editorState.hPath}</div>
										</div>
										<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[editorState.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[editorState.status].dot}`}></span>{statusMeta[editorState.status].label}</span>
									</div>

									<div class="mt-4 grid gap-3">
										<div class={`${surfaceClass} p-3`}>
											<div class={sectionLabelClass}>目标路径</div>
											<div class="mt-2 break-all text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{editorTargetPathPreview}</div>
											{#if editorTargetPathPreview !== editorState.targetPath}
												<div class="mt-2 text-xs text-[#9b6b35] dark:text-[#d7b37f]">当前内容里的 slug 会把目标改到这个路径。</div>
											{/if}
										</div>
										<div class="grid gap-3 sm:grid-cols-2">
											<div class={`${surfaceClass} p-3`}>
												<div class={sectionLabelClass}>同步策略</div>
												<div class="mt-2 text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{syncStrategyMeta[editorState.syncStrategy].label}</div>
												<div class="mt-2 text-xs leading-6 text-[#6f695f] dark:text-[#9ba79d]">{syncStrategyMeta[editorState.syncStrategy].desc}</div>
											</div>
											<div class={`${surfaceClass} p-3`}>
												<div class={sectionLabelClass}>来源状态</div>
												<div class="mt-2 text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{editorOriginMeta[editorState.origin]}</div>
												{#if editorState.existingPath}
													<div class="mt-2 break-all font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{editorState.existingPath}</div>
												{/if}
											</div>
										</div>
									</div>
								</div>

								{#if editorState.conflictDetail}
									<div class="rounded-[1.35rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">
										<div class="flex items-start justify-between gap-3">
											<div>
												<div class="font-medium">{conflictTypeMeta[editorState.conflictDetail.type].label}</div>
												<div class="mt-2 leading-7">{editorState.conflictDetail.message}</div>
											</div>
											<button class={quietButtonClass} on:click={() => openConflict({
												docId: editorState.docId,
												title: editorState.title,
												notebookName: editorState.notebookName,
												hPath: editorState.hPath,
												status: editorState.status,
												action: "block",
												reason: editorState.conflictDetail?.message ?? "",
												targetPath: editorState.targetPath,
												existingPath: editorState.existingPath,
												suggestedSlug: extractFrontmatterField(editorContent, "slug"),
												updatedLabel: editorState.updatedLabel,
												tags: [],
												syncStrategy: editorState.syncStrategy,
												conflictType: editorState.conflictDetail.type,
												conflictDetail: editorState.conflictDetail,
												existingTitle: editorState.conflictDetail.existingTitle,
												existingDocId: editorState.conflictDetail.existingDocId,
												protectedBlockState: editorState.conflictDetail.protectedBlockState,
											}, "编辑工作区")} type="button">查看详情</button>
										</div>
									</div>
								{/if}

								<div class={`${surfaceClass} p-4`}>
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class={sectionLabelClass}>全文 Markdown 编辑器</p>
											<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">这里编辑的是完整目标文件，不是尾部备注。</div>
										</div>
										{#if editorDirty}
											<span class="rounded-full border border-[#e4d2b8] bg-[#f7efe3] px-3 py-1 text-xs text-[#7b5622] dark:border-[#4b3720] dark:bg-[#241d15] dark:text-[#d7b37f]">未保存</span>
										{/if}
									</div>

									<div class="mt-4">
										<textarea bind:value={editorContent} class={editorTextareaClass} spellcheck="false"></textarea>
									</div>

									{#if editorError}
										<div class="mt-4 rounded-[1.2rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{editorError}</div>
									{/if}
									{#if editorMessage}
										<div class="mt-4 rounded-[1.2rem] border border-[#c8d6ce] bg-[#edf2ee] p-4 text-sm text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]">{editorMessage}</div>
									{/if}

									<div class="mt-5 flex flex-wrap gap-3">
										<button class={primaryButtonClass} disabled={editorSaving} on:click={() => saveEditor()} type="button">{editorSaving ? "保存中..." : getEditorSaveLabel(editorState)}</button>
										{#if editorState.origin !== "existing"}
											<button class={quietButtonClass} disabled={editorSaving} on:click={() => discardEditorDraft()} type="button">丢弃草稿</button>
										{/if}
										{#if editorState.syncStrategy === "local_override" || editorState.origin !== "existing"}
											<button class={quietButtonClass} disabled={editorSaving} on:click={() => resolveConflictAction("restore_managed_sync", editorState.docId)} type="button">恢复思源同步</button>
										{/if}
										<button class={quietButtonClass} disabled={editorSaving} on:click={() => (workspaceMode = "batch")} type="button">回到批量</button>
										<button class={quietButtonClass} disabled={editorSaving} on:click={clearEditorWorkspace} type="button">关闭工作区</button>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="space-y-5 pt-5">
							<div class={`${surfaceClass} p-4`}>
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class={sectionLabelClass}>执行协议</p>
										<div class="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">{syncModeMeta[syncMode].title}</div>
									</div>
									<div class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{adminUser || "admin"}</div>
								</div>
								<p class="mt-3 text-sm leading-7 text-[#5f5a50] dark:text-[#a4aea5]">{syncModeMeta[syncMode].desc}</p>
							</div>

							<label class="grid gap-2">
								<span class={sectionLabelClass}>分类</span>
								<input bind:value={category} class={inputClass} on:input={() => (touched.category = true)} placeholder="例如：工程效率" type="text" />
								<span class={helperTextClass}>默认跟随来源笔记本；多来源时回落到“批量导入”。没有单篇草稿覆盖时才生效。</span>
							</label>

							<div class="grid gap-2">
								<div class="flex items-center justify-between gap-3">
									<span class={sectionLabelClass}>标签</span>
									<button class={quietButtonClass} disabled={tagAiLoading || selectedDocs.length === 0} on:click={extractTags} type="button">{tagAiLoading ? "提取中..." : "AI 提取"}</button>
								</div>
								<input
									bind:value={tagsInput}
									class={inputClass}
									on:input={() => {
										touched.tags = true;
										tagAiError = "";
									}}
									placeholder="标签，逗号分隔"
									type="text"
								/>
								<span class={helperTextClass}>批量默认值只给没单篇草稿的文档兜底，别指望它覆盖你手工改过的全文。</span>
								{#if tagAiError}
									<div class="text-xs text-[#8a4e4e] dark:text-[#d59b9b]">{tagAiError}</div>
								{/if}
							</div>

							<div class="grid gap-4 md:grid-cols-2">
								<label class="grid gap-2">
									<span class={sectionLabelClass}>发布日期</span>
									<input bind:value={publishedAt} class={inputClass} on:input={() => (touched.published = true)} type="date" />
									<span class={helperTextClass}>默认取首篇文档更新时间。</span>
								</label>

								<label class="grid gap-2">
									<span class={sectionLabelClass}>Slug</span>
									<input bind:value={slug} class={inputClass} disabled={selectedDocs.length !== 1} on:input={() => (touched.slug = true)} placeholder="single-doc-slug" type="text" />
									<span class={helperTextClass}>{selectedDocs.length === 1 ? "单篇导入时可直接精确控制路径。" : "多篇时锁定，避免你误以为一个 slug 能管一批文档。"}</span>
								</label>
							</div>

							<div class="grid gap-2">
								<span class={sectionLabelClass}>同步模式</span>
								{#each syncModeOrder as mode}
									<button class={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-200 ${syncMode === mode ? "border-[#99b3a6] bg-[#eef2ed] dark:border-[#355447] dark:bg-[#151c18]" : "border-[#ddd7ca] bg-[#fcfbf7] hover:border-[#c5cfc8] hover:bg-[#f5f3ed] dark:border-[#29302b] dark:bg-[#111512] dark:hover:border-[#3a4840] dark:hover:bg-[#151917]"}`} on:click={() => (syncMode = mode)} type="button">
										<div class="flex items-center justify-between gap-3">
											<div class="text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{syncModeMeta[mode].title}</div>
											<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{mode}</div>
										</div>
										<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{syncModeMeta[mode].desc}</div>
									</button>
								{/each}
							</div>

							<div class="grid gap-2">
								<span class={sectionLabelClass}>Slug 策略</span>
								{#each slugPolicyOptions as option}
									<button class={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-200 ${slugPolicy === option.value ? "border-[#99b3a6] bg-[#eef2ed] dark:border-[#355447] dark:bg-[#151c18]" : "border-[#ddd7ca] bg-[#fcfbf7] hover:border-[#c5cfc8] hover:bg-[#f5f3ed] dark:border-[#29302b] dark:bg-[#111512] dark:hover:border-[#3a4840] dark:hover:bg-[#151917]"}`} on:click={() => (slugPolicy = option.value)} type="button">
										<div class="flex items-center justify-between gap-3">
											<div class="text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{option.label}</div>
											{#if slugPolicy === option.value}
												<span class="rounded-full border border-[#c8d6ce] bg-[#edf2ee] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]">active</span>
											{/if}
										</div>
										<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{option.desc}</div>
									</button>
								{/each}
							</div>

							<label class={`${surfaceClass} flex items-center justify-between gap-4 p-4`}>
								<div>
									<div class="text-sm font-medium text-[#171918] dark:text-[#eef2ed]">草稿导入</div>
									<div class="mt-1 text-xs leading-6 text-[#6f695f] dark:text-[#9ba79d]">需要先灰度验证时再开，不要把半成品直接推到正式内容流。</div>
								</div>
								<input bind:checked={draft} class="h-4 w-4 accent-[#355b4b] dark:accent-[#84a594]" type="checkbox" />
							</label>

							<label class="grid gap-2">
								<span class={sectionLabelClass}>LOCAL 区块备注</span>
								<textarea bind:value={localBlockNote} class={textareaClass} placeholder="留空即可。只有你明确需要批量注入默认 LOCAL 内容时再写。"></textarea>
								<span class={helperTextClass}>默认留空。这里只是批量导入时给新文章塞一个 LOCAL 默认值，不是正文编辑器。</span>
							</label>

							<div class={`${surfaceClass} p-4`}>
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class={sectionLabelClass}>选中文档</p>
										<div class="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">已选 {selectedDocs.length} 篇</div>
									</div>
									<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">selection</div>
								</div>

								{#if selectedDocs.length === 0}
									<p class="mt-4 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">还没选文档，右侧表单现在只是空壳。先去左边勾选，自动回填才有意义。</p>
								{:else}
									<div class="mt-4 space-y-2">
										{#each selectedDocs.slice(0, 6) as doc}
											<div class="rounded-[1.15rem] border border-[#ddd7ca] bg-[#fcfbf7] px-3 py-3 dark:border-[#29302b] dark:bg-[#111512]">
												<div class="flex items-center justify-between gap-3">
													<div class="min-w-0">
														<div class="truncate text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{doc.title}</div>
														<div class="mt-1 truncate font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{doc.hPath}</div>
													</div>
													<div class="flex items-center gap-2">
														<button class={quietButtonClass} on:click={() => loadEditor(doc.id)} type="button">编辑</button>
														<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[doc.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[doc.status].dot}`}></span>{statusMeta[doc.status].label}</span>
													</div>
												</div>
											</div>
										{/each}
									</div>
									{#if selectedDocs.length > 6}
										<p class="mt-3 text-xs text-[#6f695f] dark:text-[#9ba79d]">还有 {selectedDocs.length - 6} 篇没展开，没必要把右栏堆成垃圾场。</p>
									{/if}
								{/if}
							</div>
						</div>
					{/if}

				</section>

				<section class={`${panelClass} p-5 sm:p-6`}>
					<div class="flex items-start justify-between gap-4 border-b border-[#e5dfd2] pb-5 dark:border-[#212824]">
						<div>
							<p class={sectionLabelClass}>任务流</p>
							<h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#f0f4ef]">预演、执行与回执</h2>
						</div>
						{#if latestHistoryEntry}
							<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${jobStatusMeta[latestHistoryEntry.job.status].tone}`}><span class={`h-2 w-2 rounded-full ${jobStatusMeta[latestHistoryEntry.job.status].dot}`}></span>{jobStatusMeta[latestHistoryEntry.job.status].label}</span>
						{:else if latestJob}
							<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${jobStatusMeta[latestJob.status].tone}`}><span class={`h-2 w-2 rounded-full ${jobStatusMeta[latestJob.status].dot}`}></span>{jobStatusMeta[latestJob.status].label}</span>
						{:else}
							<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">待执行</span>
						{/if}
					</div>

					<div class="space-y-5 pt-5">
						<div class={`${surfaceClass} p-4`}>
							<div class="grid gap-3 sm:grid-cols-2">
								<button class={quietButtonClass} disabled={runningAction !== null} on:click={() => runJob(true)} type="button">{runningAction === "dryRun" ? "预演中..." : "Dry Run"}</button>
								<button class={primaryButtonClass} disabled={runningAction !== null} on:click={() => runJob(false)} type="button">{runningAction === "sync" ? "执行中..." : "执行同步"}</button>
							</div>
							<p class="mt-3 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">现在是跳过冲突继续写入，不会再因为 1 篇撞车把整批卡死。</p>

							{#if activityMessage}
								<div class={`mt-4 rounded-[1.2rem] border p-4 text-sm ${planDirty ? "border-[#e4d2b8] bg-[#f7efe3] text-[#7b5622] dark:border-[#4b3720] dark:bg-[#241d15] dark:text-[#d7b37f]" : "border-[#c8d6ce] bg-[#edf2ee] text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]"}`}>{activityMessage}</div>
							{/if}

							{#if latestHistoryEntry}
								<div class="mt-4 rounded-[1.2rem] border border-[#ddd7ca] bg-[#fcfbf7] p-4 text-sm text-[#5f5a50] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#b9c4ba]">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div class="min-w-0">
											<p class={sectionLabelClass}>最近结果</p>
											<div class="mt-2 flex flex-wrap items-center gap-2">
												<div class="text-base font-semibold tracking-[-0.03em] text-[#171918] dark:text-[#eef2ed]">{latestHistoryEntry.job.label}</div>
												<span class="rounded-full border border-[#d7d1c4] bg-[#f3f0e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#5d584f] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#bac4bb]">{latestHistoryEntry.dryRun ? "dry run" : "执行"}</span>
												<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-[11px] text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{syncModeMeta[latestHistoryEntry.syncMode].title}</span>
											</div>
											<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{latestHistoryEntry.job.detail}</div>
										</div>
										<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{latestHistoryEntry.job.id} · {latestHistoryEntry.job.timestamp}</div>
									</div>

									<div class="mt-4 flex flex-wrap gap-2">
										<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">共 {latestHistoryEntry.summary.total} 篇</span>
										<span class="rounded-full border border-[#c8d6ce] bg-[#edf2ee] px-3 py-1 text-xs text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]">写入 {latestHistoryEntry.summary.writtenCount}</span>
										<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">新增 {latestHistoryEntry.summary.newCount}</span>
										<span class="rounded-full border border-[#e4d2b8] bg-[#f7efe3] px-3 py-1 text-xs text-[#7b5622] dark:border-[#4b3720] dark:bg-[#241d15] dark:text-[#d7b37f]">更新 {latestHistoryEntry.summary.updatedCount}</span>
										<span class="rounded-full border border-[#d7d1c4] bg-[#f3f0e7] px-3 py-1 text-xs text-[#5d584f] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#bac4bb]">跳过 {latestHistoryEntry.summary.skipCount}</span>
										<span class="rounded-full border border-[#e1caca] bg-[#f6ecec] px-3 py-1 text-xs text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">冲突 {latestHistoryEntry.summary.conflictCount}</span>
									</div>
									{#if !writable}
										<div class="mt-2 text-xs text-[#9b6b35] dark:text-[#d7b37f]">当前版本只生成预演和执行计划，真实写入器还没接。</div>
									{/if}
								</div>
							{/if}
						</div>

						<div>
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class={sectionLabelClass}>历史任务</p>
									<p class="mt-1 text-xs text-[#6f695f] dark:text-[#9ba79d]">默认只展示最近 {Math.min(historyEntries.length, HISTORY_PREVIEW_LIMIT)} 条，旧记录先收起来，别把右栏挤爆。</p>
								</div>
								<div class="flex flex-wrap items-center justify-end gap-2">
									{#if activeHistoryEntry && latestHistoryEntry && activeHistoryEntry.job.id !== latestHistoryEntry.job.id}
										<button class={quietButtonClass} on:click={() => selectHistoryEntry(latestHistoryEntry?.job.id ?? null)} type="button">回到最新</button>
									{/if}
									{#if historyEntries.length > HISTORY_PREVIEW_LIMIT}
										<button class={quietButtonClass} on:click={() => (historyExpanded = !historyExpanded)} type="button">{historyExpanded ? "收起旧记录" : `展开其余 ${historyHiddenCount} 条`}</button>
									{/if}
									{#if historyEntries.length > 0}
										<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{historyEntries.length} records</div>
									{/if}
								</div>
							</div>

							<div class="mt-3 space-y-3">
								{#if historyError}
									<div class="rounded-[1.2rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{historyError}</div>
								{:else if historyLoading && historyEntries.length === 0}
									<div class="space-y-2">
										{#each Array.from({ length: 3 }) as _}
											<div class={`${surfaceClass} animate-pulse p-4`} aria-hidden="true">
												<div class="h-4 w-1/3 rounded bg-[#e5dfd2] dark:bg-[#1b211d]"></div>
												<div class="mt-3 h-3 w-5/6 rounded bg-[#ece6da] dark:bg-[#202621]"></div>
											</div>
										{/each}
									</div>
								{:else if historyEntries.length === 0}
									<div class="rounded-[1.2rem] border border-[#ddd7ca] bg-[#fcfbf7] p-5 text-sm leading-7 text-[#6f695f] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#9ba79d]">还没有任务记录。先跑一次 Dry Run，让系统吐出第一份执行计划。</div>
								{:else}
									<div class="space-y-3 lg:max-h-[320px] lg:overflow-y-auto lg:pr-1">
										{#each visibleHistoryEntries as entry}
											<button class={`${surfaceClass} w-full p-4 text-left transition duration-200 ${activeHistoryJobId === entry.job.id ? "border-[#99b3a6] bg-[#eef2ed] dark:border-[#355447] dark:bg-[#151c18]" : "hover:border-[#c5cfc8] hover:bg-[#f5f3ed] dark:hover:border-[#3a4840] dark:hover:bg-[#151917]"}`} on:click={() => selectHistoryEntry(entry.job.id)} type="button">
												<div class="flex items-start justify-between gap-3">
													<div class="min-w-0">
														<div class="flex items-center gap-3">
															<span class={`h-2.5 w-2.5 rounded-full ${jobStatusMeta[entry.job.status].dot}`}></span>
															<div class="text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{entry.job.label}</div>
														</div>
														<div class="mt-2 flex flex-wrap gap-2">
															<span class="rounded-full border border-[#d7d1c4] bg-[#f3f0e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#5d584f] dark:border-[#303833] dark:bg-[#1a1f1b] dark:text-[#bac4bb]">{entry.dryRun ? "dry run" : "执行"}</span>
															<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 text-[11px] text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{syncModeMeta[entry.syncMode].title}</span>
															{#if latestHistoryEntry && entry.job.id === latestHistoryEntry.job.id}
																<span class="rounded-full border border-[#c8d6ce] bg-[#edf2ee] px-3 py-1 text-[11px] text-[#2f5544] dark:border-[#294034] dark:bg-[#162019] dark:text-[#b0ccbb]">最新</span>
															{/if}
														</div>
														<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{entry.job.detail}</div>
													</div>
													<div class="shrink-0 text-right">
														<div class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${jobStatusMeta[entry.job.status].tone}`}><span class={`h-2 w-2 rounded-full ${jobStatusMeta[entry.job.status].dot}`}></span>{jobStatusMeta[entry.job.status].label}</div>
														<div class="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{entry.job.timestamp}</div>
													</div>
												</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						{#if previewItems.length > 0}
							<div class="border-t border-[#e5dfd2] pt-5 dark:border-[#212824]">
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class={sectionLabelClass}>{activeHistoryEntry ? activeHistoryEntry.job.label : "任务明细"}</p>
										{#if activeHistoryEntry && latestHistoryEntry && activeHistoryEntry.job.id !== latestHistoryEntry.job.id}
											<p class="mt-1 text-xs text-[#6f695f] dark:text-[#9ba79d]">你现在看的不是最新回执，是一条旧记录。</p>
										{/if}
									</div>
									<div class="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8c8578] dark:text-[#8d998f]">{previewItems.length} items</div>
								</div>
								<div class="mt-3 space-y-3 lg:max-h-[360px] lg:overflow-y-auto lg:pr-1">
									{#each previewItems as item}
										<div class={`${surfaceClass} p-4`}>
											<div class="flex items-start justify-between gap-3">
												<div class="min-w-0">
													<div class="truncate text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{item.title}</div>
													<div class="mt-1 truncate text-xs text-[#7a7569] dark:text-[#8d998f]">{item.notebookName} · {item.hPath}</div>
												</div>
												<div class="flex flex-wrap items-center gap-2">
													<span class="rounded-full border border-[#d7d1c4] bg-[#fcfbf7] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5d584f] dark:border-[#303833] dark:bg-[#111512] dark:text-[#bac4bb]">{item.action}</span>
													<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[item.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[item.status].dot}`}></span>{statusMeta[item.status].label}</span>
												</div>
											</div>
											<div class="mt-3 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{item.reason}</div>
											<div class="mt-3 font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">target: {item.targetPath}</div>
											{#if item.existingPath}
												<div class="mt-1 font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">existing: {item.existingPath}</div>
											{/if}
											{#if item.syncStrategy}
												<div class="mt-2 text-xs text-[#6f695f] dark:text-[#9ba79d]">同步策略：{syncStrategyMeta[item.syncStrategy].label}</div>
											{/if}
											<div class="mt-4 flex flex-wrap gap-2">
												<button class={quietButtonClass} on:click={() => loadEditor(item.docId)} type="button">编辑</button>
												{#if item.conflictDetail}
													<button class={quietButtonClass} on:click={() => openConflict(item, activeHistoryEntry?.job.label ?? "任务详情")} type="button">冲突详情</button>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			</aside>
		</div>
	</div>

	<div class={`fixed inset-0 z-40 ${conflictState ? "" : "pointer-events-none"}`}>
		<div class={`absolute inset-0 bg-[#090b09]/45 transition duration-200 ${conflictState ? "opacity-100" : "opacity-0"}`} on:click={closeConflict}></div>
		{#if conflictState}
			<div class="absolute inset-0 flex items-center justify-center px-4 py-8">
				<div class="w-full max-w-[760px] rounded-[2rem] border border-[#ddd7ca] bg-[#f8f6f0] p-5 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.45)] dark:border-[#232a25] dark:bg-[#121613] sm:p-6">
					<div class="flex items-start justify-between gap-4 border-b border-[#e5dfd2] pb-5 dark:border-[#232a25]">
						<div class="min-w-0">
							<p class={sectionLabelClass}>冲突详情 · {conflictState.originLabel}</p>
							<h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">{conflictState.item.title}</h3>
							<div class="mt-2 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">
								{conflictState.item.conflictType ? conflictTypeMeta[conflictState.item.conflictType].desc : conflictState.item.reason}
							</div>
						</div>
						<button class={quietButtonClass} on:click={closeConflict} type="button">关闭</button>
					</div>

					<div class="grid gap-5 pt-5 lg:grid-cols-[1.05fr_0.95fr]">
						<div class="space-y-4">
							<div class={`${surfaceClass} p-4`}>
								<p class={sectionLabelClass}>冲突概况</p>
								<div class="mt-3 flex flex-wrap gap-2">
									{#if conflictState.item.conflictType}
										<span class="rounded-full border border-[#e1caca] bg-[#f6ecec] px-3 py-1 text-xs text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{conflictTypeMeta[conflictState.item.conflictType].label}</span>
									{/if}
									<span class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusMeta[conflictState.item.status].tone}`}><span class={`h-2 w-2 rounded-full ${statusMeta[conflictState.item.status].dot}`}></span>{statusMeta[conflictState.item.status].label}</span>
								</div>
								<div class="mt-4 text-sm leading-7 text-[#6f695f] dark:text-[#9ba79d]">{conflictState.item.conflictDetail?.message || conflictState.item.reason}</div>
							</div>

							<div class={`${surfaceClass} p-4`}>
								<div class="grid gap-3">
									<div class={`${surfaceClass} p-3`}>
										<div class={sectionLabelClass}>目标路径</div>
										<div class="mt-2 break-all text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{conflictState.item.conflictDetail?.targetPath || conflictState.item.targetPath}</div>
									</div>
									{#if conflictState.item.conflictDetail?.existingPath || conflictState.item.existingPath}
										<div class={`${surfaceClass} p-3`}>
											<div class={sectionLabelClass}>现有文件</div>
											<div class="mt-2 break-all text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{conflictState.item.conflictDetail?.existingPath || conflictState.item.existingPath}</div>
											{#if conflictState.item.existingTitle}
												<div class="mt-2 text-xs text-[#6f695f] dark:text-[#9ba79d]">标题：{conflictState.item.existingTitle}</div>
											{/if}
											{#if conflictState.item.existingDocId}
												<div class="mt-1 font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">docId: {conflictState.item.existingDocId}</div>
											{/if}
										</div>
									{/if}
									{#if conflictState.item.protectedBlockState}
										<div class={`${surfaceClass} p-3`}>
											<div class={sectionLabelClass}>保护区块状态</div>
											<div class="mt-2 text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{protectedStateMeta[conflictState.item.protectedBlockState]}</div>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="space-y-4">
							<div class={`${surfaceClass} p-4`}>
								<p class={sectionLabelClass}>处理动作</p>
								<div class="mt-4 flex flex-wrap gap-3">
									<button class={quietButtonClass} on:click={() => { loadEditor(conflictState.item.docId); closeConflict(); }} type="button">打开全文编辑</button>
									{#if conflictState.item.conflictType === "protected_blocks_invalid"}
										<button class={primaryButtonClass} disabled={conflictActionLoading} on:click={() => resolveConflictAction("takeover_existing", conflictState.item.docId)} type="button">{conflictActionLoading ? "接管中..." : "一键接管"}</button>
									{/if}
									{#if conflictState.item.syncStrategy === "local_override"}
										<button class={quietButtonClass} disabled={conflictActionLoading} on:click={() => resolveConflictAction("restore_managed_sync", conflictState.item.docId)} type="button">恢复思源同步</button>
									{/if}
								</div>
								{#if conflictActionError}
									<div class="mt-4 rounded-[1.2rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{conflictActionError}</div>
								{/if}
							</div>

							<div class={`${surfaceClass} p-4`}>
								<p class={sectionLabelClass}>关联对象</p>
								{#if conflictState.item.conflictDetail?.relatedDocs?.length}
									<div class="mt-4 space-y-3">
										{#each conflictState.item.conflictDetail.relatedDocs as related}
											<div class={`${surfaceClass} p-3`}>
												<div class="text-sm font-medium text-[#171918] dark:text-[#eef2ed]">{related.title}</div>
												{#if related.hPath}
													<div class="mt-2 text-xs text-[#6f695f] dark:text-[#9ba79d]">{related.hPath}</div>
												{/if}
												<div class="mt-2 break-all font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{related.targetPath}</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="mt-4 rounded-[1.2rem] border border-[#ddd7ca] bg-[#fcfbf7] p-4 text-sm leading-7 text-[#6f695f] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#9ba79d]">没有更多关联对象，但这个冲突已经足够定位问题。</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class={`fixed inset-0 z-50 ${previewOpen ? "" : "pointer-events-none"}`}>
		<div class={`absolute inset-0 bg-[#090b09]/40 transition duration-300 ${previewOpen ? "opacity-100" : "opacity-0"}`} on:click={closePreview}></div>
		<aside class={`absolute right-0 top-0 flex h-full w-[520px] max-w-[96vw] flex-col border-l border-[#ddd7ca] bg-[#f8f6f0] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.28)] transition duration-300 dark:border-[#232a25] dark:bg-[#121613] ${previewOpen ? "translate-x-0" : "translate-x-full"}`}>
			<div class="border-b border-[#e5dfd2] px-5 py-5 dark:border-[#232a25]">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<div class={sectionLabelClass}>文档预览</div>
						<div class="mt-2 truncate text-xl font-semibold tracking-[-0.04em] text-[#171918] dark:text-[#eef2ed]">{previewTitle || "未选择文档"}</div>
						{#if previewHPath}
							<div class="mt-2 truncate font-mono text-[11px] text-[#8b8478] dark:text-[#809085]">{previewHPath}</div>
						{/if}
					</div>
					<button class={quietButtonClass} on:click={closePreview} type="button">关闭</button>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto px-5 py-5">
				{#if previewLoading}
					<div class="space-y-4">
						<div class={`${surfaceClass} animate-pulse p-5`} aria-hidden="true">
							<div class="h-4 w-1/3 rounded bg-[#e5dfd2] dark:bg-[#1b211d]"></div>
							<div class="mt-4 h-3 w-full rounded bg-[#ece6da] dark:bg-[#202621]"></div>
							<div class="mt-3 h-3 w-5/6 rounded bg-[#ece6da] dark:bg-[#202621]"></div>
							<div class="mt-3 h-3 w-4/6 rounded bg-[#ece6da] dark:bg-[#202621]"></div>
						</div>
					</div>
				{:else if previewError}
					<div class="rounded-[1.2rem] border border-[#e1caca] bg-[#f6ecec] p-4 text-sm text-[#7b3f3f] dark:border-[#452a2a] dark:bg-[#241818] dark:text-[#cf9f9f]">{previewError}</div>
				{:else if previewHtml}
					<div class="prose prose-sm max-w-none text-[#2b2a27] dark:prose-invert dark:text-[#e7ebe6]">
						{@html previewHtml}
					</div>
				{:else}
					<div class="rounded-[1.2rem] border border-[#ddd7ca] bg-[#fcfbf7] p-5 text-sm leading-7 text-[#6f695f] dark:border-[#29302b] dark:bg-[#111512] dark:text-[#9ba79d]">请选择一篇文档进行预览。</div>
				{/if}
			</div>
		</aside>
	</div>
</section>
