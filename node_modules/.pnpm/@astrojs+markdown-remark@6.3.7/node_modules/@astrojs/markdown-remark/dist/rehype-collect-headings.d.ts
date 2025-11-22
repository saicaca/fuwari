import type { RehypePlugin } from './types.js';
/**
 * Rehype plugin that adds `id` attributes to headings based on their text content.
 *
 * @param options Optional configuration object for the plugin.
 *
 * @see https://docs.astro.build/en/guides/markdown-content/#heading-ids-and-plugins
 */
export declare function rehypeHeadingIds({ experimentalHeadingIdCompat, }?: {
    experimentalHeadingIdCompat?: boolean;
}): ReturnType<RehypePlugin>;
