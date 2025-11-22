"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (uri, range, token = cancellation_1.NoneCancellationToken) => {
        const sourceScript = context.language.scripts.get(uri);
        if (!sourceScript) {
            return;
        }
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => range, function* (docs) {
            const mapped = (0, common_1.findOverlapCodeRange)(docs[0].offsetAt(range.start), docs[0].offsetAt(range.end), docs[2], language_core_1.isInlayHintsEnabled);
            if (mapped) {
                yield {
                    start: docs[1].positionAt(mapped.start),
                    end: docs[1].positionAt(mapped.end),
                };
            }
        }, async (plugin, document, arg) => {
            if (token.isCancellationRequested) {
                return;
            }
            const hints = await plugin[1].provideInlayHints?.(document, arg, token);
            hints?.forEach(link => {
                if (plugin[1].resolveInlayHint) {
                    link.data = {
                        uri: uri.toString(),
                        original: {
                            data: link.data,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                    };
                }
                else {
                    delete link.data;
                }
            });
            return hints;
        }, (inlayHints, docs) => {
            if (!docs) {
                return inlayHints;
            }
            return inlayHints
                .map((_inlayHint) => {
                const edits = _inlayHint.textEdits
                    ?.map(textEdit => (0, transform_1.transformTextEdit)(textEdit, range => (0, featureWorkers_1.getSourceRange)(docs, range), docs[1]))
                    .filter(textEdit => !!textEdit);
                for (const position of (0, featureWorkers_1.getSourcePositions)(docs, _inlayHint.position, language_core_1.isInlayHintsEnabled)) {
                    return {
                        ..._inlayHint,
                        position,
                        textEdits: edits,
                    };
                }
            })
                .filter(hint => !!hint);
        }, arr => arr.flat());
    };
}
//# sourceMappingURL=provideInlayHints.js.map