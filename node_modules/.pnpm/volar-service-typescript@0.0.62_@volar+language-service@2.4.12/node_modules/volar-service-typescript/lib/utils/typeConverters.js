"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolKind = void 0;
const PConst = require("../protocol.const");
var SymbolKind;
(function (SymbolKind) {
    function fromProtocolScriptElementKind(kind) {
        switch (kind) {
            case PConst.Kind.module: return 2;
            case PConst.Kind.class: return 5;
            case PConst.Kind.enum: return 10;
            case PConst.Kind.enumMember: return 22;
            case PConst.Kind.interface: return 11;
            case PConst.Kind.indexSignature: return 6;
            case PConst.Kind.callSignature: return 6;
            case PConst.Kind.method: return 6;
            case PConst.Kind.memberVariable: return 7;
            case PConst.Kind.memberGetAccessor: return 7;
            case PConst.Kind.memberSetAccessor: return 7;
            case PConst.Kind.variable: return 13;
            case PConst.Kind.let: return 13;
            case PConst.Kind.const: return 13;
            case PConst.Kind.localVariable: return 13;
            case PConst.Kind.alias: return 13;
            case PConst.Kind.function: return 12;
            case PConst.Kind.localFunction: return 12;
            case PConst.Kind.constructSignature: return 9;
            case PConst.Kind.constructorImplementation: return 9;
            case PConst.Kind.typeParameter: return 26;
            case PConst.Kind.string: return 15;
            default: return 13;
        }
    }
    SymbolKind.fromProtocolScriptElementKind = fromProtocolScriptElementKind;
})(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
//# sourceMappingURL=typeConverters.js.map