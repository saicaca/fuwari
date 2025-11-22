"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    let lastResult;
    return async (uri, position, completionContext = { triggerKind: 1, }, token = cancellation_1.NoneCancellationToken) => {
        let langaugeIdAndSnapshot;
        let sourceScript;
        const decoded = context.decodeEmbeddedDocumentUri(uri);
        if (decoded) {
            langaugeIdAndSnapshot = context.language.scripts.get(decoded[0])?.generated?.embeddedCodes.get(decoded[1]);
        }
        else {
            sourceScript = context.language.scripts.get(uri);
            langaugeIdAndSnapshot = sourceScript;
        }
        if (!langaugeIdAndSnapshot) {
            return {
                isIncomplete: false,
                items: [],
            };
        }
        if (completionContext?.triggerKind === 3
            && lastResult?.uri.toString() === uri.toString()) {
            for (const cacheData of lastResult.results) {
                if (!cacheData.list?.isIncomplete) {
                    continue;
                }
                const pluginIndex = context.plugins.findIndex(plugin => plugin[1] === cacheData.plugin);
                if (cacheData.embeddedDocumentUri) {
                    const decoded = context.decodeEmbeddedDocumentUri(cacheData.embeddedDocumentUri);
                    const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                    const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                    if (!sourceScript || !virtualCode) {
                        continue;
                    }
                    const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                    for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                        const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                        const docs = [sourceDocument, embeddedDocument, map];
                        for (const mapped of (0, featureWorkers_1.getGeneratedPositions)(docs, position, data => (0, language_core_1.isCompletionEnabled)(data))) {
                            if (!cacheData.plugin.provideCompletionItems) {
                                continue;
                            }
                            cacheData.list = await cacheData.plugin.provideCompletionItems(embeddedDocument, mapped, completionContext, token);
                            if (!cacheData.list) {
                                continue;
                            }
                            for (const item of cacheData.list.items) {
                                if (cacheData.plugin.resolveCompletionItem) {
                                    item.data = {
                                        uri: uri.toString(),
                                        original: {
                                            additionalTextEdits: item.additionalTextEdits,
                                            textEdit: item.textEdit,
                                            data: item.data,
                                        },
                                        pluginIndex: pluginIndex,
                                        embeddedDocumentUri: embeddedDocument.uri,
                                    };
                                }
                                else {
                                    delete item.data;
                                }
                            }
                            cacheData.list = (0, transform_1.transformCompletionList)(cacheData.list, range => (0, featureWorkers_1.getSourceRange)(docs, range), embeddedDocument, context);
                        }
                    }
                }
                else {
                    if (!cacheData.plugin.provideCompletionItems) {
                        continue;
                    }
                    const document = context.documents.get(uri, langaugeIdAndSnapshot.languageId, langaugeIdAndSnapshot.snapshot);
                    cacheData.list = await cacheData.plugin.provideCompletionItems(document, position, completionContext, token);
                    if (!cacheData.list) {
                        continue;
                    }
                    for (const item of cacheData.list.items) {
                        if (cacheData.plugin.resolveCompletionItem) {
                            item.data = {
                                uri: uri.toString(),
                                original: {
                                    additionalTextEdits: item.additionalTextEdits,
                                    textEdit: item.textEdit,
                                    data: item.data,
                                },
                                pluginIndex: pluginIndex,
                                embeddedDocumentUri: undefined,
                            };
                        }
                        else {
                            delete item.data;
                        }
                    }
                }
            }
        }
        else {
            lastResult = {
                uri,
                results: [],
            };
            // monky fix https://github.com/johnsoncodehk/volar/issues/1358
            let isFirstMapping = true;
            let mainCompletionUri;
            const sortedPlugins = [...context.plugins]
                .filter(plugin => !context.disabledServicePlugins.has(plugin[1]))
                .sort((a, b) => sortServices(a[1], b[1]));
            const worker = async (document, position, docs, codeInfo) => {
                for (const plugin of sortedPlugins) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    if (!plugin[1].provideCompletionItems) {
                        continue;
                    }
                    if (plugin[1].isAdditionalCompletion && !isFirstMapping) {
                        continue;
                    }
                    if (completionContext?.triggerCharacter && !plugin[0].capabilities.completionProvider?.triggerCharacters?.includes(completionContext.triggerCharacter)) {
                        continue;
                    }
                    const isAdditional = (codeInfo && typeof codeInfo.completion === 'object' && codeInfo.completion.isAdditional) || plugin[1].isAdditionalCompletion;
                    if (mainCompletionUri && (!isAdditional || mainCompletionUri !== document.uri)) {
                        continue;
                    }
                    // avoid duplicate items with .vue and .vue.html
                    if (plugin[1].isAdditionalCompletion && lastResult?.results.some(data => data.plugin === plugin[1])) {
                        continue;
                    }
                    let completionList = await plugin[1].provideCompletionItems(document, position, completionContext, token);
                    if (!completionList || !completionList.items.length) {
                        continue;
                    }
                    if (typeof codeInfo?.completion === 'object' && codeInfo.completion.onlyImport) {
                        completionList.items = completionList.items.filter(item => !!item.labelDetails);
                    }
                    if (!isAdditional) {
                        mainCompletionUri = document.uri;
                    }
                    const pluginIndex = context.plugins.indexOf(plugin);
                    for (const item of completionList.items) {
                        if (plugin[1].resolveCompletionItem) {
                            item.data = {
                                uri: uri.toString(),
                                original: {
                                    additionalTextEdits: item.additionalTextEdits,
                                    textEdit: item.textEdit,
                                    data: item.data,
                                },
                                pluginIndex,
                                embeddedDocumentUri: docs ? document.uri : undefined,
                            };
                        }
                        else {
                            delete item.data;
                        }
                    }
                    if (docs) {
                        completionList = (0, transform_1.transformCompletionList)(completionList, range => (0, featureWorkers_1.getSourceRange)(docs, range, language_core_1.isCompletionEnabled), document, context);
                    }
                    lastResult?.results.push({
                        embeddedDocumentUri: docs ? vscode_uri_1.URI.parse(document.uri) : undefined,
                        plugin: plugin[1],
                        list: completionList,
                    });
                }
                isFirstMapping = false;
            };
            if (sourceScript?.generated) {
                for (const docs of (0, featureWorkers_1.forEachEmbeddedDocument)(context, sourceScript, sourceScript.generated.root)) {
                    let _data;
                    for (const mappedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, position, data => {
                        _data = data;
                        return (0, language_core_1.isCompletionEnabled)(data);
                    })) {
                        await worker(docs[1], mappedPosition, docs, _data);
                    }
                }
            }
            else {
                const document = context.documents.get(uri, langaugeIdAndSnapshot.languageId, langaugeIdAndSnapshot.snapshot);
                await worker(document, position);
            }
        }
        return combineCompletionList(lastResult.results.map(cacheData => cacheData.list));
        function sortServices(a, b) {
            return (b.isAdditionalCompletion ? -1 : 1) - (a.isAdditionalCompletion ? -1 : 1);
        }
        function combineCompletionList(lists) {
            return {
                isIncomplete: lists.some(list => list?.isIncomplete),
                itemDefaults: lists.find(list => list?.itemDefaults)?.itemDefaults,
                items: lists.map(list => list?.items ?? []).flat(),
            };
        }
    };
}
//# sourceMappingURL=provideCompletionItems.js.map