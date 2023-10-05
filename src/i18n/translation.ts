import {en} from "./languages/en.ts";
import {zh_TW} from "./languages/zh_TW.ts";
import {zh_CN} from "./languages/zh_CN.ts";
import type I18nKey from "./i18nKey.ts";
import {getConfig} from "../utils/config-utils.ts";

export type Translation = {
    [K in I18nKey]: string;
}

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
    "en": en,
    "en_us": en,
    "en_gb": en,
    "en_au": en,
    "zh_cn": zh_CN,
    "zh_tw": zh_TW,
}

export function getTranslation(lang: string): Translation {
    lang = lang.toLowerCase();
    return map[lang] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
    const lang = getConfig().lang || "en";
    return getTranslation(lang)[key];
}