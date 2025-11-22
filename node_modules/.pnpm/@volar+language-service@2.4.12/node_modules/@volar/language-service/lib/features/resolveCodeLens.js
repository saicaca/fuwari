"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const references = require("./provideReferences");
function register(context) {
    const findReferences = references.register(context);
    return async (item, token = cancellation_1.NoneCancellationToken) => {
        const data = item.data;
        if (data?.kind === 'normal') {
            const plugin = context.plugins[data.pluginIndex];
            if (!plugin[1].resolveCodeLens) {
                delete item.data;
                return item;
            }
            Object.assign(item, data.original);
            item = await plugin[1].resolveCodeLens(item, token);
            // item.range already transformed in codeLens request
        }
        else if (data?.kind === 'references') {
            const references = await findReferences(vscode_uri_1.URI.parse(data.sourceFileUri), item.range.start, { includeDeclaration: false }, token) ?? [];
            item.command = context.commands.showReferences.create(data.sourceFileUri, item.range.start, references);
        }
        delete item.data;
        return item;
    };
}
//# sourceMappingURL=resolveCodeLens.js.map