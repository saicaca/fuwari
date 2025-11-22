import type * as vscode from '@volar/language-service';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';
import type { SharedContext } from './types';
export interface FixAllData {
    type: 'fixAll';
    uri: string;
    fileName: string;
    fixIds: {}[];
}
export interface RefactorData {
    type: 'refactor';
    uri: string;
    fileName: string;
    refactorName: string;
    actionName: string;
    range: {
        pos: number;
        end: number;
    };
}
export interface OrganizeImportsData {
    type: 'organizeImports';
    uri: string;
    fileName: string;
}
export type Data = FixAllData | RefactorData | OrganizeImportsData;
export declare function register(ctx: SharedContext): (uri: URI, document: TextDocument, range: vscode.Range, context: vscode.CodeActionContext, formattingOptions: vscode.FormattingOptions | undefined) => Promise<vscode.CodeAction[]>;
//# sourceMappingURL=codeAction.d.ts.map