import type { InlineConfig, ResolvedConfig } from 'vite';
import type { CompileOptions, Warning, PreprocessorGroup } from 'svelte/compiler';
import type { Options as InspectorOptions } from '@sveltejs/vite-plugin-svelte-inspector';

export type Options = Omit<SvelteConfig, 'vitePlugin'> & PluginOptionsInline;

interface PluginOptionsInline extends PluginOptions {
	/**
	 * Path to a svelte config file, either absolute or relative to Vite root
	 *
	 * set to `false` to ignore the svelte config file
	 *
	 * @see https://vitejs.dev/config/#root
	 */
	configFile?: string | false;
}

export interface PluginOptions {
	/**
	 * A `picomatch` pattern, or array of patterns, which specifies the files the plugin should
	 * operate on. By default, all svelte files are included.
	 *
	 * @see https://github.com/micromatch/picomatch
	 */
	include?: Arrayable<string>;
	/**
	 * A `picomatch` pattern, or array of patterns, which specifies the files to be ignored by the
	 * plugin. By default, no files are ignored.
	 *
	 * @see https://github.com/micromatch/picomatch
	 */
	exclude?: Arrayable<string>;
	/**
	 * Emit Svelte styles as virtual CSS files for Vite and other plugins to process
	 *
	 * @default true
	 */
	emitCss?: boolean;
	/**
	 * Enable or disable Hot Module Replacement.
	 * Deprecated, use compilerOptions.hmr instead!
	 *
	 * @deprecated
	 * @default true for development, always false for production
	 */
	hot?: boolean;

	/**
	 * Some Vite plugins can contribute additional preprocessors by defining `api.sveltePreprocess`.
	 * If you don't want to use them, set this to true to ignore them all or use an array of strings
	 * with plugin names to specify which.
	 *
	 * @default false
	 */
	ignorePluginPreprocessors?: boolean | string[];
	/**
	 * vite-plugin-svelte automatically handles excluding svelte libraries and reinclusion of their dependencies
	 * in vite.optimizeDeps.
	 *
	 * `disableDependencyReinclusion: true` disables all reinclusions
	 * `disableDependencyReinclusion: ['foo','bar']` disables reinclusions for dependencies of foo and bar
	 *
	 * This should be used for hybrid packages that contain both node and browser dependencies, eg Routify
	 *
	 * @default false
	 */
	disableDependencyReinclusion?: boolean | string[];
	/**
	 * Enable support for Vite's dependency optimization to prebundle Svelte libraries.
	 *
	 * To disable prebundling for a specific library, add it to `optimizeDeps.exclude`.
	 *
	 * @default true for dev, false for build
	 */
	prebundleSvelteLibraries?: boolean;
	/**
	 * toggle/configure Svelte Inspector
	 *
	 * @default unset for dev, always false for build
	 */
	inspector?: InspectorOptions | boolean;

	/**
	 * A function to update `compilerOptions` before compilation
	 *
	 * `data.filename` - The file to be compiled
	 * `data.code` - The preprocessed Svelte code
	 * `data.compileOptions` - The current compiler options
	 *
	 * To change part of the compiler options, return an object with the changes you need.
	 *
	 * @example
	 * ```
	 * ({ filename, compileOptions }) => {
	 *   // Dynamically set runes mode per Svelte file
	 *   if (forceRunesMode(filename) && !compileOptions.runes) {
	 *     return { runes: true };
	 *   }
	 * }
	 * ```
	 */
	dynamicCompileOptions?: (data: {
		filename: string;
		code: string;
		compileOptions: Partial<CompileOptions>;
	}) => Promise<Partial<CompileOptions> | void> | Partial<CompileOptions> | void;

	/**
	 * These options are considered experimental and breaking changes to them can occur in any release
	 */
	experimental?: ExperimentalOptions;
}

export interface SvelteConfig {
	/**
	 * A list of file extensions to be compiled by Svelte
	 *
	 * @default ['.svelte']
	 */
	extensions?: string[];
	/**
	 * An array of preprocessors to transform the Svelte source code before compilation
	 *
	 * @see https://svelte.dev/docs#svelte_preprocess
	 */
	preprocess?: Arrayable<PreprocessorGroup>;
	/**
	 * The options to be passed to the Svelte compiler. A few options are set by default,
	 * including `dev` and `css`. However, some options are non-configurable, like
	 * `filename`, `format`, `generate`, and `cssHash` (in dev).
	 *
	 * @see https://svelte.dev/docs#svelte_compile
	 */
	compilerOptions?: Omit<CompileOptions, 'filename' | 'format' | 'generate'>;

	/**
	 * Handles warning emitted from the Svelte compiler
	 *
	 * warnings emitted for files in node_modules are logged at the debug level, to see them run
	 * `DEBUG=vite-plugin-svelte:node-modules-onwarn pnpm build`
	 *
	 * @example
	 * ```
	 * (warning, defaultHandler) => {
	 *   // ignore some warnings
	 *   if (!['foo','bar'].includes(warning.code)) {
	 *     defaultHandler(warning);
	 *   }
	 * }
	 * ```
	 *
	 */
	onwarn?: (warning: Warning, defaultHandler: (warning: Warning) => void) => void;
	/**
	 * Options for vite-plugin-svelte
	 */
	vitePlugin?: PluginOptions;
}

/**
 * These options are considered experimental and breaking changes to them can occur in any release
 */
interface ExperimentalOptions {
	/**
	 * send a websocket message with svelte compiler warnings during dev
	 *
	 */
	sendWarningsToBrowser?: boolean;
	/**
	 * disable svelte field resolve warnings
	 *
	 * @default false
	 */
	disableSvelteResolveWarnings?: boolean;

	compileModule?: CompileModuleOptions;
}

interface CompileModuleOptions {
	/**
	 * infix that must be present in filename
	 * @default ['.svelte.']
	 */
	infixes?: string[];
	/**
	 * module extensions
	 * @default ['.ts','.js']
	 */
	extensions?: string[];
	include?: Arrayable<string>;
	exclude?: Arrayable<string>;
}

type Arrayable<T> = T | T[];

export interface VitePreprocessOptions {
	/**
	 * preprocess script block with vite pipeline.
	 * Since svelte5 this is not needed for typescript anymore
	 *
	 * @default false
	 */
	script?: boolean;
	/**
	 * preprocess style blocks with vite pipeline
	 */
	style?: boolean | InlineConfig | ResolvedConfig;
}
// eslint-disable-next-line n/no-missing-import
export * from './index.js';
