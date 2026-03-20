import type { ImportSyncStrategy, ProtectedBlockState } from "@/types/admin";

const SYNC_START = "<!-- SYNC:START -->";
const SYNC_END = "<!-- SYNC:END -->";
const LOCAL_START = "<!-- LOCAL:START -->";
const LOCAL_END = "<!-- LOCAL:END -->";

export interface ProtectedBlockInspection {
	state: ProtectedBlockState;
	localContent: string;
	syncContent: string;
}

function hasOrderedPair(content: string, start: string, end: string) {
	const startIndex = content.indexOf(start);
	const endIndex = content.indexOf(end);

	return {
		hasStart: startIndex >= 0,
		hasEnd: endIndex >= 0,
		isOrdered: startIndex >= 0 && endIndex > startIndex,
	};
}

function getBlockContent(content: string, start: string, end: string) {
	const startIndex = content.indexOf(start);
	const endIndex = content.indexOf(end);

	if (startIndex < 0 || endIndex <= startIndex) {
		return "";
	}

	return content
		.slice(startIndex + start.length, endIndex)
		.replace(/^\r?\n/, "")
		.replace(/\r?\n$/, "");
}

export function inspectProtectedBlocks(
	content: string,
): ProtectedBlockInspection {
	const syncPair = hasOrderedPair(content, SYNC_START, SYNC_END);
	const localPair = hasOrderedPair(content, LOCAL_START, LOCAL_END);

	if (syncPair.isOrdered && localPair.isOrdered) {
		return {
			state: "managed",
			localContent: getBlockContent(content, LOCAL_START, LOCAL_END),
			syncContent: getBlockContent(content, SYNC_START, SYNC_END),
		};
	}

	if (
		syncPair.hasStart ||
		syncPair.hasEnd ||
		localPair.hasStart ||
		localPair.hasEnd
	) {
		return {
			state: "broken",
			localContent: "",
			syncContent: "",
		};
	}

	return {
		state: "absent",
		localContent: "",
		syncContent: "",
	};
}

function escapeYamlString(value: string) {
	return JSON.stringify(value ?? "");
}

function escapeYamlStringArray(values: string[]) {
	return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

function buildBaseFrontmatterLines(input: {
	title: string;
	publishedAt: string;
	updatedAt: string;
	description?: string;
	tags: string[];
	category: string;
	draft: boolean;
	slug: string;
	siyuanDocId: string;
	siyuanNotebook: string;
	siyuanNotebookId: string;
	siyuanPath: string;
	siyuanUpdated: string;
	siyuanHash: string;
	syncStrategy: ImportSyncStrategy;
}) {
	return [
		"---",
		`title: ${escapeYamlString(input.title)}`,
		`published: ${escapeYamlString(input.publishedAt)}`,
		`updated: ${escapeYamlString(input.updatedAt)}`,
		`description: ${escapeYamlString(input.description ?? "")}`,
		'image: ""',
		`tags: ${escapeYamlStringArray(input.tags)}`,
		`category: ${escapeYamlString(input.category)}`,
		`draft: ${input.draft ? "true" : "false"}`,
		'lang: ""',
		`slug: ${escapeYamlString(input.slug)}`,
		'source: "siyuan"',
		`siyuanDocId: ${escapeYamlString(input.siyuanDocId)}`,
		`siyuanNotebook: ${escapeYamlString(input.siyuanNotebook)}`,
		`siyuanNotebookId: ${escapeYamlString(input.siyuanNotebookId)}`,
		`siyuanPath: ${escapeYamlString(input.siyuanPath)}`,
		`siyuanUpdated: ${escapeYamlString(input.siyuanUpdated)}`,
		`siyuanHash: ${escapeYamlString(input.siyuanHash)}`,
		`siyuanSyncStrategy: ${escapeYamlString(input.syncStrategy)}`,
		'prevTitle: ""',
		'prevSlug: ""',
		'nextTitle: ""',
		'nextSlug: ""',
		"---",
		"",
	];
}

export function buildManagedDocument(input: {
	title: string;
	publishedAt: string;
	updatedAt: string;
	description?: string;
	tags: string[];
	category: string;
	draft: boolean;
	slug: string;
	siyuanDocId: string;
	siyuanNotebook: string;
	siyuanNotebookId: string;
	siyuanPath: string;
	siyuanUpdated: string;
	siyuanHash: string;
	syncContent: string;
	localContent?: string;
}) {
	const lines = [
		...buildBaseFrontmatterLines({
			...input,
			syncStrategy: "managed",
		}),
		SYNC_START,
		input.syncContent.trim(),
		SYNC_END,
		"",
		LOCAL_START,
		(input.localContent ?? "").trim(),
		LOCAL_END,
		"",
	];

	return lines.join("\n");
}

export function buildLocalOverrideDocument(input: {
	title: string;
	publishedAt: string;
	updatedAt: string;
	description?: string;
	tags: string[];
	category: string;
	draft: boolean;
	slug: string;
	siyuanDocId: string;
	siyuanNotebook: string;
	siyuanNotebookId: string;
	siyuanPath: string;
	siyuanUpdated: string;
	siyuanHash: string;
	bodyContent: string;
}) {
	return [
		...buildBaseFrontmatterLines({
			...input,
			syncStrategy: "local_override",
		}),
		input.bodyContent.trim(),
		"",
	].join("\n");
}

export function mergeManagedDocument(input: {
	existingContent: string;
	title: string;
	publishedAt: string;
	updatedAt: string;
	description?: string;
	tags: string[];
	category: string;
	draft: boolean;
	slug: string;
	siyuanDocId: string;
	siyuanNotebook: string;
	siyuanNotebookId: string;
	siyuanPath: string;
	siyuanUpdated: string;
	siyuanHash: string;
	syncContent: string;
	defaultLocalContent?: string;
}) {
	const inspection = inspectProtectedBlocks(input.existingContent);

	return buildManagedDocument({
		...input,
		localContent:
			inspection.state === "managed"
				? inspection.localContent
				: (input.defaultLocalContent ?? ""),
	});
}
