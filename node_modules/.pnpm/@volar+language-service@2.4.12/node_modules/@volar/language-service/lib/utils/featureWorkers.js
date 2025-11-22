"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentFeatureWorker = documentFeatureWorker;
exports.languageFeatureWorker = languageFeatureWorker;
exports.safeCall = safeCall;
exports.forEachEmbeddedDocument = forEachEmbeddedDocument;
exports.getSourceRange = getSourceRange;
exports.getGeneratedRange = getGeneratedRange;
exports.getSourceRanges = getSourceRanges;
exports.getGeneratedRanges = getGeneratedRanges;
exports.getSourcePositions = getSourcePositions;
exports.getGeneratedPositions = getGeneratedPositions;
exports.getLinkedCodePositions = getLinkedCodePositions;
function documentFeatureWorker(context, uri, valid, worker, transformResult, combineResult) {
    return languageFeatureWorker(context, uri, () => void 0, function* (map) {
        if (valid(map)) {
            yield;
        }
    }, worker, transformResult, combineResult);
}
async function languageFeatureWorker(context, uri, getRealDocParams, eachVirtualDocParams, worker, transformResult, combineResult) {
    let sourceScript;
    const decoded = context.decodeEmbeddedDocumentUri(uri);
    if (decoded) {
        sourceScript = context.language.scripts.get(decoded[0]);
    }
    else {
        sourceScript = context.language.scripts.get(uri);
    }
    if (!sourceScript) {
        return;
    }
    let results = [];
    if (decoded) {
        const virtualCode = sourceScript.generated?.embeddedCodes.get(decoded[1]);
        if (virtualCode) {
            const docs = [
                context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot),
                context.documents.get(uri, virtualCode.languageId, virtualCode.snapshot),
                context.language.maps.get(virtualCode, sourceScript),
            ];
            await docsWorker(docs, false);
        }
    }
    else if (sourceScript.generated) {
        for (const docs of forEachEmbeddedDocument(context, sourceScript, sourceScript.generated.root)) {
            if (results.length && !combineResult) {
                continue;
            }
            await docsWorker(docs, true);
        }
    }
    else {
        const document = context.documents.get(uri, sourceScript.languageId, sourceScript.snapshot);
        const params = getRealDocParams();
        for (const [pluginIndex, plugin] of Object.entries(context.plugins)) {
            if (context.disabledServicePlugins.has(plugin[1])) {
                continue;
            }
            const embeddedResult = await safeCall(() => worker(plugin, document, params, undefined), `Language service plugin "${plugin[0].name}" (${pluginIndex}) failed to provide document feature for ${document.uri}.`);
            if (!embeddedResult) {
                continue;
            }
            const result = transformResult(embeddedResult, undefined);
            if (!result) {
                continue;
            }
            results.push(result);
            if (!combineResult) {
                break;
            }
        }
    }
    if (combineResult && results.length > 0) {
        const combined = combineResult(results);
        return combined;
    }
    else if (results.length > 0) {
        return results[0];
    }
    async function docsWorker(docs, transform) {
        for (const mappedArg of eachVirtualDocParams(docs)) {
            if (results.length && !combineResult) {
                continue;
            }
            for (const [pluginIndex, plugin] of Object.entries(context.plugins)) {
                if (context.disabledServicePlugins.has(plugin[1])) {
                    continue;
                }
                if (results.length && !combineResult) {
                    continue;
                }
                const embeddedResult = await safeCall(() => worker(plugin, docs[1], mappedArg, docs), `Language service plugin "${plugin[0].name}" (${pluginIndex}) failed to provide document feature for ${docs[1].uri}.`);
                if (!embeddedResult) {
                    continue;
                }
                if (transform) {
                    const mappedResult = transformResult(embeddedResult, docs);
                    if (mappedResult) {
                        results.push(mappedResult);
                    }
                }
                else {
                    results.push(embeddedResult);
                }
            }
        }
    }
}
async function safeCall(cb, errorMsg) {
    try {
        return await cb();
    }
    catch (err) {
        console.warn(errorMsg, err);
    }
}
function* forEachEmbeddedDocument(context, sourceScript, current) {
    if (current.embeddedCodes) {
        for (const embeddedCode of current.embeddedCodes) {
            yield* forEachEmbeddedDocument(context, sourceScript, embeddedCode);
        }
    }
    const embeddedDocumentUri = context.encodeEmbeddedDocumentUri(sourceScript.id, current.id);
    if (!context.disabledEmbeddedDocumentUris.get(embeddedDocumentUri)) {
        yield [
            context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot),
            context.documents.get(embeddedDocumentUri, current.languageId, current.snapshot),
            context.language.maps.get(current, sourceScript),
        ];
    }
}
function getSourceRange(docs, range, filter) {
    for (const result of getSourceRanges(docs, range, filter)) {
        return result;
    }
}
function getGeneratedRange(docs, range, filter) {
    for (const result of getGeneratedRanges(docs, range, filter)) {
        return result;
    }
}
function* getSourceRanges([sourceDocument, embeddedDocument, map], range, filter) {
    for (const [mappedStart, mappedEnd] of map.toSourceRange(embeddedDocument.offsetAt(range.start), embeddedDocument.offsetAt(range.end), true, filter)) {
        yield { start: sourceDocument.positionAt(mappedStart), end: sourceDocument.positionAt(mappedEnd) };
    }
}
function* getGeneratedRanges([sourceDocument, embeddedDocument, map], range, filter) {
    for (const [mappedStart, mappedEnd] of map.toGeneratedRange(sourceDocument.offsetAt(range.start), sourceDocument.offsetAt(range.end), true, filter)) {
        yield { start: embeddedDocument.positionAt(mappedStart), end: embeddedDocument.positionAt(mappedEnd) };
    }
}
function* getSourcePositions([sourceDocument, embeddedDocument, map], position, filter = () => true) {
    for (const mapped of map.toSourceLocation(embeddedDocument.offsetAt(position), filter)) {
        yield sourceDocument.positionAt(mapped[0]);
    }
}
function* getGeneratedPositions([sourceDocument, embeddedDocument, map], position, filter = () => true) {
    for (const mapped of map.toGeneratedLocation(sourceDocument.offsetAt(position), filter)) {
        yield embeddedDocument.positionAt(mapped[0]);
    }
}
function* getLinkedCodePositions(document, linkedMap, posotion) {
    for (const linkedPosition of linkedMap.getLinkedOffsets(document.offsetAt(posotion))) {
        yield document.positionAt(linkedPosition);
    }
}
//# sourceMappingURL=featureWorkers.js.map