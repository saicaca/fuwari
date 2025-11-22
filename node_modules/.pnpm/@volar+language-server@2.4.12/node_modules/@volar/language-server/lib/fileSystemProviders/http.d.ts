import { FileSystem } from '@volar/language-service';
import type { URI } from 'vscode-uri';
import { LanguageServer } from '../types';
export declare const provider: FileSystem;
export declare function listenEditorSettings(server: LanguageServer): void;
export declare function handler(uri: URI): Promise<string | undefined>;
