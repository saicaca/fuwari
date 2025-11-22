import type { LanguageServiceContext, LanguageServicePlugin, ProviderResult } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
export declare function getLanguageServiceByDocument(ts: typeof import('typescript'), document: TextDocument): {
    languageService: ts.LanguageService;
    fileName: string;
};
export declare function create(ts: typeof import('typescript'), { isFormattingEnabled, }?: {
    isFormattingEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    isAutoClosingTagsEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
}): LanguageServicePlugin;
//# sourceMappingURL=syntactic.d.ts.map