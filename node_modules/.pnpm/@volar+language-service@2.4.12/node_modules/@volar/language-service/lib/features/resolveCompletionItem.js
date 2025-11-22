"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (item, token = cancellation_1.NoneCancellationToken) => {
        const data = item.data;
        if (data) {
            const plugin = context.plugins[data.pluginIndex];
            if (!plugin[1].resolveCompletionItem) {
                delete item.data;
                return item;
            }
            item = Object.assign(item, data.original);
            if (data.embeddedDocumentUri) {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(data.embeddedDocumentUri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (sourceScript && virtualCode) {
                    const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                    for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                        const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                        const docs = [sourceDocument, embeddedDocument, map];
                        item = await plugin[1].resolveCompletionItem(item, token);
                        item = plugin[1].transformCompletionItem?.(item) ?? (0, transform_1.transformCompletionItem)(item, embeddedRange => (0, featureWorkers_1.getSourceRange)(docs, embeddedRange), embeddedDocument, context);
                    }
                }
            }
            else {
                item = await plugin[1].resolveCompletionItem(item, token);
            }
        }
        // TODO: monkey fix import ts file icon
        if (item.detail !== item.detail + '.ts') {
            item.detail = item.detail;
        }
        delete item.data;
        return item;
    };
}
//# sourceMappingURL=resolveCompletionItem.js.map