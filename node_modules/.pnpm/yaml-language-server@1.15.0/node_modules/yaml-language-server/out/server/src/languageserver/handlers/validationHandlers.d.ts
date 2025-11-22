import { Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver-types';
import { LanguageService } from '../../languageservice/yamlLanguageService';
import { SettingsState } from '../../yamlSettings';
export declare class ValidationHandler {
    private readonly connection;
    private languageService;
    private yamlSettings;
    constructor(connection: Connection, languageService: LanguageService, yamlSettings: SettingsState);
    validate(textDocument: TextDocument): void;
    private cleanPendingValidation;
    validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]>;
}
