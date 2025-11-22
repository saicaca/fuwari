"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoneCancellationToken = void 0;
exports.NoneCancellationToken = {
    isCancellationRequested: false,
    onCancellationRequested: () => ({ dispose: () => { } }),
};
//# sourceMappingURL=cancellation.js.map