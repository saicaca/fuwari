"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return async (uri, options, range, onTypeParams, token = cancellation_1.NoneCancellationToken) => {
        const sourceScript = context.language.scripts.get(uri);
        if (!sourceScript) {
            return;
        }
        let document = context.documents.get(uri, sourceScript.languageId, sourceScript.snapshot);
        range ??= {
            start: document.positionAt(0),
            end: document.positionAt(document.getText().length),
        };
        if (!sourceScript.generated) {
            return onTypeParams
                ? (await tryFormat(document, document, sourceScript, undefined, 0, onTypeParams.position, onTypeParams.ch))?.edits
                : (await tryFormat(document, document, sourceScript, undefined, 0, range, undefined))?.edits;
        }
        const embeddedRanges = new Map(); // TODO: Formatting of upper-level virtual code may cause offset of lower-level selection range
        const startOffset = document.offsetAt(range.start);
        const endOffset = document.offsetAt(range.end);
        for (const code of (0, language_core_1.forEachEmbeddedCode)(sourceScript.generated.root)) {
            const map = context.language.maps.get(code, sourceScript);
            if (map) {
                const embeddedRange = (0, common_1.findOverlapCodeRange)(startOffset, endOffset, map, language_core_1.isFormattingEnabled);
                if (embeddedRange) {
                    if (embeddedRange.start === map.mappings[0].generatedOffsets[0]) {
                        embeddedRange.start = 0;
                    }
                    const lastMapping = map.mappings[map.mappings.length - 1];
                    if (embeddedRange.end === lastMapping.generatedOffsets[lastMapping.generatedOffsets.length - 1] + (lastMapping.generatedLengths ?? lastMapping.lengths)[lastMapping.lengths.length - 1]) {
                        embeddedRange.end = code.snapshot.getLength();
                    }
                    embeddedRanges.set(code.id, embeddedRange);
                }
            }
        }
        try {
            const originalDocument = document;
            let tempSourceSnapshot = sourceScript.snapshot;
            let tempVirtualFile = context.language.scripts.set(vscode_uri_1.URI.parse(sourceScript.id.toString() + '.tmp'), sourceScript.snapshot, sourceScript.languageId, [sourceScript.generated.languagePlugin])?.generated?.root;
            if (!tempVirtualFile) {
                return;
            }
            let currentCodes = [];
            for (let depth = 0; (currentCodes = getNestedEmbeddedFiles(context, sourceScript.id, tempVirtualFile, depth)).length > 0; depth++) {
                let edits = [];
                for (const code of currentCodes) {
                    if (!code.mappings.some(mapping => (0, language_core_1.isFormattingEnabled)(mapping.data))) {
                        continue;
                    }
                    const currentRange = embeddedRanges.get(code.id);
                    if (!currentRange) {
                        continue;
                    }
                    const isChildRange = [...(0, language_core_1.forEachEmbeddedCode)(code)].some(child => {
                        if (child === code) {
                            return false;
                        }
                        const childRange = embeddedRanges.get(child.id);
                        return childRange && childRange.end - childRange.start >= currentRange.end - currentRange.start;
                    });
                    if (isChildRange) {
                        continue;
                    }
                    const docs = [
                        context.documents.get(uri, sourceScript.languageId, tempSourceSnapshot),
                        context.documents.get(context.encodeEmbeddedDocumentUri(uri, code.id), code.languageId, code.snapshot),
                        context.language.mapperFactory(code.mappings),
                    ];
                    let embeddedResult;
                    if (onTypeParams) {
                        for (const embeddedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, onTypeParams.position)) {
                            embeddedResult = await tryFormat(docs[0], docs[1], sourceScript, code, depth, embeddedPosition, onTypeParams.ch);
                            break;
                        }
                    }
                    else if (currentRange) {
                        embeddedResult = await tryFormat(docs[0], docs[1], sourceScript, code, depth, {
                            start: docs[1].positionAt(currentRange.start),
                            end: docs[1].positionAt(currentRange.end),
                        });
                    }
                    if (!embeddedResult) {
                        continue;
                    }
                    for (const textEdit of embeddedResult.edits) {
                        const range = (0, featureWorkers_1.getSourceRange)(docs, textEdit.range);
                        if (range) {
                            edits.push({
                                newText: textEdit.newText,
                                range,
                            });
                        }
                    }
                }
                if (edits.length > 0) {
                    const newText = vscode_languageserver_textdocument_1.TextDocument.applyEdits(document, edits);
                    document = vscode_languageserver_textdocument_1.TextDocument.create(document.uri, document.languageId, document.version + 1, newText);
                    tempSourceSnapshot = (0, common_1.stringToSnapshot)(newText);
                    tempVirtualFile = context.language.scripts.set(vscode_uri_1.URI.parse(sourceScript.id.toString() + '.tmp'), tempSourceSnapshot, sourceScript.languageId, [sourceScript.generated.languagePlugin])?.generated?.root;
                    if (!tempVirtualFile) {
                        break;
                    }
                }
            }
            if (document.getText() === originalDocument.getText()) {
                return;
            }
            const editRange = {
                start: originalDocument.positionAt(0),
                end: originalDocument.positionAt(originalDocument.getText().length),
            };
            const textEdit = {
                range: editRange,
                newText: document.getText(),
            };
            return [textEdit];
        }
        finally {
            context.language.scripts.delete(vscode_uri_1.URI.parse(sourceScript.id.toString() + '.tmp'));
        }
        async function tryFormat(sourceDocument, document, sourceScript, virtualCode, embeddedLevel, rangeOrPosition, ch) {
            if (context.disabledEmbeddedDocumentUris.get(vscode_uri_1.URI.parse(document.uri))) {
                return;
            }
            let codeOptions;
            rangeOrPosition ??= {
                start: document.positionAt(0),
                end: document.positionAt(document.getText().length),
            };
            if (virtualCode) {
                codeOptions = {
                    level: embeddedLevel,
                    initialIndentLevel: 0,
                };
                if (virtualCode.mappings.length) {
                    const firstMapping = virtualCode.mappings[0];
                    const startOffset = firstMapping.sourceOffsets[0];
                    const startPosition = sourceDocument.positionAt(startOffset);
                    codeOptions.initialIndentLevel = computeInitialIndent(sourceDocument.getText(), sourceDocument.offsetAt({ line: startPosition.line, character: 0 }), options);
                }
                for (const plugin of context.plugins) {
                    if (context.disabledServicePlugins.has(plugin[1])) {
                        continue;
                    }
                    codeOptions = await plugin[1].resolveEmbeddedCodeFormattingOptions?.(sourceScript, virtualCode, codeOptions, token) ?? codeOptions;
                }
            }
            for (const plugin of context.plugins) {
                if (context.disabledServicePlugins.has(plugin[1])) {
                    continue;
                }
                if (token.isCancellationRequested) {
                    break;
                }
                let edits;
                try {
                    if (ch !== undefined && rangeOrPosition && 'line' in rangeOrPosition && 'character' in rangeOrPosition) {
                        if (plugin[0].capabilities.documentOnTypeFormattingProvider?.triggerCharacters?.includes(ch)) {
                            edits = await plugin[1].provideOnTypeFormattingEdits?.(document, rangeOrPosition, ch, options, codeOptions, token);
                        }
                    }
                    else if (ch === undefined && rangeOrPosition && 'start' in rangeOrPosition && 'end' in rangeOrPosition) {
                        edits = await plugin[1].provideDocumentFormattingEdits?.(document, rangeOrPosition, options, codeOptions, token);
                    }
                }
                catch (err) {
                    console.warn(err);
                }
                if (!edits) {
                    continue;
                }
                return {
                    plugin,
                    edits,
                };
            }
        }
    };
}
function getNestedEmbeddedFiles(context, uri, rootCode, depth) {
    const nestedCodesByLevel = [[rootCode]];
    while (true) {
        if (nestedCodesByLevel.length > depth) {
            return nestedCodesByLevel[depth];
        }
        const nestedCodes = [];
        for (const code of nestedCodesByLevel[nestedCodesByLevel.length - 1]) {
            if (code.embeddedCodes) {
                for (const embedded of code.embeddedCodes) {
                    if (!context.disabledEmbeddedDocumentUris.get(context.encodeEmbeddedDocumentUri(uri, embedded.id))) {
                        nestedCodes.push(embedded);
                    }
                }
            }
        }
        nestedCodesByLevel.push(nestedCodes);
    }
}
function computeInitialIndent(content, i, options) {
    let nChars = 0;
    const tabSize = options.tabSize || 4;
    while (i < content.length) {
        const ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
//# sourceMappingURL=provideDocumentFormattingEdits.js.map