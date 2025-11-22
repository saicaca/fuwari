"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, color, range, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => range, function* (docs) {
            for (const mappedRange of (0, featureWorkers_1.getGeneratedRanges)(docs, range, language_core_1.isColorEnabled)) {
                yield mappedRange;
            }
        }, (plugin, document, range) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideColorPresentations?.(document, color, range, token);
        }, (data, docs) => {
            if (!docs) {
                return data;
            }
            return data
                .map(colorPresentation => {
                if (colorPresentation.textEdit) {
                    const range = (0, featureWorkers_1.getSourceRange)(docs, colorPresentation.textEdit.range);
                    if (!range) {
                        return undefined;
                    }
                    colorPresentation.textEdit.range = range;
                }
                if (colorPresentation.additionalTextEdits) {
                    for (const textEdit of colorPresentation.additionalTextEdits) {
                        const range = (0, featureWorkers_1.getSourceRange)(docs, textEdit.range);
                        if (!range) {
                            return undefined;
                        }
                        textEdit.range = range;
                    }
                }
                return colorPresentation;
            })
                .filter(colorPresentation => !!colorPresentation);
        });
    };
}
//# sourceMappingURL=provideColorPresentations.js.map