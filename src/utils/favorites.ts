import { readFile } from "node:fs/promises";
import path from "node:path";
import { FavoritesConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";

export type FavoriteFolder = {
	id: number;
	title: string;
	cover?: string;
	intro?: string;
	media_count?: number;
	upper?: {
		name?: string;
		mid?: number;
	};
};

export type FavoriteMedia = {
	id?: number;
	bvid?: string;
	title: string;
	cover?: string;
	intro?: string;
	link?: string;
	duration?: number;
	pubtime?: number;
	upper?: {
		name?: string;
		mid?: number;
	};
	cnt_info?: {
		play?: number;
		danmaku?: number;
		collect?: number;
	};
};

type FavoriteFoldersApiResponse = {
	code: number;
	message: string;
	data?: {
		list?: FavoriteFolder[];
	};
};

type FavoriteResourcesApiResponse = {
	code: number;
	message: string;
	data?: {
		info?: FavoriteFolder;
		medias?: FavoriteMedia[];
	};
};

type FavoriteFoldersJsonPayload =
	| FavoriteFoldersApiResponse
	| { list?: FavoriteFolder[] }
	| FavoriteFolder[];

type FavoriteResourcesJsonPayload =
	| FavoriteResourcesApiResponse
	| { info?: FavoriteFolder; medias?: FavoriteMedia[] }
	| FavoriteMedia[];

export type FavoriteFoldersResult = {
	items: FavoriteFolder[];
	errorMessage: string;
};

export type FavoriteResourcesResult = {
	folder: FavoriteFolder | null;
	items: FavoriteMedia[];
	errorMessage: string;
};

let favoriteFoldersPromise: Promise<FavoriteFoldersResult> | null = null;
const favoriteResourcesPromiseMap = new Map<
	string,
	Promise<FavoriteResourcesResult>
>();

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseApiError(payload: Record<string, unknown>) {
	if (typeof payload.code === "number" && payload.code !== 0) {
		throw new Error(
			typeof payload.message === "string"
				? payload.message
				: `Bilibili code ${payload.code}`,
		);
	}
}

function parseFavoriteFoldersPayload(
	payload: FavoriteFoldersJsonPayload,
): FavoriteFolder[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (!isRecord(payload)) {
		return [];
	}

	parseApiError(payload);

	if (Array.isArray(payload.list)) {
		return payload.list as FavoriteFolder[];
	}

	const data = payload.data;
	if (isRecord(data) && Array.isArray(data.list)) {
		return data.list as FavoriteFolder[];
	}

	return [];
}

function parseFavoriteResourcesPayload(payload: FavoriteResourcesJsonPayload): {
	folder: FavoriteFolder | null;
	items: FavoriteMedia[];
} {
	if (Array.isArray(payload)) {
		return { folder: null, items: payload };
	}

	if (!isRecord(payload)) {
		return { folder: null, items: [] };
	}

	parseApiError(payload);

	if (Array.isArray(payload.medias)) {
		return {
			folder: isRecord(payload.info) ? (payload.info as FavoriteFolder) : null,
			items: payload.medias as FavoriteMedia[],
		};
	}

	const data = payload.data;
	if (isRecord(data)) {
		return {
			folder: isRecord(data.info) ? (data.info as FavoriteFolder) : null,
			items: Array.isArray(data.medias) ? (data.medias as FavoriteMedia[]) : [],
		};
	}

	return { folder: null, items: [] };
}

async function enrichFavoriteFoldersWithDetailJson(
	folders: FavoriteFolder[],
): Promise<FavoriteFolder[]> {
	const enriched: FavoriteFolder[] = [];

	for (const folder of folders) {
		if (folder.cover) {
			enriched.push(folder);
			continue;
		}

		try {
			const file = await readFile(
				path.resolve(
					process.cwd(),
					FavoritesConfig.detailJsonDir,
					`${folder.id}.json`,
				),
				{
					encoding: "utf-8",
				},
			);
			const payload = JSON.parse(file) as FavoriteResourcesJsonPayload;
			const detail = parseFavoriteResourcesPayload(payload).folder;
			if (!detail) {
				enriched.push(folder);
				continue;
			}

			enriched.push({
				...folder,
				cover: folder.cover || detail.cover,
				intro: folder.intro || detail.intro,
				upper: folder.upper || detail.upper,
			});
		} catch {
			enriched.push(folder);
		}
	}

	return enriched;
}

async function getFavoriteFoldersFromJson(): Promise<FavoriteFoldersResult> {
	try {
		const file = await readFile(
			path.resolve(process.cwd(), FavoritesConfig.listJsonPath),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as FavoriteFoldersJsonPayload;
		return {
			items: await enrichFavoriteFoldersWithDetailJson(
				parseFavoriteFoldersPayload(payload),
			),
			errorMessage: "",
		};
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Favorites JSON read failed",
		};
	}
}

async function getFavoriteFoldersFromApi(): Promise<FavoriteFoldersResult> {
	const params = new URLSearchParams({
		up_mid: String(FavoritesConfig.uid),
	});
	const requestUrl = `https://api.bilibili.com/x/v3/fav/folder/created/list-all?${params}`;

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				Referer: `https://space.bilibili.com/${FavoritesConfig.uid}/favlist`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as FavoriteFoldersJsonPayload;
		return {
			items: await enrichFavoriteFoldersWithDetailJson(
				parseFavoriteFoldersPayload(payload),
			),
			errorMessage: "",
		};
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error
					? error.message
					: "Favorites data request failed",
		};
	}
}

