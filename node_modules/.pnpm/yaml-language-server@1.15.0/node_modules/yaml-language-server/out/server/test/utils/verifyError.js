"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpectedCompletion = exports.createExpectedDocumentSymbolNoDetail = exports.createExpectedDocumentSymbol = exports.createExpectedSymbolInformation = exports.createUnusedAnchorDiagnostic = exports.createDiagnosticWithData = exports.createExpectedError = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const vscode_json_languageservice_1 = require("vscode-json-languageservice");
function createExpectedError(message, startLine, startCharacter, endLine, endCharacter, severity = 1, source = 'YAML', code = vscode_json_languageservice_1.ErrorCode.Undefined) {
    return vscode_languageserver_types_1.Diagnostic.create(vscode_languageserver_types_1.Range.create(startLine, startCharacter, endLine, endCharacter), message, severity, code, source);
}
exports.createExpectedError = createExpectedError;
function createDiagnosticWithData(message, startLine, startCharacter, endLine, endCharacter, severity = 1, source = 'YAML', schemaUri, data = {}) {
    const diagnostic = createExpectedError(message, startLine, startCharacter, endLine, endCharacter, severity, source);
    diagnostic.data = { schemaUri: typeof schemaUri === 'string' ? [schemaUri] : schemaUri, ...data };
    return diagnostic;
}
exports.createDiagnosticWithData = createDiagnosticWithData;
function createUnusedAnchorDiagnostic(message, startLine, startCharacter, endLine, endCharacter) {
    const diagnostic = createExpectedError(message, startLine, startCharacter, endLine, endCharacter, vscode_languageserver_types_1.DiagnosticSeverity.Hint, 'YAML');
    diagnostic.tags = [vscode_languageserver_types_1.DiagnosticTag.Unnecessary];
    return diagnostic;
}
exports.createUnusedAnchorDiagnostic = createUnusedAnchorDiagnostic;
function createExpectedSymbolInformation(name, kind, containerName, uri, startLine, startCharacter, endLine, endCharacter) {
    return {
        name,
        kind,
        containerName,
        location: {
            uri,
            range: {
                start: {
                    line: startLine,
                    character: startCharacter,
                },
                end: {
                    line: endLine,
                    character: endCharacter,
                },
            },
        },
    };
}
exports.createExpectedSymbolInformation = createExpectedSymbolInformation;
function createExpectedDocumentSymbol(name, kind, startLine, startCharacter, endLine, endCharacter, startLineSelection, startCharacterSelection, endLineSelection, endCharacterSelection, children = [], detail) {
    return vscode_languageserver_types_1.DocumentSymbol.create(name, detail, kind, vscode_languageserver_types_1.Range.create(startLine, startCharacter, endLine, endCharacter), vscode_languageserver_types_1.Range.create(startLineSelection, startCharacterSelection, endLineSelection, endCharacterSelection), children);
}
exports.createExpectedDocumentSymbol = createExpectedDocumentSymbol;
function createExpectedDocumentSymbolNoDetail(name, kind, startLine, startCharacter, endLine, endCharacter, startLineSelection, startCharacterSelection, endLineSelection, endCharacterSelection, children = []) {
    const docSymbol = vscode_languageserver_types_1.DocumentSymbol.create(name, undefined, kind, vscode_languageserver_types_1.Range.create(startLine, startCharacter, endLine, endCharacter), vscode_languageserver_types_1.Range.create(startLineSelection, startCharacterSelection, endLineSelection, endCharacterSelection), children);
    delete docSymbol.detail;
    return docSymbol;
}
exports.createExpectedDocumentSymbolNoDetail = createExpectedDocumentSymbolNoDetail;
function createExpectedCompletion(label, insertText, startLine, startCharacter, endLine, endCharacter, kind, insertTextFormat = 2, extra = {}) {
    return {
        ...{
            insertText,
            label,
            insertTextFormat,
            kind,
            textEdit: {
                newText: insertText,
                range: {
                    start: {
                        line: startLine,
                        character: startCharacter,
                    },
                    end: {
                        line: endLine,
                        character: endCharacter,
                    },
                },
            },
        },
        ...extra,
    };
}
exports.createExpectedCompletion = createExpectedCompletion;
//# sourceMappingURL=verifyError.js.map