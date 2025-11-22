"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const nls = require("vscode-nls");
const shared_1 = require("../shared");
const lspConverters_1 = require("../utils/lspConverters");
const syntactic_1 = require("./syntactic");
const localize = nls.loadMessageBundle(); // TODO: not working
const defaultJsDoc = `/**\n * $0\n */`;
function create(ts) {
    return {
        name: 'typescript-doc-comment-template',
        capabilities: {
            completionProvider: {
                triggerCharacters: ['*'],
            },
        },
        create() {
            return {
                provideCompletionItems(document, position) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    if (!isPotentiallyValidDocCompletionPosition(document, position)) {
                        return;
                    }
                    const { languageService, fileName } = (0, syntactic_1.getLanguageServiceByDocument)(ts, document);
                    const offset = document.offsetAt(position);
                    const docCommentTemplate = languageService.getDocCommentTemplateAtPosition(fileName, offset);
                    if (!docCommentTemplate) {
                        return;
                    }
                    let insertText;
                    // Workaround for #43619
                    // docCommentTemplate previously returned undefined for empty jsdoc templates.
                    // TS 2.7 now returns a single line doc comment, which breaks indentation.
                    if (docCommentTemplate.newText === '/** */') {
                        insertText = defaultJsDoc;
                    }
                    else {
                        insertText = templateToSnippet(docCommentTemplate.newText);
                    }
                    const item = createCompletionItem(document, position, insertText);
                    return {
                        isIncomplete: false,
                        items: [item],
                    };
                },
            };
        },
    };
}
function createCompletionItem(document, position, insertText) {
    const item = { label: '/** */' };
    item.kind = 1;
    item.detail = localize('typescript.jsDocCompletionItem.documentation', 'JSDoc comment');
    item.sortText = '\0';
    item.insertTextFormat = 2;
    const line = (0, lspConverters_1.getLineText)(document, position.line);
    const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
    const suffix = line.slice(position.character).match(/^\s*\**\//);
    const start = { line: position.line, character: position.character + (prefix ? -prefix[0].length : 0) };
    const end = { line: position.line, character: position.character + (suffix ? suffix[0].length : 0) };
    const range = { start, end };
    item.textEdit = { range, newText: insertText };
    return item;
}
function isPotentiallyValidDocCompletionPosition(document, position) {
    // Only show the JSdoc completion when the everything before the cursor is whitespace
    // or could be the opening of a comment
    const line = (0, lspConverters_1.getLineText)(document, position.line);
    const prefix = line.slice(0, position.character);
    if (!/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/.test(prefix)) {
        return false;
    }
    // And everything after is possibly a closing comment or more whitespace
    const suffix = line.slice(position.character);
    return /^\s*(\*+\/)?\s*$/.test(suffix);
}
function templateToSnippet(template) {
    // TODO: use append placeholder
    let snippetIndex = 1;
    template = template.replace(/\$/g, '\\$');
    template = template.replace(/^[ \t]*(?=(\/|[ ]\*))/gm, '');
    template = template.replace(/^(\/\*\*\s*\*[ ]*)$/m, x => x + `\$0`);
    template = template.replace(/\* @param([ ]\{\S+\})?\s+(\S+)[ \t]*$/gm, (_param, type, post) => {
        let out = '* @param ';
        if (type === ' {any}' || type === ' {*}') {
            out += `{\$\{${snippetIndex++}:*\}} `;
        }
        else if (type) {
            out += type + ' ';
        }
        out += post + ` \${${snippetIndex++}}`;
        return out;
    });
    template = template.replace(/\* @returns[ \t]*$/gm, `* @returns \${${snippetIndex++}}`);
    return template;
}
//# sourceMappingURL=docCommentTemplate.js.map