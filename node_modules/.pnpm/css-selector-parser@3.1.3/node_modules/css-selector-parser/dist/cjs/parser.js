"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParser = void 0;
var indexes_js_1 = require("./indexes.js");
var pseudo_signatures_js_1 = require("./pseudo-signatures.js");
var syntax_definitions_js_1 = require("./syntax-definitions.js");
var utils_js_1 = require("./utils.js");
var errorPrefix = "css-selector-parser parse error: ";
/**
 * Creates a parse function to be used later to parse CSS selectors.
 */
function createParser(options) {
    if (options === void 0) { options = {}; }
    var _a = options.syntax, syntax = _a === void 0 ? 'latest' : _a, substitutes = options.substitutes, _b = options.strict, strict = _b === void 0 ? true : _b, modules = options.modules;
    var syntaxDefinition = typeof syntax === 'object' ? syntax : syntax_definitions_js_1.cssSyntaxDefinitions[syntax];
    if (syntaxDefinition.baseSyntax) {
        syntaxDefinition = (0, syntax_definitions_js_1.extendSyntaxDefinition)(syntax_definitions_js_1.cssSyntaxDefinitions[syntaxDefinition.baseSyntax], syntaxDefinition);
    }
    // Apply modules from syntax definition
    if (syntaxDefinition.modules && syntaxDefinition.modules.length > 0) {
        for (var _i = 0, _c = syntaxDefinition.modules; _i < _c.length; _i++) {
            var module_1 = _c[_i];
            var moduleSyntax = syntax_definitions_js_1.cssModules[module_1];
            if (moduleSyntax) {
                syntaxDefinition = (0, syntax_definitions_js_1.extendSyntaxDefinition)(moduleSyntax, syntaxDefinition);
            }
        }
    }
    // Apply additional modules if specified from options
    if (modules && modules.length > 0) {
        for (var _d = 0, modules_1 = modules; _d < modules_1.length; _d++) {
            var module_2 = modules_1[_d];
            var moduleSyntax = syntax_definitions_js_1.cssModules[module_2];
            if (moduleSyntax) {
                syntaxDefinition = (0, syntax_definitions_js_1.extendSyntaxDefinition)(moduleSyntax, syntaxDefinition);
            }
        }
    }
    var _e = syntaxDefinition.tag
        ? [true, Boolean((0, syntax_definitions_js_1.getXmlOptions)(syntaxDefinition.tag).wildcard)]
        : [false, false], tagNameEnabled = _e[0], tagNameWildcardEnabled = _e[1];
    var idEnabled = Boolean(syntaxDefinition.ids);
    var classNamesEnabled = Boolean(syntaxDefinition.classNames);
    var namespaceEnabled = Boolean(syntaxDefinition.namespace);
    var namespaceWildcardEnabled = syntaxDefinition.namespace &&
        (syntaxDefinition.namespace === true || syntaxDefinition.namespace.wildcard === true);
    if (namespaceEnabled && !tagNameEnabled) {
        throw new Error("".concat(errorPrefix, "Namespaces cannot be enabled while tags are disabled."));
    }
    var substitutesEnabled = Boolean(substitutes);
    var combinatorsIndex = syntaxDefinition.combinators
        ? (0, indexes_js_1.createMulticharIndex)(syntaxDefinition.combinators)
        : indexes_js_1.emptyMulticharIndex;
    var _f = syntaxDefinition.attributes
        ? [
            true,
            syntaxDefinition.attributes.operators
                ? (0, indexes_js_1.createMulticharIndex)(syntaxDefinition.attributes.operators)
                : indexes_js_1.emptyMulticharIndex,
            syntaxDefinition.attributes.caseSensitivityModifiers
                ? (0, indexes_js_1.createRegularIndex)(syntaxDefinition.attributes.caseSensitivityModifiers)
                : indexes_js_1.emptyRegularIndex,
            syntaxDefinition.attributes.unknownCaseSensitivityModifiers === 'accept'
        ]
        : [false, indexes_js_1.emptyMulticharIndex, indexes_js_1.emptyRegularIndex, false], attributesEnabled = _f[0], attributesOperatorsIndex = _f[1], attributesCaseSensitivityModifiers = _f[2], attributesAcceptUnknownCaseSensitivityModifiers = _f[3];
    var attributesCaseSensitivityModifiersEnabled = attributesAcceptUnknownCaseSensitivityModifiers || Object.keys(attributesCaseSensitivityModifiers).length > 0;
    var _g = syntaxDefinition.pseudoClasses
        ? [
            true,
            syntaxDefinition.pseudoClasses.definitions
                ? (0, pseudo_signatures_js_1.calculatePseudoSignatures)(syntaxDefinition.pseudoClasses.definitions)
                : pseudo_signatures_js_1.emptyPseudoSignatures,
            syntaxDefinition.pseudoClasses.unknown === 'accept'
        ]
        : [false, pseudo_signatures_js_1.emptyPseudoSignatures, false], pseudoClassesEnabled = _g[0], pseudoClassesDefinitions = _g[1], pseudoClassesAcceptUnknown = _g[2];
    var _h = syntaxDefinition.pseudoElements
        ? [
            true,
            syntaxDefinition.pseudoElements.notation === 'singleColon' ||
                syntaxDefinition.pseudoElements.notation === 'both',
            !syntaxDefinition.pseudoElements.notation ||
                syntaxDefinition.pseudoElements.notation === 'doubleColon' ||
                syntaxDefinition.pseudoElements.notation === 'both',
            syntaxDefinition.pseudoElements.definitions
                ? (0, pseudo_signatures_js_1.calculatePseudoSignatures)(Array.isArray(syntaxDefinition.pseudoElements.definitions)
                    ? { NoArgument: syntaxDefinition.pseudoElements.definitions }
                    : syntaxDefinition.pseudoElements.definitions)
                : pseudo_signatures_js_1.emptyPseudoSignatures,
            syntaxDefinition.pseudoElements.unknown === 'accept'
        ]
        : [false, false, false, pseudo_signatures_js_1.emptyPseudoSignatures, false], pseudoElementsEnabled = _h[0], pseudoElementsSingleColonNotationEnabled = _h[1], pseudoElementsDoubleColonNotationEnabled = _h[2], pseudoElementsDefinitions = _h[3], pseudoElementsAcceptUnknown = _h[4];
    var str = '';
    var l = str.length;
    var pos = 0;
    var chr = '';
    var is = function (comparison) { return chr === comparison; };
    var isTagStart = function () { return is('*') || (0, utils_js_1.isIdentStart)(chr); };
    var rewind = function (newPos) {
        pos = newPos;
        chr = str.charAt(pos);
    };
    var next = function () {
        pos++;
        chr = str.charAt(pos);
    };
    var readAndNext = function () {
        var current = chr;
        pos++;
        chr = str.charAt(pos);
        return current;
    };
    /** @throws ParserError */
    function fail(errorMessage) {
        var position = Math.min(l - 1, pos);
        var error = new Error("".concat(errorPrefix).concat(errorMessage, " Pos: ").concat(position, "."));
        error.position = position;
        error.name = 'ParserError';
        throw error;
    }
    function assert(condition, errorMessage) {
        if (!condition) {
            return fail(errorMessage);
        }
    }
    var assertNonEof = function () {
        assert(pos < l, 'Unexpected end of input.');
    };
    var isEof = function () { return pos >= l; };
    var pass = function (character) {
        assert(pos < l, "Expected \"".concat(character, "\" but end of input reached."));
        assert(chr === character, "Expected \"".concat(character, "\" but \"").concat(chr, "\" found."));
        pos++;
        chr = str.charAt(pos);
    };
    function matchMulticharIndex(index) {
        var match = matchMulticharIndexPos(index, pos);
        if (match) {
            pos += match.length;
            chr = str.charAt(pos);
            return match;
        }
    }
    function matchMulticharIndexPos(index, subPos) {
        var char = str.charAt(subPos);
        var charIndex = index[char];
        if (charIndex) {
            var subMatch = matchMulticharIndexPos(charIndex.chars, subPos + 1);
            if (subMatch) {
                return subMatch;
            }
            if (charIndex.self) {
                return charIndex.self;
            }
        }
    }
    /**
     * @see https://www.w3.org/TR/css-syntax/#hex-digit-diagram
     */
    function parseHex() {
        var hex = readAndNext();
        var count = 1;
        while ((0, utils_js_1.isHex)(chr) && count < utils_js_1.maxHexLength) {
            hex += readAndNext();
            count++;
        }
        skipSingleWhitespace();
        return String.fromCharCode(parseInt(hex, 16));
    }
    /**
     * @see https://www.w3.org/TR/css-syntax/#string-token-diagram
     */
    function parseString(quote) {
        var result = '';
        pass(quote);
        while (pos < l) {
            if (is(quote)) {
                next();
                return result;
            }
            else if (is('\\')) {
                next();
                if (is(quote)) {
                    result += quote;
                    next();
                }
                else if (chr === '\n' || chr === '\f') {
                    next();
                }
                else if (chr === '\r') {
                    next();
                    if (is('\n')) {
                        next();
                    }
                }
                else if ((0, utils_js_1.isHex)(chr)) {
                    result += parseHex();
                }
                else {
                    result += chr;
                    next();
                }
            }
            else {
                result += chr;
                next();
            }
        }
        return result;
    }
    /**
     * @see https://www.w3.org/TR/css-syntax/#ident-token-diagram
     */
    function parseIdentifier() {
        if (!(0, utils_js_1.isIdentStart)(chr)) {
            return null;
        }
        var result = '';
        while (is('-')) {
            result += chr;
            next();
        }
        if (result === '-' && !(0, utils_js_1.isIdent)(chr) && !is('\\')) {
            fail('Identifiers cannot consist of a single hyphen.');
        }
        if (strict && result.length >= 2) {
            // Checking this only for strict mode since browsers work fine with these identifiers.
            fail('Identifiers cannot start with two hyphens with strict mode on.');
        }
        if (utils_js_1.digitsChars[chr]) {
            fail('Identifiers cannot start with hyphens followed by digits.');
        }
        while (pos < l) {
            if ((0, utils_js_1.isIdent)(chr)) {
                result += readAndNext();
            }
            else if (is('\\')) {
                next();
                assertNonEof();
                if ((0, utils_js_1.isHex)(chr)) {
                    result += parseHex();
                }
                else {
                    result += readAndNext();
                }
            }
            else {
                break;
            }
        }
        return result;
    }
    function parsePseudoClassString() {
        var result = '';
        while (pos < l) {
            if (is(')')) {
                break;
            }
            else if (is('\\')) {
                next();
                if (isEof() && !strict) {
                    return (result + '\\').trim();
                }
                assertNonEof();
                if ((0, utils_js_1.isHex)(chr)) {
                    result += parseHex();
                }
                else {
                    result += readAndNext();
                }
            }
            else {
                result += readAndNext();
            }
        }
        return result.trim();
    }
    function skipSingleWhitespace() {
        if (chr === ' ' || chr === '\t' || chr === '\f' || chr === '\n') {
            next();
            return;
        }
        if (chr === '\r') {
            next();
        }
        if (chr === '\n') {
            next();
        }
    }
    function skipWhitespace() {
        while (utils_js_1.whitespaceChars[chr]) {
            next();
        }
    }
    function parseSelector(relative) {
        if (relative === void 0) { relative = false; }
        skipWhitespace();
        var rules = [parseRule(relative)];
        while (is(',')) {
            next();
            skipWhitespace();
            rules.push(parseRule(relative));
        }
        return {
            type: 'Selector',
            rules: rules
        };
    }
    function parseAttribute() {
        pass('[');
        skipWhitespace();
        var attr;
        if (is('|')) {
            assert(namespaceEnabled, 'Namespaces are not enabled.');
            next();
            var name_1 = parseIdentifier();
            assert(name_1, 'Expected attribute name.');
            attr = {
                type: 'Attribute',
                name: name_1,
                namespace: { type: 'NoNamespace' }
            };
        }
        else if (is('*')) {
            assert(namespaceEnabled, 'Namespaces are not enabled.');
            assert(namespaceWildcardEnabled, 'Wildcard namespace is not enabled.');
            next();
            pass('|');
            var name_2 = parseIdentifier();
            assert(name_2, 'Expected attribute name.');
            attr = {
                type: 'Attribute',
                name: name_2,
                namespace: { type: 'WildcardNamespace' }
            };
        }
        else {
            var identifier = parseIdentifier();
            assert(identifier, 'Expected attribute name.');
            attr = {
                type: 'Attribute',
                name: identifier
            };
            if (is('|')) {
                var savedPos = pos;
                next();
                if ((0, utils_js_1.isIdentStart)(chr)) {
                    assert(namespaceEnabled, 'Namespaces are not enabled.');
                    var name_3 = parseIdentifier();
                    assert(name_3, 'Expected attribute name.');
                    attr = {
                        type: 'Attribute',
                        name: name_3,
                        namespace: { type: 'NamespaceName', name: identifier }
                    };
                }
                else {
                    rewind(savedPos);
                }
            }
        }
        assert(attr.name, 'Expected attribute name.');
        skipWhitespace();
        if (isEof() && !strict) {
            return attr;
        }
        if (is(']')) {
            next();
        }
        else {
            attr.operator = matchMulticharIndex(attributesOperatorsIndex);
            assert(attr.operator, 'Expected a valid attribute selector operator.');
            skipWhitespace();
            assertNonEof();
            if (utils_js_1.quoteChars[chr]) {
                attr.value = {
                    type: 'String',
                    value: parseString(chr)
                };
            }
            else if (substitutesEnabled && is('$')) {
                next();
                var name_4 = parseIdentifier();
                assert(name_4, 'Expected substitute name.');
                attr.value = {
                    type: 'Substitution',
                    name: name_4
                };
            }
            else {
                var value = parseIdentifier();
                assert(value, 'Expected attribute value.');
                attr.value = {
                    type: 'String',
                    value: value
                };
            }
            skipWhitespace();
            if (isEof() && !strict) {
                return attr;
            }
            if (!is(']')) {
                var caseSensitivityModifier = parseIdentifier();
                assert(caseSensitivityModifier, 'Expected end of attribute selector.');
                attr.caseSensitivityModifier = caseSensitivityModifier;
                assert(attributesCaseSensitivityModifiersEnabled, 'Attribute case sensitivity modifiers are not enabled.');
                assert(attributesAcceptUnknownCaseSensitivityModifiers ||
                    attributesCaseSensitivityModifiers[attr.caseSensitivityModifier], 'Unknown attribute case sensitivity modifier.');
                skipWhitespace();
                if (isEof() && !strict) {
                    return attr;
                }
            }
            pass(']');
        }
        return attr;
    }
    function parseNumber() {
        var result = '';
        while (utils_js_1.digitsChars[chr]) {
            result += readAndNext();
        }
        assert(result !== '', 'Formula parse error.');
        return parseInt(result);
    }
    var isNumberStart = function () { return is('-') || is('+') || utils_js_1.digitsChars[chr]; };
    function parseFormula() {
        if (is('e') || is('o')) {
            var ident = parseIdentifier();
            if (ident === 'even') {
                skipWhitespace();
                return [2, 0];
            }
            if (ident === 'odd') {
                skipWhitespace();
                return [2, 1];
            }
        }
        var firstNumber = null;
        var firstNumberMultiplier = 1;
        if (is('-')) {
            next();
            firstNumberMultiplier = -1;
        }
        if (isNumberStart()) {
            if (is('+')) {
                next();
            }
            firstNumber = parseNumber();
            if (!is('\\') && !is('n')) {
                return [0, firstNumber * firstNumberMultiplier];
            }
        }
        if (firstNumber === null) {
            firstNumber = 1;
        }
        firstNumber *= firstNumberMultiplier;
        var identifier;
        if (is('\\')) {
            next();
            if ((0, utils_js_1.isHex)(chr)) {
                identifier = parseHex();
            }
            else {
                identifier = readAndNext();
            }
        }
        else {
            identifier = readAndNext();
        }
        assert(identifier === 'n', 'Formula parse error: expected "n".');
        skipWhitespace();
        if (is('+') || is('-')) {
            var sign = is('+') ? 1 : -1;
            next();
            skipWhitespace();
            return [firstNumber, sign * parseNumber()];
        }
        else {
            return [firstNumber, 0];
        }
    }
    function parsePseudoArgument(pseudoName, type, signature) {
        var argument;
        if (is('(')) {
            next();
            skipWhitespace();
            if (substitutesEnabled && is('$')) {
                next();
                var name_5 = parseIdentifier();
                assert(name_5, 'Expected substitute name.');
                argument = {
                    type: 'Substitution',
                    name: name_5
                };
            }
            else if (signature.type === 'String') {
                argument = {
                    type: 'String',
                    value: parsePseudoClassString()
                };
                assert(argument.value, "Expected ".concat(type, " argument value."));
            }
            else if (signature.type === 'Selector') {
                argument = parseSelector(true);
            }
            else if (signature.type === 'Formula') {
                var _a = parseFormula(), a = _a[0], b = _a[1];
                argument = {
                    type: 'Formula',
                    a: a,
                    b: b
                };
                if (signature.ofSelector) {
                    skipWhitespace();
                    if (is('o') || is('\\')) {
                        var ident = parseIdentifier();
                        assert(ident === 'of', 'Formula of selector parse error.');
                        skipWhitespace();
                        argument = {
                            type: 'FormulaOfSelector',
                            a: a,
                            b: b,
                            selector: parseRule()
                        };
                    }
                }
            }
            else {
                return fail("Invalid ".concat(type, " signature."));
            }
            skipWhitespace();
            if (isEof() && !strict) {
                return argument;
            }
            pass(')');
        }
        else {
            assert(signature.optional, "Argument is required for ".concat(type, " \"").concat(pseudoName, "\"."));
        }
        return argument;
    }
    function parseTagName() {
        if (is('*')) {
            assert(tagNameWildcardEnabled, 'Wildcard tag name is not enabled.');
            next();
            return { type: 'WildcardTag' };
        }
        else if ((0, utils_js_1.isIdentStart)(chr)) {
            assert(tagNameEnabled, 'Tag names are not enabled.');
            var name_6 = parseIdentifier();
            assert(name_6, 'Expected tag name.');
            return {
                type: 'TagName',
                name: name_6
            };
        }
        else {
            return fail('Expected tag name.');
        }
    }
    function parseTagNameWithNamespace() {
        if (is('*')) {
            var savedPos = pos;
            next();
            if (!is('|')) {
                rewind(savedPos);
                return parseTagName();
            }
            next();
            if (!isTagStart()) {
                rewind(savedPos);
                return parseTagName();
            }
            assert(namespaceEnabled, 'Namespaces are not enabled.');
            assert(namespaceWildcardEnabled, 'Wildcard namespace is not enabled.');
            var tagName = parseTagName();
            tagName.namespace = { type: 'WildcardNamespace' };
            return tagName;
        }
        else if (is('|')) {
            assert(namespaceEnabled, 'Namespaces are not enabled.');
            next();
            var tagName = parseTagName();
            tagName.namespace = { type: 'NoNamespace' };
            return tagName;
        }
        else if ((0, utils_js_1.isIdentStart)(chr)) {
            var identifier = parseIdentifier();
            assert(identifier, 'Expected tag name.');
            if (!is('|')) {
                assert(tagNameEnabled, 'Tag names are not enabled.');
                return {
                    type: 'TagName',
                    name: identifier
                };
            }
            var savedPos = pos;
            next();
            if (!isTagStart()) {
                rewind(savedPos);
                return {
                    type: 'TagName',
                    name: identifier
                };
            }
            assert(namespaceEnabled, 'Namespaces are not enabled.');
            var tagName = parseTagName();
            tagName.namespace = { type: 'NamespaceName', name: identifier };
            return tagName;
        }
        else {
            return fail('Expected tag name.');
        }
    }
    function parseRule(relative) {
        var _a, _b;
        if (relative === void 0) { relative = false; }
        var rule = { type: 'Rule', items: [] };
        if (relative) {
            var combinator = matchMulticharIndex(combinatorsIndex);
            if (combinator) {
                rule.combinator = combinator;
                skipWhitespace();
            }
        }
        while (pos < l) {
            if (isTagStart()) {
                assert(rule.items.length === 0, 'Unexpected tag/namespace start.');
                rule.items.push(parseTagNameWithNamespace());
            }
            else if (is('|')) {
                var savedPos = pos;
                next();
                if (isTagStart()) {
                    assert(rule.items.length === 0, 'Unexpected tag/namespace start.');
                    rewind(savedPos);
                    rule.items.push(parseTagNameWithNamespace());
                }
                else {
                    rewind(savedPos);
                    break;
                }
            }
            else if (is('.')) {
                assert(classNamesEnabled, 'Class names are not enabled.');
                next();
                var className = parseIdentifier();
                assert(className, 'Expected class name.');
                rule.items.push({ type: 'ClassName', name: className });
            }
            else if (is('#')) {
                assert(idEnabled, 'IDs are not enabled.');
                next();
                var idName = parseIdentifier();
                assert(idName, 'Expected ID name.');
                rule.items.push({ type: 'Id', name: idName });
            }
            else if (is('[')) {
                assert(attributesEnabled, 'Attributes are not enabled.');
                rule.items.push(parseAttribute());
            }
            else if (is(':')) {
                var isDoubleColon = false;
                var isPseudoElement = false;
                next();
                if (is(':')) {
                    assert(pseudoElementsEnabled, 'Pseudo elements are not enabled.');
                    assert(pseudoElementsDoubleColonNotationEnabled, 'Pseudo elements double colon notation is not enabled.');
                    isDoubleColon = true;
                    next();
                }
                var pseudoName = parseIdentifier();
                assert(isDoubleColon || pseudoName, 'Expected pseudo-class name.');
                assert(!isDoubleColon || pseudoName, 'Expected pseudo-element name.');
                assert(pseudoName, 'Expected pseudo-class name.');
                if (!isDoubleColon ||
                    pseudoElementsAcceptUnknown ||
                    Object.prototype.hasOwnProperty.call(pseudoElementsDefinitions, pseudoName)) {
                    // All good
                }
                else {
                    // Generate a helpful error message with location information
                    var locations = syntax_definitions_js_1.pseudoLocationIndex.pseudoElements[pseudoName];
                    var errorMessage = "Unknown pseudo-element \"".concat(pseudoName, "\"");
                    if (locations && locations.length > 0) {
                        errorMessage += ". It is defined in: ".concat(locations.join(', '));
                    }
                    fail(errorMessage + '.');
                }
                isPseudoElement =
                    pseudoElementsEnabled &&
                        (isDoubleColon ||
                            (!isDoubleColon &&
                                pseudoElementsSingleColonNotationEnabled &&
                                Object.prototype.hasOwnProperty.call(pseudoElementsDefinitions, pseudoName)));
                if (isPseudoElement) {
                    var signature = (_a = pseudoElementsDefinitions[pseudoName]) !== null && _a !== void 0 ? _a : (pseudoElementsAcceptUnknown && pseudo_signatures_js_1.defaultPseudoSignature);
                    var pseudoElement = {
                        type: 'PseudoElement',
                        name: pseudoName
                    };
                    var argument = parsePseudoArgument(pseudoName, 'pseudo-element', signature);
                    if (argument) {
                        assert(argument.type !== 'Formula' && argument.type !== 'FormulaOfSelector', 'Pseudo-elements cannot have formula argument.');
                        pseudoElement.argument = argument;
                    }
                    rule.items.push(pseudoElement);
                }
                else {
                    assert(pseudoClassesEnabled, 'Pseudo-classes are not enabled.');
                    var signature = (_b = pseudoClassesDefinitions[pseudoName]) !== null && _b !== void 0 ? _b : (pseudoClassesAcceptUnknown && pseudo_signatures_js_1.defaultPseudoSignature);
                    if (signature) {
                        // All good
                    }
                    else {
                        // Generate a helpful error message with location information
                        var locations = syntax_definitions_js_1.pseudoLocationIndex.pseudoClasses[pseudoName];
                        var errorMessage = "Unknown pseudo-class: \"".concat(pseudoName, "\"");
                        if (locations && locations.length > 0) {
                            errorMessage += ". It is defined in: ".concat(locations.join(', '));
                        }
                        fail(errorMessage + '.');
                    }
                    var argument = parsePseudoArgument(pseudoName, 'pseudo-class', signature);
                    var pseudoClass = {
                        type: 'PseudoClass',
                        name: pseudoName
                    };
                    if (argument) {
                        pseudoClass.argument = argument;
                    }
                    rule.items.push(pseudoClass);
                }
            }
            else {
                break;
            }
        }
        if (rule.items.length === 0) {
            if (isEof()) {
                return fail('Expected rule but end of input reached.');
            }
            else {
                return fail("Expected rule but \"".concat(chr, "\" found."));
            }
        }
        skipWhitespace();
        if (!isEof() && !is(',') && !is(')')) {
            var combinator = matchMulticharIndex(combinatorsIndex);
            skipWhitespace();
            rule.nestedRule = parseRule();
            rule.nestedRule.combinator = combinator;
        }
        return rule;
    }
    return function (input) {
        // noinspection SuspiciousTypeOfGuard
        if (typeof input !== 'string') {
            throw new Error("".concat(errorPrefix, "Expected string input."));
        }
        str = input;
        l = str.length;
        pos = 0;
        chr = str.charAt(0);
        return parseSelector();
    };
}
exports.createParser = createParser;
