import { DefinitionParams } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionLink } from 'vscode-languageserver-types';
import { Telemetry } from '../telemetry';
export declare class YamlDefinition {
    private readonly telemetry?;
    constructor(telemetry?: Telemetry);
    getDefinition(document: TextDocument, params: DefinitionParams): DefinitionLink[] | undefined;
}
