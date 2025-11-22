import { YAMLDocument, SingleYAMLDocument } from './yaml-documents';
import { TextDocument } from 'vscode-languageserver-textdocument';
export { YAMLDocument, SingleYAMLDocument };
export declare type YamlVersion = '1.1' | '1.2';
export interface ParserOptions {
    customTags: string[];
    yamlVersion: YamlVersion;
}
export declare const defaultOptions: ParserOptions;
/**
 * `yaml-ast-parser-custom-tags` parses the AST and
 * returns YAML AST nodes, which are then formatted
 * for consumption via the language server.
 */
export declare function parse(text: string, parserOptions?: ParserOptions, document?: TextDocument): YAMLDocument;
