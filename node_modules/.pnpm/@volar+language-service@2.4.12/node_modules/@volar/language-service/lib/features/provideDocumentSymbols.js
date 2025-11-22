"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return (uri, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isSymbolsEnabled)(mapping.data)), (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideDocumentSymbols?.(document, token);
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return data
                .map(symbol => (0, transform_1.transformDocumentSymbol)(symbol, range => (0, featureWorkers_1.getSourceRange)(docs, range, language_core_1.isSymbolsEnabled)))
                .filter(symbol => !!symbol);
        }, results => {
            for (let i = 0; i < results.length; i++) {
                for (let j = 0; j < results.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    results[i] = results[i].filter(child => {
                        for (const parent of forEachSymbol(results[j])) {
                            if ((0, common_1.isInsideRange)(parent.range, child.range)) {
                                parent.children ??= [];
                                parent.children.push(child);
                                return false;
                            }
                        }
                        return true;
                    });
                }
            }
            return results.flat();
        });
    };
}
function* forEachSymbol(symbols) {
    for (const symbol of symbols) {
        if (symbol.children) {
            yield* forEachSymbol(symbol.children);
        }
        yield symbol;
    }
}
//# sourceMappingURL=provideDocumentSymbols.js.map