import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';
export declare function plainWithLinks(parts: readonly ts.server.protocol.SymbolDisplayPart[] | string, fileNameToUri: (fileName: string) => URI, getTextDocument: (uri: URI) => TextDocument | undefined): string;
export declare function tagsMarkdownPreview(tags: readonly ts.JSDocTagInfo[], fileNameToUri: (fileName: string) => URI, getTextDocument: (uri: URI) => TextDocument | undefined): string;
export declare function markdownDocumentation(documentation: ts.server.protocol.SymbolDisplayPart[] | string | undefined, tags: ts.JSDocTagInfo[] | undefined, fileNameToUri: (fileName: string) => URI, getTextDocument: (uri: URI) => TextDocument | undefined): string;
export declare function addMarkdownDocumentation(out: string, documentation: ts.server.protocol.SymbolDisplayPart[] | string | undefined, tags: ts.JSDocTagInfo[] | undefined, fileNameToUri: (fileName: string) => URI, getTextDocument: (uri: URI) => TextDocument | undefined): string;
//# sourceMappingURL=previewer.d.ts.map