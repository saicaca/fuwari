import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeLens } from 'vscode-languageserver-types';
import { YAMLSchemaService } from './yamlSchemaService';
import { Telemetry } from '../telemetry';
export declare class YamlCodeLens {
    private schemaService;
    private readonly telemetry?;
    constructor(schemaService: YAMLSchemaService, telemetry?: Telemetry);
    getCodeLens(document: TextDocument): Promise<CodeLens[]>;
    resolveCodeLens(param: CodeLens): PromiseLike<CodeLens> | CodeLens;
}
