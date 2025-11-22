"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (uri, range, codeActionContext, token = cancellation_1.NoneCancellationToken) => {
        const sourceScript = context.language.scripts.get(uri);
        if (!sourceScript) {
            return;
        }
        const transformedCodeActions = new WeakSet();
        return await (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => ({ range, codeActionContext }), function* (docs) {
            const _codeActionContext = {
                diagnostics: (0, transform_1.transformLocations)(codeActionContext.diagnostics, range => (0, featureWorkers_1.getGeneratedRange)(docs, range)),
                only: codeActionContext.only,
            };
            const mapped = (0, common_1.findOverlapCodeRange)(docs[0].offsetAt(range.start), docs[0].offsetAt(range.end), docs[2], language_core_1.isCodeActionsEnabled);
            if (mapped) {
                yield {
                    range: {
                        start: docs[1].positionAt(mapped.start),
                        end: docs[1].positionAt(mapped.end),
                    },
                    codeActionContext: _codeActionContext,
                };
            }
        }, async (plugin, document, { range, codeActionContext }) => {
            if (token.isCancellationRequested) {
                return;
            }
            const pluginIndex = context.plugins.indexOf(plugin);
            const diagnostics = codeActionContext.diagnostics.filter(diagnostic => {
                const data = diagnostic.data;
                if (data && data.version !== document.version) {
                    return false;
                }
                return data?.pluginIndex === pluginIndex;
            }).map(diagnostic => {
                const data = diagnostic.data;
                return {
                    ...diagnostic,
                    ...data.original,
                };
            });
            const codeActions = await plugin[1].provideCodeActions?.(document, range, {
                ...codeActionContext,
                diagnostics,
            }, token);
            codeActions?.forEach(codeAction => {
                if (plugin[1].resolveCodeAction) {
                    codeAction.data = {
                        uri: uri.toString(),
                        version: document.version,
                        original: {
                            data: codeAction.data,
                            edit: codeAction.edit,
                        },
                        pluginIndex: context.plugins.indexOf(plugin),
                    };
                }
                else {
                    delete codeAction.data;
                }
            });
            if (codeActions && plugin[1].transformCodeAction) {
                for (let i = 0; i < codeActions.length; i++) {
                    const transformed = plugin[1].transformCodeAction(codeActions[i]);
                    if (transformed) {
                        codeActions[i] = transformed;
                        transformedCodeActions.add(transformed);
                    }
                }
            }
            return codeActions;
        }, actions => actions
            .map(action => {
            if (transformedCodeActions.has(action)) {
                return action;
            }
            if (action.edit) {
                const edit = (0, transform_1.transformWorkspaceEdit)(action.edit, context, 'codeAction');
                if (!edit) {
                    return;
                }
                action.edit = edit;
            }
            return action;
        })
            .filter(action => !!action), arr => dedupe.withCodeAction(arr.flat()));
    };
}
//# sourceMappingURL=provideCodeActions.js.map