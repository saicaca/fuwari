import { readFile } from "node:fs/promises";
import path from "node:path";
import { FollowsConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";

export type FollowItem = {
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

type FollowsApiResponse = {
	code: number;
	message: string;
	data?: {
		list?: FollowItem[];
		total?: number;
	};
};

export type FollowsResult = {
	items: FollowItem[];
	errorMessage: string;
};

let followItemsPromise: Promise<FollowsResult> | null = null;

async function getFollowsFromJson(): Promise<FollowsResult> {
	try {
		const file = await readFile(
			path.resolve(process.cwd(), FollowsConfig.jsonPath),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as FollowsApiResponse;
		if (payload.code !== 0) {
			throw new Error(payload.message || `Bilibili code ${payload.code}`);
		}
		return { items: payload.data?.list ?? [], errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Follows JSON read failed",
		};
	}
}

async function getFollowsFromApi(): Promise<FollowsResult> {
	const params = new URLSearchParams({
		vmid: String(FollowsConfig.uid),
		pn: String(Math.max(FollowsConfig.pn, 1)),
		ps: String(Math.max(FollowsConfig.ps, 1)),
	});
	const requestUrl = `https://api.bilibili.com/x/relation/followings?${params}`;

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				Referer: `https://space.bilibili.com/${FollowsConfig.uid}/fans/follow`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as FollowsApiResponse;
		if (payload.code !== 0) {
			throw new Error(payload.message || `Bilibili code ${payload.code}`);
		}
		return { items: payload.data?.list ?? [], errorMessage: "" };
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Follows data request failed",
		};
	}
}

export async function getFollowItems(): Promise<FollowsResult> {
	if (!FollowsConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!followItemsPromise) {
		followItemsPromise =
			FollowsConfig.source === "api" ? getFollowsFromApi() : getFollowsFromJson();
	}
	return followItemsPromise;
}

export function getFollowUrl(item: FollowItem): string {
	return `https://space.bilibili.com/${item.mid}`;
}
