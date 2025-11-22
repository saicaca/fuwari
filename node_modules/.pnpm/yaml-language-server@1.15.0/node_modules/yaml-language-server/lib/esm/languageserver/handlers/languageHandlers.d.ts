/// <reference types="node" />
import { Connection } from 'vscode-languageserver';
import { CodeActionParams, DidChangeWatchedFilesParams, DocumentFormattingParams, DocumentLinkParams, DocumentOnTypeFormattingParams, DocumentSymbolParams, FoldingRangeParams, SelectionRangeParams, TextDocumentPositionParams, CodeLensParams, DefinitionParams } from 'vscode-languageserver-protocol';
import { CodeAction, CodeLens, CompletionList, DefinitionLink, DocumentLink, DocumentSymbol, Hover, FoldingRange, SelectionRange, SymbolInformation, TextEdit } from 'vscode-languageserver-types';
import { LanguageService } from '../../languageservice/yamlLanguageService';
import { SettingsState } from '../../yamlSettings';
import { ValidationHandler } from './validationHandlers';
export declare class LanguageHandlers {
    private readonly connection;
    private languageService;
    private yamlSettings;
    private validationHandler;
    pendingLimitExceededWarnings: {
        [uri: string]: {
            features: {
                [name: string]: string;
            };
            timeout?: NodeJS.Timeout;
        };
    };
    constructor(connection: Connection, languageService: LanguageService, yamlSettings: SettingsState, validationHandler: ValidationHandler);
    registerHandlers(): void;
    documentLinkHandler(params: DocumentLinkParams): Promise<DocumentLink[]>;
    /**
     * Called when the code outline in an editor needs to be populated
     * Returns a list of symbols that is then shown in the code outline
     */
    documentSymbolHandler(documentSymbolParams: DocumentSymbolParams): DocumentSymbol[] | SymbolInformation[];
    /**
     * Called when the formatter is invoked
     * Returns the formatted document content using prettier
     */
    formatterHandler(formatParams: DocumentFormattingParams): TextEdit[];
    formatOnTypeHandler(params: DocumentOnTypeFormattingParams): Promise<TextEdit[] | undefined> | TextEdit[] | undefined;
    /**
     * Called when the user hovers with their mouse over a keyword
     * Returns an informational tooltip
     */
    hoverHandler(textDocumentPositionParams: TextDocumentPositionParams): Promise<Hover>;
    /**
     * Called when auto-complete is triggered in an editor
     * Returns a list of valid completion items
     */
    completionHandler(textDocumentPosition: TextDocumentPositionParams): Promise<CompletionList>;
    /**
     * Called when a monitored file is changed in an editor
     * Re-validates the entire document
     */
    watchedFilesHandler(change: DidChangeWatchedFilesParams): void;
    foldingRangeHandler(params: FoldingRangeParams): Promise<FoldingRange[] | undefined> | FoldingRange[] | undefined;
    selectionRangeHandler(params: SelectionRangeParams): SelectionRange[] | undefined;
    codeActionHandler(params: CodeActionParams): CodeAction[] | undefined;
    codeLensHandler(params: CodeLensParams): PromiseLike<CodeLens[] | undefined> | CodeLens[] | undefined;
    codeLensResolveHandler(param: CodeLens): PromiseLike<CodeLens> | CodeLens;
    definitionHandler(params: DefinitionParams): DefinitionLink[];
    private cancelLimitExceededWarnings;
    private onResultLimitExceeded;
}
