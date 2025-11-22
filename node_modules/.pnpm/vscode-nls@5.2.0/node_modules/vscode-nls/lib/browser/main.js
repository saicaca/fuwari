"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.loadMessageBundle = exports.BundleFormat = exports.MessageFormat = void 0;
var ral_1 = require("../common/ral");
var common_1 = require("../common/common");
var common_2 = require("../common/common");
Object.defineProperty(exports, "MessageFormat", { enumerable: true, get: function () { return common_2.MessageFormat; } });
Object.defineProperty(exports, "BundleFormat", { enumerable: true, get: function () { return common_2.BundleFormat; } });
function loadMessageBundle(_file) {
    return function (key, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (typeof key === 'number') {
            throw new Error("Browser implementation does currently not support externalized strings.");
        }
        else {
            return common_1.localize.apply(void 0, __spreadArray([key, message], args, false));
        }
    };
}
exports.loadMessageBundle = loadMessageBundle;
function config(options) {
    var _a;
    (0, common_1.setPseudo)(((_a = options === null || options === void 0 ? void 0 : options.locale) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'pseudo');
    return loadMessageBundle;
}
exports.config = config;
ral_1.default.install(Object.freeze({
    loadMessageBundle: loadMessageBundle,
    config: config
}));
//# sourceMappingURL=main.js.map