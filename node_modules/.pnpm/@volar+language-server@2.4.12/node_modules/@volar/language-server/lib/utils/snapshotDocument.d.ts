import type * as ts from 'typescript';
import type * as vscode from 'vscode-languageserver-protocol';
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
export declare class SnapshotDocument implements TextDocument {
    private document;
    private snapshots;
    constructor(uri: string, languageId: string, version: number, text: string);
    get uri(): string;
    get languageId(): string;
    get version(): number;
    get lineCount(): number;
    getText(range?: Range): string;
    positionAt(offset: number): import("vscode-languageserver-textdocument").Position;
    offsetAt(position: vscode.Position): number;
    /**
     * Update the document with the given content changes and version.
     * If all changes is incremental, calculate the change range and add a new snapshot.
     * Otherwise, reset the changes.
     */
    update(contentChanges: vscode.TextDocumentContentChangeEvent[], version: number): void;
    getSnapshot(): ts.IScriptSnapshot;
    private resetChanges;
    private clearUnreferencedVersions;
}
