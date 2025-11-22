import { type CodeMapping, type LanguagePlugin, type VirtualCode } from '@volar/language-core';
import type ts from 'typescript';
export declare function getLanguagePlugin(): LanguagePlugin<string, AstroVirtualCode>;
export declare class AstroVirtualCode implements VirtualCode {
    fileName: string;
    snapshot: ts.IScriptSnapshot;
    id: string;
    languageId: string;
    mappings: CodeMapping[];
    embeddedCodes: VirtualCode[];
    codegenStacks: never[];
    constructor(fileName: string, snapshot: ts.IScriptSnapshot);
}
