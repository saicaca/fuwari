/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Parser, Composer, LineCounter } from 'yaml';
import { YAMLDocument, SingleYAMLDocument } from './yaml-documents';
import { getCustomTags } from './custom-tag-provider';
import { TextBuffer } from '../utils/textBuffer';
export { YAMLDocument, SingleYAMLDocument };
export const defaultOptions = {
    customTags: [],
    yamlVersion: '1.2',
};
/**
 * `yaml-ast-parser-custom-tags` parses the AST and
 * returns YAML AST nodes, which are then formatted
 * for consumption via the language server.
 */
export function parse(text, parserOptions = defaultOptions, document) {
    const options = {
        strict: false,
        customTags: getCustomTags(parserOptions.customTags),
        version: parserOptions.yamlVersion ?? defaultOptions.yamlVersion,
        keepSourceTokens: true,
    };
    const composer = new Composer(options);
    const lineCounter = new LineCounter();
    let isLastLineEmpty = false;
    if (document) {
        const textBuffer = new TextBuffer(document);
        const position = textBuffer.getPosition(text.length);
        const lineContent = textBuffer.getLineContent(position.line);
        isLastLineEmpty = lineContent.trim().length === 0;
    }
    const parser = isLastLineEmpty ? new Parser() : new Parser(lineCounter.addNewLine);
    const tokens = parser.parse(text);
    const tokensArr = Array.from(tokens);
    const docs = composer.compose(tokensArr, true, text.length);
    // Generate the SingleYAMLDocs from the AST nodes
    const yamlDocs = Array.from(docs, (doc) => parsedDocToSingleYAMLDocument(doc, lineCounter));
    // Consolidate the SingleYAMLDocs
    return new YAMLDocument(yamlDocs, tokensArr);
}
function parsedDocToSingleYAMLDocument(parsedDoc, lineCounter) {
    const syd = new SingleYAMLDocument(lineCounter);
    syd.internalDocument = parsedDoc;
    return syd;
}
//# sourceMappingURL=yamlParser07.js.map