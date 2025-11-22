"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const cancellation_1 = require("../utils/cancellation");
const transform_1 = require("../utils/transform");
function register(context) {
    return async (item, token = cancellation_1.NoneCancellationToken) => {
        const data = item.data;
        if (data) {
            const plugin = context.plugins[data.pluginIndex];
            if (!plugin[1].resolveCodeAction) {
                delete item.data;
                return item;
            }
            Object.assign(item, data.original);
            item = await plugin[1].resolveCodeAction(item, token);
            item = plugin[1].transformCodeAction?.(item)
                ?? (item.edit
                    ? {
                        ...item,
                        edit: (0, transform_1.transformWorkspaceEdit)(item.edit, context, 'codeAction', { [data.uri]: data.version }),
                    }
                    : item);
        }
        delete item.data;
        return item;
    };
}
//# sourceMappingURL=resolveCodeAction.js.map