"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, position, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, function* (docs) {
            for (const pos of (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isLinkedEditingEnabled)) {
                yield pos;
            }
        }, (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideLinkedEditingRanges?.(document, position, token);
        }, (ranges, docs) => {
            if (!docs) {
                return ranges;
            }
            return {
                wordPattern: ranges.wordPattern,
                ranges: ranges.ranges
                    .map(range => (0, featureWorkers_1.getSourceRange)(docs, range, language_core_1.isLinkedEditingEnabled))
                    .filter(range => !!range),
            };
        });
    };
}
//# sourceMappingURL=provideLinkedEditingRanges.js.map