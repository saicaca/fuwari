import type * as vscode from '@volar/language-service';
import type * as EmmetHelper from '@vscode/emmet-helper';
import type { Node as FlatNode, Stylesheet as FlatStylesheet, HtmlNode as HtmlFlatNode } from 'EmmetFlatNode';
export declare function getEmmetHelper(): typeof EmmetHelper;
export declare function isStyleSheet(syntax: string): boolean;
export declare function getMappingForIncludedLanguages(context: vscode.LanguageServiceContext): Promise<Record<string, string>>;
/**
* Get the corresponding emmet mode for given vscode language mode
* E.g.: jsx for typescriptreact/javascriptreact or pug for jade
* If the language is not supported by emmet or has been excluded via `excludeLanguages` setting,
* then nothing is returned
*
* @param excludedLanguages Array of language ids that user has chosen to exclude for emmet
*/
export declare function getEmmetMode(language: string, mappedModes: Record<string, string>, excludedLanguages: string[]): string | undefined;
/**
 * Traverse the given document backward & forward from given position
 * to find a complete ruleset, then parse just that to return a Stylesheet
 * @param document TextDocument
 * @param position vscode.Position
 */
export declare function parsePartialStylesheet(document: vscode.TextDocument, position: vscode.Position): FlatStylesheet | undefined;
/**
 * Returns node corresponding to given position in the given root node
 */
export declare function getFlatNode(root: FlatNode | undefined, offset: number, includeNodeBoundary: boolean): FlatNode | undefined;
export declare const allowedMimeTypesInScriptTag: string[];
/**
 * Finds the HTML node within an HTML document at a given position
 * If position is inside a script tag of type template, then it will be parsed to find the inner HTML node as well
 */
export declare function getHtmlFlatNode(documentText: string, root: FlatNode | undefined, offset: number, includeNodeBoundary: boolean): HtmlFlatNode | undefined;
export declare function getEmmetConfiguration(context: vscode.LanguageServiceContext, syntax: string): Promise<{
    preferences: any;
    showExpandedAbbreviation: any;
    showAbbreviationSuggestions: any;
    syntaxProfiles: any;
    variables: any;
    excludeLanguages: any;
    showSuggestionsAsSnippets: any;
}>;
export declare function getEmbeddedCssNodeIfAny(document: vscode.TextDocument, currentNode: FlatNode | undefined, position: vscode.Position): FlatNode | undefined;
//# sourceMappingURL=util.d.ts.map