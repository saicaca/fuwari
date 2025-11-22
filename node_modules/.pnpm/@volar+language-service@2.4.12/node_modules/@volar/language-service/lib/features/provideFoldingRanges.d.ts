import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
import type * as _ from 'vscode-languageserver-protocol';
export declare function register(context: LanguageServiceContext): (uri: URI, token?: _.CancellationToken) => Promise<_.FoldingRange[] | undefined>;
