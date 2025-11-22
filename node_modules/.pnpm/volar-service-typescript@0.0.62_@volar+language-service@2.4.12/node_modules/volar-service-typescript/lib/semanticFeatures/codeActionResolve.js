"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.resolveFixAllCodeAction = resolveFixAllCodeAction;
exports.resolveRefactorCodeAction = resolveRefactorCodeAction;
exports.resolveOrganizeImportsCodeAction = resolveOrganizeImportsCodeAction;
const getFormatCodeSettings_1 = require("../configs/getFormatCodeSettings");
const getUserPreferences_1 = require("../configs/getUserPreferences");
const shared_1 = require("../shared");
const lspConverters_1 = require("../utils/lspConverters");
const vscode_uri_1 = require("vscode-uri");
function register(ctx) {
    return async (codeAction, formattingOptions) => {
        const data = codeAction.data;
        const document = ctx.getTextDocument(vscode_uri_1.URI.parse(data.uri));
        const [formatOptions, preferences] = await Promise.all([
            (0, getFormatCodeSettings_1.getFormatCodeSettings)(ctx, document, formattingOptions),
            (0, getUserPreferences_1.getUserPreferences)(ctx, document),
        ]);
        if (data?.type === 'fixAll') {
            resolveFixAllCodeAction(ctx, codeAction, data, formatOptions, preferences);
        }
        else if (data?.type === 'refactor') {
            resolveRefactorCodeAction(ctx, codeAction, data, document, formatOptions, preferences);
        }
        else if (data?.type === 'organizeImports') {
            resolveOrganizeImportsCodeAction(ctx, codeAction, data, formatOptions, preferences);
        }
        return codeAction;
    };
}
function resolveFixAllCodeAction(ctx, codeAction, data, formatOptions, preferences) {
    const fixes = data.fixIds.map(fixId => (0, shared_1.safeCall)(() => ctx.languageService.getCombinedCodeFix({ type: 'file', fileName: data.fileName }, fixId, formatOptions, preferences)));
    const changes = fixes.map(fix => fix?.changes ?? []).flat();
    codeAction.edit = (0, lspConverters_1.convertFileTextChanges)(changes, ctx.fileNameToUri, ctx.getTextDocument);
}
function resolveRefactorCodeAction(ctx, codeAction, data, document, formatOptions, preferences) {
    const editInfo = (0, shared_1.safeCall)(() => ctx.languageService.getEditsForRefactor(data.fileName, formatOptions, data.range, data.refactorName, data.actionName, preferences));
    if (!editInfo) {
        return;
    }
    codeAction.edit = (0, lspConverters_1.convertFileTextChanges)(editInfo.edits, ctx.fileNameToUri, ctx.getTextDocument);
    if (editInfo.renameLocation !== undefined && editInfo.renameFilename !== undefined) {
        codeAction.command = ctx.commands.rename.create(document.uri, document.positionAt(editInfo.renameLocation));
    }
}
function resolveOrganizeImportsCodeAction(ctx, codeAction, data, formatOptions, preferences) {
    const changes = (0, shared_1.safeCall)(() => ctx.languageService.organizeImports({ type: 'file', fileName: data.fileName }, formatOptions, preferences));
    codeAction.edit = (0, lspConverters_1.convertFileTextChanges)(changes ?? [], ctx.fileNameToUri, ctx.getTextDocument);
}
//# sourceMappingURL=codeActionResolve.js.map