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
            if (!plugin[1].resolveDocumentLink) {
                delete item.data;
                return item;
            }
            Object.assign(item, data.original);
            item = await plugin[1].resolveDocumentLink(item, token);
            if (item.target) {
                item.target = (0, transform_1.transformDocumentLinkTarget)(item.target, context).toString();
            }
        }
        delete item.data;
        return item;
    };
}
//# sourceMappingURL=resolveDocumentLink.js.map