"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.documentFeatureWorker)(context, uri, () => true, async (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            return await plugin[1].provideFileReferences?.(document, token) ?? [];
        }, data => data
            .map(reference => {
            const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(reference.uri));
            const sourceScript = decoded && context.language.scripts.get(decoded[0]);
            const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
            if (!sourceScript || !virtualCode) {
                return reference;
            }
            const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
            for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                const docs = [sourceDocument, embeddedDocument, map];
                const range = (0, featureWorkers_1.getSourceRange)(docs, reference.range, language_core_1.isReferencesEnabled);
                if (range) {
                    reference.uri = sourceDocument.uri;
                    reference.range = range;
                    return reference;
                }
            }
        })
            .filter(reference => !!reference), arr => dedupe.withLocations(arr.flat()));
    };
}
//# sourceMappingURL=provideFileReferences.js.map