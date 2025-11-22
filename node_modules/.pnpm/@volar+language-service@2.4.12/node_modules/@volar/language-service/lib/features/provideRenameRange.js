"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, position, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isRenameEnabled), (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideRenameRange?.(document, position, token);
        }, (item, docs) => {
            if (!docs) {
                return item;
            }
            if ('start' in item && 'end' in item) {
                return (0, featureWorkers_1.getSourceRange)(docs, item);
            }
            return item;
        }, prepares => {
            for (const prepare of prepares) {
                if ('start' in prepare && 'end' in prepare) {
                    return prepare; // if has any valid range, ignore other errors
                }
            }
            return prepares[0];
        });
    };
}
//# sourceMappingURL=provideRenameRange.js.map