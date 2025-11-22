import { SymbolInformation, DocumentSymbol } from 'vscode-languageserver-types';
import { YAMLSchemaService } from './yamlSchemaService';
import { DocumentSymbolsContext } from 'vscode-json-languageservice/lib/umd/jsonLanguageTypes';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Telemetry } from '../telemetry';
export declare class YAMLDocumentSymbols {
    private readonly telemetry?;
    private jsonDocumentSymbols;
    constructor(schemaService: YAMLSchemaService, telemetry?: Telemetry);
    findDocumentSymbols(document: TextDocument, context?: DocumentSymbolsContext): SymbolInformation[];
    findHierarchicalDocumentSymbols(document: TextDocument, context?: DocumentSymbolsContext): DocumentSymbol[];
}
