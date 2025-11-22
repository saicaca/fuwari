"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const snapshotDocument_1 = require("../utils/snapshotDocument");
function register(server) {
    const syncedDocumentParsedUriToUri = new Map();
    const documentsCache = new Map();
    const documents = new vscode.TextDocuments({
        create(uri, languageId, version, text) {
            const cache = documentsCache.get(uri)?.deref();
            if (cache && cache.languageId === languageId && cache.version === version && cache.getText() === text) {
                return cache;
            }
            const document = new snapshotDocument_1.SnapshotDocument(uri, languageId, version, text);
            documentsCache.set(uri, new WeakRef(document));
            return document;
        },
        update(snapshot, contentChanges, version) {
            snapshot.update(contentChanges, version);
            return snapshot;
        },
    });
    documents.listen(server.connection);
    documents.onDidOpen(({ document }) => {
        const parsedUri = vscode_uri_1.URI.parse(document.uri);
        syncedDocumentParsedUriToUri.set(parsedUri.toString(), document.uri);
    });
    documents.onDidClose(({ document }) => {
        const parsedUri = vscode_uri_1.URI.parse(document.uri);
        syncedDocumentParsedUriToUri.delete(parsedUri.toString());
    });
    server.onInitialize(serverCapabilities => {
        serverCapabilities.textDocumentSync = vscode.TextDocumentSyncKind.Incremental;
    });
    return {
        all: documents.all.bind(documents),
        onDidChangeContent: documents.onDidChangeContent.bind(documents),
        onDidOpen: documents.onDidOpen.bind(documents),
        onDidClose: documents.onDidClose.bind(documents),
        onDidSave: documents.onDidSave.bind(documents),
        get(uri) {
            return documents.get(getSyncedDocumentKey(uri) ?? uri.toString());
        },
    };
    function getSyncedDocumentKey(uri) {
        const originalUri = syncedDocumentParsedUriToUri.get(uri.toString());
        if (originalUri) {
            return originalUri;
        }
    }
}
//# sourceMappingURL=textDocuments.js.map