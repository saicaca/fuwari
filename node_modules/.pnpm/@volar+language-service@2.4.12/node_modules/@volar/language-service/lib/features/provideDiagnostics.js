"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMarkups = void 0;
exports.register = register;
exports.transformDiagnostic = transformDiagnostic;
exports.updateRange = updateRange;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
const uriMap_1 = require("../utils/uriMap");
exports.errorMarkups = (0, uriMap_1.createUriMap)();
function register(context) {
    const lastResponses = (0, uriMap_1.createUriMap)();
    const cacheMaps = {
        semantic: new Map(),
        syntactic: new Map(),
    };
    context.env.onDidChangeConfiguration?.(() => {
        lastResponses.clear();
        cacheMaps.semantic.clear();
        cacheMaps.syntactic.clear();
    });
    return async (uri, response, token = cancellation_1.NoneCancellationToken) => {
        let langaugeIdAndSnapshot;
        const decoded = context.decodeEmbeddedDocumentUri(uri);
        if (decoded) {
            langaugeIdAndSnapshot = context.language.scripts.get(decoded[0])?.generated?.embeddedCodes.get(decoded[1]);
        }
        else {
            langaugeIdAndSnapshot = context.language.scripts.get(uri);
        }
        if (!langaugeIdAndSnapshot) {
            return [];
        }
        const document = context.documents.get(uri, langaugeIdAndSnapshot.languageId, langaugeIdAndSnapshot.snapshot);
        const lastResponse = lastResponses.get(uri) ?? lastResponses.set(uri, {
            semantic: { errors: [] },
            syntactic: { errors: [] },
        }).get(uri);
        let updateCacheRangeFailed = false;
        let errorsUpdated = false;
        let lastCheckCancelAt = 0;
        for (const cache of Object.values(lastResponse)) {
            const oldSnapshot = cache.snapshot;
            const oldDocument = cache.document;
            const change = oldSnapshot ? langaugeIdAndSnapshot.snapshot.getChangeRange(oldSnapshot) : undefined;
            cache.snapshot = langaugeIdAndSnapshot.snapshot;
            cache.document = document;
            if (!updateCacheRangeFailed && oldDocument && change) {
                const changeRange = {
                    range: {
                        start: oldDocument.positionAt(change.span.start),
                        end: oldDocument.positionAt(change.span.start + change.span.length),
                    },
                    newEnd: document.positionAt(change.span.start + change.newLength),
                };
                for (const error of cache.errors) {
                    if (!updateRange(error.range, changeRange)) {
                        updateCacheRangeFailed = true;
                        break;
                    }
                }
            }
        }
        await worker('syntactic', cacheMaps.syntactic, lastResponse.syntactic);
        processResponse();
        await worker('semantic', cacheMaps.semantic, lastResponse.semantic);
        return collectErrors();
        function processResponse() {
            if (errorsUpdated && !updateCacheRangeFailed) {
                response?.(collectErrors());
                errorsUpdated = false;
            }
        }
        function collectErrors() {
            return Object.values(lastResponse).flatMap(({ errors }) => errors);
        }
        async function worker(kind, cacheMap, cache) {
            const result = await (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isDiagnosticsEnabled)(mapping.data)), async (plugin, document) => {
                const interFileDependencies = plugin[0].capabilities.diagnosticProvider?.interFileDependencies;
                if (kind === 'semantic' !== interFileDependencies) {
                    return;
                }
                if (Date.now() - lastCheckCancelAt >= 10) {
                    await (0, common_1.sleep)(10); // waiting LSP event polling
                    lastCheckCancelAt = Date.now();
                }
                if (token.isCancellationRequested) {
                    return;
                }
                const pluginIndex = context.plugins.indexOf(plugin);
                const pluginCache = cacheMap.get(pluginIndex) ?? cacheMap.set(pluginIndex, new Map()).get(pluginIndex);
                const cache = pluginCache.get(document.uri);
                if (!interFileDependencies && cache && cache.documentVersion === document.version) {
                    return cache.errors;
                }
                const errors = await plugin[1].provideDiagnostics?.(document, token) || [];
                errors.forEach(error => {
                    error.data = {
                        uri: uri.toString(),
                        version: document.version,
                        pluginIndex: pluginIndex,
                        isFormat: false,
                        original: {
                            data: error.data,
                        },
                        documentUri: document.uri,
                    };
                });
                errorsUpdated = true;
                pluginCache.set(document.uri, {
                    documentVersion: document.version,
                    errors,
                });
                return errors;
            }, (errors, map) => {
                return errors
                    .map(error => transformDiagnostic(context, error, map))
                    .filter(error => !!error);
            }, arr => dedupe.withDiagnostics(arr.flat()));
            if (result) {
                cache.errors = result;
                cache.snapshot = langaugeIdAndSnapshot?.snapshot;
            }
        }
    };
}
function transformDiagnostic(context, error, docs) {
    // clone it to avoid modify cache
    let _error = { ...error };
    if (docs) {
        const range = (0, featureWorkers_1.getSourceRange)(docs, error.range, data => (0, language_core_1.shouldReportDiagnostics)(data, error.source, error.code));
        if (!range) {
            return;
        }
        _error.range = range;
    }
    if (_error.relatedInformation) {
        const relatedInfos = [];
        for (const info of _error.relatedInformation) {
            const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(info.location.uri));
            const sourceScript = decoded && context.language.scripts.get(decoded[0]);
            const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
            if (sourceScript && virtualCode) {
                const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                    const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                    const docs = [sourceDocument, embeddedDocument, map];
                    const range = (0, featureWorkers_1.getSourceRange)(docs, info.location.range, data => (0, language_core_1.shouldReportDiagnostics)(data, undefined, undefined));
                    if (range) {
                        relatedInfos.push({
                            location: {
                                uri: sourceDocument.uri,
                                range,
                            },
                            message: info.message,
                        });
                    }
                }
            }
            else {
                relatedInfos.push(info);
            }
        }
        _error.relatedInformation = relatedInfos;
    }
    return _error;
}
function updateRange(range, change) {
    if (!updatePosition(range.start, change, false)) {
        return;
    }
    if (!updatePosition(range.end, change, true)) {
        return;
    }
    if (range.end.line === range.start.line && range.end.character <= range.start.character) {
        range.end.character++;
    }
    return range;
}
function updatePosition(position, change, isEnd) {
    if (change.range.end.line > position.line) {
        if (change.newEnd.line > position.line) {
            // No change
            return true;
        }
        else if (change.newEnd.line === position.line) {
            position.character = Math.min(position.character, change.newEnd.character);
            return true;
        }
        else if (change.newEnd.line < position.line) {
            position.line = change.newEnd.line;
            position.character = change.newEnd.character;
            return true;
        }
    }
    else if (change.range.end.line === position.line) {
        const characterDiff = change.newEnd.character - change.range.end.character;
        if (position.character >= change.range.end.character) {
            if (change.newEnd.line !== change.range.end.line) {
                position.line = change.newEnd.line;
                position.character = change.newEnd.character + position.character - change.range.end.character;
            }
            else {
                if (isEnd ? change.range.end.character < position.character : change.range.end.character <= position.character) {
                    position.character += characterDiff;
                }
                else {
                    const offset = change.range.end.character - position.character;
                    if (-characterDiff > offset) {
                        position.character += characterDiff + offset;
                    }
                }
            }
            return true;
        }
        else {
            if (change.newEnd.line === change.range.end.line) {
                const offset = change.range.end.character - position.character;
                if (-characterDiff > offset) {
                    position.character += characterDiff + offset;
                }
            }
            else if (change.newEnd.line < change.range.end.line) {
                position.line = change.newEnd.line;
                position.character = change.newEnd.character;
            }
            else {
                // No change
            }
            return true;
        }
    }
    else if (change.range.end.line < position.line) {
        position.line += change.newEnd.line - change.range.end.line;
        return true;
    }
    return false;
}
//# sourceMappingURL=provideDiagnostics.js.map