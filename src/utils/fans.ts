import { readFile } from "node:fs/promises";
import path from "node:path";
import { FansConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";

export type FanItem = {
	mid: number;
	uname: string;
	face: string;
	sign?: string;
	mtime?: number;
	official_verify?: {
		type?: number;
		desc?: string;
	};
	vip?: {
		type?: number;
		vipType?: number;
		vipStatus?: number;
		label?: {
			text?: string;
			path?: string;
		};
		nickname_color?: string;
	};
};

type FansApiResponse = {
	code: number;
	message: string;
	data?: {
		list?: FanItem[];
		total?: number;
	};
};

type FansJsonPayload =
	| FansApiResponse
	| {
			list?: FanItem[];
	  }
	| {
			data?: FanItem[];
	  }
	| FanItem[];

export type FansResult = {
	items: FanItem[];
	errorMessage: string;
};

let fanItemsPromise: Promise<FansResult> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseFansPayload(payload: FansJsonPayload): FanItem[] {
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

	if (Array.isArray(payload.list)) {
		return payload.list as FanItem[];
	}

	if (Array.isArray(payload.data)) {
		return payload.data as FanItem[];
	}

	const data = payload.data;
	if (isRecord(data) && Array.isArray(data.list)) {
		return data.list as FanItem[];
	}

	return [];
}

async function getFansFromJson(): Promise<FansResult> {
	try {
		const file = await readFile(
			path.resolve(process.cwd(), FansConfig.jsonPath),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as FansJsonPayload;
		return { items: parseFansPayload(payload), errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Fans JSON read failed",
		};
	}
}

async function getFansFromApi(): Promise<FansResult> {
	const params = new URLSearchParams({
		vmid: String(FansConfig.uid),
		pn: String(Math.max(FansConfig.pn, 1)),
		ps: String(Math.max(FansConfig.ps, 1)),
	});
	const requestUrl = `https://api.bilibili.com/x/relation/followers?${params}`;

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				Referer: `https://space.bilibili.com/${FansConfig.uid}/fans/fans`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as FansApiResponse;
		return { items: parseFansPayload(payload), errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Fans data request failed",
		};
	}
}

export async function getFanItems(): Promise<FansResult> {
	if (!FansConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!fanItemsPromise) {
		fanItemsPromise =
			FansConfig.source === "api" ? getFansFromApi() : getFansFromJson();
	}
	return fanItemsPromise;
}

export function getFanUrl(item: FanItem): string {
	return `https://space.bilibili.com/${item.mid}`;
}
