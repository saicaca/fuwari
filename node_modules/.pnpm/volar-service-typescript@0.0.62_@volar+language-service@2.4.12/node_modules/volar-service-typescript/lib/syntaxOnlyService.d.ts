import type * as ts from 'typescript';
export declare function createSyntaxOnlyService(ts: typeof import('typescript'), syntaxOnly: boolean): {
    languageService: ts.LanguageService;
    updateFile: (fileName: string, snapshot: ts.IScriptSnapshot, scriptKind: ts.ScriptKind) => void;
};
//# sourceMappingURL=syntaxOnlyService.d.ts.map