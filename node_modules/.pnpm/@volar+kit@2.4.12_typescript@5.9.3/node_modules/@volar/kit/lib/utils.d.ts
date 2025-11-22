import type * as path from 'typesafe-path/posix';
import { URI } from 'vscode-uri';
import type * as ts from 'typescript';
export declare const defaultCompilerOptions: ts.CompilerOptions;
export declare function asPosix(path: string): path.PosixPath;
export declare const asFileName: (uri: URI) => string;
export declare const asUri: (fileName: string) => URI;
