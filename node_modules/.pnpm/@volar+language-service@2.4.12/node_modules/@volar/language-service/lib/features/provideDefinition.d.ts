import type { CodeInformation } from '@volar/language-core';
import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext, apiName: 'provideDeclaration' | 'provideDefinition' | 'provideTypeDefinition' | 'provideImplementation', isValidPosition: (data: CodeInformation) => boolean): (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
