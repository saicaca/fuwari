export interface SnippetsMap {
    [name: string]: string;
}
/**
 * Parses raw snippets definitions with possibly multiple keys into a plan
 * snippet map
 */
export declare function parseSnippets(snippets: SnippetsMap): SnippetsMap;
/**
 * List of all known syntaxes
 */
export declare const syntaxes: {
    markup: string[];
    stylesheet: string[];
};
