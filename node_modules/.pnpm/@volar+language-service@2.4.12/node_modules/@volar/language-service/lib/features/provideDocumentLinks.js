"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (uri, token = cancellation_1.NoneCancellationToken) => {
        return await (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isDocumentLinkEnabled)(mapping.data)), async (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            const links = await plugin[1].provideDocumentLinks?.(document, token);
            for (const link of links ?? []) {
                if (plugin[1].resolveDocumentLink) {
                    link.data = {
                        uri: uri.toString(),
                        original: {
                            data: link.data,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                    };
                }
                else {
                    delete link.data;
                }
            }
            return links;
        }, (links, docs) => {
            if (!docs) {
                return links;
            }
            return links
                .map(link => {
                const range = (0, featureWorkers_1.getSourceRange)(docs, link.range, language_core_1.isDocumentLinkEnabled);
                if (!range) {
                    return;
                }
                link = {
                    ...link,
                    range,
                };
                if (link.target) {
                    link.target = (0, transform_1.transformDocumentLinkTarget)(link.target, context).toString();
                }
                return link;
            })
                .filter(link => !!link);
        }, arr => arr.flat()) ?? [];
    };
}
//# sourceMappingURL=provideDocumentLinks.js.map