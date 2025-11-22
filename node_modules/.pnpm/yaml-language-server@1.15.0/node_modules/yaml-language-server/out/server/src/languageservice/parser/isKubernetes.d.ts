import { TextDocument } from 'vscode-languageserver-textdocument';
import * as Parser from './jsonParser07';
export declare function setKubernetesParserOption(jsonDocuments: Parser.JSONDocument[], option: boolean): void;
export declare function isKubernetesAssociatedDocument(textDocument: TextDocument, paths: string[]): boolean;
