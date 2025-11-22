"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (oldUri, newUri, token = cancellation_1.NoneCancellationToken) => {
        for (const plugin of context.plugins) {
            if (context.disabledServicePlugins.has(plugin[1])) {
                continue;
            }
            if (token.isCancellationRequested) {
                break;
            }
            if (!plugin[1].provideFileRenameEdits) {
                continue;
            }
            const workspaceEdit = await plugin[1].provideFileRenameEdits(oldUri, newUri, token);
            if (workspaceEdit) {
                const result = (0, transform_1.transformWorkspaceEdit)(workspaceEdit, context, 'fileName');
                if (result?.documentChanges) {
                    result.documentChanges = dedupe.withDocumentChanges(result.documentChanges);
                }
                return result;
            }
        }
    };
}
//# sourceMappingURL=provideFileRenameEdits.js.map