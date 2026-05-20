import { readFile } from "node:fs/promises";
import path from "node:path";
import { DynamicConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";

type DynamicRichTextNode = {
	text?: string;
	orig_text?: string;
};

type DynamicDesc = {
	text?: string;
	rich_text_nodes?: DynamicRichTextNode[];
};

type DynamicArchive = {
	bvid?: string;
	cover?: string;
	jump_url?: string;
	title?: string;
	desc?: string;
	duration_text?: string;
	badge?: {
		text?: string;
	};
	stat?: {
		play?: string | number;
		danmaku?: string | number;
	};
};

type DynamicDrawItem = {
	src?: string;
	width?: string | number;
	height?: string | number;
};

type DynamicMajor = {
	type?: string;
	archive?: DynamicArchive | null;
	draw?: {
		items?: DynamicDrawItem[];
	} | null;
	article?: {
		title?: string;
		desc?: string;
		covers?: string[];
		jump_url?: string;
	} | null;
	opus?: {
		title?: string;
		summary?: {
			text?: string;
		};
		pics?: DynamicDrawItem[];
		jump_url?: string;
	} | null;
};

export type DynamicItem = {
	id_str: string;
	type?: string;
	basic?: {
		jump_url?: string;
		rid_str?: string;
	};
	modules?: {
		module_author?: {
			name?: string;
			face?: string;
			jump_url?: string;
			pub_time?: string;
			pub_action?: string;
		};
		module_dynamic?: {
			desc?: DynamicDesc | null;
			major?: DynamicMajor | null;
		};
		module_stat?: {
			forward?: { count?: number };
			comment?: { count?: number };
			like?: { count?: number };
		};
	};
};

type DynamicApiResponse = {
	code: number;
	message: string;
	data?: {
		items?: DynamicItem[];
	};
};

type DynamicJsonPayload =
	| DynamicApiResponse
	| {
			items?: DynamicItem[];
	  }
	| {
			data?: DynamicItem[];
	  }
	| DynamicItem[];

export type DynamicResult = {
	items: DynamicItem[];
	errorMessage: string;
};

let dynamicItemsPromise: Promise<DynamicResult> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseDynamicPayload(payload: DynamicJsonPayload): DynamicItem[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (!isRecord(payload)) {
		return [];
	}

	if (typeof payload.code === "number" && payload.code !== 0) {
		throw new Error(
			typeof payload.message === "string"
				? payload.message
				: `Bilibili code ${payload.code}`,
		);
	}

	if (Array.isArray(payload.items)) {
		return payload.items as DynamicItem[];
	}

	if (Array.isArray(payload.data)) {
		return payload.data as DynamicItem[];
	}

	const data = payload.data;
	if (isRecord(data) && Array.isArray(data.items)) {
		return data.items as DynamicItem[];
	}

	return [];
}

async function getDynamicFromJson(): Promise<DynamicResult> {
	try {
		const file = await readFile(
			path.resolve(process.cwd(), DynamicConfig.jsonPath),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as DynamicJsonPayload;
		return { items: parseDynamicPayload(payload), errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Dynamic JSON read failed",
		};
	}
}

async function getDynamicFromApi(): Promise<DynamicResult> {
	const params = new URLSearchParams({
		host_mid: String(DynamicConfig.uid),
	});
	const requestUrl = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?${params}`;

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				Referer: `https://space.bilibili.com/${DynamicConfig.uid}/dynamic`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as DynamicApiResponse;
		return { items: parseDynamicPayload(payload), errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Dynamic data request failed",
		};
	}
}

export async function getDynamicItems(): Promise<DynamicResult> {
	if (!DynamicConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!dynamicItemsPromise) {
		dynamicItemsPromise =
			DynamicConfig.source === "api" ? getDynamicFromApi() : getDynamicFromJson();
	}
	return dynamicItemsPromise;
}

export function normalizeBilibiliUrl(url: string | undefined): string {
	if (!url) {
		return `https://space.bilibili.com/${DynamicConfig.uid}/dynamic`;
	}

	if (url.startsWith("//")) {
		return `https:${url}`;
	}

	return url;
}

export function getDynamicUrl(item: DynamicItem): string {
	const major = item.modules?.module_dynamic?.major;
	return normalizeBilibiliUrl(
		major?.archive?.jump_url ||
			major?.article?.jump_url ||
			major?.opus?.jump_url ||
			item.basic?.jump_url ||
			`https://t.bilibili.com/${item.id_str}`,
	);
}

export function getDynamicTitle(item: DynamicItem): string {
	const major = item.modules?.module_dynamic?.major;
	const text = getDynamicText(item).trim();
	return (
		major?.archive?.title ||
		major?.article?.title ||
		major?.opus?.title ||
		text ||
		getDynamicBadge(item) ||
		item.modules?.module_author?.pub_action ||
		item.id_str
	);
}

export function getDynamicText(item: DynamicItem): string {
	const dynamic = item.modules?.module_dynamic;
	const nodes = dynamic?.desc?.rich_text_nodes;
	if (nodes?.length) {
		return nodes.map((node) => node.text || node.orig_text || "").join("");
	}

	const major = dynamic?.major;
	return (
		dynamic?.desc?.text ||
		major?.archive?.desc ||
		major?.article?.desc ||
		major?.opus?.summary?.text ||
		""
	);
}

export function getDynamicCover(item: DynamicItem): string {
	const major = item.modules?.module_dynamic?.major;
	return (
		major?.archive?.cover ||
		major?.article?.covers?.[0] ||
		major?.opus?.pics?.[0]?.src ||
		major?.draw?.items?.[0]?.src ||
		""
	);
}

export function getDynamicBadge(item: DynamicItem): string {
	const major = item.modules?.module_dynamic?.major;
	return (
		major?.archive?.badge?.text ||
		(item.type === "DYNAMIC_TYPE_DRAW" ? "动态图片" : "") ||
		item.modules?.module_author?.pub_action ||
		"动态"
	);
}
