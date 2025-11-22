"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return async (uri, token = cancellation_1.NoneCancellationToken) => {
        return await (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isCodeLensEnabled)(mapping.data)), async (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            let codeLens = await plugin[1].provideCodeLenses?.(document, token);
            const pluginIndex = context.plugins.indexOf(plugin);
            codeLens?.forEach(codeLens => {
                if (plugin[1].resolveCodeLens) {
                    codeLens.data = {
                        kind: 'normal',
                        uri: uri.toString(),
                        original: {
                            data: codeLens.data,
                        },
                        pluginIndex,
                    };
                }
                else {
                    delete codeLens.data;
                }
            });
            const ranges = await plugin[1].provideReferencesCodeLensRanges?.(document, token);
            const referencesCodeLens = ranges?.map(range => ({
                range,
                data: {
                    kind: 'references',
                    sourceFileUri: uri.toString(),
                    workerFileUri: document.uri,
                    workerFileRange: range,
                    pluginIndex: pluginIndex,
                },
            }));
            codeLens = [
                ...codeLens ?? [],
                ...referencesCodeLens ?? [],
            ];
            return codeLens;
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return data
                .map(codeLens => {
                const range = (0, featureWorkers_1.getSourceRange)(docs, codeLens.range, language_core_1.isCodeLensEnabled);
                if (range) {
                    return {
                        ...codeLens,
                        range,
                    };
                }
            })
                .filter(codeLens => !!codeLens);
        }, arr => arr.flat()) ?? [];
    };
}
//# sourceMappingURL=provideCodeLenses.js.map