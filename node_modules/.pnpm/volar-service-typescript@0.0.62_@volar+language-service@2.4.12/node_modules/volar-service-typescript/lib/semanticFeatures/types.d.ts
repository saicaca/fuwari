import type { LanguageServiceContext } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';
export type SharedContext = LanguageServiceContext & {
    languageServiceHost: ts.LanguageServiceHost;
    languageService: ts.LanguageService;
    getTextDocument: (uri: URI) => TextDocument | undefined;
    uriToFileName: (uri: URI) => string;
    fileNameToUri: (fileName: string) => URI;
};
//# sourceMappingURL=types.d.ts.map