/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types", "vscode-languageserver-textdocument"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileType = exports.ClientCapabilities = exports.ScannerState = exports.TokenType = exports.ColorPresentation = exports.ColorInformation = exports.Color = exports.FormattingOptions = exports.Diagnostic = exports.FoldingRangeKind = exports.FoldingRange = exports.DocumentLink = exports.DocumentHighlightKind = exports.DocumentHighlight = exports.InsertTextFormat = exports.InsertReplaceEdit = exports.TextEdit = exports.Hover = exports.SymbolKind = exports.DocumentSymbol = exports.SymbolInformation = exports.Command = exports.InsertTextMode = exports.CompletionItemTag = exports.CompletionItem = exports.CompletionItemKind = exports.CompletionList = exports.WorkspaceEdit = exports.SelectionRange = exports.DocumentUri = exports.MarkedString = exports.MarkupKind = exports.MarkupContent = exports.Location = exports.Range = exports.Position = exports.TextDocument = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    Object.defineProperty(exports, "Position", { enumerable: true, get: function () { return vscode_languageserver_types_1.Position; } });
    Object.defineProperty(exports, "Range", { enumerable: true, get: function () { return vscode_languageserver_types_1.Range; } });
    Object.defineProperty(exports, "Location", { enumerable: true, get: function () { return vscode_languageserver_types_1.Location; } });
    Object.defineProperty(exports, "MarkupContent", { enumerable: true, get: function () { return vscode_languageserver_types_1.MarkupContent; } });
    Object.defineProperty(exports, "MarkupKind", { enumerable: true, get: function () { return vscode_languageserver_types_1.MarkupKind; } });
    Object.defineProperty(exports, "MarkedString", { enumerable: true, get: function () { return vscode_languageserver_types_1.MarkedString; } });
    Object.defineProperty(exports, "DocumentUri", { enumerable: true, get: function () { return vscode_languageserver_types_1.DocumentUri; } });
    Object.defineProperty(exports, "SelectionRange", { enumerable: true, get: function () { return vscode_languageserver_types_1.SelectionRange; } });
    Object.defineProperty(exports, "WorkspaceEdit", { enumerable: true, get: function () { return vscode_languageserver_types_1.WorkspaceEdit; } });
    Object.defineProperty(exports, "CompletionList", { enumerable: true, get: function () { return vscode_languageserver_types_1.CompletionList; } });
    Object.defineProperty(exports, "CompletionItemKind", { enumerable: true, get: function () { return vscode_languageserver_types_1.CompletionItemKind; } });
    Object.defineProperty(exports, "CompletionItem", { enumerable: true, get: function () { return vscode_languageserver_types_1.CompletionItem; } });
    Object.defineProperty(exports, "CompletionItemTag", { enumerable: true, get: function () { return vscode_languageserver_types_1.CompletionItemTag; } });
    Object.defineProperty(exports, "InsertTextMode", { enumerable: true, get: function () { return vscode_languageserver_types_1.InsertTextMode; } });
    Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return vscode_languageserver_types_1.Command; } });
    Object.defineProperty(exports, "SymbolInformation", { enumerable: true, get: function () { return vscode_languageserver_types_1.SymbolInformation; } });
    Object.defineProperty(exports, "DocumentSymbol", { enumerable: true, get: function () { return vscode_languageserver_types_1.DocumentSymbol; } });
    Object.defineProperty(exports, "SymbolKind", { enumerable: true, get: function () { return vscode_languageserver_types_1.SymbolKind; } });
    Object.defineProperty(exports, "Hover", { enumerable: true, get: function () { return vscode_languageserver_types_1.Hover; } });
    Object.defineProperty(exports, "TextEdit", { enumerable: true, get: function () { return vscode_languageserver_types_1.TextEdit; } });
    Object.defineProperty(exports, "InsertReplaceEdit", { enumerable: true, get: function () { return vscode_languageserver_types_1.InsertReplaceEdit; } });
    Object.defineProperty(exports, "InsertTextFormat", { enumerable: true, get: function () { return vscode_languageserver_types_1.InsertTextFormat; } });
    Object.defineProperty(exports, "DocumentHighlight", { enumerable: true, get: function () { return vscode_languageserver_types_1.DocumentHighlight; } });
    Object.defineProperty(exports, "DocumentHighlightKind", { enumerable: true, get: function () { return vscode_languageserver_types_1.DocumentHighlightKind; } });
    Object.defineProperty(exports, "DocumentLink", { enumerable: true, get: function () { return vscode_languageserver_types_1.DocumentLink; } });
    Object.defineProperty(exports, "FoldingRange", { enumerable: true, get: function () { return vscode_languageserver_types_1.FoldingRange; } });
    Object.defineProperty(exports, "FoldingRangeKind", { enumerable: true, get: function () { return vscode_languageserver_types_1.FoldingRangeKind; } });
    Object.defineProperty(exports, "Diagnostic", { enumerable: true, get: function () { return vscode_languageserver_types_1.Diagnostic; } });
    Object.defineProperty(exports, "FormattingOptions", { enumerable: true, get: function () { return vscode_languageserver_types_1.FormattingOptions; } });
    Object.defineProperty(exports, "Color", { enumerable: true, get: function () { return vscode_languageserver_types_1.Color; } });
    Object.defineProperty(exports, "ColorInformation", { enumerable: true, get: function () { return vscode_languageserver_types_1.ColorInformation; } });
    Object.defineProperty(exports, "ColorPresentation", { enumerable: true, get: function () { return vscode_languageserver_types_1.ColorPresentation; } });
    const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
    Object.defineProperty(exports, "TextDocument", { enumerable: true, get: function () { return vscode_languageserver_textdocument_1.TextDocument; } });
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["StartCommentTag"] = 0] = "StartCommentTag";
        TokenType[TokenType["Comment"] = 1] = "Comment";
        TokenType[TokenType["EndCommentTag"] = 2] = "EndCommentTag";
        TokenType[TokenType["StartTagOpen"] = 3] = "StartTagOpen";
        TokenType[TokenType["StartTagClose"] = 4] = "StartTagClose";
        TokenType[TokenType["StartTagSelfClose"] = 5] = "StartTagSelfClose";
        TokenType[TokenType["StartTag"] = 6] = "StartTag";
        TokenType[TokenType["EndTagOpen"] = 7] = "EndTagOpen";
        TokenType[TokenType["EndTagClose"] = 8] = "EndTagClose";
        TokenType[TokenType["EndTag"] = 9] = "EndTag";
        TokenType[TokenType["DelimiterAssign"] = 10] = "DelimiterAssign";
        TokenType[TokenType["AttributeName"] = 11] = "AttributeName";
        TokenType[TokenType["AttributeValue"] = 12] = "AttributeValue";
        TokenType[TokenType["StartDoctypeTag"] = 13] = "StartDoctypeTag";
        TokenType[TokenType["Doctype"] = 14] = "Doctype";
        TokenType[TokenType["EndDoctypeTag"] = 15] = "EndDoctypeTag";
        TokenType[TokenType["Content"] = 16] = "Content";
        TokenType[TokenType["Whitespace"] = 17] = "Whitespace";
        TokenType[TokenType["Unknown"] = 18] = "Unknown";
        TokenType[TokenType["Script"] = 19] = "Script";
        TokenType[TokenType["Styles"] = 20] = "Styles";
        TokenType[TokenType["EOS"] = 21] = "EOS";
    })(TokenType || (exports.TokenType = TokenType = {}));
    var ScannerState;
    (function (ScannerState) {
        ScannerState[ScannerState["WithinContent"] = 0] = "WithinContent";
        ScannerState[ScannerState["AfterOpeningStartTag"] = 1] = "AfterOpeningStartTag";
        ScannerState[ScannerState["AfterOpeningEndTag"] = 2] = "AfterOpeningEndTag";
        ScannerState[ScannerState["WithinDoctype"] = 3] = "WithinDoctype";
        ScannerState[ScannerState["WithinTag"] = 4] = "WithinTag";
        ScannerState[ScannerState["WithinEndTag"] = 5] = "WithinEndTag";
        ScannerState[ScannerState["WithinComment"] = 6] = "WithinComment";
        ScannerState[ScannerState["WithinScriptContent"] = 7] = "WithinScriptContent";
        ScannerState[ScannerState["WithinStyleContent"] = 8] = "WithinStyleContent";
        ScannerState[ScannerState["AfterAttributeName"] = 9] = "AfterAttributeName";
        ScannerState[ScannerState["BeforeAttributeValue"] = 10] = "BeforeAttributeValue";
    })(ScannerState || (exports.ScannerState = ScannerState = {}));
    var ClientCapabilities;
    (function (ClientCapabilities) {
        ClientCapabilities.LATEST = {
            textDocument: {
                completion: {
                    completionItem: {
                        documentationFormat: [vscode_languageserver_types_1.MarkupKind.Markdown, vscode_languageserver_types_1.MarkupKind.PlainText]
                    }
                },
                hover: {
                    contentFormat: [vscode_languageserver_types_1.MarkupKind.Markdown, vscode_languageserver_types_1.MarkupKind.PlainText]
                }
            }
        };
    })(ClientCapabilities || (exports.ClientCapabilities = ClientCapabilities = {}));
    var FileType;
    (function (FileType) {
        /**
         * The file type is unknown.
         */
        FileType[FileType["Unknown"] = 0] = "Unknown";
        /**
         * A regular file.
         */
        FileType[FileType["File"] = 1] = "File";
        /**
         * A directory.
         */
        FileType[FileType["Directory"] = 2] = "Directory";
        /**
         * A symbolic link to a file.
         */
        FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
    })(FileType || (exports.FileType = FileType = {}));
});
