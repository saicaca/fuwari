"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedMimeTypesInScriptTag = void 0;
exports.getEmmetHelper = getEmmetHelper;
exports.isStyleSheet = isStyleSheet;
exports.getMappingForIncludedLanguages = getMappingForIncludedLanguages;
exports.getEmmetMode = getEmmetMode;
exports.parsePartialStylesheet = parsePartialStylesheet;
exports.getFlatNode = getFlatNode;
exports.getHtmlFlatNode = getHtmlFlatNode;
exports.getEmmetConfiguration = getEmmetConfiguration;
exports.getEmbeddedCssNodeIfAny = getEmbeddedCssNodeIfAny;
const css_parser_1 = require("@emmetio/css-parser");
const html_matcher_1 = require("@emmetio/html-matcher");
const bufferStream_1 = require("./bufferStream");
let _emmetHelper;
function getEmmetHelper() {
    // Lazy load vscode-emmet-helper instead of importing it
    // directly to reduce the start-up time of the extension
    if (!_emmetHelper) {
        _emmetHelper = require('@vscode/emmet-helper');
    }
    return _emmetHelper;
}
/**
 * Mapping between languages that support Emmet and completion trigger characters
 */
const LANGUAGE_MODES = {
    'html': ['!', '.', '}', ':', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'jade': ['!', '.', '}', ':', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'slim': ['!', '.', '}', ':', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'haml': ['!', '.', '}', ':', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'xml': ['.', '}', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'xsl': ['!', '.', '}', '*', '$', '/', ']', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'css': [':', '!', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'scss': [':', '!', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'sass': [':', '!', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'less': [':', '!', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'stylus': [':', '!', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'javascriptreact': ['!', '.', '}', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'typescriptreact': ['!', '.', '}', '*', '$', ']', '/', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
};
function isStyleSheet(syntax) {
    const stylesheetSyntaxes = ['css', 'scss', 'sass', 'less', 'stylus'];
    return stylesheetSyntaxes.includes(syntax);
}
async function getMappingForIncludedLanguages(context) {
    // Explicitly map languages that have built-in grammar in VS Code to their parent language
    // to get emmet completion support
    // For other languages, users will have to use `emmet.includeLanguages` or
    // language specific extensions can provide emmet completion support
    const MAPPED_MODES = {
        'handlebars': 'html',
        'php': 'html'
    };
    const finalMappedModes = {};
    const includeLanguagesConfig = await context.env.getConfiguration?.('emmet.includeLanguages');
    const includeLanguages = Object.assign({}, MAPPED_MODES, includeLanguagesConfig ?? {});
    Object.keys(includeLanguages).forEach(syntax => {
        if (typeof includeLanguages[syntax] === 'string' && LANGUAGE_MODES[includeLanguages[syntax]]) {
            finalMappedModes[syntax] = includeLanguages[syntax];
        }
    });
    return finalMappedModes;
}
/**
* Get the corresponding emmet mode for given vscode language mode
* E.g.: jsx for typescriptreact/javascriptreact or pug for jade
* If the language is not supported by emmet or has been excluded via `excludeLanguages` setting,
* then nothing is returned
*
* @param excludedLanguages Array of language ids that user has chosen to exclude for emmet
*/
function getEmmetMode(language, mappedModes, excludedLanguages) {
    if (!language || excludedLanguages.includes(language)) {
        return;
    }
    if (language === 'jsx-tags') {
        language = 'javascriptreact';
    }
    if (mappedModes[language]) {
        language = mappedModes[language];
    }
    if (/\b(typescriptreact|javascriptreact|jsx-tags)\b/.test(language)) { // treat tsx like jsx
        language = 'jsx';
    }
    else if (language === 'sass-indented') { // map sass-indented to sass
        language = 'sass';
    }
    else if (language === 'jade' || language === 'pug') {
        language = 'pug';
    }
    const syntaxes = getSyntaxes();
    if (syntaxes.markup.includes(language) || syntaxes.stylesheet.includes(language)) {
        return language;
    }
    return;
}
const closeBrace = 125;
const openBrace = 123;
const slash = 47;
const star = 42;
/**
 * Traverse the given document backward & forward from given position
 * to find a complete ruleset, then parse just that to return a Stylesheet
 * @param document TextDocument
 * @param position vscode.Position
 */
function parsePartialStylesheet(document, position) {
    const isCSS = document.languageId === 'css';
    const positionOffset = document.offsetAt(position);
    let startOffset = 0;
    let endOffset = document.getText().length;
    const limitCharacter = positionOffset - 5000;
    const limitOffset = limitCharacter > 0 ? limitCharacter : startOffset;
    const stream = new bufferStream_1.DocumentStreamReader(document, positionOffset);
    function findOpeningCommentBeforePosition(pos) {
        const text = document.getText().substring(0, pos);
        const offset = text.lastIndexOf('/*');
        if (offset === -1) {
            return;
        }
        return offset;
    }
    function findClosingCommentAfterPosition(pos) {
        const text = document.getText().substring(pos);
        let offset = text.indexOf('*/');
        if (offset === -1) {
            return;
        }
        offset += 2 + pos;
        return offset;
    }
    function consumeLineCommentBackwards() {
        const posLineNumber = document.positionAt(stream.pos).line;
        if (!isCSS && currentLine !== posLineNumber) {
            currentLine = posLineNumber;
            const startLineComment = document.getText({
                start: { line: currentLine, character: 0 },
                end: { line: currentLine + 1, character: 0 },
            }).indexOf('//');
            if (startLineComment > -1) {
                stream.pos = document.offsetAt({ line: currentLine, character: startLineComment });
            }
        }
    }
    function consumeBlockCommentBackwards() {
        if (!stream.sof() && stream.peek() === slash) {
            if (stream.backUp(1) === star) {
                stream.pos = findOpeningCommentBeforePosition(stream.pos) ?? startOffset;
            }
            else {
                stream.next();
            }
        }
    }
    function consumeCommentForwards() {
        if (stream.eat(slash)) {
            if (stream.eat(slash) && !isCSS) {
                const posLineNumber = document.positionAt(stream.pos).line;
                stream.pos = document.offsetAt({ line: posLineNumber + 1, character: 0 });
            }
            else if (stream.eat(star)) {
                stream.pos = findClosingCommentAfterPosition(stream.pos) ?? endOffset;
            }
        }
    }
    // Go forward until we find a closing brace.
    while (!stream.eof() && !stream.eat(closeBrace)) {
        if (stream.peek() === slash) {
            consumeCommentForwards();
        }
        else {
            stream.next();
        }
    }
    if (!stream.eof()) {
        endOffset = stream.pos;
    }
    stream.pos = positionOffset;
    let openBracesToFind = 1;
    let currentLine = position.line;
    let exit = false;
    // Go back until we found an opening brace. If we find a closing one, consume its pair and continue.
    while (!exit && openBracesToFind > 0 && !stream.sof()) {
        consumeLineCommentBackwards();
        switch (stream.backUp(1)) {
            case openBrace:
                openBracesToFind--;
                break;
            case closeBrace:
                if (isCSS) {
                    stream.next();
                    startOffset = stream.pos;
                    exit = true;
                }
                else {
                    openBracesToFind++;
                }
                break;
            case slash:
                consumeBlockCommentBackwards();
                break;
            default:
                break;
        }
        if (position.line - document.positionAt(stream.pos).line > 100
            || stream.pos <= limitOffset) {
            exit = true;
        }
    }
    // We are at an opening brace. We need to include its selector.
    currentLine = document.positionAt(stream.pos).line;
    openBracesToFind = 0;
    let foundSelector = false;
    while (!exit && !stream.sof() && !foundSelector && openBracesToFind >= 0) {
        consumeLineCommentBackwards();
        const ch = stream.backUp(1);
        if (/\s/.test(String.fromCharCode(ch))) {
            continue;
        }
        switch (ch) {
            case slash:
                consumeBlockCommentBackwards();
                break;
            case closeBrace:
                openBracesToFind++;
                break;
            case openBrace:
                openBracesToFind--;
                break;
            default:
                if (!openBracesToFind) {
                    foundSelector = true;
                }
                break;
        }
        if (!stream.sof() && foundSelector) {
            startOffset = stream.pos;
        }
    }
    try {
        const buffer = ' '.repeat(startOffset) + document.getText().substring(startOffset, endOffset);
        return (0, css_parser_1.default)(buffer);
    }
    catch (e) {
        return;
    }
}
/**
 * Returns node corresponding to given position in the given root node
 */
function getFlatNode(root, offset, includeNodeBoundary) {
    if (!root) {
        return;
    }
    function getFlatNodeChild(child) {
        if (!child) {
            return;
        }
        const nodeStart = child.start;
        const nodeEnd = child.end;
        if ((nodeStart < offset && nodeEnd > offset)
            || (includeNodeBoundary && nodeStart <= offset && nodeEnd >= offset)) {
            return getFlatNodeChildren(child.children) ?? child;
        }
        else if ('close' in child) {
            // We have an HTML node in this case.
            // In case this node is an invalid unpaired HTML node,
            // we still want to search its children
            const htmlChild = child;
            if (htmlChild.open && !htmlChild.close) {
                return getFlatNodeChildren(htmlChild.children);
            }
        }
        return;
    }
    function getFlatNodeChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const foundChild = getFlatNodeChild(children[i]);
            if (foundChild) {
                return foundChild;
            }
        }
        return;
    }
    return getFlatNodeChildren(root.children);
}
exports.allowedMimeTypesInScriptTag = ['text/html', 'text/plain', 'text/x-template', 'text/template', 'text/ng-template'];
/**
 * Finds the HTML node within an HTML document at a given position
 * If position is inside a script tag of type template, then it will be parsed to find the inner HTML node as well
 */
function getHtmlFlatNode(documentText, root, offset, includeNodeBoundary) {
    let currentNode = getFlatNode(root, offset, includeNodeBoundary);
    if (!currentNode) {
        return;
    }
    // If the currentNode is a script one, first set up its subtree and then find HTML node.
    if (currentNode.name === 'script' && currentNode.children.length === 0) {
        const scriptNodeBody = setupScriptNodeSubtree(documentText, currentNode);
        if (scriptNodeBody) {
            currentNode = getHtmlFlatNode(scriptNodeBody, currentNode, offset, includeNodeBoundary) ?? currentNode;
        }
    }
    else if (currentNode.type === 'cdata') {
        const cdataBody = setupCdataNodeSubtree(documentText, currentNode);
        currentNode = getHtmlFlatNode(cdataBody, currentNode, offset, includeNodeBoundary) ?? currentNode;
    }
    return currentNode;
}
function setupScriptNodeSubtree(documentText, scriptNode) {
    const isTemplateScript = scriptNode.name === 'script' &&
        (scriptNode.attributes &&
            scriptNode.attributes.some(x => x.name.toString() === 'type'
                && exports.allowedMimeTypesInScriptTag.includes(x.value.toString())));
    if (isTemplateScript
        && scriptNode.open) {
        // blank out the rest of the document and generate the subtree.
        const beforePadding = ' '.repeat(scriptNode.open.end);
        const endToUse = scriptNode.close ? scriptNode.close.start : scriptNode.end;
        const scriptBodyText = beforePadding + documentText.substring(scriptNode.open.end, endToUse);
        const innerRoot = (0, html_matcher_1.default)(scriptBodyText);
        innerRoot.children.forEach(child => {
            scriptNode.children.push(child);
            child.parent = scriptNode;
        });
        return scriptBodyText;
    }
    return '';
}
function setupCdataNodeSubtree(documentText, cdataNode) {
    // blank out the rest of the document and generate the subtree.
    const cdataStart = '<![CDATA[';
    const cdataEnd = ']]>';
    const startToUse = cdataNode.start + cdataStart.length;
    const endToUse = cdataNode.end - cdataEnd.length;
    const beforePadding = ' '.repeat(startToUse);
    const cdataBody = beforePadding + documentText.substring(startToUse, endToUse);
    const innerRoot = (0, html_matcher_1.default)(cdataBody);
    innerRoot.children.forEach(child => {
        cdataNode.children.push(child);
        child.parent = cdataNode;
    });
    return cdataBody;
}
async function getEmmetConfiguration(context, syntax) {
    const emmetConfig = await context.env.getConfiguration?.('emmet') ?? {};
    const syntaxProfiles = Object.assign({}, emmetConfig['syntaxProfiles'] || {});
    const preferences = Object.assign({}, emmetConfig['preferences'] || {});
    // jsx, xml and xsl syntaxes need to have self closing tags unless otherwise configured by user
    if (syntax === 'jsx' || syntax === 'xml' || syntax === 'xsl') {
        syntaxProfiles[syntax] = syntaxProfiles[syntax] || {};
        if (typeof syntaxProfiles[syntax] === 'object'
            && !syntaxProfiles[syntax].hasOwnProperty('self_closing_tag') // Old Emmet format
            && !syntaxProfiles[syntax].hasOwnProperty('selfClosingStyle') // Emmet 2.0 format
        ) {
            syntaxProfiles[syntax] = {
                ...syntaxProfiles[syntax],
                selfClosingStyle: syntax === 'jsx' ? 'xhtml' : 'xml'
            };
        }
    }
    return {
        preferences,
        showExpandedAbbreviation: emmetConfig['showExpandedAbbreviation'],
        showAbbreviationSuggestions: emmetConfig['showAbbreviationSuggestions'],
        syntaxProfiles,
        variables: emmetConfig['variables'],
        excludeLanguages: emmetConfig['excludeLanguages'],
        showSuggestionsAsSnippets: emmetConfig['showSuggestionsAsSnippets']
    };
}
function getEmbeddedCssNodeIfAny(document, currentNode, position) {
    if (!currentNode) {
        return;
    }
    const currentHtmlNode = currentNode;
    if (currentHtmlNode && currentHtmlNode.open && currentHtmlNode.close) {
        const offset = document.offsetAt(position);
        if (currentHtmlNode.open.end < offset && offset <= currentHtmlNode.close.start) {
            if (currentHtmlNode.name === 'style') {
                const buffer = ' '.repeat(currentHtmlNode.open.end) + document.getText().substring(currentHtmlNode.open.end, currentHtmlNode.close.start);
                return (0, css_parser_1.default)(buffer);
            }
        }
    }
    return;
}
function getSyntaxes() {
    /**
     * List of all known syntaxes, from emmetio/emmet
     */
    return {
        markup: ['html', 'xml', 'xsl', 'jsx', 'js', 'pug', 'slim', 'haml'],
        stylesheet: ['css', 'sass', 'scss', 'less', 'sss', 'stylus']
    };
}
//# sourceMappingURL=util.js.map