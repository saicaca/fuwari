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
function astMethods(type) {
    return function (generatorName, checkerName) {
        var _a;
        return (_a = {},
            _a[generatorName] = function (props) { return (__assign({ type: type }, props)); },
            _a[checkerName] = function (entity) {
                return typeof entity === 'object' && entity !== null && entity.type === type;
            },
            _a);
    };
}
/**
 * AST structure generators and matchers.
 * For instance, `ast.selector({rules: [...]})` creates AstSelector and `ast.isSelector(...)` checks if
 * AstSelector was specified.
 *
 * @example
 *
 * // Represents CSS selector: ns|div#user-34.user.user-active[role="button"]:lang(en)::before > *
 * const selector = ast.selector({
 *     rules: [
 *         ast.rule({
 *             items: [
 *                 ast.tagName({name: 'div', namespace: ast.namespaceName({name: 'ns'})}),
 *                 ast.id({name: 'user-34'}),
 *                 ast.className({name: 'user'}),
 *                 ast.className({name: 'user-active'}),
 *                 ast.attribute({
 *                     name: 'role',
 *                     operator: '=',
 *                     value: ast.string({value: 'button'})
 *                 }),
 *                 ast.pseudoClass({
 *                     name: 'lang',
 *                     argument: ast.string({value: 'en'})
 *                 }),
 *                 ast.pseudoElement({name: 'before'})
 *             ],
 *             nestedRule: ast.rule({combinator: '>', items: [ast.wildcardTag()]})
 *         })
 *     ]
 * });
 * console.log(ast.isSelector(selector)); // prints true
 * console.log(ast.isRule(selector)); // prints false
 */
export var ast = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, astMethods('Selector')('selector', 'isSelector')), astMethods('Rule')('rule', 'isRule')), astMethods('TagName')('tagName', 'isTagName')), astMethods('Id')('id', 'isId')), astMethods('ClassName')('className', 'isClassName')), astMethods('WildcardTag')('wildcardTag', 'isWildcardTag')), astMethods('NamespaceName')('namespaceName', 'isNamespaceName')), astMethods('WildcardNamespace')('wildcardNamespace', 'isWildcardNamespace')), astMethods('NoNamespace')('noNamespace', 'isNoNamespace')), astMethods('Attribute')('attribute', 'isAttribute')), astMethods('PseudoClass')('pseudoClass', 'isPseudoClass')), astMethods('PseudoElement')('pseudoElement', 'isPseudoElement')), astMethods('String')('string', 'isString')), astMethods('Formula')('formula', 'isFormula')), astMethods('FormulaOfSelector')('formulaOfSelector', 'isFormulaOfSelector')), astMethods('Substitution')('substitution', 'isSubstitution'));
