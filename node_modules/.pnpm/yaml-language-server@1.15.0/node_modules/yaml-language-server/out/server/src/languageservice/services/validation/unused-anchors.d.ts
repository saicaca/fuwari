import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver-types';
import { SingleYAMLDocument } from '../../parser/yaml-documents';
import { AdditionalValidator } from './types';
export declare class UnusedAnchorsValidator implements AdditionalValidator {
    validate(document: TextDocument, yamlDoc: SingleYAMLDocument): Diagnostic[];
    private getAnchorNode;
}
