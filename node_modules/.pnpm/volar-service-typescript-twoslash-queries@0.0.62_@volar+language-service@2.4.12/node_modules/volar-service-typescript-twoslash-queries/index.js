"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const vscode_uri_1 = require("vscode-uri");
function create(ts) {
    return {
        name: 'typescript-twoslash-queries',
        capabilities: {
            inlayHintProvider: {},
        },
        create(context) {
            return {
                provideInlayHints(document, range) {
                    if (isTsDocument(document.languageId)) {
                        const languageService = context.inject('typescript/languageService');
                        const fileName = context.inject('typescript/documentFileName', vscode_uri_1.URI.parse(document.uri));
                        if (!languageService || !fileName) {
                            return;
                        }
                        const inlayHints = [];
                        for (const pointer of document.getText(range).matchAll(/^\s*\/\/\s*\^\?/gm)) {
                            const pointerOffset = pointer.index + pointer[0].indexOf('^?') + document.offsetAt(range.start);
                            const pointerPosition = document.positionAt(pointerOffset);
                            const hoverOffset = document.offsetAt({
                                line: pointerPosition.line - 1,
                                character: pointerPosition.character,
                            });
                            const quickInfo = languageService.getQuickInfoAtPosition(fileName, hoverOffset);
                            if (quickInfo) {
                                inlayHints.push({
                                    position: { line: pointerPosition.line, character: pointerPosition.character + 2 },
                                    label: ts.displayPartsToString(quickInfo.displayParts),
                                    paddingLeft: true,
                                    paddingRight: false,
                                });
                            }
                        }
                        return inlayHints;
                    }
                },
            };
        },
    };
}
function isTsDocument(languageId) {
    return languageId === 'javascript' ||
        languageId === 'typescript' ||
        languageId === 'javascriptreact' ||
        languageId === 'typescriptreact';
}
//# sourceMappingURL=index.js.map