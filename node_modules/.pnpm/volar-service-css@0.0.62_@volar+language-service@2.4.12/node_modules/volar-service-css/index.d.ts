import type { Disposable, DocumentSelector, FormattingOptions, ProviderResult, LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as css from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
export interface Provide {
    'css/stylesheet': (document: TextDocument, ls: css.LanguageService) => css.Stylesheet;
    'css/languageService': (document: TextDocument) => css.LanguageService | undefined;
}
export declare function resolveReference(ref: string, baseUri: URI, workspaceFolders: URI[]): string;
export declare function create({ cssDocumentSelector, scssDocumentSelector, lessDocumentSelector, useDefaultDataProvider, getDocumentContext, isFormattingEnabled, getFormattingOptions, getLanguageSettings, getCustomData, onDidChangeCustomData, }?: {
    cssDocumentSelector?: DocumentSelector;
    scssDocumentSelector?: DocumentSelector;
    lessDocumentSelector?: DocumentSelector;
    useDefaultDataProvider?: boolean;
    getDocumentContext?(context: LanguageServiceContext): css.DocumentContext;
    isFormattingEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    getFormattingOptions?(document: TextDocument, options: FormattingOptions, context: LanguageServiceContext): ProviderResult<css.CSSFormatConfiguration>;
    getLanguageSettings?(document: TextDocument, context: LanguageServiceContext): ProviderResult<css.LanguageSettings | undefined>;
    getCustomData?(context: LanguageServiceContext): ProviderResult<css.ICSSDataProvider[]>;
    onDidChangeCustomData?(listener: () => void, context: LanguageServiceContext): Disposable;
}): LanguageServicePlugin;
//# sourceMappingURL=index.d.ts.map