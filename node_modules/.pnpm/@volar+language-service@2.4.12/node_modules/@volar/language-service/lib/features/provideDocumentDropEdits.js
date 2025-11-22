"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return (uri, position, dataTransfer, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, function* (docs) {
            for (const mappedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, position)) {
                yield mappedPosition;
            }
        }, (plugin, document, arg) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideDocumentDropEdits?.(document, arg, dataTransfer, token);
        }, edit => {
            if (edit.additionalEdit) {
                edit.additionalEdit = (0, transform_1.transformWorkspaceEdit)(edit.additionalEdit, context, undefined);
            }
            return edit;
        });
    };
}
//# sourceMappingURL=provideDocumentDropEdits.js.map