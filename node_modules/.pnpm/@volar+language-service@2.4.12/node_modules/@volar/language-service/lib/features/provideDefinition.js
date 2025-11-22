"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context, apiName, isValidPosition) {
    return (uri, position, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, isValidPosition), async (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            const recursiveChecker = dedupe.createLocationSet();
            const result = [];
            await withLinkedCode(document, position, undefined);
            return result;
            async function withLinkedCode(document, position, originDefinition) {
                const api = plugin[1][apiName];
                if (!api) {
                    return;
                }
                if (recursiveChecker.has({ uri: document.uri, range: { start: position, end: position } })) {
                    return;
                }
                recursiveChecker.add({ uri: document.uri, range: { start: position, end: position } });
                const definitions = await api?.(document, position, token) ?? [];
                for (const definition of definitions) {
                    let foundMirrorPosition = false;
                    recursiveChecker.add({ uri: definition.targetUri, range: { start: definition.targetRange.start, end: definition.targetRange.start } });
                    const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(definition.targetUri));
                    const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                    const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                    const linkedCodeMap = virtualCode && sourceScript
                        ? context.language.linkedCodeMaps.get(virtualCode)
                        : undefined;
                    if (sourceScript && virtualCode && linkedCodeMap) {
                        const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                        for (const linkedPos of (0, featureWorkers_1.getLinkedCodePositions)(embeddedDocument, linkedCodeMap, definition.targetSelectionRange.start)) {
                            if (recursiveChecker.has({ uri: embeddedDocument.uri, range: { start: linkedPos, end: linkedPos } })) {
                                continue;
                            }
                            foundMirrorPosition = true;
                            await withLinkedCode(embeddedDocument, linkedPos, originDefinition ?? definition);
                        }
                    }
                    if (!foundMirrorPosition) {
                        if (originDefinition) {
                            result.push({
                                ...definition,
                                originSelectionRange: originDefinition.originSelectionRange,
                            });
                        }
                        else {
                            result.push(definition);
                        }
                    }
                }
            }
        }, (data, map) => data.map(link => {
            if (link.originSelectionRange && map) {
                const originSelectionRange = toSourcePositionPreferSurroundedPosition(map, link.originSelectionRange, position);
                if (!originSelectionRange) {
                    return;
                }
                link.originSelectionRange = originSelectionRange;
            }
            let foundTargetSelectionRange = false;
            const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(link.targetUri));
            const sourceScript = decoded && context.language.scripts.get(decoded[0]);
            const targetVirtualFile = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
            if (sourceScript && targetVirtualFile) {
                const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, targetVirtualFile.id), targetVirtualFile.languageId, targetVirtualFile.snapshot);
                for (const [targetScript, targetSourceMap] of context.language.maps.forEach(targetVirtualFile)) {
                    const sourceDocument = context.documents.get(targetScript.id, targetScript.languageId, targetScript.snapshot);
                    const docs = [sourceDocument, embeddedDocument, targetSourceMap];
                    const targetSelectionRange = (0, featureWorkers_1.getSourceRange)(docs, link.targetSelectionRange);
                    if (!targetSelectionRange) {
                        continue;
                    }
                    foundTargetSelectionRange = true;
                    let targetRange = (0, featureWorkers_1.getSourceRange)(docs, link.targetRange);
                    link.targetUri = sourceDocument.uri;
                    // loose range mapping to for template slots, slot properties
                    link.targetRange = targetRange ?? targetSelectionRange;
                    link.targetSelectionRange = targetSelectionRange;
                }
                if (apiName === 'provideDefinition' && !foundTargetSelectionRange) {
                    for (const [targetScript] of context.language.maps.forEach(targetVirtualFile)) {
                        if (targetScript.id.toString() !== uri.toString()) {
                            return {
                                ...link,
                                targetUri: targetScript.id.toString(),
                                targetRange: {
                                    start: { line: 0, character: 0 },
                                    end: { line: 0, character: 0 },
                                },
                                targetSelectionRange: {
                                    start: { line: 0, character: 0 },
                                    end: { line: 0, character: 0 },
                                },
                            };
                        }
                    }
                    return;
                }
            }
            return link;
        }).filter(link => !!link), arr => dedupe.withLocationLinks(arr.flat()));
    };
}
function toSourcePositionPreferSurroundedPosition(docs, mappedRange, position) {
    let result;
    for (const range of (0, featureWorkers_1.getSourceRanges)(docs, mappedRange)) {
        if (!result) {
            result = range;
        }
        if ((range.start.line < position.line || (range.start.line === position.line && range.start.character <= position.character))
            && (range.end.line > position.line || (range.end.line === position.line && range.end.character >= position.character))) {
            return range;
        }
    }
    return result;
}
//# sourceMappingURL=provideDefinition.js.map