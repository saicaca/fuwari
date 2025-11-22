import type { CodeInformation, Mapper } from '@volar/language-core';
import type * as ts from 'typescript';
import type * as vscode from 'vscode-languageserver-protocol';
export declare function findOverlapCodeRange(start: number, end: number, map: Mapper, filter: (data: CodeInformation) => boolean): {
    start: number;
    end: number;
} | undefined;
export declare function isInsideRange(parent: vscode.Range, child: vscode.Range): boolean;
export declare function isEqualRange(a: vscode.Range, b: vscode.Range): boolean;
export declare function stringToSnapshot(str: string): ts.IScriptSnapshot;
export declare function sleep(ms: number): Promise<unknown>;
