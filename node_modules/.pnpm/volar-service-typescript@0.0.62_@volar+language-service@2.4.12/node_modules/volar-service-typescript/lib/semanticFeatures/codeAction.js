"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const getFormatCodeSettings_1 = require("../configs/getFormatCodeSettings");
const getUserPreferences_1 = require("../configs/getUserPreferences");
const shared_1 = require("../shared");
const fixNames = require("../utils/fixNames");
const lspConverters_1 = require("../utils/lspConverters");
const codeActionResolve_1 = require("./codeActionResolve");
const renameCommandRefactors = new Set([
    'refactor.rewrite.property.generateAccessors',
    'refactor.extract.type',
    'refactor.extract.interface',
    'refactor.extract.typedef',
    'refactor.extract.constant',
    'refactor.extract.function',
]);
function register(ctx) {
    let resolveCommandSupport = ctx.env.clientCapabilities?.textDocument?.codeAction?.resolveSupport?.properties?.includes('command');
    let resolveEditSupport = ctx.env.clientCapabilities?.textDocument?.codeAction?.resolveSupport?.properties?.includes('edit');
    let loged = false;
    const wranUnsupportResolve = () => {
        if (loged) {
            return;
        }
        loged = true;
        console.warn('[volar-service-typescript] The language client lacks support for the command/edit properties in the resolve code action. Therefore, the code action resolve is pre-calculated.');
    };
    if (!ctx.env.clientCapabilities) {
        resolveCommandSupport = true;
        resolveEditSupport = true;
    }
    return async (uri, document, range, context, formattingOptions) => {
        const [formatOptions, preferences] = await Promise.all([
            (0, getFormatCodeSettings_1.getFormatCodeSettings)(ctx, document, formattingOptions),
            (0, getUserPreferences_1.getUserPreferences)(ctx, document),
        ]);
        const fileName = ctx.uriToFileName(uri);
        const start = document.offsetAt(range.start);
        const end = document.offsetAt(range.end);
        let result = [];
        const onlyQuickFix = matchOnlyKind(`${'quickfix'}.ts`);
        if (!context.only || onlyQuickFix) {
            for (const error of context.diagnostics) {
                const codeFixes = (0, shared_1.safeCall)(() => ctx.languageService.getCodeFixesAtPosition(fileName, document.offsetAt(error.range.start), document.offsetAt(error.range.end), [Number(error.code)], formatOptions, preferences)) ?? [];
                for (const codeFix of codeFixes) {
                    result = result.concat(convertCodeFixAction(codeFix, [error], onlyQuickFix ?? ''));
                }
            }
        }
        if (context.only) {
            for (const only of context.only) {
                if (only.split('.')[0] === 'refactor') {
                    const refactors = (0, shared_1.safeCall)(() => ctx.languageService.getApplicableRefactors(fileName, { pos: start, end: end }, preferences, undefined, only)) ?? [];
                    for (const refactor of refactors) {
                        result = result.concat(convertApplicableRefactorInfo(refactor));
                    }
                }
            }
        }
        else {
            const refactors = (0, shared_1.safeCall)(() => ctx.languageService.getApplicableRefactors(fileName, { pos: start, end: end }, preferences, undefined, undefined)) ?? [];
            for (const refactor of refactors) {
                result = result.concat(convertApplicableRefactorInfo(refactor));
            }
        }
        const onlySourceOrganizeImports = matchOnlyKind(`${'source.organizeImports'}.ts`);
        if (onlySourceOrganizeImports) {
            const action = {
                title: 'Organize Imports',
                kind: onlySourceOrganizeImports,
            };
            const data = {
                type: 'organizeImports',
                uri: document.uri,
                fileName,
            };
            if (resolveEditSupport) {
                action.data = data;
            }
            else {
                wranUnsupportResolve();
                (0, codeActionResolve_1.resolveOrganizeImportsCodeAction)(ctx, action, data, formatOptions, preferences);
            }
            result.push(action);
        }
        const onlySourceFixAll = matchOnlyKind(`${'source.fixAll'}.ts`);
        if (onlySourceFixAll) {
            const action = {
                title: 'Fix All',
                kind: onlySourceFixAll,
            };
            const data = {
                uri: document.uri,
                type: 'fixAll',
                fileName,
                fixIds: [
                    fixNames.classIncorrectlyImplementsInterface,
                    fixNames.awaitInSyncFunction,
                    fixNames.unreachableCode,
                ],
            };
            if (resolveEditSupport) {
                action.data = data;
            }
            else {
                wranUnsupportResolve();
                (0, codeActionResolve_1.resolveFixAllCodeAction)(ctx, action, data, formatOptions, preferences);
            }
            result.push(action);
        }
        const onlyRemoveUnused = matchOnlyKind(`${'source'}.removeUnused.ts`);
        if (onlyRemoveUnused) {
            const action = {
                title: 'Remove all unused code',
                kind: onlyRemoveUnused,
            };
            const data = {
                uri: document.uri,
                type: 'fixAll',
                fileName,
                fixIds: [
                    // not working and throw
                    fixNames.unusedIdentifier,
                    // TODO: remove patching
                    'unusedIdentifier_prefix',
                    'unusedIdentifier_deleteImports',
                    'unusedIdentifier_delete',
                    'unusedIdentifier_infer',
                ],
            };
            if (resolveEditSupport) {
                action.data = data;
            }
            else {
                wranUnsupportResolve();
                (0, codeActionResolve_1.resolveFixAllCodeAction)(ctx, action, data, formatOptions, preferences);
            }
            result.push(action);
        }
        const onlyAddMissingImports = matchOnlyKind(`${'source'}.addMissingImports.ts`);
        if (onlyAddMissingImports) {
            const action = {
                title: 'Add all missing imports',
                kind: onlyAddMissingImports,
            };
            const data = {
                uri: document.uri,
                type: 'fixAll',
                fileName,
                fixIds: [
                    // not working and throw
                    fixNames.fixImport,
                    // TODO: remove patching
                    'fixMissingImport',
                ],
            };
            if (resolveEditSupport) {
                action.data = data;
            }
            else {
                wranUnsupportResolve();
                (0, codeActionResolve_1.resolveFixAllCodeAction)(ctx, action, data, formatOptions, preferences);
            }
            result.push(action);
        }
        for (const codeAction of result) {
            if (codeAction.diagnostics === undefined) {
                codeAction.diagnostics = context.diagnostics;
            }
        }
        return result;
        function matchOnlyKind(kind) {
            if (context.only) {
                for (const only of context.only) {
                    const a = only.split('.');
                    const b = kind.split('.');
                    if (a.length <= b.length) {
                        let matchNums = 0;
                        for (let i = 0; i < a.length; i++) {
                            if (a[i] == b[i]) {
                                matchNums++;
                            }
                        }
                        if (matchNums === a.length) {
                            return only;
                        }
                    }
                }
            }
        }
        function convertCodeFixAction(codeFix, diagnostics, kind) {
            const edit = (0, lspConverters_1.convertFileTextChanges)(codeFix.changes, ctx.fileNameToUri, ctx.getTextDocument);
            const codeActions = [];
            const fix = {
                title: codeFix.description,
                kind,
                edit,
            };
            fix.diagnostics = diagnostics;
            codeActions.push(fix);
            if (codeFix.fixAllDescription && codeFix.fixId) {
                const fixAll = {
                    title: codeFix.fixAllDescription,
                    kind,
                };
                const data = {
                    uri: document.uri,
                    type: 'fixAll',
                    fileName,
                    fixIds: [codeFix.fixId],
                };
                if (resolveEditSupport) {
                    fixAll.data = data;
                }
                else {
                    wranUnsupportResolve();
                    (0, codeActionResolve_1.resolveFixAllCodeAction)(ctx, fixAll, data, formatOptions, preferences);
                }
                fixAll.diagnostics = diagnostics;
                codeActions.push(fixAll);
            }
            return codeActions;
        }
        function convertApplicableRefactorInfo(refactor) {
            const codeActions = [];
            for (const action of refactor.actions) {
                const codeAction = {
                    title: action.description,
                    kind: action.kind,
                };
                if (action.notApplicableReason) {
                    codeAction.disabled = { reason: action.notApplicableReason };
                }
                if (refactor.inlineable) {
                    codeAction.isPreferred = true;
                }
                const data = {
                    uri: document.uri,
                    type: 'refactor',
                    fileName,
                    range: { pos: start, end: end },
                    refactorName: refactor.name,
                    actionName: action.name,
                };
                const hasCommand = renameCommandRefactors.has(action.kind);
                if (hasCommand && resolveCommandSupport && resolveEditSupport) {
                    codeAction.data = data;
                }
                else if (!hasCommand && resolveEditSupport) {
                    codeAction.data = data;
                }
                else if (!codeAction.disabled) {
                    wranUnsupportResolve();
                    (0, codeActionResolve_1.resolveRefactorCodeAction)(ctx, codeAction, data, document, formatOptions, preferences);
                }
                codeActions.push(codeAction);
            }
            return codeActions;
        }
    };
}
//# sourceMappingURL=codeAction.js.map