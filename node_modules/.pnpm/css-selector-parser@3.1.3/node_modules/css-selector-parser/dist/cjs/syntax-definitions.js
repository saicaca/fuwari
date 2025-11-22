"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pseudoLocationIndex = exports.buildPseudoLocationIndex = exports.cssSyntaxDefinitions = exports.cssModules = exports.extendSyntaxDefinition = exports.getXmlOptions = void 0;
var emptyXmlOptions = {};
var defaultXmlOptions = { wildcard: true };
function getXmlOptions(param) {
    if (param) {
        if (typeof param === 'boolean') {
            return defaultXmlOptions;
        }
        else {
            return param;
        }
    }
    else {
        return emptyXmlOptions;
    }
}
exports.getXmlOptions = getXmlOptions;
function withMigration(migration, merge) {
    return function (base, extension) { return merge(migration(base), migration(extension)); };
}
function withNoNegative(merge) {
    return function (base, extension) {
        var result = merge(base, extension);
        if (!result) {
            throw new Error("Syntax definition cannot be null or undefined.");
        }
        return result;
    };
}
function withPositive(positive, merge) {
    return function (base, extension) {
        if (extension === true) {
            return positive;
        }
        return merge(base === true ? positive : base, extension);
    };
}
function mergeSection(values) {
    return function (base, extension) {
        if (!extension || !base) {
            return extension;
        }
        if (typeof extension !== 'object' || extension === null) {
            throw new Error("Unexpected syntax definition extension type: ".concat(extension, "."));
        }
        var result = __assign({}, base);
        for (var _i = 0, _a = Object.entries(extension); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (key === 'latest') {
                continue;
            }
            var mergeSchema = values[key];
            result[key] = mergeSchema(base[key], value);
        }
        return result;
    };
}
function replaceValueIfSpecified(base, extension) {
    if (extension !== undefined) {
        return extension;
    }
    return base;
}
function concatArray(base, extension) {
    if (!extension) {
        return base;
    }
    if (!base) {
        return extension;
    }
    return base.concat(extension);
}
function mergeDefinitions(base, extension) {
    if (!extension) {
        return base;
    }
    if (!base) {
        return extension;
    }
    var result = __assign({}, base);
    for (var _i = 0, _a = Object.entries(extension); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (!value) {
            delete result[key];
            continue;
        }
        var baseValue = base[key];
        if (!baseValue) {
            result[key] = value;
            continue;
        }
        result[key] = baseValue.concat(value);
    }
    return result;
}
exports.extendSyntaxDefinition = withNoNegative(mergeSection({
    baseSyntax: replaceValueIfSpecified,
    modules: concatArray,
    tag: withPositive(defaultXmlOptions, mergeSection({
        wildcard: replaceValueIfSpecified
    })),
    ids: replaceValueIfSpecified,
    classNames: replaceValueIfSpecified,
    namespace: withPositive(defaultXmlOptions, mergeSection({
        wildcard: replaceValueIfSpecified
    })),
    combinators: concatArray,
    attributes: mergeSection({
        operators: concatArray,
        caseSensitivityModifiers: concatArray,
        unknownCaseSensitivityModifiers: replaceValueIfSpecified
    }),
    pseudoClasses: mergeSection({
        unknown: replaceValueIfSpecified,
        definitions: mergeDefinitions
    }),
    pseudoElements: mergeSection({
        unknown: replaceValueIfSpecified,
        notation: replaceValueIfSpecified,
        definitions: withMigration(function (definitions) { return (Array.isArray(definitions) ? { NoArgument: definitions } : definitions); }, mergeDefinitions)
    })
}));
var css1SyntaxDefinition = {
    tag: {},
    ids: true,
    classNames: true,
    combinators: [],
    pseudoElements: {
        unknown: 'reject',
        notation: 'singleColon',
        definitions: ['first-letter', 'first-line']
    },
    pseudoClasses: {
        unknown: 'reject',
        definitions: {
            NoArgument: ['link', 'visited', 'active']
        }
    }
};
var css2SyntaxDefinition = (0, exports.extendSyntaxDefinition)(css1SyntaxDefinition, {
    tag: { wildcard: true },
    combinators: ['>', '+'],
    attributes: {
        unknownCaseSensitivityModifiers: 'reject',
        operators: ['=', '~=', '|=']
    },
    pseudoElements: {
        definitions: ['before', 'after']
    },
    pseudoClasses: {
        unknown: 'reject',
        definitions: {
            NoArgument: ['hover', 'focus', 'first-child'],
            String: ['lang']
        }
    }
});
var selectors3SyntaxDefinition = (0, exports.extendSyntaxDefinition)(css2SyntaxDefinition, {
    namespace: {
        wildcard: true
    },
    combinators: ['~'],
    attributes: {
        operators: ['^=', '$=', '*=']
    },
    pseudoElements: {
        notation: 'both'
    },
    pseudoClasses: {
        definitions: {
            NoArgument: [
                'root',
                'last-child',
                'first-of-type',
                'last-of-type',
                'only-child',
                'only-of-type',
                'empty',
                'target',
                'enabled',
                'disabled',
                'checked',
                'indeterminate'
            ],
            Formula: ['nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type'],
            Selector: ['not']
        }
    }
});
var selectors4SyntaxDefinition = (0, exports.extendSyntaxDefinition)(selectors3SyntaxDefinition, {
    combinators: ['||'],
    attributes: {
        caseSensitivityModifiers: ['i', 'I', 's', 'S']
    },
    pseudoClasses: {
        definitions: {
            NoArgument: [
                'any-link',
                'local-link',
                'target-within',
                'scope',
                'current',
                'past',
                'future',
                'focus-within',
                'focus-visible',
                'read-write',
                'read-only',
                'placeholder-shown',
                'default',
                'valid',
                'invalid',
                'in-range',
                'out-of-range',
                'required',
                'optional',
                'blank',
                'user-invalid',
                'playing',
                'paused',
                'autofill',
                'modal',
                'fullscreen',
                'picture-in-picture',
                'defined',
                'loading',
                'popover-open'
            ],
            Formula: ['nth-col', 'nth-last-col'],
            String: ['dir'],
            FormulaOfSelector: ['nth-child', 'nth-last-child'],
            Selector: ['current', 'is', 'where', 'has', 'state']
        }
    },
    pseudoElements: {
        definitions: {
            NoArgument: ['marker']
        }
    }
});
/**
 * CSS Modules with their syntax definitions.
 * These can be used to extend the parser with specific CSS modules.
 *
 * @example
 * // Using the css-position-3 module
 * createParser({ modules: ['css-position-3'] })
 */
