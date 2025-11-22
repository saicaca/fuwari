import type { CodeInformation, LinkedCodeMap, Mapper, SourceScript, VirtualCode } from '@volar/language-core';
import type * as vscode from 'vscode-languageserver-protocol';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { URI } from 'vscode-uri';
import type { LanguageServiceContext, LanguageServicePlugin, LanguageServicePluginInstance } from '../types';
export type DocumentsAndMap = [
    sourceDocument: TextDocument,
    embeddedDocument: TextDocument,
    map: Mapper
];
export declare function documentFeatureWorker<T>(context: LanguageServiceContext, uri: URI, valid: (info: DocumentsAndMap) => boolean, worker: (plugin: [LanguageServicePlugin, LanguageServicePluginInstance], document: TextDocument) => Thenable<T | null | undefined> | T | null | undefined, transformResult: (result: T, map?: DocumentsAndMap) => T | undefined, combineResult?: (results: T[]) => T): Promise<T | undefined>;
export declare function languageFeatureWorker<T, K>(context: LanguageServiceContext, uri: URI, getRealDocParams: () => K, eachVirtualDocParams: (map: DocumentsAndMap) => Generator<K>, worker: (plugin: [LanguageServicePlugin, LanguageServicePluginInstance], document: TextDocument, params: K, map?: DocumentsAndMap) => Thenable<T | null | undefined> | T | null | undefined, transformResult: (result: T, map?: DocumentsAndMap) => T | undefined, combineResult?: (results: T[]) => T): Promise<T | undefined>;
export declare function safeCall<T>(cb: () => Thenable<T> | T, errorMsg?: string): Promise<T | undefined>;
export declare function forEachEmbeddedDocument(context: LanguageServiceContext, sourceScript: SourceScript<URI>, current: VirtualCode): Generator<DocumentsAndMap>;
export declare function getSourceRange(docs: DocumentsAndMap, range: vscode.Range, filter?: (data: CodeInformation) => boolean): {
    start: import("vscode-languageserver-textdocument").Position;
    end: import("vscode-languageserver-textdocument").Position;
} | undefined;
export declare function getGeneratedRange(docs: DocumentsAndMap, range: vscode.Range, filter?: (data: CodeInformation) => boolean): {
    start: import("vscode-languageserver-textdocument").Position;
    end: import("vscode-languageserver-textdocument").Position;
} | undefined;
export declare function getSourceRanges([sourceDocument, embeddedDocument, map]: DocumentsAndMap, range: vscode.Range, filter?: (data: CodeInformation) => boolean): Generator<{
    start: import("vscode-languageserver-textdocument").Position;
    end: import("vscode-languageserver-textdocument").Position;
}, void, unknown>;
export declare function getGeneratedRanges([sourceDocument, embeddedDocument, map]: DocumentsAndMap, range: vscode.Range, filter?: (data: CodeInformation) => boolean): Generator<{
    start: import("vscode-languageserver-textdocument").Position;
    end: import("vscode-languageserver-textdocument").Position;
}, void, unknown>;
export declare function getSourcePositions([sourceDocument, embeddedDocument, map]: DocumentsAndMap, position: vscode.Position, filter?: (data: CodeInformation) => boolean): Generator<import("vscode-languageserver-textdocument").Position, void, unknown>;
export declare function getGeneratedPositions([sourceDocument, embeddedDocument, map]: DocumentsAndMap, position: vscode.Position, filter?: (data: CodeInformation) => boolean): Generator<import("vscode-languageserver-textdocument").Position, void, unknown>;
export declare function getLinkedCodePositions(document: TextDocument, linkedMap: LinkedCodeMap, posotion: vscode.Position): Generator<import("vscode-languageserver-textdocument").Position, void, unknown>;
