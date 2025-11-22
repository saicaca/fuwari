import { DocumentLink } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Telemetry } from '../telemetry';
export declare class YamlLinks {
    private readonly telemetry?;
    constructor(telemetry?: Telemetry);
    findLinks(document: TextDocument): Promise<DocumentLink[]>;
}
