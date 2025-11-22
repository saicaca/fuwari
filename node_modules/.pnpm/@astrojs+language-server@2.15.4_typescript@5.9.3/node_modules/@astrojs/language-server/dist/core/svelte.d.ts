import { type CodeInformation, type LanguagePlugin, type Mapping, type VirtualCode } from '@volar/language-core';
import type ts from 'typescript';
import type { URI } from 'vscode-uri';
export declare function getSvelteLanguagePlugin(): LanguagePlugin<URI, SvelteVirtualCode>;
declare class SvelteVirtualCode implements VirtualCode {
    fileName: string;
    snapshot: ts.IScriptSnapshot;
    id: string;
    languageId: string;
    mappings: Mapping<CodeInformation>[];
    embeddedCodes: VirtualCode[];
    codegenStacks: never[];
    constructor(fileName: string, snapshot: ts.IScriptSnapshot);
}
export {};
