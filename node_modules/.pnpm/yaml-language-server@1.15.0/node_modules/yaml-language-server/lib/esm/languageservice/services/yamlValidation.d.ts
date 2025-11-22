import { Diagnostic } from 'vscode-languageserver-types';
import { LanguageSettings } from '../yamlLanguageService';
import { YAMLSchemaService } from './yamlSchemaService';
import { YAMLDocDiagnostic } from '../utils/parseUtils';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Telemetry } from '../telemetry';
/**
 * Convert a YAMLDocDiagnostic to a language server Diagnostic
 * @param yamlDiag A YAMLDocDiagnostic from the parser
 * @param textDocument TextDocument from the language server client
 */
export declare const yamlDiagToLSDiag: (yamlDiag: YAMLDocDiagnostic, textDocument: TextDocument) => Diagnostic;
export declare class YAMLValidation {
    private readonly telemetry?;
    private validationEnabled;
    private customTags;
    private jsonValidation;
    private disableAdditionalProperties;
    private yamlVersion;
    private validators;
    private MATCHES_MULTIPLE;
    constructor(schemaService: YAMLSchemaService, telemetry?: Telemetry);
    configure(settings: LanguageSettings): void;
    doValidation(textDocument: TextDocument, isKubernetes?: boolean): Promise<Diagnostic[]>;
    private runAdditionalValidators;
}
