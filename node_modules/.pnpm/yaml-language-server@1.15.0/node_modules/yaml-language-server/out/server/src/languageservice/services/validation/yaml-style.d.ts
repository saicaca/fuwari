import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver-types';
import { SingleYAMLDocument } from '../../parser/yaml-documents';
import { LanguageSettings } from '../../yamlLanguageService';
import { AdditionalValidator } from './types';
export declare class YAMLStyleValidator implements AdditionalValidator {
    private forbidSequence;
    private forbidMapping;
    constructor(settings: LanguageSettings);
    validate(document: TextDocument, yamlDoc: SingleYAMLDocument): Diagnostic[];
    private getRangeOf;
}
