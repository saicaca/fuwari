"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDocumentLinkTarget = transformDocumentLinkTarget;
exports.transformMarkdown = transformMarkdown;
exports.transformCompletionItem = transformCompletionItem;
exports.transformCompletionList = transformCompletionList;
exports.transformDocumentSymbol = transformDocumentSymbol;
exports.transformFoldingRanges = transformFoldingRanges;
exports.transformHover = transformHover;
exports.transformLocation = transformLocation;
exports.transformLocations = transformLocations;
exports.transformSelectionRange = transformSelectionRange;
exports.transformSelectionRanges = transformSelectionRanges;
exports.transformTextEdit = transformTextEdit;
exports.transformWorkspaceSymbol = transformWorkspaceSymbol;
exports.transformWorkspaceEdit = transformWorkspaceEdit;
exports.pushEditToDocumentChanges = pushEditToDocumentChanges;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const featureWorkers_1 = require("./featureWorkers");
function transformDocumentLinkTarget(_target, context) {
    let target = vscode_uri_1.URI.parse(_target);
    const decoded = context.decodeEmbeddedDocumentUri(target);
    if (!decoded) {
        return target;
    }
    const embeddedRange = target.fragment.match(/^L(\d+)(,(\d+))?(-L(\d+)(,(\d+))?)?$/);
    const sourceScript = context.language.scripts.get(decoded[0]);
    const virtualCode = sourceScript?.generated?.embeddedCodes.get(decoded[1]);
    target = decoded[0];
    if (embeddedRange && sourceScript && virtualCode) {
        const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
        for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
            if (!map.mappings.some(mapping => (0, language_core_1.isDocumentLinkEnabled)(mapping.data))) {
                continue;
            }
            const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
            const docs = [sourceDocument, embeddedDocument, map];
            const startLine = Number(embeddedRange[1]) - 1;
            const startCharacter = Number(embeddedRange[3] ?? 1) - 1;
            if (embeddedRange[5] !== undefined) {
                const endLine = Number(embeddedRange[5]) - 1;
                const endCharacter = Number(embeddedRange[7] ?? 1) - 1;
                const sourceRange = (0, featureWorkers_1.getSourceRange)(docs, {
                    start: { line: startLine, character: startCharacter },
                    end: { line: endLine, character: endCharacter },
                });
                if (sourceRange) {
                    target = target.with({
                        fragment: 'L' + (sourceRange.start.line + 1) + ',' + (sourceRange.start.character + 1)
                            + '-L' + (sourceRange.end.line + 1) + ',' + (sourceRange.end.character + 1),
                    });
                    break;
                }
            }
            else {
                let mapped = false;
                for (const sourcePos of (0, featureWorkers_1.getSourcePositions)(docs, { line: startLine, character: startCharacter })) {
                    mapped = true;
                    target = target.with({
                        fragment: 'L' + (sourcePos.line + 1) + ',' + (sourcePos.character + 1),
                    });
                    break;
                }
                if (mapped) {
                    break;
                }
            }
        }
    }
    return target;
}
function transformMarkdown(content, context) {
    return content.replace(/(?!\()volar-embedded-content:\/\/\w+\/[^)]+/g, match => {
        const segments = match.split('|');
        segments[0] = transformDocumentLinkTarget(segments[0], context).toString();
        return segments.join('|');
    });
}
function transformCompletionItem(item, getOtherRange, document, context) {
    return {
        ...item,
        additionalTextEdits: item.additionalTextEdits
            ?.map(edit => transformTextEdit(edit, getOtherRange, document))
            .filter(edit => !!edit),
        textEdit: item.textEdit
            ? transformTextEdit(item.textEdit, getOtherRange, document)
            : undefined,
        documentation: item.documentation ?
            typeof item.documentation === 'string' ? transformMarkdown(item.documentation, context) :
                item.documentation.kind === 'markdown' ?
                    { kind: 'markdown', value: transformMarkdown(item.documentation.value, context) }
                    : item.documentation
            : undefined
    };
}
function transformCompletionList(completionList, getOtherRange, document, context) {
    return {
        isIncomplete: completionList.isIncomplete,
        itemDefaults: completionList.itemDefaults ? {
            ...completionList.itemDefaults,
            editRange: completionList.itemDefaults.editRange
                ? 'replace' in completionList.itemDefaults.editRange
                    ? {
                        insert: getOtherRange(completionList.itemDefaults.editRange.insert),
                        replace: getOtherRange(completionList.itemDefaults.editRange.replace),
                    }
                    : getOtherRange(completionList.itemDefaults.editRange)
                : undefined,
        } : undefined,
        items: completionList.items.map(item => transformCompletionItem(item, getOtherRange, document, context)),
    };
}
function transformDocumentSymbol(symbol, getOtherRange) {
    const range = getOtherRange(symbol.range);
    if (!range) {
        return;
    }
    const selectionRange = getOtherRange(symbol.selectionRange);
    if (!selectionRange) {
        return;
    }
    return {
        ...symbol,
        range,
        selectionRange,
        children: symbol.children
            ?.map(child => transformDocumentSymbol(child, getOtherRange))
            .filter(child => !!child),
    };
}
function transformFoldingRanges(ranges, getOtherRange) {
    const result = [];
    for (const range of ranges) {
        const otherRange = getOtherRange({
            start: { line: range.startLine, character: range.startCharacter ?? 0 },
            end: { line: range.endLine, character: range.endCharacter ?? 0 },
        });
        if (otherRange) {
            range.startLine = otherRange.start.line;
            range.endLine = otherRange.end.line;
            if (range.startCharacter !== undefined) {
                range.startCharacter = otherRange.start.character;
            }
            if (range.endCharacter !== undefined) {
                range.endCharacter = otherRange.end.character;
            }
            result.push(range);
        }
    }
    return result;
}
function transformHover(hover, getOtherRange) {
    if (!hover?.range) {
        return hover;
    }
    const range = getOtherRange(hover.range);
    if (!range) {
        return;
    }
    return {
        ...hover,
        range,
    };
}
function transformLocation(location, getOtherRange) {
    const range = getOtherRange(location.range);
    if (!range) {
        return;
    }
    return {
        ...location,
        range,
    };
}
function transformLocations(locations, getOtherRange) {
    return locations
        .map(location => transformLocation(location, getOtherRange))
        .filter(location => !!location);
}
function transformSelectionRange(location, getOtherRange) {
    const range = getOtherRange(location.range);
    if (!range) {
        return;
    }
    const parent = location.parent ? transformSelectionRange(location.parent, getOtherRange) : undefined;
    return {
        range,
        parent,
    };
}
function transformSelectionRanges(locations, getOtherRange) {
    return locations
        .map(location => transformSelectionRange(location, getOtherRange))
        .filter(location => !!location);
}
function transformTextEdit(textEdit, getOtherRange, document) {
    if ('range' in textEdit) {
        let range = getOtherRange(textEdit.range);
        if (range) {
            return {
                ...textEdit,
                range,
            };
        }
        ;
        const cover = tryRecoverTextEdit(getOtherRange, textEdit.range, textEdit.newText, document);
        if (cover) {
            return {
                ...textEdit,
                range: cover.range,
                newText: cover.newText,
            };
        }
    }
    else if ('replace' in textEdit && 'insert' in textEdit) {
        const insert = getOtherRange(textEdit.insert);
        const replace = insert ? getOtherRange(textEdit.replace) : undefined;
        if (insert && replace) {
            return {
                ...textEdit,
                insert,
                replace,
            };
        }
        const recoverInsert = tryRecoverTextEdit(getOtherRange, textEdit.insert, textEdit.newText, document);
        const recoverReplace = recoverInsert ? tryRecoverTextEdit(getOtherRange, textEdit.replace, textEdit.newText, document) : undefined;
        if (recoverInsert && recoverReplace && recoverInsert.newText === recoverReplace.newText) {
            return {
                ...textEdit,
                insert: recoverInsert.range,
                replace: recoverReplace.range,
                newText: recoverInsert.newText,
            };
        }
    }
}
/**
 * update edit text from ". foo" to " foo"
 * fix https://github.com/johnsoncodehk/volar/issues/2155
 */
