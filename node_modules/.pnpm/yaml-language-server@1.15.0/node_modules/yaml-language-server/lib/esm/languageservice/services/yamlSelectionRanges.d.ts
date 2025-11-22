import { Position, SelectionRange } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
export declare function getSelectionRanges(document: TextDocument, positions: Position[]): SelectionRange[];
