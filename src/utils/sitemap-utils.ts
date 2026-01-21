import { SUPPORTED_LOCALES } from "../i18n/translation";
import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { formatDateToYYYYMMDD, getEffectiveDate } from "./date-utils";

type SitemapState = {
	lastmodByLogicalSlug: Map<string, string>;
	latestPostLastmod?: string;
};

const isMarkdown = (fileName: string) =>
	fileName.endsWith(".md") || fileName.endsWith(".mdx");

const getLogicalSlug = (slug: string) => {
	const parts = slug.split("/");
	const matchedLocale = SUPPORTED_LOCALES.find(
		(lang) => lang.toLowerCase() === parts[0].toLowerCase(),
	);
	if (parts.length > 1 && matchedLocale) {
		return parts.slice(1).join("/");
	}
	return slug;
};

const extractFrontmatter = (content: string) => {
	const match = content.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/);
	return match ? match[1] : undefined;
};

const toDate = (value: unknown) => {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}
	return undefined;
};

const buildStateFromContent = async (contentDir: string): Promise<SitemapState> => {
	const lastmodByLogicalSlug = new Map<string, string>();
	let latestPostLastmod: string | undefined = undefined;

	const walk = async (dir: string) => {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(fullPath);
				continue;
			}
			if (!entry.isFile() || !isMarkdown(entry.name)) continue;

			const content = await fs.readFile(fullPath, "utf8");
			const frontmatterRaw = extractFrontmatter(content);
			if (!frontmatterRaw) continue;

			let frontmatter: Record<string, unknown> = {};
			try {
				frontmatter = parseYaml(frontmatterRaw) as Record<string, unknown>;
			} catch {
				continue;
			}

			if (frontmatter.draft === true) continue;

			const published = toDate(frontmatter.published);
			if (!published) continue;
			const updated = toDate(frontmatter.updated);
			const effective = getEffectiveDate(published, updated);

			const relative = path
				.relative(contentDir, fullPath)
				.replace(/\\/g, "/");
			const withoutExt = relative.replace(/\.(md|mdx)$/i, "");
			const slug =
				withoutExt.endsWith("/index") ? withoutExt.slice(0, -"/index".length) : withoutExt;
			const logicalSlug = getLogicalSlug(slug);
			const lastmod = formatDateToYYYYMMDD(effective);
			const existing = lastmodByLogicalSlug.get(logicalSlug);
			if (!existing || lastmod > existing) {
				lastmodByLogicalSlug.set(logicalSlug, lastmod);
			}
			if (!latestPostLastmod || lastmod > latestPostLastmod) {
				latestPostLastmod = lastmod;
			}
		}
	};

	await walk(contentDir);
	return { lastmodByLogicalSlug, latestPostLastmod };
};

export function createSitemapSerialize(site: string, contentDir: string) {
	let statePromise: Promise<SitemapState> | undefined;
	const getState = () => {
		if (!statePromise) statePromise = buildStateFromContent(contentDir);
		return statePromise;
	};

	return async function serialize(item: { url: string; lastmod?: string }) {
		const state = await getState();
		const pathname = new URL(item.url, site).pathname;
		const parts = pathname.replace(/^\/|\/$/g, "").split("/");
		const postsIndex = parts.indexOf("posts");
		if (postsIndex !== -1) {
			const logicalSlug = decodeURIComponent(
				parts.slice(postsIndex + 1).join("/"),
			);
			const lastmod = state.lastmodByLogicalSlug.get(logicalSlug);
			if (lastmod) {
				return {
					...item,
					lastmod,
				};
			}
		}
		if (state.latestPostLastmod) {
			return {
				...item,
				lastmod: state.latestPostLastmod,
			};
		}
		return item;
	};
}
