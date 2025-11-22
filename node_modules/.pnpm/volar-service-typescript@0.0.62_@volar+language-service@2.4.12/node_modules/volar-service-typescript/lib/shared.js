"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigTitle = getConfigTitle;
exports.isTsDocument = isTsDocument;
exports.isJsonDocument = isJsonDocument;
exports.safeCall = safeCall;
function getConfigTitle(document) {
    if (document.languageId === 'javascriptreact') {
        return 'javascript';
    }
    if (document.languageId === 'typescriptreact') {
        return 'typescript';
    }
    return document.languageId;
}
function isTsDocument(document) {
    return document.languageId === 'javascript' ||
        document.languageId === 'typescript' ||
        document.languageId === 'javascriptreact' ||
        document.languageId === 'typescriptreact';
}
function isJsonDocument(document) {
    return document.languageId === 'json' ||
        document.languageId === 'jsonc';
}
function safeCall(cb) {
    try {
        return cb();
    }
    catch { }
}
//# sourceMappingURL=shared.js.map