"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const cancellation_1 = require("../utils/cancellation");
function register(context) {
    return async (item, token = cancellation_1.NoneCancellationToken) => {
        const data = item.data;
        if (data) {
            const plugin = context.plugins[data.pluginIndex];
            if (!plugin[1].resolveInlayHint) {
                delete item.data;
                return item;
            }
            Object.assign(item, data.original);
            item = await plugin[1].resolveInlayHint(item, token);
        }
        delete item.data;
        return item;
    };
}
//# sourceMappingURL=resolveInlayHint.js.map