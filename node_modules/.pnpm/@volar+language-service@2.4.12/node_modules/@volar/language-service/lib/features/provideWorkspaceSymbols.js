"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (query, token = cancellation_1.NoneCancellationToken) => {
        const symbolsList = [];
        for (const plugin of context.plugins) {
            if (context.disabledServicePlugins.has(plugin[1])) {
                continue;
            }
            if (token.isCancellationRequested) {
                break;
            }
            if (!plugin[1].provideWorkspaceSymbols) {
                continue;
            }
            const embeddedSymbols = await plugin[1].provideWorkspaceSymbols(query, token);
            if (!embeddedSymbols) {
                continue;
            }
            const symbols = embeddedSymbols
                .map(symbol => (0, transform_1.transformWorkspaceSymbol)(symbol, loc => {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(loc.uri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (sourceScript && virtualCode) {
                    const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                    for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                        const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                        const docs = [sourceDocument, embeddedDocument, map];
                        const range = (0, featureWorkers_1.getSourceRange)(docs, loc.range);
                        if (range) {
                            return { uri: sourceDocument.uri, range };
                        }
                    }
                }
                else {
                    return loc;
                }
            }))
                .filter(symbol => !!symbol);
            symbols?.forEach(symbol => {
                if (plugin[1].resolveWorkspaceSymbol) {
                    symbol.data = {
                        original: {
                            data: symbol.data,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                    };
                }
                else {
                    delete symbol.data;
                }
            });
            symbolsList.push(symbols);
        }
        return symbolsList.flat();
    };
}
//# sourceMappingURL=provideWorkspaceSymbols.js.map