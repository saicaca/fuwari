"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormatCodeSettings = getFormatCodeSettings;
const shared_1 = require("../shared");
async function getFormatCodeSettings(ctx, document, options) {
    const config = await ctx.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.format') ?? {};
    return {
        convertTabsToSpaces: options?.insertSpaces,
        tabSize: options?.tabSize,
        indentSize: options?.tabSize,
        indentStyle: 2,
        newLineCharacter: '\n',
        insertSpaceAfterCommaDelimiter: config.insertSpaceAfterCommaDelimiter ?? true,
        insertSpaceAfterConstructor: config.insertSpaceAfterConstructor ?? false,
        insertSpaceAfterSemicolonInForStatements: config.insertSpaceAfterSemicolonInForStatements ?? true,
        insertSpaceBeforeAndAfterBinaryOperators: config.insertSpaceBeforeAndAfterBinaryOperators ?? true,
        insertSpaceAfterKeywordsInControlFlowStatements: config.insertSpaceAfterKeywordsInControlFlowStatements ?? true,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: config.insertSpaceAfterFunctionKeywordForAnonymousFunctions ?? true,
        insertSpaceBeforeFunctionParenthesis: config.insertSpaceBeforeFunctionParenthesis ?? false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis ?? false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets ?? false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces ?? true,
        insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: config.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces ?? true,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces ?? false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: config.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces ?? false,
        insertSpaceAfterTypeAssertion: config.insertSpaceAfterTypeAssertion ?? false,
        placeOpenBraceOnNewLineForFunctions: config.placeOpenBraceOnNewLineForFunctions ?? false,
        placeOpenBraceOnNewLineForControlBlocks: config.placeOpenBraceOnNewLineForControlBlocks ?? false,
        semicolons: config.semicolons ?? 'ignore',
    };
}
//# sourceMappingURL=getFormatCodeSettings.js.map