async function getFavoriteResourcesFromJson(
	mediaId: string,
): Promise<FavoriteResourcesResult> {
	try {
		const file = await readFile(
			path.resolve(
				process.cwd(),
				FavoritesConfig.detailJsonDir,
				`${mediaId}.json`,
			),
			{
				encoding: "utf-8",
			},
		);
		const payload = JSON.parse(file) as FavoriteResourcesJsonPayload;
		return {
			...parseFavoriteResourcesPayload(payload),
			errorMessage: "",
		};
	} catch (error) {
		return {
			folder: null,
			items: [],
			errorMessage:
				error instanceof Error
					? error.message
					: "Favorite resource JSON read failed",
		};
	}
}

async function getFavoriteResourcesFromApi(
	mediaId: string,
): Promise<FavoriteResourcesResult> {
	const params = new URLSearchParams({
		media_id: mediaId,
		pn: "1",
		ps: String(Math.max(FavoritesConfig.apiPageSize, 1)),
		keyword: "",
		order: "mtime",
		type: "0",
		tid: "0",
		platform: "web",
		web_location: "0.0",
	});
	const requestUrl = `https://api.bilibili.com/x/v3/fav/resource/list?${params}`;

	try {
		const response = await fetchWithTimeout(requestUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				Referer: `https://space.bilibili.com/${FavoritesConfig.uid}/favlist?fid=${mediaId}`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as FavoriteResourcesJsonPayload;
		return {
			...parseFavoriteResourcesPayload(payload),
			errorMessage: "",
		};
	} catch (error) {
		return {
			folder: null,
			items: [],
			errorMessage:
				error instanceof Error
					? error.message
					: "Favorite resource request failed",
		};
	}
}

export async function getFavoriteFolders(): Promise<FavoriteFoldersResult> {
	if (!FavoritesConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!favoriteFoldersPromise) {
		favoriteFoldersPromise =
			FavoritesConfig.listSource === "api"
				? getFavoriteFoldersFromApi()
				: getFavoriteFoldersFromJson();
	}
	return favoriteFoldersPromise;
}

export async function getFavoriteResources(
	mediaId: string,
): Promise<FavoriteResourcesResult> {
	if (!FavoritesConfig.enable) {
		return { folder: null, items: [], errorMessage: "" };
	}

	if (!favoriteResourcesPromiseMap.has(mediaId)) {
		favoriteResourcesPromiseMap.set(
			mediaId,
			FavoritesConfig.detailSource === "api"
				? getFavoriteResourcesFromApi(mediaId)
				: getFavoriteResourcesFromJson(mediaId),
		);
	}
	return favoriteResourcesPromiseMap.get(mediaId)!;
}

export function getFavoriteFolderUrl(folder: FavoriteFolder): string {
	return `/fav/${folder.id}/`;
}

export function getFavoriteMediaUrl(media: FavoriteMedia): string {
	if (media.link) {
		return media.link.startsWith("//") ? `https:${media.link}` : media.link;
	}

	if (media.bvid) {
		return `https://www.bilibili.com/video/${media.bvid}`;
	}

	return "#";
}

export function formatFavoriteCount(value: number | undefined): string {
	return new Intl.NumberFormat("zh-CN").format(value ?? 0);
}

export function formatFavoriteDuration(value: number | undefined): string {
	if (!value || value <= 0) {
		return "";
	}

	const hours = Math.floor(value / 3600);
	const minutes = Math.floor((value % 3600) / 60);
	const seconds = value % 60;

	if (hours > 0) {
		return [hours, minutes, seconds]
			.map((part) => String(part).padStart(2, "0"))
			.join(":");
	}

	return [minutes, seconds]
		.map((part) => String(part).padStart(2, "0"))
		.join(":");
}
