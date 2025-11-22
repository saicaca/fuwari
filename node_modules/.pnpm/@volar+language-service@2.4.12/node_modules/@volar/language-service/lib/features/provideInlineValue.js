"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, range, ivContext, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => range, docs => (0, featureWorkers_1.getGeneratedRanges)(docs, range, language_core_1.isInlineValueEnabled), (plugin, document, range) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideInlineValues?.(document, range, ivContext, token);
        }, (items, docs) => {
            if (!docs) {
                return items;
            }
            return items
                .map(item => {
                const mappedRange = (0, featureWorkers_1.getSourceRange)(docs, item.range, language_core_1.isInlineValueEnabled);
                if (mappedRange) {
                    item.range = mappedRange;
                    return item;
                }
            })
                .filter(item => !!item);
        }, results => results.flat());
    };
}
//# sourceMappingURL=provideInlineValue.js.map