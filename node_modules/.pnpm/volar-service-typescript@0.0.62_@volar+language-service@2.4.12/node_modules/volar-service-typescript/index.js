"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const directiveComment_1 = require("./lib/plugins/directiveComment");
const docCommentTemplate_1 = require("./lib/plugins/docCommentTemplate");
const semantic_1 = require("./lib/plugins/semantic");
const syntactic_1 = require("./lib/plugins/syntactic");
function create(ts, options) {
    return [
        (0, semantic_1.create)(ts, options),
        (0, syntactic_1.create)(ts, options),
        (0, docCommentTemplate_1.create)(ts),
        (0, directiveComment_1.create)(),
    ];
}
//# sourceMappingURL=index.js.map