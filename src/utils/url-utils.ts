import I18nKey from "@i18n/i18nKey";
import {
	DEFAULT_LOCALE,
	getKeyToLanguage,
	i18n,
	SUPPORTED_LOCALES,
} from "@i18n/translation";

export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string, lang?: string): string {
	let logicalSlug = slug;
	let detectedLang = lang;

	const parts = slug.split("/");
	const matchedLocale = (SUPPORTED_LOCALES as any).find(
		(l: string) => l.toLowerCase() === parts[0].toLowerCase(),
	);

	if (parts.length > 1 && matchedLocale) {
		logicalSlug = parts.slice(1).join("/");
		if (!detectedLang) {
			detectedLang = matchedLocale;
		}
	}

	return url(`/posts/${logicalSlug}/`, detectedLang);
}

export function getTagUrl(tag: string, lang?: string): string {
	if (!tag) return url("/archive/", lang);
	return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`, lang);
}

export function getCategoryUrl(category: string | null, lang?: string): string {
	if (
		!category ||
		category.trim() === "" ||
		category.trim().toLowerCase() ===
			i18n(I18nKey.uncategorized, lang).toLowerCase()
	)
		return url("/archive/?uncategorized=true", lang);
	return url(`/archive/?category=${encodeURIComponent(category.trim())}`, lang);
}

export function getDir(path: string): string {
	const normalizedPath = path.replace(/\\/g, "/");
	const lastSlashIndex = normalizedPath.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return normalizedPath.substring(0, lastSlashIndex + 1);
}

export function url(path: string, lang?: string) {
	const prefix = lang && lang !== DEFAULT_LOCALE ? `/${lang}` : "";
	return joinUrl("", import.meta.env.BASE_URL, `${prefix}${path}`);
}
export function getStaticAlternates(
	path: string,
): { lang: string; href: string }[] {
	const joinAbsoluteUrl = (p: string) => {
		const site = import.meta.env.SITE.replace(/\/$/, "");
		const relative = p.replace(/^\//, "");
		return `${site}/${relative}`;
	};

	const alternates: { lang: string; href: string }[] = SUPPORTED_LOCALES.map(
		(lang) => ({
			lang: getKeyToLanguage(lang),
			href: joinAbsoluteUrl(url(path, lang)),
		}),
	);

	alternates.push({
		lang: "x-default",
		href: joinAbsoluteUrl(url(path, DEFAULT_LOCALE)),
	});

	return alternates;
}
