import { Hover, Position } from 'vscode-languageserver-types';
import { LanguageSettings } from '../yamlLanguageService';
import { YAMLSchemaService } from './yamlSchemaService';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Telemetry } from '../telemetry';
export declare class YAMLHover {
    private readonly telemetry?;
    private shouldHover;
    private indentation;
    private schemaService;
    constructor(schemaService: YAMLSchemaService, telemetry?: Telemetry);
    configure(languageSettings: LanguageSettings): void;
    doHover(document: TextDocument, position: Position, isKubernetes?: boolean): Promise<Hover | null>;
    private getHover;
    private toMarkdown;
}
