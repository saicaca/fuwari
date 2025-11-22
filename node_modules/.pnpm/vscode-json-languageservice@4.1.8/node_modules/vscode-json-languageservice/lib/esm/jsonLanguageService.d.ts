import { Thenable, ASTNode, Color, ColorInformation, ColorPresentation, LanguageServiceParams, LanguageSettings, DocumentLanguageSettings, FoldingRange, JSONSchema, SelectionRange, FoldingRangesContext, DocumentSymbolsContext, ColorInformationContext as DocumentColorsContext, TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, FormattingOptions, DocumentSymbol, DefinitionLink, MatchingSchema } from './jsonLanguageTypes';
import { DocumentLink } from 'vscode-languageserver-types';
export declare type JSONDocument = {
    root: ASTNode | undefined;
    getNodeFromOffset(offset: number, includeRightBound?: boolean): ASTNode | undefined;
};
export * from './jsonLanguageTypes';
export interface LanguageService {
    configure(settings: LanguageSettings): void;
    doValidation(document: TextDocument, jsonDocument: JSONDocument, documentSettings?: DocumentLanguageSettings, schema?: JSONSchema): Thenable<Diagnostic[]>;
    parseJSONDocument(document: TextDocument): JSONDocument;
    newJSONDocument(rootNode: ASTNode, syntaxDiagnostics?: Diagnostic[]): JSONDocument;
    resetSchema(uri: string): boolean;
    getMatchingSchemas(document: TextDocument, jsonDocument: JSONDocument, schema?: JSONSchema): Thenable<MatchingSchema[]>;
    doResolve(item: CompletionItem): Thenable<CompletionItem>;
    doComplete(document: TextDocument, position: Position, doc: JSONDocument): Thenable<CompletionList | null>;
    findDocumentSymbols(document: TextDocument, doc: JSONDocument, context?: DocumentSymbolsContext): SymbolInformation[];
    findDocumentSymbols2(document: TextDocument, doc: JSONDocument, context?: DocumentSymbolsContext): DocumentSymbol[];
    findDocumentColors(document: TextDocument, doc: JSONDocument, context?: DocumentColorsContext): Thenable<ColorInformation[]>;
    getColorPresentations(document: TextDocument, doc: JSONDocument, color: Color, range: Range): ColorPresentation[];
    doHover(document: TextDocument, position: Position, doc: JSONDocument): Thenable<Hover | null>;
    format(document: TextDocument, range: Range, options: FormattingOptions): TextEdit[];
    getFoldingRanges(document: TextDocument, context?: FoldingRangesContext): FoldingRange[];
    getSelectionRanges(document: TextDocument, positions: Position[], doc: JSONDocument): SelectionRange[];
    findDefinition(document: TextDocument, position: Position, doc: JSONDocument): Thenable<DefinitionLink[]>;
    findLinks(document: TextDocument, doc: JSONDocument): Thenable<DocumentLink[]>;
}
export declare function getLanguageService(params: LanguageServiceParams): LanguageService;
