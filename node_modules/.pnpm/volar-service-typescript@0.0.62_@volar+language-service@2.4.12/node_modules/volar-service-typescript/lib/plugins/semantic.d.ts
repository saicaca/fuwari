import type { LanguageServiceContext, LanguageServicePlugin, ProviderResult } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
export interface Provide {
    'typescript/languageService': () => ts.LanguageService;
    'typescript/languageServiceHost': () => ts.LanguageServiceHost;
    'typescript/documentFileName': (uri: URI) => string;
    'typescript/documentUri': (fileName: string) => URI;
}
export interface CompletionItemData {
    uri: string;
    fileName: string;
    offset: number;
    originalItem: {
        name: ts.CompletionEntry['name'];
        source: ts.CompletionEntry['source'];
        data: ts.CompletionEntry['data'];
        labelDetails: ts.CompletionEntry['labelDetails'];
    };
}
export declare function create(ts: typeof import('typescript'), { disableAutoImportCache, isValidationEnabled, isSuggestionsEnabled, }?: {
    disableAutoImportCache?: boolean;
    isValidationEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
    isSuggestionsEnabled?(document: TextDocument, context: LanguageServiceContext): ProviderResult<boolean>;
}): LanguageServicePlugin;
//# sourceMappingURL=semantic.d.ts.map