function tryRecoverTextEdit(getOtherRange, replaceRange, newText, document) {
    if (replaceRange.start.line === replaceRange.end.line && replaceRange.end.character > replaceRange.start.character) {
        let character = replaceRange.start.character;
        while (newText.length && replaceRange.end.character > character) {
            const newStart = { line: replaceRange.start.line, character: replaceRange.start.character + 1 };
            if (document.getText({ start: replaceRange.start, end: newStart }) === newText[0]) {
                newText = newText.slice(1);
                character++;
                const otherRange = getOtherRange({ start: newStart, end: replaceRange.end });
                if (otherRange) {
                    return {
                        newText,
                        range: otherRange,
                    };
                }
            }
            else {
                break;
            }
        }
    }
}
function transformWorkspaceSymbol(symbol, getOtherLocation) {
    if (!('range' in symbol.location)) {
        return symbol;
    }
    const loc = getOtherLocation(symbol.location);
    if (!loc) {
        return;
    }
    return {
        ...symbol,
        location: loc,
    };
}
function transformWorkspaceEdit(edit, context, mode, versions = {}) {
    const sourceResult = {};
    let hasResult = false;
    for (const tsUri in edit.changeAnnotations) {
        sourceResult.changeAnnotations ??= {};
        const tsAnno = edit.changeAnnotations[tsUri];
        const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsUri));
        const sourceScript = decoded && context.language.scripts.get(decoded[0]);
        const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
        if (sourceScript && virtualCode) {
            for (const [sourceScript] of context.language.maps.forEach(virtualCode)) {
                // TODO: check capability?
                const uri = sourceScript.id.toString();
                sourceResult.changeAnnotations[uri] = tsAnno;
                break;
            }
        }
        else {
            sourceResult.changeAnnotations[tsUri] = tsAnno;
        }
    }
    for (const tsUri in edit.changes) {
        sourceResult.changes ??= {};
        const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsUri));
        const sourceScript = decoded && context.language.scripts.get(decoded[0]);
        const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
        if (sourceScript && virtualCode) {
            const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
            for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                const docs = [sourceDocument, embeddedDocument, map];
                const tsEdits = edit.changes[tsUri];
                for (const tsEdit of tsEdits) {
                    if (mode === 'rename' || mode === 'fileName' || mode === 'codeAction') {
                        let _data;
                        const range = (0, featureWorkers_1.getSourceRange)(docs, tsEdit.range, data => {
                            _data = data;
                            return (0, language_core_1.isRenameEnabled)(data);
                        });
                        if (range) {
                            sourceResult.changes[sourceDocument.uri] ??= [];
                            sourceResult.changes[sourceDocument.uri].push({
                                newText: (0, language_core_1.resolveRenameEditText)(tsEdit.newText, _data),
                                range,
                            });
                            hasResult = true;
                        }
                    }
                    else {
                        const range = (0, featureWorkers_1.getSourceRange)(docs, tsEdit.range);
                        if (range) {
                            sourceResult.changes[sourceDocument.uri] ??= [];
                            sourceResult.changes[sourceDocument.uri].push({ newText: tsEdit.newText, range });
                            hasResult = true;
                        }
                    }
                }
            }
        }
        else {
            sourceResult.changes[tsUri] = edit.changes[tsUri];
            hasResult = true;
        }
    }
    if (edit.documentChanges) {
        for (const tsDocEdit of edit.documentChanges) {
            sourceResult.documentChanges ??= [];
            let sourceEdit;
            if ('textDocument' in tsDocEdit) {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsDocEdit.textDocument.uri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (sourceScript && virtualCode) {
                    const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                    for (const [sourceScript, map] of context.language.maps.forEach(virtualCode)) {
                        const sourceDocument = context.documents.get(sourceScript.id, sourceScript.languageId, sourceScript.snapshot);
                        const docs = [sourceDocument, embeddedDocument, map];
                        sourceEdit = {
                            textDocument: {
                                uri: sourceDocument.uri,
                                version: versions[sourceDocument.uri] ?? null,
                            },
                            edits: [],
                        };
                        for (const tsEdit of tsDocEdit.edits) {
                            if (mode === 'rename' || mode === 'fileName' || mode === 'codeAction') {
                                let _data;
                                const range = (0, featureWorkers_1.getSourceRange)(docs, tsEdit.range, data => {
                                    _data = data;
                                    // fix https://github.com/johnsoncodehk/volar/issues/1091
                                    return (0, language_core_1.isRenameEnabled)(data);
                                });
                                if (range) {
                                    sourceEdit.edits.push({
                                        annotationId: 'annotationId' in tsEdit ? tsEdit.annotationId : undefined,
                                        newText: (0, language_core_1.resolveRenameEditText)(tsEdit.newText, _data),
                                        range,
                                    });
                                }
                            }
                            else {
                                const range = (0, featureWorkers_1.getSourceRange)(docs, tsEdit.range);
                                if (range) {
                                    sourceEdit.edits.push({
                                        annotationId: 'annotationId' in tsEdit ? tsEdit.annotationId : undefined,
                                        newText: tsEdit.newText,
                                        range,
                                    });
                                }
                            }
                        }
                        if (!sourceEdit.edits.length) {
                            sourceEdit = undefined;
                        }
                    }
                }
                else {
                    sourceEdit = tsDocEdit;
                }
            }
            else if (tsDocEdit.kind === 'create') {
                sourceEdit = tsDocEdit; // TODO: remove .ts?
            }
            else if (tsDocEdit.kind === 'rename') {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsDocEdit.oldUri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (virtualCode) {
                    for (const [sourceScript] of context.language.maps.forEach(virtualCode)) {
                        // TODO: check capability?
                        sourceEdit = {
                            kind: 'rename',
                            oldUri: sourceScript.id.toString(),
                            newUri: tsDocEdit.newUri /* TODO: remove .ts? */,
                            options: tsDocEdit.options,
                            annotationId: tsDocEdit.annotationId,
                        };
                    }
                }
                else {
                    sourceEdit = tsDocEdit;
                }
            }
            else if (tsDocEdit.kind === 'delete') {
                const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(tsDocEdit.uri));
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (virtualCode) {
                    for (const [sourceScript] of context.language.maps.forEach(virtualCode)) {
                        // TODO: check capability?
                        sourceEdit = {
                            kind: 'delete',
                            uri: sourceScript.id.toString(),
                            options: tsDocEdit.options,
                            annotationId: tsDocEdit.annotationId,
                        };
                    }
                }
                else {
                    sourceEdit = tsDocEdit;
                }
            }
            if (sourceEdit) {
                pushEditToDocumentChanges(sourceResult.documentChanges, sourceEdit);
                hasResult = true;
            }
        }
    }
    if (hasResult) {
        return sourceResult;
    }
}
function pushEditToDocumentChanges(arr, item) {
    const current = arr.find(edit => 'textDocument' in edit
        && 'textDocument' in item
        && edit.textDocument.uri === item.textDocument.uri);
    if (current) {
        current.edits.push(...item.edits);
    }
    else {
        arr.push(item);
    }
}
//# sourceMappingURL=transform.js.map