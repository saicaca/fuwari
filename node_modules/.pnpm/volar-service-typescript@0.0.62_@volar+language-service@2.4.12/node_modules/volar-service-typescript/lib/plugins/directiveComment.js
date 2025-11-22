"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const nls = require("vscode-nls");
const shared_1 = require("../shared");
const localize = nls.loadMessageBundle(); // TODO: not working
const directives = [
    {
        value: '@ts-check',
        description: localize('ts-check', "Enables semantic checking in a JavaScript file. Must be at the top of a file.")
    }, {
        value: '@ts-nocheck',
        description: localize('ts-nocheck', "Disables semantic checking in a JavaScript file. Must be at the top of a file.")
    }, {
        value: '@ts-ignore',
        description: localize('ts-ignore', "Suppresses @ts-check errors on the next line of a file.")
    }, {
        value: '@ts-expect-error',
        description: localize('ts-expect-error', "Suppresses @ts-check errors on the next line of a file, expecting at least one to exist.")
    }
];
function create() {
    return {
        name: 'typescript-directive-comment',
        capabilities: {
            completionProvider: {
                triggerCharacters: ['@'],
            },
        },
        create() {
            return {
                provideCompletionItems(document, position) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    const prefix = document.getText({
                        start: { line: position.line, character: 0 },
                        end: position,
                    });
                    const match = prefix.match(/^\s*\/\/+\s?(@[a-zA-Z\-]*)?$/);
                    if (match) {
                        const items = directives.map(directive => {
                            const item = { label: directive.value };
                            item.insertTextFormat = 2;
                            item.detail = directive.description;
                            const range = {
                                start: {
                                    line: position.line,
                                    character: Math.max(0, position.character - (match[1] ? match[1].length : 0)),
                                },
                                end: position,
                            };
                            item.textEdit = {
                                range,
                                newText: directive.value,
                            };
                            return item;
                        });
                        return {
                            isIncomplete: false,
                            items,
                        };
                    }
                },
            };
        },
    };
}
//# sourceMappingURL=directiveComment.js.map