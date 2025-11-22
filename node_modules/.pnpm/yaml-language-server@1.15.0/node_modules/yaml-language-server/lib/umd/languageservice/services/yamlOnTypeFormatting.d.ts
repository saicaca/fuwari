import { DocumentOnTypeFormattingParams } from 'vscode-languageserver';
import { TextEdit } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
export declare function doDocumentOnTypeFormatting(document: TextDocument, params: DocumentOnTypeFormattingParams): TextEdit[] | undefined;
