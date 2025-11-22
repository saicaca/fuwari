import { escapeIdentifier, escapeString } from './utils.js';
var errorPrefix = "css-selector-parser render error: ";
function renderNamespace(namespace) {
    if (namespace.type === 'WildcardNamespace') {
        return '*|';
    }
    else if (namespace.type === 'NamespaceName') {
        return "".concat(escapeIdentifier(namespace.name), "|");
    }
    else if (namespace.type === 'NoNamespace') {
        return '|';
    }
    throw new Error("".concat(errorPrefix, "Unknown namespace type: ").concat(namespace.type, "."));
}
function renderSubstitution(sub) {
    return "$".concat(escapeIdentifier(sub.name));
}
function renderFormula(a, b) {
    if (a) {
        var result = "".concat(a === 1 ? '' : a === -1 ? '-' : a, "n");
        if (b) {
            result += "".concat(b > 0 ? '+' : '').concat(b);
        }
        return result;
    }
    else {
        return String(b);
    }
}
/**
 * Renders CSS Selector AST back to a string.
 *
 * @example
 *
 * import {ast, render} from 'css-selector-parser';
 *
 * const selector = ast.selector({
 *     rules: [
 *         ast.rule({
 *             items: [
 *                 ast.tagName({name: 'a'}),
 *                 ast.id({name: 'user-23'}),
 *                 ast.className({name: 'user'}),
 *                 ast.pseudoClass({name: 'visited'}),
 *                 ast.pseudoElement({name: 'before'})
 *             ]
 *         })
 *     ]
 * });
 *
 * console.log(render(selector)); // a#user-23.user:visited::before
 */
export function render(entity) {
    if (entity.type === 'Selector') {
        return entity.rules.map(render).join(', ');
    }
    if (entity.type === 'Rule') {
        var result = '';
        var items = entity.items, combinator = entity.combinator, nestedRule = entity.nestedRule;
        if (combinator) {
            result += "".concat(combinator, " ");
        }
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            result += render(item);
        }
        if (nestedRule) {
            result += " ".concat(render(nestedRule));
        }
        return result;
    }
    else if (entity.type === 'TagName' || entity.type === 'WildcardTag') {
        var result = '';
        var namespace = entity.namespace;
        if (namespace) {
            result += renderNamespace(namespace);
        }
        if (entity.type === 'TagName') {
            result += escapeIdentifier(entity.name);
        }
        else if (entity.type === 'WildcardTag') {
            result += '*';
        }
        return result;
    }
    else if (entity.type === 'Id') {
        return "#".concat(escapeIdentifier(entity.name));
    }
    else if (entity.type === 'ClassName') {
        return ".".concat(escapeIdentifier(entity.name));
    }
    else if (entity.type === 'Attribute') {
        var name_1 = entity.name, namespace = entity.namespace, operator = entity.operator, value = entity.value, caseSensitivityModifier = entity.caseSensitivityModifier;
        var result = '[';
        if (namespace) {
            result += renderNamespace(namespace);
        }
        result += escapeIdentifier(name_1);
        if (operator && value) {
            result += operator;
            if (value.type === 'String') {
                result += escapeString(value.value);
            }
            else if (value.type === 'Substitution') {
                result += renderSubstitution(value);
            }
            else {
                throw new Error("Unknown attribute value type: ".concat(value.type, "."));
            }
            if (caseSensitivityModifier) {
                result += " ".concat(escapeIdentifier(caseSensitivityModifier));
            }
        }
        result += ']';
        return result;
    }
    else if (entity.type === 'PseudoClass') {
        var name_2 = entity.name, argument = entity.argument;
        var result = ":".concat(escapeIdentifier(name_2));
        if (argument) {
            result += "(".concat(argument.type === 'String' ? escapeIdentifier(argument.value) : render(argument), ")");
        }
        return result;
    }
    else if (entity.type === 'PseudoElement') {
        var name_3 = entity.name, argument = entity.argument;
        var result = "::".concat(escapeIdentifier(name_3));
        if (argument) {
            result += "(".concat(argument.type === 'String' ? escapeIdentifier(argument.value) : render(argument), ")");
        }
        return result;
    }
    else if (entity.type === 'String') {
        throw new Error("".concat(errorPrefix, "String cannot be rendered outside of context."));
    }
    else if (entity.type === 'Formula') {
        return renderFormula(entity.a, entity.b);
    }
    else if (entity.type === 'FormulaOfSelector') {
        return renderFormula(entity.a, entity.b) + ' of ' + render(entity.selector);
    }
    else if (entity.type === 'Substitution') {
        return "$".concat(escapeIdentifier(entity.name));
    }
    throw new Error("Unknown type specified to render method: ".concat(entity.type, "."));
}
