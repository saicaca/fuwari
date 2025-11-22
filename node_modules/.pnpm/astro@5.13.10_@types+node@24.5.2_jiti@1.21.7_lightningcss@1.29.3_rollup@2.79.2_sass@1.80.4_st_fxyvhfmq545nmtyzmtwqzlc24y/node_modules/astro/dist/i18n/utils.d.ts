import type { SSRManifest } from '../core/app/types.js';
import type { AstroConfig, Locales } from '../types/public/config.js';
type BrowserLocale = {
    locale: string;
    qualityValue: number | undefined;
};
/**
 * Parses the value of the `Accept-Language` header:
 *
 * More info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
 *
 * Complex example: `fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5`
 *
 */
export declare function parseLocale(header: string): BrowserLocale[];
/**
 * Set the current locale by parsing the value passed from the `Accept-Header`.
 *
 * If multiple locales are present in the header, they are sorted by their quality value and the highest is selected as current locale.
 *
 */
export declare function computePreferredLocale(request: Request, locales: Locales): string | undefined;
export declare function computePreferredLocaleList(request: Request, locales: Locales): string[];
export declare function computeCurrentLocale(pathname: string, locales: Locales, defaultLocale: string): string | undefined;
export type RoutingStrategies = 'manual' | 'pathname-prefix-always' | 'pathname-prefix-other-locales' | 'pathname-prefix-always-no-redirect' | 'domains-prefix-always' | 'domains-prefix-other-locales' | 'domains-prefix-always-no-redirect';
export declare function toRoutingStrategy(routing: NonNullable<AstroConfig['i18n']>['routing'], domains: NonNullable<AstroConfig['i18n']>['domains']): RoutingStrategies;
export declare function fromRoutingStrategy(strategy: RoutingStrategies, fallbackType: NonNullable<SSRManifest['i18n']>['fallbackType']): NonNullable<AstroConfig['i18n']>['routing'];
export declare function toFallbackType(routing: NonNullable<AstroConfig['i18n']>['routing']): 'redirect' | 'rewrite';
export {};
