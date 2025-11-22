"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return (uri, positions, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => positions, function* (docs) {
            const result = positions
                .map(position => {
                for (const mappedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isSelectionRangesEnabled)) {
                    return mappedPosition;
                }
            })
                .filter(position => !!position);
            if (result.length) {
                yield result;
            }
        }, async (plugin, document, positions) => {
            if (token.isCancellationRequested) {
                return;
            }
            const selectionRanges = await plugin[1].provideSelectionRanges?.(document, positions, token);
            if (selectionRanges && selectionRanges.length !== positions.length) {
                console.error('Selection ranges count should be equal to positions count:', plugin[0].name, selectionRanges.length, positions.length);
                return;
            }
            return selectionRanges;
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return (0, transform_1.transformSelectionRanges)(data, range => (0, featureWorkers_1.getSourceRange)(docs, range, language_core_1.isSelectionRangesEnabled));
        }, results => {
            const result = [];
            for (let i = 0; i < positions.length; i++) {
                let pluginResults = [];
                for (const ranges of results) {
                    pluginResults.push(ranges[i]);
                }
                pluginResults = pluginResults.sort((a, b) => {
                    if ((0, common_1.isInsideRange)(a.range, b.range)) {
                        return 1;
                    }
                    if ((0, common_1.isInsideRange)(b.range, a.range)) {
                        return -1;
                    }
                    return 0;
                });
                for (let j = 1; j < pluginResults.length; j++) {
                    let top = pluginResults[j - 1];
                    const parent = pluginResults[j];
                    while (top.parent && (0, common_1.isInsideRange)(parent.range, top.parent.range) && !(0, common_1.isEqualRange)(parent.range, top.parent.range)) {
                        top = top.parent;
                    }
                    if (top) {
                        top.parent = parent;
                    }
                }
                result.push(pluginResults[0]);
            }
            return result;
        });
    };
}
//# sourceMappingURL=provideSelectionRanges.js.map