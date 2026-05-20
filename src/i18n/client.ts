import { type Writable, writable } from "svelte/store";
import { siteConfig } from "@/config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { es } from "./languages/es";
import { id } from "./languages/id";
import { ja } from "./languages/ja";
import { ko } from "./languages/ko";
import { th } from "./languages/th";
import { tr } from "./languages/tr";
import { vi } from "./languages/vi";
import { zh_CN } from "./languages/zh_CN";
import { zh_TW } from "./languages/zh_TW";
import type { Translation } from "./translation";

export const supportedLanguages = [
	{ code: "zh_CN", label: "简体中文" },
	{ code: "zh_TW", label: "繁體中文" },
	{ code: "en", label: "English" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
	{ code: "es", label: "Español" },
	{ code: "th", label: "ไทย" },
	{ code: "vi", label: "Tiếng Việt" },
	{ code: "tr", label: "Türkçe" },
	{ code: "id", label: "Indonesia" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

const translations: Record<SupportedLanguage, Translation> = {
	en,
	es,
	id,
	ja,
	ko,
	th,
	tr,
	vi,
	zh_CN,
	zh_TW,
};

function isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
	return supportedLanguages.some((item) => item.code === lang);
}

function getInitialLanguage(): SupportedLanguage {
	if (typeof window === "undefined") {
		return siteConfig.lang;
	}

	const stored = localStorage.getItem("language");
	return isSupportedLanguage(stored) ? stored : siteConfig.lang;
}

export function getCurrentLanguage(): SupportedLanguage {
	return getInitialLanguage();
}

export const language: Writable<SupportedLanguage> =
	writable<SupportedLanguage>(getInitialLanguage());

export function translate(
	key: I18nKey,
	lang: SupportedLanguage = getInitialLanguage(),
): string {
	return translations[lang]?.[key] || en[key];
}

export function applyLanguage(lang: SupportedLanguage): void {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.lang = lang.replace("_", "-");
	for (const element of document.querySelectorAll<HTMLElement>(
		"[data-i18n-key]",
	)) {
		const key = element.dataset.i18nKey as I18nKey | undefined;
		if (key) {
			element.textContent = translate(key, lang);
		}
	}
	for (const element of document.querySelectorAll<HTMLElement>(
		"[data-i18n-aria-key]",
	)) {
		const key = element.dataset.i18nAriaKey as I18nKey | undefined;
		if (key) {
			element.setAttribute("aria-label", translate(key, lang));
		}
	}
}

export function setLanguage(lang: SupportedLanguage): void {
	localStorage.setItem("language", lang);
	language.set(lang);
	applyLanguage(lang);
}
