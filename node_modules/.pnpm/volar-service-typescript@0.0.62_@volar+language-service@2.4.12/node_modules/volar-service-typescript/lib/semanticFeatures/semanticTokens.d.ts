import type * as vscode from '@volar/language-service';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { SharedContext } from './types';
import type { URI } from 'vscode-uri';
export declare function register(ts: typeof import('typescript'), ctx: SharedContext): (uri: URI, document: TextDocument, range: vscode.Range, legend: vscode.SemanticTokensLegend) => [number, number, number, number, number][] | undefined;
//# sourceMappingURL=semanticTokens.d.ts.map