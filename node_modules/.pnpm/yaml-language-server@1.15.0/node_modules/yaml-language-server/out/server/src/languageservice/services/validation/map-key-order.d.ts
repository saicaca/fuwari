import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver-types';
import { SingleYAMLDocument } from '../../parser/yaml-documents';
import { AdditionalValidator } from './types';
export declare class MapKeyOrderValidator implements AdditionalValidator {
    validate(document: TextDocument, yamlDoc: SingleYAMLDocument): Diagnostic[];
}