exports.cssModules = {
    'css-position-1': {
        latest: false,
        pseudoClasses: {
            definitions: {
                NoArgument: ['static', 'relative', 'absolute']
            }
        }
    },
    'css-position-2': {
        latest: false,
        pseudoClasses: {
            definitions: {
                NoArgument: ['static', 'relative', 'absolute', 'fixed']
            }
        }
    },
    'css-position-3': {
        latest: false,
        pseudoClasses: {
            definitions: {
                NoArgument: ['sticky', 'fixed', 'absolute', 'relative', 'static']
            }
        }
    },
    'css-position-4': {
        latest: true,
        pseudoClasses: {
            definitions: {
                NoArgument: ['sticky', 'fixed', 'absolute', 'relative', 'static', 'initial']
            }
        }
    },
    'css-scoping-1': {
        latest: true,
        pseudoClasses: {
            definitions: {
                NoArgument: ['host', 'host-context'],
                Selector: ['host', 'host-context']
            }
        },
        pseudoElements: {
            definitions: {
                Selector: ['slotted']
            }
        }
    },
    'css-pseudo-4': {
        latest: true,
        pseudoElements: {
            definitions: {
                NoArgument: [
                    'marker',
                    'selection',
                    'target-text',
                    'search-text',
                    'spelling-error',
                    'grammar-error',
                    'backdrop',
                    'file-selector-button',
                    'prefix',
                    'postfix',
                    'placeholder',
                    'details-content'
                ],
                String: ['highlight']
            }
        }
    },
    'css-shadow-parts-1': {
        latest: true,
        pseudoElements: {
            definitions: {
                String: ['part']
            }
        }
    }
};
var latestSyntaxDefinition = __assign(__assign({}, selectors4SyntaxDefinition), { modules: Object.entries(exports.cssModules)
        .filter(function (_a) {
        var latest = _a[1].latest;
        return latest;
    })
        .map(function (_a) {
        var name = _a[0];
        return name;
    }) });
var progressiveSyntaxDefinition = (0, exports.extendSyntaxDefinition)(latestSyntaxDefinition, {
    pseudoElements: {
        unknown: 'accept'
    },
    pseudoClasses: {
        unknown: 'accept'
    },
    attributes: {
        unknownCaseSensitivityModifiers: 'accept'
    }
});
exports.cssSyntaxDefinitions = {
    css1: css1SyntaxDefinition,
    css2: css2SyntaxDefinition,
    css3: selectors3SyntaxDefinition,
    'selectors-3': selectors3SyntaxDefinition,
    'selectors-4': selectors4SyntaxDefinition,
    latest: latestSyntaxDefinition,
    progressive: progressiveSyntaxDefinition
};
/**
 * Builds an index of where each pseudo-class and pseudo-element is defined
 * (in which CSS Level or CSS Module)
 */
