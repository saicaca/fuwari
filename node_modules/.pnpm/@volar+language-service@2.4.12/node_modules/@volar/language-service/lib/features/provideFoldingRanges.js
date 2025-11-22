"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return (uri, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.documentFeatureWorker)(context, uri, docs => docs[2].mappings.some(mapping => (0, language_core_1.isFoldingRangesEnabled)(mapping.data)), (plugin, document) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideFoldingRanges?.(document, token);
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return (0, transform_1.transformFoldingRanges)(data, range => (0, featureWorkers_1.getSourceRange)(docs, range, language_core_1.isFoldingRangesEnabled));
        }, arr => arr.flat());
    };
}
//# sourceMappingURL=provideFoldingRanges.js.map