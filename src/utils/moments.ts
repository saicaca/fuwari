import sanitizeHtml from "sanitize-html";
import { MomentsConfig } from "@/config";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import { fetchWithTimeout } from "@/utils/request-utils";
import type { MomentsFeedSource } from "@/types/config";

export type MomentItem = {
	title: string;
	link: string;
	published?: Date;
	summary: string;
	source: MomentsFeedSource;
};

export type FeedResult = {
	source: MomentsFeedSource;
	items: MomentItem[];
	error?: string;
};

let momentsFeedResultsPromise: Promise<FeedResult[]> | null = null;

const decodeXml = (value: string) =>
	value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'");

const getTagValue = (xml: string, tag: string) => {
	const match = xml.match(
		new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
	);
	return match ? decodeXml(match[1].trim()) : "";
};

const getAtomLink = (entry: string) => {
	const alternate = entry.match(
		/<link\b(?=[^>]*rel=["']alternate["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/i,
	);
	const anyLink = entry.match(/<link\b(?=[^>]*href=["']([^"']+)["'])[^>]*>/i);
	return decodeXml(
		(alternate || anyLink)?.[1]?.trim() || getTagValue(entry, "link"),
	);
};

const normalizeDate = (value: string) => {
	if (!value) return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
};

const cleanSummary = (value: string) =>
	sanitizeHtml(decodeXml(value), {
		allowedTags: [],
		allowedAttributes: {},
	})
		.replace(/\s+/g, " ")
		.trim();

const parseFeedItems = (xml: string, source: MomentsFeedSource) => {
	const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
	const atomItems = [
		...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi),
	];
	const entries = rssItems.length > 0 ? rssItems : atomItems;
	const isAtom = rssItems.length === 0;

	return entries.map((match): MomentItem => {
		const entry = match[1];
		const title = getTagValue(entry, "title") || i18n(I18nKey.momentsUntitled);
		const link = isAtom ? getAtomLink(entry) : getTagValue(entry, "link");
		const summary =
			getTagValue(entry, "description") ||
			getTagValue(entry, "summary") ||
			getTagValue(entry, "content:encoded") ||
			getTagValue(entry, "content");
		const published =
			normalizeDate(getTagValue(entry, "pubDate")) ||
			normalizeDate(getTagValue(entry, "published")) ||
			normalizeDate(getTagValue(entry, "updated"));

		return {
			title: cleanSummary(title),
			link: link || source.homepage || source.url,
			published,
			summary: cleanSummary(summary),
			source,
		};
	});
};

const fetchFeed = async (source: MomentsFeedSource): Promise<FeedResult> => {
	try {
		const response = await fetchWithTimeout(source.url, {
			headers: {
				Accept:
					"application/rss+xml, application/atom+xml, application/xml, text/xml",
				"User-Agent":
					"Mozilla/5.0 (compatible; Astro Moments Page; +https://astro.build)",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const xml = await response.text();
		return {
			source,
			items: parseFeedItems(xml, source),
		};
	} catch (error) {
		return {
			source,
			items: [],
			error:
				error instanceof Error
					? error.message
					: i18n(I18nKey.momentsRequestFailed),
		};
	}
};

export async function getMomentsFeedResults(): Promise<FeedResult[]> {
	if (!MomentsConfig.enable) {
		return [];
	}

	if (!momentsFeedResultsPromise) {
		momentsFeedResultsPromise = Promise.all(
			MomentsConfig.sources.map(fetchFeed),
		);
	}

	return momentsFeedResultsPromise;
}

export function getSortedMoments(feedResults: FeedResult[]): MomentItem[] {
	return feedResults
		.flatMap((result) => result.items)
		.sort(
			(a, b) => (b.published?.getTime() || 0) - (a.published?.getTime() || 0),
		)
		.slice(0, Math.max(MomentsConfig.limit, 1));
}
