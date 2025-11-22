/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
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
    exports.join = void 0;
    exports.dirname = dirname;
    exports.basename = basename;
    exports.extname = extname;
    /**
     * @returns the directory name of a path.
     */
    function dirname(path) {
        const idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
        if (idx === 0) {
            return '.';
        }
        else if (~idx === 0) {
            return path[0];
        }
        else {
            return path.substring(0, ~idx);
        }
    }
    /**
     * @returns the base name of a path.
     */
    function basename(path) {
        const idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
        if (idx === 0) {
            return path;
        }
        else if (~idx === path.length - 1) {
            return basename(path.substring(0, path.length - 1));
        }
        else {
            return path.substr(~idx + 1);
        }
    }
    /**
     * @returns {{.far}} from boo.far or the empty string.
     */
    function extname(path) {
        path = basename(path);
        const idx = ~path.lastIndexOf('.');
        return idx ? path.substring(~idx) : '';
    }
    const join = function () {
        // Not using a function with var-args because of how TS compiles
        // them to JS - it would result in 2*n runtime cost instead
        // of 1*n, where n is parts.length.
        let value = '';
        for (let i = 0; i < arguments.length; i++) {
            const part = arguments[i];
            if (i > 0) {
                // add the separater between two parts unless
                // there already is one
                const last = value.charCodeAt(value.length - 1);
                if (last !== 47 /* CharCode.Slash */ && last !== 92 /* CharCode.Backslash */) {
                    const next = part.charCodeAt(0);
                    if (next !== 47 /* CharCode.Slash */ && next !== 92 /* CharCode.Backslash */) {
                        value += '/';
                    }
                }
            }
            value += part;
        }
        return value;
    };
    exports.join = join;
});
