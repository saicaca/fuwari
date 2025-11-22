"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ts, host, _service) {
    var _a, _b;
    // @ts-expect-error
    const importSuggestionsCache = (_b = (_a = ts.Completions) === null || _a === void 0 ? void 0 : _a.createImportSuggestionsForFileCache) === null || _b === void 0 ? void 0 : _b.call(_a);
    // @ts-expect-error
    // TODO: crash on 'addListener' from 'node:process', reuse because TS has same problem
    host.getImportSuggestionsCache = () => importSuggestionsCache;
}
exports.default = default_1;