function buildPseudoLocationIndex() {
    var index = {
        pseudoClasses: {},
        pseudoElements: {}
    };
    // Add CSS Levels (excluding 'latest' and 'progressive')
    var cssLevels = ['css1', 'css2', 'css3', 'selectors-3', 'selectors-4'];
    for (var _i = 0, cssLevels_1 = cssLevels; _i < cssLevels_1.length; _i++) {
        var level = cssLevels_1[_i];
        var syntax = exports.cssSyntaxDefinitions[level];
        // Process pseudo-classes
        if (syntax.pseudoClasses && typeof syntax.pseudoClasses === 'object') {
            var definitions = syntax.pseudoClasses.definitions;
            if (definitions) {
                for (var _a = 0, _b = Object.entries(definitions); _a < _b.length; _a++) {
                    var _c = _b[_a], names = _c[1];
                    for (var _d = 0, names_1 = names; _d < names_1.length; _d++) {
                        var name_1 = names_1[_d];
                        if (!index.pseudoClasses[name_1]) {
                            index.pseudoClasses[name_1] = [];
                        }
                        if (!index.pseudoClasses[name_1].includes(level)) {
                            index.pseudoClasses[name_1].push(level);
                        }
                    }
                }
            }
        }
        // Process pseudo-elements
        if (syntax.pseudoElements && typeof syntax.pseudoElements === 'object') {
            var definitions = syntax.pseudoElements.definitions;
            if (definitions) {
                if (Array.isArray(definitions)) {
                    for (var _e = 0, definitions_1 = definitions; _e < definitions_1.length; _e++) {
                        var name_2 = definitions_1[_e];
                        if (!index.pseudoElements[name_2]) {
                            index.pseudoElements[name_2] = [];
                        }
                        if (!index.pseudoElements[name_2].includes(level)) {
                            index.pseudoElements[name_2].push(level);
                        }
                    }
                }
                else {
                    for (var _f = 0, _g = Object.values(definitions); _f < _g.length; _f++) {
                        var names = _g[_f];
                        for (var _h = 0, names_2 = names; _h < names_2.length; _h++) {
                            var name_3 = names_2[_h];
                            if (!index.pseudoElements[name_3]) {
                                index.pseudoElements[name_3] = [];
                            }
                            if (!index.pseudoElements[name_3].includes(level)) {
                                index.pseudoElements[name_3].push(level);
                            }
                        }
                    }
                }
            }
        }
    }
    // Add CSS Modules
    for (var _j = 0, _k = Object.entries(exports.cssModules); _j < _k.length; _j++) {
        var _l = _k[_j], moduleName = _l[0], moduleSyntax = _l[1];
        // Process pseudo-classes
        if (moduleSyntax.pseudoClasses && typeof moduleSyntax.pseudoClasses === 'object') {
            var definitions = moduleSyntax.pseudoClasses.definitions;
            if (definitions) {
                for (var _m = 0, _o = Object.values(definitions); _m < _o.length; _m++) {
                    var names = _o[_m];
                    for (var _p = 0, names_3 = names; _p < names_3.length; _p++) {
                        var name_4 = names_3[_p];
                        if (!index.pseudoClasses[name_4]) {
                            index.pseudoClasses[name_4] = [];
                        }
                        if (!index.pseudoClasses[name_4].includes(moduleName)) {
                            index.pseudoClasses[name_4].push(moduleName);
                        }
                    }
                }
            }
        }
        // Process pseudo-elements
        if (moduleSyntax.pseudoElements && typeof moduleSyntax.pseudoElements === 'object') {
            var definitions = moduleSyntax.pseudoElements.definitions;
            if (definitions) {
                if (Array.isArray(definitions)) {
                    for (var _q = 0, definitions_2 = definitions; _q < definitions_2.length; _q++) {
                        var name_5 = definitions_2[_q];
                        if (!index.pseudoElements[name_5]) {
                            index.pseudoElements[name_5] = [];
                        }
                        if (!index.pseudoElements[name_5].includes(moduleName)) {
                            index.pseudoElements[name_5].push(moduleName);
                        }
                    }
                }
                else {
                    for (var _r = 0, _s = Object.values(definitions); _r < _s.length; _r++) {
                        var names = _s[_r];
                        for (var _t = 0, names_4 = names; _t < names_4.length; _t++) {
                            var name_6 = names_4[_t];
                            if (!index.pseudoElements[name_6]) {
                                index.pseudoElements[name_6] = [];
                            }
                            if (!index.pseudoElements[name_6].includes(moduleName)) {
                                index.pseudoElements[name_6].push(moduleName);
                            }
                        }
                    }
                }
            }
        }
    }
    return index;
}
exports.buildPseudoLocationIndex = buildPseudoLocationIndex;
// Pre-build the index for faster lookup
exports.pseudoLocationIndex = buildPseudoLocationIndex();
