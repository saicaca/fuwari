import type I18nKey from "@i18n/i18nKey";
import { siteConfig } from "@/config";
import { en } from "./languages/en.ts";
import { zh_CN } from "./languages/zh_CN.ts";

export type Translation = {
  [K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
  // English and common variants
  en: en,
  en_us: en,
  en_gb: en,
  en_au: en,
  // Simplified Chinese (zh-CN) and a few tolerant aliases
  zh: zh_CN,
  zh_cn: zh_CN,
  zh_hans: zh_CN,
};

export function getTranslation(lang: string): Translation {
  return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
  const lang = siteConfig.lang || "en";
  return getTranslation(lang)[key];
}
