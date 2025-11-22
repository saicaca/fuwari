"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return {
        getCallHierarchyItems(uri, position, token = cancellation_1.NoneCancellationToken) {
            return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isCallHierarchyEnabled), async (plugin, document, position, map) => {
                if (token.isCancellationRequested) {
                    return;
                }
                const items = await plugin[1].provideCallHierarchyItems?.(document, position, token);
                items?.forEach(item => {
                    item.data = {
                        uri: uri.toString(),
                        original: {
                            data: item.data,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                        embeddedDocumentUri: map?.[1].uri,
                    };
                });
                return items;
            }, (data, map) => {
                if (!map) {
                    return data;
                }
                return data
                    .map(item => transformHierarchyItem(item, [])?.[0])
                    .filter(item => !!item);
            }, arr => dedupe.withLocations(arr.flat()));
        },
        getTypeHierarchyItems(uri, position, token = cancellation_1.NoneCancellationToken) {
            return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isTypeHierarchyEnabled), async (plugin, document, position, map) => {
                if (token.isCancellationRequested) {
                    return;
                }
                const items = await plugin[1].provideTypeHierarchyItems?.(document, position, token);
                items?.forEach(item => {
                    item.data = {
                        uri: uri.toString(),
                        original: {
                            data: item.data,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                        embeddedDocumentUri: map?.[1].uri,
                    };
                });
                return items;
            }, (data, map) => {
                if (!map) {
                    return data;
                }
                return data
                    .map(item => transformHierarchyItem(item, [])?.[0])
                    .filter(item => !!item);
            }, arr => dedupe.withLocations(arr.flat()));
        },
        async getCallHierarchyIncomingCalls(item, token) {
            const data = item.data;
            let incomingItems = [];
            if (data) {
                const plugin = context.plugins[data.pluginIndex];
                if (!plugin[1].provideCallHierarchyIncomingCalls) {
                    return incomingItems;
                }
                Object.assign(item, data.original);
                if (data.embeddedDocumentUri) {
                    const isEmbeddedContent = !!context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(data.embeddedDocumentUri));
                    if (isEmbeddedContent) {
                        const _calls = await plugin[1].provideCallHierarchyIncomingCalls(item, token);
                        for (const _call of _calls) {
                            const calls = transformHierarchyItem(_call.from, _call.fromRanges);
                            if (!calls) {
                                continue;
                            }
                            incomingItems.push({
                                from: calls[0],
                                fromRanges: calls[1],
                            });
                        }
                    }
                }
                else {
                    const _calls = await plugin[1].provideCallHierarchyIncomingCalls(item, token);
                    for (const _call of _calls) {
                        const calls = transformHierarchyItem(_call.from, _call.fromRanges);
                        if (!calls) {
                            continue;
                        }
                        incomingItems.push({
                            from: calls[0],
                            fromRanges: calls[1],
                        });
                    }
                }
            }
            return dedupe.withCallHierarchyIncomingCalls(incomingItems);
        },
        async getCallHierarchyOutgoingCalls(item, token) {
            const data = item.data;
            let items = [];
            if (data) {
                const plugin = context.plugins[data.pluginIndex];
                if (!plugin[1].provideCallHierarchyOutgoingCalls) {
                    return items;
                }
                Object.assign(item, data.original);
                if (data.embeddedDocumentUri) {
                    const isEmbeddedContent = !!context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(data.embeddedDocumentUri));
                    if (isEmbeddedContent) {
                        const _calls = await plugin[1].provideCallHierarchyOutgoingCalls(item, token);
                        for (const call of _calls) {
                            const calls = transformHierarchyItem(call.to, call.fromRanges);
                            if (!calls) {
                                continue;
                            }
                            items.push({
                                to: calls[0],
                                fromRanges: calls[1],
                            });
                        }
                    }
                }
                else {
                    const _calls = await plugin[1].provideCallHierarchyOutgoingCalls(item, token);
                    for (const call of _calls) {
                        const calls = transformHierarchyItem(call.to, call.fromRanges);
                        if (!calls) {
                            continue;
                        }
                        items.push({
                            to: calls[0],
                            fromRanges: calls[1],
                        });
                    }
                }
            }
            return dedupe.withCallHierarchyOutgoingCalls(items);
        },
        async getTypeHierarchySupertypes(item, token) {
            const data = item.data;
            if (data) {
                const plugin = context.plugins[data.pluginIndex];
                if (!plugin[1].provideTypeHierarchySupertypes) {
                    return [];
                }
                Object.assign(item, data.original);
                if (data.embeddedDocumentUri) {
                    const isEmbeddedContent = !!context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(data.embeddedDocumentUri));
                    if (isEmbeddedContent) {
                        const items = await plugin[1].provideTypeHierarchySupertypes(item, token);
                        return items
                            .map(item => transformHierarchyItem(item, [])?.[0])
                            .filter(item => !!item);
                    }
                }
                else {
                    const items = await plugin[1].provideTypeHierarchySupertypes(item, token);
                    return items
                        .map(item => transformHierarchyItem(item, [])?.[0])
                        .filter(item => !!item);
                }
            }
        },
        async getTypeHierarchySubtypes(item, token) {
            const data = item.data;
            if (data) {
                const plugin = context.plugins[data.pluginIndex];
                if (!plugin[1].provideTypeHierarchySubtypes) {
                    return [];
                }
                Object.assign(item, data.original);
                if (data.embeddedDocumentUri) {
                    const isEmbeddedContent = !!context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(data.embeddedDocumentUri));
                    if (isEmbeddedContent) {
                        const items = await plugin[1].provideTypeHierarchySubtypes(item, token);
                        return items
                            .map(item => transformHierarchyItem(item, [])?.[0])
                            .filter(item => !!item);
                    }
                }
                else {
                    const items = await plugin[1].provideTypeHierarchySubtypes(item, token);
                    return items
                        .map(item => transformHierarchyItem(item, [])?.[0])
                        .filter(item => !!item);
                }
            }
        },
    };
    function transformHierarchyItem(tsItem, tsRanges) {
        const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsItem.uri));
        const sourceScript = decoded && context.language.scripts.get(decoded[0]);
        const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
        if (!sourceScript || !virtualCode) {
            return [tsItem, tsRanges];
        }
        const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
        for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
            const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
            const docs = [sourceDocument, embeddedDocument, map];
            let range = (0, featureWorkers_1.getSourceRange)(docs, tsItem.range);
            if (!range) {
                // TODO: <script> range
                range = {
                    start: sourceDocument.positionAt(0),
                    end: sourceDocument.positionAt(sourceDocument.getText().length),
                };
            }
            const selectionRange = (0, featureWorkers_1.getSourceRange)(docs, tsItem.selectionRange);
            if (!selectionRange) {
                continue;
            }
            const vueRanges = tsRanges.map(tsRange => (0, featureWorkers_1.getSourceRange)(docs, tsRange)).filter(range => !!range);
            const vueItem = {
                ...tsItem,
                name: tsItem.name === embeddedDocument.uri.substring(embeddedDocument.uri.lastIndexOf('/') + 1)
                    ? sourceDocument.uri.substring(sourceDocument.uri.lastIndexOf('/') + 1)
                    : tsItem.name,
                uri: sourceDocument.uri,
                // TS Bug: `range: range` not works
                range: {
                    start: range.start,
                    end: range.end,
                },
                selectionRange: {
                    start: selectionRange.start,
                    end: selectionRange.end,
                },
            };
            return [vueItem, vueRanges];
        }
    }
}
//# sourceMappingURL=provideCallHierarchyItems.js.map