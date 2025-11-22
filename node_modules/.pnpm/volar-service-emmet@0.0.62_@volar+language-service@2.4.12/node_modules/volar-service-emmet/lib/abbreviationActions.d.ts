import type * as vscode from '@volar/language-service';
import type { Node } from 'EmmetFlatNode';
/**
 * Checks if given position is a valid location to expand emmet abbreviation.
 * Works only on html and css/less/scss syntax
 * @param document current Text Document
 * @param rootNode parsed document
 * @param currentNode current node in the parsed document
 * @param syntax syntax of the abbreviation
 * @param position position to validate
 * @param abbreviationRange The range of the abbreviation for which given position is being validated
 */
export declare function isValidLocationForEmmetAbbreviation(context: vscode.LanguageServiceContext, document: vscode.TextDocument, rootNode: Node | undefined, currentNode: Node | undefined, syntax: string, offset: number, abbreviationRange: vscode.Range): Promise<boolean>;
export declare function getSyntaxFromArgs(context: vscode.LanguageServiceContext, args: {
    [x: string]: string;
}): Promise<string | undefined>;
//# sourceMappingURL=abbreviationActions.d.ts.map