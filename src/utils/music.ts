import { readFile } from "node:fs/promises";
import path from "node:path";
import { MusicConfig } from "@/config";
import { fetchWithTimeout } from "@/utils/request-utils";
import { url } from "@/utils/url-utils";

export type MusicTrack = {
	id: string;
	title: string;
	artist?: string;
	album?: string;
	duration?: string;
	cover?: string;
	sourceUrl: string;
	lyricUrl?: string;
	videoUrl?: string;
	uploader?: string;
	artistHome?: string;
};

type MusicTrackInput = {
	title?: string;
	artist?: string;
	up_name?: string;
	artist_home?: string;
	album?: string;
	time?: string;
	cover?: string;
	v_url?: string;
	url?: string;
	lrc?: string;
};

type MusicPayload = {
	songs?: MusicTrackInput[];
};

export type MusicResult = {
	items: MusicTrack[];
	errorMessage: string;
};

let musicItemsPromise: Promise<MusicResult> | null = null;

function isExternalUrl(value: string): boolean {
	return /^https?:\/\//i.test(value);
}

function normalizeAssetUrl(value?: string): string | undefined {
	if (!value) return undefined;
	if (isExternalUrl(value)) return value;
	return url(value.startsWith("/") ? value : `/${value}`);
}

function normalizeTrack(item: MusicTrackInput, index: number): MusicTrack | null {
	const sourceUrl = normalizeAssetUrl(item.url);
	if (!sourceUrl) return null;

	const title = item.title?.trim() || `Track ${index + 1}`;
	const artist = item.artist?.trim() || item.up_name?.trim() || "";

	return {
		id: `${title}-${index}`,
		title,
		artist,
		album: item.album?.trim() || "",
		duration: item.time?.trim() || "",
		cover: normalizeAssetUrl(item.cover),
		sourceUrl,
		lyricUrl: normalizeAssetUrl(item.lrc),
		videoUrl: item.v_url?.trim() || "",
		uploader: item.up_name?.trim() || "",
		artistHome: item.artist_home?.trim() || "",
	};
}

function parseMusicPayload(payload: unknown): MusicTrack[] {
	const songs = Array.isArray(payload)
		? payload
		: ((payload as MusicPayload | null)?.songs ?? []);

	return songs
		.map((item, index) => normalizeTrack(item as MusicTrackInput, index))
		.filter((item): item is MusicTrack => item !== null);
}

async function getMusicFromJson(): Promise<MusicResult> {
	try {
		const file = await readFile(path.resolve(process.cwd(), MusicConfig.jsonPath), {
			encoding: "utf-8",
		});
		const payload = JSON.parse(file) as unknown;
		return {
			items: parseMusicPayload(payload),
			errorMessage: "",
		};
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Music JSON read failed",
		};
	}
}

async function getMusicFromApi(): Promise<MusicResult> {
	if (!MusicConfig.apiUrl) {
		return {
			items: [],
			errorMessage: "MusicConfig.apiUrl is not configured",
		};
	}

	try {
		const response = await fetchWithTimeout(MusicConfig.apiUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const payload = (await response.json()) as unknown;
		return {
			items: parseMusicPayload(payload),
			errorMessage: "",
		};
	} catch (error) {
		return {
			items: [],
			errorMessage:
				error instanceof Error ? error.message : "Music data request failed",
		};
	}
}

export async function getMusicItems(): Promise<MusicResult> {
	if (!MusicConfig.enable) {
		return { items: [], errorMessage: "" };
	}

	if (!musicItemsPromise) {
		musicItemsPromise =
			MusicConfig.source === "api" ? getMusicFromApi() : getMusicFromJson();
	}
	return musicItemsPromise;
}
