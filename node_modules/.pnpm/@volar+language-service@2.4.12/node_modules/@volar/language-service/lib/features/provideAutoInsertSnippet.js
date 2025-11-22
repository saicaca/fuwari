"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, selection, change, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => ({ selection, change }), function* (docs) {
            for (const mappedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, selection, language_core_1.isAutoInsertEnabled)) {
                for (const mapped of docs[2].toGeneratedLocation(change.rangeOffset)) {
                    yield {
                        selection: mappedPosition,
                        change: {
                            text: change.text,
                            rangeOffset: mapped[0],
                            rangeLength: change.rangeLength,
                        },
                    };
                    break;
                }
            }
        }, (plugin, document, args) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideAutoInsertSnippet?.(document, args.selection, args.change, token);
        }, snippet => snippet);
    };
}
//# sourceMappingURL=provideAutoInsertSnippet.js.map