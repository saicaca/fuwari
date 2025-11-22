"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const vscode_uri_1 = require("vscode-uri");
function create(
/**
 * Prettier instance or getter to use.
 */
prettierInstanceOrGetter, { html, documentSelector = ['html', 'css', 'scss', 'typescript', 'javascript'], isFormattingEnabled = async (prettier, document, context) => {
    const parsed = vscode_uri_1.URI.parse(document.uri);
    const uri = context.decodeEmbeddedDocumentUri(parsed)?.[0] ?? parsed;
    if (uri.scheme === 'file') {
        const fileInfo = await prettier.getFileInfo(uri.fsPath, { ignorePath: '.prettierignore', resolveConfig: false });
        if (fileInfo.ignored) {
            return false;
        }
    }
    return true;
}, getFormattingOptions = async (prettier, document, formatOptions, context) => {
    const parsed = vscode_uri_1.URI.parse(document.uri);
    const uri = context.decodeEmbeddedDocumentUri(parsed)?.[0] ?? parsed;
    const configOptions = uri.scheme === 'file'
        ? await prettier.resolveConfig(uri.fsPath)
        : null;
    const editorOptions = await context.env.getConfiguration?.('prettier', uri.toString());
    return {
        filepath: uri.scheme === 'file'
            ? uri.fsPath
            : undefined,
        tabWidth: formatOptions.tabSize,
        useTabs: !formatOptions.insertSpaces,
        ...editorOptions,
        ...configOptions,
    };
}, } = {}) {
    return {
        name: 'prettier',
        capabilities: {
            documentFormattingProvider: true,
        },
        create(context) {
            let prettierInstanceOrPromise;
            return {
                async provideDocumentFormattingEdits(document, _, formatOptions) {
                    if (!matchDocument(documentSelector, document)) {
                        return;
                    }
                    prettierInstanceOrPromise ??= typeof prettierInstanceOrGetter === 'function'
                        ? prettierInstanceOrGetter(context)
                        : prettierInstanceOrGetter;
                    const prettier = await prettierInstanceOrPromise;
                    if (!prettier) {
                        return;
                    }
                    const hasFormattingEnabled = await isFormattingEnabled(prettier, document, context);
                    if (!hasFormattingEnabled) {
                        return;
                    }
                    const fullText = document.getText();
                    let oldText = fullText;
                    const isHTML = document.languageId === 'html';
                    if (isHTML && html?.breakContentsFromTags) {
                        oldText = oldText
                            .replace(/(<[a-z][^>]*>)([^ \n])/gi, '$1 $2')
                            .replace(/([^ \n])(<\/[a-z][a-z0-9\t\n\r -]*>)/gi, '$1 $2');
                    }
                    const prettierOptions = await getFormattingOptions(prettier, document, formatOptions, context);
                    const newText = await prettier.format(oldText, prettierOptions);
                    return [{
                            newText,
                            range: {
                                start: document.positionAt(0),
                                end: document.positionAt(fullText.length),
                            },
                        }];
                },
            };
        },
    };
}
function matchDocument(selector, document) {
    for (const sel of selector) {
        if (sel === document.languageId || (typeof sel === 'object' && sel.language === document.languageId)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=index.js.map