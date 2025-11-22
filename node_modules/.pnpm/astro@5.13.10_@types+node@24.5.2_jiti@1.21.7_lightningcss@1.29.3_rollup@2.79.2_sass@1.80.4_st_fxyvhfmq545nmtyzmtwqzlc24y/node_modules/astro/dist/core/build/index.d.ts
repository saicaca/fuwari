import type { AstroInlineConfig } from '../../types/public/config.js';
interface BuildOptions {
    /**
     * Output a development-based build similar to code transformed in `astro dev`. This
     * can be useful to test build-only issues with additional debugging information included.
     *
     * @default false
     */
    devOutput?: boolean;
    /**
     * Teardown the compiler WASM instance after build. This can improve performance when
     * building once, but may cause a performance hit if building multiple times in a row.
     *
     * When building multiple projects in the same execution (e.g. during tests), disabling
     * this option can greatly improve performance at the cost of some extra memory usage.
     *
     * @default true
     */
    teardownCompiler?: boolean;
}
/**
 * Builds your site for deployment. By default, this will generate static files and place them in a dist/ directory.
 * If SSR is enabled, this will generate the necessary server files to serve your site.
 *
 * @experimental The JavaScript API is experimental
 */
export default function build(inlineConfig: AstroInlineConfig, options?: BuildOptions): Promise<void>;
export {};
