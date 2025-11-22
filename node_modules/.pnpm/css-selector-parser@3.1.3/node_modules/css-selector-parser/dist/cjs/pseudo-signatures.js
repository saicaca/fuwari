"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePseudoSignatures = exports.inverseCategories = exports.defaultPseudoSignature = exports.emptyPseudoSignatures = void 0;
exports.emptyPseudoSignatures = {};
exports.defaultPseudoSignature = {
    type: 'String',
    optional: true
};
function calculatePseudoSignature(types) {
    var result = {
        type: 'NoArgument',
        optional: false
    };
    function setResultType(type) {
        if (result.type && result.type !== type && result.type !== 'NoArgument') {
            throw new Error("Conflicting pseudo-class argument type: \"".concat(result.type, "\" vs \"").concat(type, "\"."));
        }
        result.type = type;
    }
    for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
        var type = types_1[_i];
        if (type === 'NoArgument') {
            result.optional = true;
        }
        if (type === 'Formula') {
            setResultType('Formula');
        }
        if (type === 'FormulaOfSelector') {
            setResultType('Formula');
            result.ofSelector = true;
        }
        if (type === 'String') {
            setResultType('String');
        }
        if (type === 'Selector') {
            setResultType('Selector');
        }
    }
    return result;
}
function inverseCategories(obj) {
    var result = {};
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var category = _a[_i];
        var items = obj[category];
        if (items) {
            for (var _b = 0, _c = items; _b < _c.length; _b++) {
                var item = _c[_b];
                (result[item] || (result[item] = [])).push(category);
            }
        }
    }
    return result;
}
exports.inverseCategories = inverseCategories;
function calculatePseudoSignatures(definitions) {
    var pseudoClassesToArgumentTypes = inverseCategories(definitions);
    var result = {};
    for (var _i = 0, _a = Object.keys(pseudoClassesToArgumentTypes); _i < _a.length; _i++) {
        var pseudoClass = _a[_i];
        var argumentTypes = pseudoClassesToArgumentTypes[pseudoClass];
        if (argumentTypes) {
            result[pseudoClass] = calculatePseudoSignature(argumentTypes);
        }
    }
    return result;
}
exports.calculatePseudoSignatures = calculatePseudoSignatures;
