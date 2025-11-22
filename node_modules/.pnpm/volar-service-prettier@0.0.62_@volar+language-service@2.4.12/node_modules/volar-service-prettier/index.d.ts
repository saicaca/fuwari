import type { DocumentSelector, FormattingOptions, ProviderResult, LanguageServiceContext, LanguageServicePlugin, TextDocument } from '@volar/language-service';
import type { Options } from 'prettier';
export declare function create(
/**
 * Prettier instance or getter to use.
 */
prettierInstanceOrGetter: typeof import('prettier') | ((context: LanguageServiceContext) => ProviderResult<typeof import('prettier') | undefined>), { html, documentSelector, isFormattingEnabled, getFormattingOptions, }?: {
    html?: {
        /**
         * Preprocessing to break "contents" from "HTML tags".
         * This will prevent HTML closing tags, and opening tags without attributes
         * from breaking into a blank `>` or `<` on a new line.
         */
        breakContentsFromTags?: boolean;
    };
    /**
     * Languages to be formatted by prettier.
     *
     * @default
     * ['html', 'css', 'scss', 'typescript', 'javascript']
     */
    documentSelector?: DocumentSelector;
    isFormattingEnabled?(prettier: typeof import('prettier'), document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    getFormattingOptions?(prettier: typeof import('prettier'), document: TextDocument, formatOptions: FormattingOptions, context: LanguageServiceContext): ProviderResult<Options>;
}): LanguageServicePlugin;
//# sourceMappingURL=index.d.ts.map