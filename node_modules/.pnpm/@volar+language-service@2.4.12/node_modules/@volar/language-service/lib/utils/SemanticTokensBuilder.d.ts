import type { SemanticTokens } from 'vscode-languageserver-protocol';
export declare class SemanticTokensBuilder {
    private _id;
    private _prevLine;
    private _prevChar;
    private _data;
    private _dataLen;
    constructor();
    private initialize;
    push(line: number, char: number, length: number, tokenType: number, tokenModifiers: number): void;
    get id(): string;
    build(): SemanticTokens;
}
