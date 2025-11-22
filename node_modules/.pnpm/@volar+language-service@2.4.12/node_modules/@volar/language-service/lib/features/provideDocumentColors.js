"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isColorEnabled)(mapping.data)), (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideDocumentColors?.(document, token);
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return data
                .map(color => {
                const range = (0, featureWorkers_1.getSourceRange)(docs, color.range, language_core_1.isColorEnabled);
                if (range) {
                    return {
                        range,
                        color: color.color,
                    };
                }
            })
                .filter(color => !!color);
        }, arr => arr.flat());
    };
}
//# sourceMappingURL=provideDocumentColors.js.map