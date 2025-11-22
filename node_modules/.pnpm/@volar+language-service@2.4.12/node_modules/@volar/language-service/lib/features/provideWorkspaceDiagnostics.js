"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const provideDiagnostics_1 = require("./provideDiagnostics");
function register(context) {
    return async (token = cancellation_1.NoneCancellationToken) => {
        const allItems = [];
        for (const plugin of context.plugins) {
            if (context.disabledServicePlugins.has(plugin[1])) {
                continue;
            }
            if (token.isCancellationRequested) {
                break;
            }
            if (!plugin[1].provideWorkspaceDiagnostics) {
                continue;
            }
            const report = await plugin[1].provideWorkspaceDiagnostics(token);
            if (!report) {
                continue;
            }
            const items = report
                .map(item => {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(item.uri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (virtualCode && sourceScript) {
                    if (item.kind === 'unchanged') {
                        return {
                            ...item,
                            uri: sourceScript.id.toString(),
                        };
                    }
                    else {
                        const map = context.language.maps.get(virtualCode, sourceScript);
                        const docs = [
                            context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot),
                            context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot),
                            map,
                        ];
                        return {
                            ...item,
                            items: item.items
                                .map(error => (0, provideDiagnostics_1.transformDiagnostic)(context, error, docs))
                                .filter(error => !!error)
                        };
                    }
                }
                else {
                    if (item.kind === 'unchanged') {
                        return item;
                    }
                    return {
                        ...item,
                        items: item.items
                            .map(error => (0, provideDiagnostics_1.transformDiagnostic)(context, error, undefined))
                            .filter(error => !!error)
                    };
                }
            });
            allItems.push(...items);
        }
        return allItems;
    };
}
//# sourceMappingURL=provideWorkspaceDiagnostics.js.map