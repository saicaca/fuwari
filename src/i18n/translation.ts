import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { es } from "./languages/es";
import { id } from "./languages/id";
import { ja } from "./languages/ja";
import { ko } from "./languages/ko";
import { ptBR } from "./languages/pt_BR";
import { ru } from "./languages/ru";
import { th } from "./languages/th";
import { tr } from "./languages/tr";
import { vi } from "./languages/vi";
import { zhCN } from "./languages/zh_CN";
import { zhTW } from "./languages/zh_TW";

export type Translation = {
	[K in I18nKey]: string;
};

import {
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
	type SupportedLocale,
} from "./constants";

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale };

// export const LANG_NAMES: Record<string, string> = {
// 	ko: "한국어",
// 	en: "English",
// 	ja: "日本語",
// 	zh: "中文",
// };

const map: { [key: string]: Translation } = {
	es: es,
	en: en,
	"en-us": en,
	"en-gb": en,
	"en-au": en,
	pt: ptBR,
	"pt-br": ptBR,
	ru: ru,
	"ru-ru": ru,
	"zh-cn": zhCN,
	"zh-tw": zhTW,
	ja: ja,
	"ja-jp": ja,
	ko: ko,
	"ko-kr": ko,
	th: th,
	"th-th": th,
	vi: vi,
	"vi-vn": vi,
	id: id,
	tr: tr,
	"tr-tr": tr,
};

const defaultTranslation = map[DEFAULT_LOCALE.toLowerCase()];

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey, lang?: string): string {
	const locale = lang || siteConfig.lang || DEFAULT_LOCALE;
	return getTranslation(locale)[key];
}

export function getKeyToLanguage(lang: string): string {
	const normalized = lang.replace("_", "-").toLowerCase();
	const [language, region] = normalized.split("-");
	if (!region) return language;
	return `${language}-${region.toUpperCase()}`;
}
