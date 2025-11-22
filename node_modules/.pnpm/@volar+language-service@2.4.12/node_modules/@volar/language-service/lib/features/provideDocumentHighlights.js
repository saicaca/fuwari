"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, position, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isHighlightEnabled), async (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            const recursiveChecker = dedupe.createLocationSet();
            const result = [];
            await withLinkedCode(document, position);
            return result;
            async function withLinkedCode(document, position) {
                if (!plugin[1].provideDocumentHighlights) {
                    return;
                }
                if (recursiveChecker.has({ uri: document.uri, range: { start: position, end: position } })) {
                    return;
                }
                recursiveChecker.add({ uri: document.uri, range: { start: position, end: position } });
                const references = await plugin[1].provideDocumentHighlights(document, position, token) ?? [];
                for (const reference of references) {
                    let foundMirrorPosition = false;
                    recursiveChecker.add({ uri: document.uri, range: { start: reference.range.start, end: reference.range.start } });
                    const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(document.uri));
                    const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                    const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                    const linkedCodeMap = virtualCode && sourceScript
                        ? context.language.linkedCodeMaps.get(virtualCode)
                        : undefined;
                    if (sourceScript && virtualCode && linkedCodeMap) {
                        const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                        for (const linkedPos of (0, featureWorkers_1.getLinkedCodePositions)(embeddedDocument, linkedCodeMap, reference.range.start)) {
                            if (recursiveChecker.has({ uri: embeddedDocument.uri, range: { start: linkedPos, end: linkedPos } })) {
                                continue;
                            }
                            foundMirrorPosition = true;
                            await withLinkedCode(embeddedDocument, linkedPos);
                        }
                    }
                    if (!foundMirrorPosition) {
                        result.push(reference);
                    }
                }
            }
        }, (data, docs) => data
            .map(highlight => {
            if (!docs) {
                return highlight;
            }
            const range = (0, featureWorkers_1.getSourceRange)(docs, highlight.range, language_core_1.isHighlightEnabled);
            if (range) {
                return {
                    ...highlight,
                    range,
                };
            }
        })
            .filter(highlight => !!highlight), arr => arr.flat());
    };
}
//# sourceMappingURL=provideDocumentHighlights.js.map