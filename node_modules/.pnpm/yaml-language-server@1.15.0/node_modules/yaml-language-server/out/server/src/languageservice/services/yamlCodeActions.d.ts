import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction } from 'vscode-languageserver-types';
import { ClientCapabilities, CodeActionParams } from 'vscode-languageserver-protocol';
import { LanguageSettings } from '../yamlLanguageService';
export declare class YamlCodeActions {
    private readonly clientCapabilities;
    private indentation;
    constructor(clientCapabilities: ClientCapabilities);
    configure(settings: LanguageSettings): void;
    getCodeAction(document: TextDocument, params: CodeActionParams): CodeAction[] | undefined;
    private getJumpToSchemaActions;
    private getTabToSpaceConverting;
    private getUnusedAnchorsDelete;
    private getConvertToBooleanActions;
    private getConvertToBlockStyleActions;
    private getKeyOrderActions;
}
