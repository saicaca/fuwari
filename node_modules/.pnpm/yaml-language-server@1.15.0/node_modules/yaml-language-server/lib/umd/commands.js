/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YamlCommands = void 0;
    var YamlCommands;
    (function (YamlCommands) {
        YamlCommands["JUMP_TO_SCHEMA"] = "jumpToSchema";
    })(YamlCommands = exports.YamlCommands || (exports.YamlCommands = {}));
});
//# sourceMappingURL=commands.js.map