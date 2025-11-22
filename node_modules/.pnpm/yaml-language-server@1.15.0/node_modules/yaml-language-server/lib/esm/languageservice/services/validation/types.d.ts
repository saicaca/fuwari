import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver-types';
import { SingleYAMLDocument } from '../../parser/yaml-documents';
export interface AdditionalValidator {
    validate(document: TextDocument, yamlDoc: SingleYAMLDocument): Diagnostic[];
}
