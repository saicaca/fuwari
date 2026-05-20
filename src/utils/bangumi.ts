import { readFile } from "node:fs/promises";
import path from "node:path";
import { BangumiConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";

export type BangumiItem = {
	season_id: number;
	title: string;
	cover: string;
	url?: string;
	season_type_name?: string;
	areas?: string[];
	styles?: string[];
	new_ep?: {
		index_show?: string;
	};
	progress?: string;
	evaluate?: string;
	rating?: {
		score?: number;
		count?: number;
	};
	publish?: {
		pub_time_show?: string;
	};
	stat?: {
		follow?: number;
		view?: number;
		danmaku?: number;
	};
	badge?: string;
};

type BangumiApiResponse = {
	code: number;
	message: string;
	data?: {
		list?: BangumiItem[];
		total?: number;
	};
};

export type BangumiResult = {
	items: BangumiItem[];
	errorMessage: string;
};

let bangumiItemsPromise: Promise<BangumiResult> | null = null;

async function getBangumiFromJson(): Promise<BangumiResult> {
	try {
		const file = await readFile(
			path.resolve(process.cwd(), BangumiConfig.jsonPath),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as BangumiApiResponse;
		if (payload.code !== 0) {
			throw new Error(payload.message || `Bilibili code ${payload.code}`);
		}
		return { items: payload.data?.list ?? [], errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Bangumi JSON read failed",
		};
	}
}

async function getBangumiFromApi(): Promise<BangumiResult> {
	const pageSize = Math.min(Math.max(BangumiConfig.ps, 1), 30);
	const params = new URLSearchParams({
		vmid: String(BangumiConfig.uid),
		type: String(BangumiConfig.type),
		pn: String(Math.max(BangumiConfig.pn, 1)),
		ps: String(pageSize),
	});
	const requestUrl = `https://api.bilibili.com/x/space/bangumi/follow/list?${params}`;
	const requestHeaders = {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
		Referer: `https://space.bilibili.com/${BangumiConfig.uid}/bangumi`,
	};

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: requestHeaders,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as BangumiApiResponse;
		if (payload.code !== 0) {
			throw new Error(payload.message || `Bilibili code ${payload.code}`);
		}

		return { items: payload.data?.list ?? [], errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Bangumi data request failed",
		};
	}
}

export async function getBangumiItems(): Promise<BangumiResult> {
	if (!BangumiConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!bangumiItemsPromise) {
		bangumiItemsPromise =
			BangumiConfig.source === "api" ? getBangumiFromApi() : getBangumiFromJson();
	}
	return bangumiItemsPromise;
}
