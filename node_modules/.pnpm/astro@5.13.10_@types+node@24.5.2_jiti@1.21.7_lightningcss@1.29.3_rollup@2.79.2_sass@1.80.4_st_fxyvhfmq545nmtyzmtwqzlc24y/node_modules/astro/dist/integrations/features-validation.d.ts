import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
import type { AstroAdapterFeatureMap } from '../types/public/integrations.js';
export declare const AdapterFeatureStability: {
    readonly STABLE: "stable";
    readonly DEPRECATED: "deprecated";
    readonly UNSUPPORTED: "unsupported";
    readonly EXPERIMENTAL: "experimental";
    readonly LIMITED: "limited";
};
type ValidationResult = {
    [Property in keyof AstroAdapterFeatureMap]: boolean;
};
/**
 * Checks whether an adapter supports certain features that are enabled via Astro configuration.
 *
 * If a configuration is enabled and "unlocks" a feature, but the adapter doesn't support, the function
 * will throw a runtime error.
 *
 */
export declare function validateSupportedFeatures(adapterName: string, featureMap: AstroAdapterFeatureMap, settings: AstroSettings, logger: Logger): ValidationResult;
export declare function getAdapterStaticRecommendation(adapterName: string): string | undefined;
export {};
