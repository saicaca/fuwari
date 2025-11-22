import type { Disposable, DocumentSelector, FormattingOptions, LanguageServiceContext, LanguageServicePlugin, ProviderResult } from '@volar/language-service';
import * as html from 'vscode-html-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
export interface Provide {
    'html/htmlDocument': (document: TextDocument) => html.HTMLDocument | undefined;
    'html/languageService': () => html.LanguageService;
    'html/documentContext': () => html.DocumentContext;
}
export declare function resolveReference(ref: string, baseUri: URI, workspaceFolders: URI[]): string;
export declare function create({ documentSelector, configurationSections, useDefaultDataProvider, getDocumentContext, isFormattingEnabled, getFormattingOptions, getCompletionConfiguration, getHoverSettings, getCustomData, onDidChangeCustomData, }?: {
    documentSelector?: DocumentSelector;
    configurationSections?: {
        autoCreateQuotes: string;
        autoClosingTags: string;
    };
    useDefaultDataProvider?: boolean;
    isFormattingEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    isAutoCreateQuotesEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    isAutoClosingTagsEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    getDocumentContext?(context: LanguageServiceContext): html.DocumentContext;
    getFormattingOptions?(document: TextDocument, options: FormattingOptions, context: LanguageServiceContext): ProviderResult<html.HTMLFormatConfiguration>;
    getCompletionConfiguration?(document: TextDocument, context: LanguageServiceContext): ProviderResult<html.CompletionConfiguration | undefined>;
    getHoverSettings?(document: TextDocument, context: LanguageServiceContext): ProviderResult<html.HoverSettings | undefined>;
    getCustomData?(context: LanguageServiceContext): ProviderResult<html.IHTMLDataProvider[]>;
    onDidChangeCustomData?(listener: () => void, context: LanguageServiceContext): Disposable;
}): LanguageServicePlugin;
//# sourceMappingURL=index.d.ts.map