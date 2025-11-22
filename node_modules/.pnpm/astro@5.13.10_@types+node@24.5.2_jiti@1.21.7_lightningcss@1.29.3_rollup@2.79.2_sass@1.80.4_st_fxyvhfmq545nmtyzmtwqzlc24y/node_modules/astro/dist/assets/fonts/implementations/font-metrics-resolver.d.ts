import type { CssRenderer, FontFetcher, FontMetricsResolver } from '../definitions.js';
export declare function createCapsizeFontMetricsResolver({ fontFetcher, cssRenderer, }: {
    fontFetcher: FontFetcher;
    cssRenderer: CssRenderer;
}): FontMetricsResolver;
