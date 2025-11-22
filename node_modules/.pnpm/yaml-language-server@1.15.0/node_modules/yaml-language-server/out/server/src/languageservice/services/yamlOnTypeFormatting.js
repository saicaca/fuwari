"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.doDocumentOnTypeFormatting = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const textBuffer_1 = require("../utils/textBuffer");
function doDocumentOnTypeFormatting(document, params) {
    const { position } = params;
    const tb = new textBuffer_1.TextBuffer(document);
    if (params.ch === '\n') {
        const previousLine = tb.getLineContent(position.line - 1);
        if (previousLine.trimRight().endsWith(':')) {
            const currentLine = tb.getLineContent(position.line);
            const subLine = currentLine.substring(position.character, currentLine.length);
            const isInArray = previousLine.indexOf(' - ') !== -1;
            if (subLine.trimRight().length === 0) {
                const indentationFix = position.character - (previousLine.length - previousLine.trimLeft().length);
                if (indentationFix === params.options.tabSize && !isInArray) {
                    return; // skip if line already has proper formatting
                }
                const result = [];
                if (currentLine.length > 0) {
                    result.push(vscode_languageserver_types_1.TextEdit.del(vscode_languageserver_types_1.Range.create(position, vscode_languageserver_types_1.Position.create(position.line, currentLine.length - 1))));
                }
                result.push(vscode_languageserver_types_1.TextEdit.insert(position, ' '.repeat(params.options.tabSize + (isInArray ? 2 - indentationFix : 0))));
                return result;
            }
            if (isInArray) {
                return [vscode_languageserver_types_1.TextEdit.insert(position, ' '.repeat(params.options.tabSize))];
            }
        }
        if (previousLine.trimRight().endsWith('|')) {
            return [vscode_languageserver_types_1.TextEdit.insert(position, ' '.repeat(params.options.tabSize))];
        }
        if (previousLine.includes(' - ') && !previousLine.includes(': ')) {
            return [vscode_languageserver_types_1.TextEdit.insert(position, '- ')];
        }
        if (previousLine.includes(' - ') && previousLine.includes(': ')) {
            return [vscode_languageserver_types_1.TextEdit.insert(position, '  ')];
        }
    }
}
exports.doDocumentOnTypeFormatting = doDocumentOnTypeFormatting;
//# sourceMappingURL=yamlOnTypeFormatting.js.map