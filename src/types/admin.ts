export type ImportStatus =
	| "new"
	| "synced"
	| "updated"
	| "conflict"
	| "local_override";

export type SyncMode = "sync" | "create_only" | "force_overwrite";

export type SlugPolicy = "stable" | "manual" | "title";

export type ImportSyncStrategy = "managed" | "local_override";

export type ProtectedBlockState = "managed" | "broken" | "absent";

export type ImportConflictType =
	| "slug_occupied"
	| "batch_duplicate_slug"
	| "protected_blocks_invalid";

export interface ImportNotebookNode {
	id: string;
	kind: "notebook";
	notebookId: string;
	notebookName: string;
	title: string;
	path: "/";
	hPath: "/";
	hasChildren: true;
	childrenLoaded: boolean;
	children: ImportDocNode[];
}

export interface ImportDocNode {
	id: string;
	kind: "doc";
	notebookId: string;
	notebookName: string;
	title: string;
	path: string;
	hPath: string;
	updated: string;
	updatedLabel: string;
	hash: string;
	tags: string[];
	hasChildren: boolean;
	childCount: number;
	childrenLoaded: boolean;
	children: ImportDocNode[];
	status: ImportStatus;
	syncStrategy?: ImportSyncStrategy;
}

export type ImportTreeNode = ImportNotebookNode | ImportDocNode;

export interface NotebooksResponse {
	notebooks: ImportNotebookNode[];
}

export interface TreeResponse {
	nodes: ImportDocNode[];
	path: string;
	recursive: boolean;
}

export interface SearchResponse {
	items: ImportDocNode[];
	keyword: string;
}

export interface ImportRequestMetadata {
	category: string;
	tags: string[];
	publishedAt: string;
	slug: string;
	slugPolicy: SlugPolicy;
	draft: boolean;
	localBlockNote: string;
}

export interface ImportFolderItem {
	notebookId: string;
	path: string;
	recursive: boolean;
}

export interface ImportJobRequest {
	dryRun: boolean;
	syncMode: SyncMode;
	docIds: string[];
	folders?: ImportFolderItem[];
	metadata: ImportRequestMetadata;
}

export interface ImportJobRecord {
	id: string;
	label: string;
	status: "queued" | "running" | "success" | "attention";
	detail: string;
	timestamp: string;
}

export interface ImportPreviewItem {
	docId: string;
	title: string;
	notebookName: string;
	hPath: string;
	status: ImportStatus;
	action: "create" | "skip" | "update" | "block";
	reason: string;
	targetPath: string;
	existingPath: string;
	suggestedSlug: string;
	updatedLabel: string;
	tags: string[];
	syncStrategy: ImportSyncStrategy;
	conflictType?: ImportConflictType;
	conflictDetail?: ImportConflictDetail;
	existingTitle?: string;
	existingDocId?: string;
	protectedBlockState?: ProtectedBlockState;
}

export interface ImportConflictReference {
	docId: string;
	title: string;
	hPath: string;
	targetPath: string;
}

export interface ImportConflictDetail {
	type: ImportConflictType;
	message: string;
	targetPath: string;
	existingPath?: string;
	existingTitle?: string;
	existingDocId?: string;
	protectedBlockState?: ProtectedBlockState;
	relatedDocs?: ImportConflictReference[];
}

export interface ImportJobResult {
	job: ImportJobRecord;
	items: ImportPreviewItem[];
	summary: {
		total: number;
		newCount: number;
		updatedCount: number;
		skipCount: number;
		conflictCount: number;
		writtenCount: number;
	};
	writable: boolean;
}

export type ImportEditorOrigin = "existing" | "generated" | "draft";

export interface ImportEditorState {
	docId: string;
	title: string;
	notebookName: string;
	hPath: string;
	updatedLabel: string;
	status: ImportStatus;
	origin: ImportEditorOrigin;
	targetPath: string;
	existingPath: string;
	content: string;
	syncStrategy: ImportSyncStrategy;
	conflictDetail: ImportConflictDetail | null;
	protectedBlockState?: ProtectedBlockState;
}

export interface ImportEditorResponse {
	editor: ImportEditorState;
}

export interface ImportEditorSaveRequest {
	docId: string;
	content: string;
}

export interface ImportDraftRecord {
	docId: string;
	content: string;
	targetPath: string;
	suggestedSlug: string;
	updatedAt: string;
}

export interface ImportConflictResolveRequest {
	docId: string;
	action: "takeover_existing" | "restore_managed_sync";
}

export interface ImportConflictResolveResponse {
	message: string;
	status: ImportStatus;
	editor?: ImportEditorState | null;
}

export interface ImportHistoryEntry {
	job: ImportJobRecord;
	items: ImportPreviewItem[];
	summary: ImportJobResult["summary"];
	dryRun: boolean;
	syncMode: SyncMode;
	createdAt: string;
}

export interface ImportHistoryResponse {
	entries: ImportHistoryEntry[];
}

export interface AdminSession {
	authenticated: boolean;
	username: string;
}

export interface AdminSessionResponse {
	session: AdminSession;
	configured: boolean;
}

export type ApiResponse<T> =
	| {
			ok: true;
			data: T;
	  }
	| {
			ok: false;
			error: string;
	  };
