import { ExpressiveCodeTheme, ExpressiveCodePlugin } from '@expressive-code/core';
import { MaybeGetter, MaybeArray, LanguageRegistration as LanguageRegistration$1, ShikiTransformer, bundledThemes } from 'shiki';
export { BundledLanguage as BundledShikiLanguage } from 'shiki';

type IShikiRawRepository = LanguageRegistration$1['repository'];
type IShikiRawRule = IShikiRawRepository[keyof IShikiRawRepository];
type ILocation = IShikiRawRepository['$vscodeTextmateLocation'];
interface ILocatable {
    readonly $vscodeTextmateLocation?: ILocation | undefined;
}
interface IRawRepositoryMap {
    [name: string]: IRawRule;
}
type IRawRepository = IRawRepositoryMap & ILocatable;
interface IRawCapturesMap {
    [captureId: string]: IRawRule;
}
type IRawCaptures = IRawCapturesMap & ILocatable;
interface IRawRule extends Omit<IShikiRawRule, 'applyEndPatternLast' | 'captures' | 'patterns'> {
    readonly applyEndPatternLast?: boolean | number | undefined;
    readonly captures?: IRawCaptures | undefined;
    readonly comment?: string | undefined;
    readonly patterns?: IRawRule[] | undefined;
}
/**
 * A less strict version of Shiki's `LanguageRegistration` interface that aligns better with
 * actual grammars found in the wild. This version attempts to reduce the amount
 * of type errors that would occur when importing and adding external grammars,
 * while still being supported by the language processing code.
 */
interface LanguageRegistration extends Omit<LanguageRegistration$1, 'repository'> {
    repository?: IRawRepository | undefined;
}
type LanguageInput = MaybeGetter<MaybeArray<LanguageRegistration>>;

interface PluginShikiOptions {
    /**
     * A list of additional languages that should be available for syntax highlighting.
     *
     * You can pass any of the language input types supported by Shiki, e.g.:
     * - `import('./some-exported-grammar.mjs')`
     * - `async () => JSON.parse(await fs.readFile('some-json-grammar.json', 'utf-8'))`
     *
     * See the [Shiki documentation](https://shiki.style/guide/load-lang) for more information.
     */
    langs?: LanguageInput[] | undefined;
    /**
     * Allows defining alias names for languages. The keys are the alias names,
     * and the values are the language IDs to which they should resolve.
     *
     * The values can either be bundled languages, or additional languages
     * defined in `langs`.
     *
     * @example { 'mjs': 'javascript' }
     */
    langAlias?: Record<string, string> | undefined;
    /**
     * By default, the additional languages defined in `langs` are only available in
     * top-level code blocks contained directly in their parent Markdown or MDX document.
     *
     * Setting this option to `true` also enables syntax highlighting when a fenced code block
     * using one of your additional `langs` is nested inside an outer `markdown`, `md` or `mdx`
     * code block. Example:
     *
     * `````md
     * ````md
     * This top-level Markdown code block contains a nested `my-custom-lang` code block:
     *
     * ```my-custom-lang
     * This nested code block will only be highlighted using `my-custom-lang`
     * if `injectLangsIntoNestedCodeBlocks` is enabled.
     * ```
     * ````
     * `````
     */
    injectLangsIntoNestedCodeBlocks?: boolean | undefined;
    /**
     * An optional list of Shiki transformers.
     *
     * **Warning:** This option is experimental and only supports a very limited subset of
     * transformer features. Currently, only the `preprocess` and `tokens` hooks are supported,
     * and only if they do not modify the code block's text.
     *
     * Trying to use unsupported features will throw an error. For more information, see:
     *
     * https://expressive-code.com/key-features/syntax-highlighting/#transformers
     */
    transformers?: ShikiTransformer[] | unknown[] | undefined;
    /**
     * The RegExp engine to use for syntax highlighting.
     *
     * - `'oniguruma'`: The default engine that supports all grammars,
     *   but requires WebAssembly support.
     * - `'javascript'`: A pure JavaScript engine that does not require WebAssembly.
     */
    engine?: 'oniguruma' | 'javascript' | undefined;
}
/**
 * A list of all themes bundled with Shiki.
 */
type BundledShikiTheme = Exclude<keyof typeof bundledThemes, 'css-variables'>;

/**
 * Loads a theme bundled with Shiki for use with Expressive Code.
 */
declare function loadShikiTheme(bundledThemeName: BundledShikiTheme): Promise<ExpressiveCodeTheme>;
declare function pluginShiki(options?: PluginShikiOptions): ExpressiveCodePlugin;

export { BundledShikiTheme, PluginShikiOptions, loadShikiTheme, pluginShiki };
