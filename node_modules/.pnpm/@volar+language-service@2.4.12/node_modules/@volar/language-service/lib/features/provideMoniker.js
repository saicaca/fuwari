"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, position, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isMonikerEnabled), (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideMoniker?.(document, position, token);
        }, result => result, results => results.flat());
    };
}
//# sourceMappingURL=provideMoniker.js.map