import type I18nKey from "@i18n/i18nKey";
import { siteConfig } from "@/config";
import { en } from "./languages/en.ts";
import { es } from "./languages/es.ts";
import { id } from "./languages/id.ts";
import { ja } from "./languages/ja.ts";
import { ko } from "./languages/ko.ts";
import { th } from "./languages/th.ts";
import { tr } from "./languages/tr.ts";
import { vi } from "./languages/vi.ts";
import { zh_CN } from "./languages/zh_CN.ts";
import { zh_TW } from "./languages/zh_TW.ts";

export type Translation = {
  [K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
  es: es,
  en: en,
  en_us: en,
  en_gb: en,
  en_au: en,
  zh_cn: zh_CN,
  zh_tw: zh_TW,
  ja: ja,
  ja_jp: ja,
  ko: ko,
  ko_kr: ko,
  th: th,
  th_th: th,
  vi: vi,
  vi_vn: vi,
  id: id,
  tr: tr,
  tr_tr: tr,
};

export function getTranslation(lang: string): Translation {
  return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
  const lang = siteConfig.lang || "en";
  return getTranslation(lang)[key];
}
