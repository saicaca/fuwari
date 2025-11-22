import { RehypeExpressiveCodeRenderer, RehypeExpressiveCodeOptions, BundledShikiLanguage } from 'rehype-expressive-code';
export * from 'rehype-expressive-code';
import { AstroIntegration } from 'astro';

type ConfigSetupHookArgs = Parameters<NonNullable<AstroIntegration['hooks']['astro:config:setup']>>[0];
type AstroConfig = ConfigSetupHookArgs['config'];
/**
 * Contains the parts of the Astro config that are used by this integration.
 */
type PartialAstroConfig = Pick<AstroConfig, 'base' | 'root' | 'srcDir'> & {
    build?: Partial<Pick<AstroConfig['build'], 'assets' | 'assetsPrefix'>> | undefined;
    markdown?: Partial<{
        shikiConfig: Partial<Pick<AstroConfig['markdown']['shikiConfig'], 'langs' | 'langAlias'>>;
    }> | undefined;
};

type CreateAstroRendererArgs = {
    ecConfig: AstroExpressiveCodeOptions;
    astroConfig: PartialAstroConfig;
    logger?: ConfigSetupHookArgs['logger'] | undefined;
};
type AstroExpressiveCodeRenderer = RehypeExpressiveCodeRenderer & {
    hashedStyles: [string, string][];
    hashedScripts: [string, string][];
};
declare function createAstroRenderer({ ecConfig, astroConfig, logger }: CreateAstroRendererArgs): Promise<AstroExpressiveCodeRenderer>;

type AstroExpressiveCodeOptions = RehypeExpressiveCodeOptions & {
    /**
     * Determines if the styles required to display code blocks should be emitted into a separate
     * CSS file rather than being inlined into the rendered HTML of the first code block per page.
     *
     * This is recommended for sites containing multiple pages with code blocks, as it will reduce
     * the overall footprint of the site when navigating between pages.
     *
     * The generated URL is located inside Astro's assets directory and includes a content hash
     * so it can be cached indefinitely by browsers. If you are using the default values for the
     * Astro config options `base`, `build.assets`, `build.assetsPrefix`, the resulting URL
     * will be `/_astro/ec.{hash}.css`.
     *
     * **Important**: To actually benefit from caching, please ensure that your hosting provider
     * serves the contents of the assets directory as immutable files with a long cache lifetime,
     * e.g. `Cache-Control: public,max-age=31536000,immutable`.
     *
     * @default true
     */
    emitExternalStylesheet?: boolean | undefined;
    /**
     * This advanced option allows you to influence the rendering process by creating
     * your own `AstroExpressiveCodeRenderer` or processing the base styles and JS modules
     * added to every page.
     *
     * The return value will be cached and used for all code blocks on the site.
     */
    customCreateAstroRenderer?: ((args: CreateAstroRendererArgs) => Promise<AstroExpressiveCodeRenderer> | AstroExpressiveCodeRenderer) | undefined;
    /**
     * This advanced option allows you to preprocess the Expressive Code configuration
     * before it is used by the Astro integration or its exported `<Code>` component.
     *
     * For example, Starlight uses this option to provide different default settings
     * and additional theme options.
     */
    customConfigPreprocessors?: CustomConfigPreprocessors | undefined;
    /**
     * Controls whether any themes from the full Shiki bundle that are not used by your
     * Expressive Code configuration should be removed from the final bundle.
     *
     * Defaults to `true`, which automatically reduces SSR bundle size by over 1 MB.
     *
     * If you need to access all themes on your site, you can set this option to `false`.
     */
    removeUnusedThemes?: boolean | undefined;
};
type CustomConfigPreprocessors = {
    /**
     * To perform preprocessing on the Expressive Code configuration before it is used
     * by the Astro integration, set this property to a function. It will be called with
     * an object argument that contains the following properties:
     * - `ecConfig`: an Expressive Code config object merged from the optional EC config file
     *   `ec.config.mjs` and any options passed directly to the integration
     * - `astroConfig`: an object containing commonly used settings from the Astro configuration
     *
     * The return value must be a valid Expressive Code configuration object.
     */
    preprocessAstroIntegrationConfig: ConfigPreprocessorFn;
    /**
     * If you set `preprocessAstroIntegrationConfig` to a function, you must also set this property
     * to the JS source code of a Vite virtual module that exports the same function as its
     * default export.
     *
     * This is necessary to allow the `<Code>` component to access the same preprocessed config
     * as the Astro integration. The Astro integration cannot share the function directly with
     * the `<Code>` component because it runs in a separate Vite instance.
     */
    preprocessComponentConfig: string;
};
type ConfigPreprocessorFn = (args: {
    ecConfig: unknown;
    astroConfig: PartialAstroConfig;
}) => Promise<AstroExpressiveCodeOptions> | AstroExpressiveCodeOptions;
/**
 * Merges the given Astro Expressive Code configuration objects into a single new result object.
 *
 * Option values from earlier objects in the argument list are overwritten by new values
 * found in later objects, including `undefined` values.
 *
 * For the following object options, a deep merge is performed instead of a simple override:
 * - `defaultProps`
 * - `frames`
 * - `shiki`
 * - `styleOverrides`
 *
 * The following array options are concatenated instead of being replaced:
 * - `shiki.langs`
 */
declare function mergeEcConfigOptions(...configs: AstroExpressiveCodeOptions[]): AstroExpressiveCodeOptions;

declare module 'rehype-expressive-code' {
    interface PluginShikiOptions {
        /**
         * Allows defining a subset of language IDs from the full Shiki bundle
         * that should be available for syntax highlighting.
         *
         * In server-side rendering (SSR) environments, setting this option to the languages
         * used on your site can reduce bundle size by up to 80%.
         *
         * If this option is not set, all languages from the full Shiki bundle are available.
         */
        bundledLangs?: BundledShikiLanguage[] | undefined;
    }
}

/**
 * Astro integration that adds Expressive Code support to code blocks in Markdown & MDX documents.
 */
declare function astroExpressiveCode(integrationOptions?: AstroExpressiveCodeOptions): {
    name: string;
    hooks: {
        'astro:config:setup': (args: unknown) => Promise<void>;
    };
};
/**
 * A utility function that helps you define an Expressive Code configuration object. It is meant
 * to be used inside the optional config file `ec.config.mjs` located in the root directory
 * of your Astro project, and its return value to be exported as the default export.
 *
 * Expressive Code will automatically detect this file and use the exported configuration object
 * to override its own default settings.
 *
 * Using this function is recommended, but not required. It just passes through the given object,
 * but it also provides type information for your editor's auto-completion and type checking.
 *
 * @example
 * ```js
 * // ec.config.mjs
 * import { defineEcConfig } from 'astro-expressive-code'
 *
 * export default defineEcConfig({
 *   themes: ['dracula', 'github-light'],
 *   styleOverrides: {
 *     borderRadius: '0.5rem',
 *   },
 * })
 * ```
 */
declare function defineEcConfig(config: AstroExpressiveCodeOptions): AstroExpressiveCodeOptions;

export { AstroExpressiveCodeOptions, AstroExpressiveCodeRenderer, ConfigPreprocessorFn, CreateAstroRendererArgs, CustomConfigPreprocessors, PartialAstroConfig, astroExpressiveCode, createAstroRenderer, astroExpressiveCode as default, defineEcConfig, mergeEcConfigOptions };
