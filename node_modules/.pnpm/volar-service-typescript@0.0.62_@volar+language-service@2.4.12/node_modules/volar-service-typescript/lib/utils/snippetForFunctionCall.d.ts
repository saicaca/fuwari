import type * as ts from 'typescript';
export declare function snippetForFunctionCall(item: {
    insertText?: string;
    label: string;
}, displayParts: ReadonlyArray<ts.server.protocol.SymbolDisplayPart>): {
    snippet: string;
    parameterCount: number;
};
//# sourceMappingURL=snippetForFunctionCall.d.ts.map