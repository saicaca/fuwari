export const SUPPORTED_LOCALES = ["ko", "en", "zh-CN", "zh-TW", "ja", "ru", "es", "pt-BR"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number] | string;

export const DEFAULT_LOCALE: SupportedLocale = "ko";
