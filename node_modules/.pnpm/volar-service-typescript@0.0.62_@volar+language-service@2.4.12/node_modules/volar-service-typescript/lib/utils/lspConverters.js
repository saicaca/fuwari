"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDiagnostic = convertDiagnostic;
exports.applyCompletionEntryDetails = applyCompletionEntryDetails;
exports.convertCompletionInfo = convertCompletionInfo;
exports.getLineText = getLineText;
exports.convertNavigateToItem = convertNavigateToItem;
exports.convertInlayHint = convertInlayHint;
exports.convertHighlightSpan = convertHighlightSpan;
exports.convertSelectionRange = convertSelectionRange;
exports.convertFileTextChanges = convertFileTextChanges;
exports.convertRenameLocations = convertRenameLocations;
exports.convertQuickInfo = convertQuickInfo;
exports.convertNavTree = convertNavTree;
exports.convertOutliningSpan = convertOutliningSpan;
exports.convertOutliningSpanKind = convertOutliningSpanKind;
exports.convertTextChange = convertTextChange;
exports.convertCallHierarchyIncomingCall = convertCallHierarchyIncomingCall;
exports.convertCallHierarchyOutgoingCall = convertCallHierarchyOutgoingCall;
exports.convertCallHierarchyItem = convertCallHierarchyItem;
exports.convertDocumentSpanToLocation = convertDocumentSpanToLocation;
exports.convertDefinitionInfoAndBoundSpan = convertDefinitionInfoAndBoundSpan;
exports.convertDocumentSpantoLocationLink = convertDocumentSpantoLocationLink;
exports.convertTextSpan = convertTextSpan;
const path = require("path-browserify");
const semver = require("semver");
const PConst = require("../protocol.const");
const modifiers_1 = require("../utils/modifiers");
const previewer = require("../utils/previewer");
const typeConverters = require("../utils/typeConverters");
// diagnostics
function convertDiagnostic(diag, document, fileNameToUri, getTextDocument) {
    if (diag.start === undefined) {
        return;
    }
    if (diag.length === undefined) {
        return;
    }
    const diagnostic = {
        range: {
            start: document.positionAt(diag.start),
            end: document.positionAt(diag.start + diag.length),
        },
        severity: convertDiagnosticCategory(diag.category),
        source: 'ts',
        code: diag.code,
        message: getMessageText(diag),
    };
    if (diag.relatedInformation) {
        diagnostic.relatedInformation = diag.relatedInformation
            .map(rErr => convertDiagnosticRelatedInformation(rErr, fileNameToUri, getTextDocument))
            .filter((v) => !!v);
    }
    if (diag.reportsUnnecessary) {
        if (diagnostic.tags === undefined) {
            diagnostic.tags = [];
        }
        diagnostic.tags.push(1);
    }
    if (diag.reportsDeprecated) {
        if (diagnostic.tags === undefined) {
            diagnostic.tags = [];
        }
        diagnostic.tags.push(2);
    }
    return diagnostic;
}
function convertDiagnosticRelatedInformation(diag, fileNameToUri, getTextDocument) {
    if (diag.start === undefined) {
        return;
    }
    if (diag.length === undefined) {
        return;
    }
    let document;
    if (diag.file) {
        document = getTextDocument(fileNameToUri(diag.file.fileName));
    }
    if (!document) {
        return;
    }
    const diagnostic = {
        location: {
            uri: document.uri,
            range: {
                start: document.positionAt(diag.start),
                end: document.positionAt(diag.start + diag.length),
            },
        },
        message: getMessageText(diag),
    };
    return diagnostic;
}
function convertDiagnosticCategory(input) {
    switch (input) {
        case 0: return 2;
        case 1: return 1;
        case 2: return 4;
        case 3: return 3;
    }
    return 1;
}
function getMessageText(diag, level = 0) {
    let messageText = '  '.repeat(level);
    if (typeof diag.messageText === 'string') {
        messageText += diag.messageText;
    }
    else {
        messageText += diag.messageText.messageText;
        if (diag.messageText.next) {
            for (const info of diag.messageText.next) {
                messageText += '\n' + getMessageText(info, level + 1);
            }
        }
    }
    return messageText;
}
// completion resolve
function applyCompletionEntryDetails(ts, item, data, document, fileNameToUri, getTextDocument) {
    const { sourceDisplay } = data;
    if (sourceDisplay) {
        item.labelDetails ??= {};
        item.labelDetails.description = ts.displayPartsToString(sourceDisplay);
    }
    const detailTexts = [];
    if (data.codeActions) {
        item.additionalTextEdits ??= [];
        for (const action of data.codeActions) {
            detailTexts.push(action.description);
            for (const changes of action.changes) {
                const ranges = changes.textChanges.map(change => convertTextSpan(change.span, document));
                ranges.forEach((range, index) => {
                    item.additionalTextEdits?.push({ range, newText: changes.textChanges[index].newText });
                });
            }
        }
    }
    if (data.displayParts) {
        detailTexts.push(previewer.plainWithLinks(data.displayParts, fileNameToUri, getTextDocument));
    }
    if (detailTexts.length) {
        item.detail = detailTexts.join('\n');
    }
    item.documentation = {
        kind: 'markdown',
        value: previewer.markdownDocumentation(data.documentation, data.tags, fileNameToUri, getTextDocument),
    };
    if (data) {
        handleKindModifiers(item, data);
    }
}
// completion
function convertCompletionInfo(ts, completionContext, document, position, createData) {
    const lt_320 = semver.lt(ts.version, '3.2.0');
    const gte_300 = semver.gte(ts.version, '3.0.0');
    const wordRange = completionContext.optionalReplacementSpan
        ? convertTextSpan(completionContext.optionalReplacementSpan, document)
        : undefined;
    const line = getLineText(document, position.line);
    const dotAccessorContext = getDotAccessorContext(document);
    const entries = completionContext.entries
        .map(tsEntry => ({
        ...convertCompletionEntry(tsEntry, document),
        data: createData(tsEntry),
    }));
    return {
        isIncomplete: !!completionContext.isIncomplete,
        items: entries,
    };
    function convertCompletionEntry(tsEntry, document) {
        const item = { label: tsEntry.name };
        item.kind = convertCompletionItemKind(tsEntry.kind);
        if (tsEntry.source && tsEntry.hasAction) {
            // De-prioritize auto-imports
            // https://github.com/microsoft/vscode/issues/40311
            item.sortText = '\uffff' + tsEntry.sortText;
        }
        else {
            item.sortText = tsEntry.sortText;
        }
        const { sourceDisplay, isSnippet, labelDetails } = tsEntry;
        if (sourceDisplay) {
            item.labelDetails ??= {};
            item.labelDetails.description = ts.displayPartsToString(sourceDisplay);
        }
        if (labelDetails) {
            item.labelDetails ??= {};
            Object.assign(item.labelDetails, labelDetails);
        }
        item.preselect = tsEntry.isRecommended;
        let range = getRangeFromReplacementSpan(tsEntry, document);
        item.commitCharacters = getCommitCharacters(tsEntry, {
            isNewIdentifierLocation: completionContext.isNewIdentifierLocation,
            isInValidCommitCharacterContext: isInValidCommitCharacterContext(document, position),
            enableCallCompletions: true, // TODO: suggest.completeFunctionCalls
        });
        item.insertText = tsEntry.insertText;
        item.insertTextFormat = isSnippet ? 2 : 1;
        item.filterText = getFilterText(tsEntry, wordRange, line, tsEntry.insertText);
        if (completionContext?.isMemberCompletion && dotAccessorContext && !isSnippet) {
            item.filterText = dotAccessorContext.text + (item.insertText || item.label);
            if (!range) {
                const replacementRange = wordRange;
                if (replacementRange) {
                    range = {
                        inserting: dotAccessorContext.range,
                        replacing: rangeUnion(dotAccessorContext.range, replacementRange),
                    };
                }
                else {
                    range = dotAccessorContext.range;
                }
                item.insertText = item.filterText;
            }
        }
        handleKindModifiers(item, tsEntry);
        if (!range && wordRange) {
            range = {
                inserting: { start: wordRange.start, end: position },
                replacing: wordRange,
            };
        }
        if (range) {
            if ('start' in range) {
                item.textEdit = {
                    range,
                    newText: item.insertText || item.label,
                };
            }
            else {
                item.textEdit = {
                    insert: range.inserting,
                    replace: range.replacing,
                    newText: item.insertText || item.label,
                };
            }
        }
        return item;
    }
    function getDotAccessorContext(document) {
        let dotAccessorContext;
        if (gte_300) {
            if (!completionContext) {
                return;
            }
            const isMemberCompletion = completionContext.isMemberCompletion;
            if (isMemberCompletion) {
                const dotMatch = line.slice(0, position.character).match(/\??\.\s*$/) || undefined;
                if (dotMatch) {
                    const range = {
                        start: { line: position.line, character: position.character - dotMatch[0].length },
                        end: position,
                    };
                    const text = document.getText(range);
                    dotAccessorContext = { range, text };
                }
            }
        }
        return dotAccessorContext;
    }
    // from vscode typescript
    function getRangeFromReplacementSpan(tsEntry, document) {
        if (!tsEntry.replacementSpan) {
            return;
        }
        let replaceRange = {
            start: document.positionAt(tsEntry.replacementSpan.start),
            end: document.positionAt(tsEntry.replacementSpan.start + tsEntry.replacementSpan.length),
        };
        // Make sure we only replace a single line at most
        if (replaceRange.start.line !== replaceRange.end.line) {
            replaceRange = {
                start: {
                    line: replaceRange.start.line,
                    character: replaceRange.start.character,
                },
                end: {
                    line: replaceRange.start.line,
                    character: document.positionAt(document.offsetAt({ line: replaceRange.start.line + 1, character: 0 }) - 1).character,
                },
            };
        }
        // If TS returns an explicit replacement range, we should use it for both types of completion
        return {
            inserting: replaceRange,
            replacing: replaceRange,
        };
    }
    function getFilterText(tsEntry, wordRange, line, insertText) {
        // Handle private field completions
        if (tsEntry.name.startsWith('#')) {
            const wordStart = wordRange ? line.charAt(wordRange.start.character) : undefined;
            if (insertText) {
                if (insertText.startsWith('this.#')) {
                    return wordStart === '#' ? insertText : insertText.replace(/^this\.#/, '');
                }
                else {
                    return insertText;
                }
            }
            else {
                return wordStart === '#' ? undefined : tsEntry.name.replace(/^#/, '');
            }
        }
        // For `this.` completions, generally don't set the filter text since we don't want them to be overly prioritized. #74164
        if (insertText?.startsWith('this.')) {
            return undefined;
        }
        // Handle the case:
        // ```
        // const xyz = { 'ab c': 1 };
        // xyz.ab|
        // ```
        // In which case we want to insert a bracket accessor but should use `.abc` as the filter text instead of
        // the bracketed insert text.
        else if (insertText?.startsWith('[')) {
            return insertText.replace(/^\[['"](.+)[['"]\]$/, '.$1');
        }
        // In all other cases, fallback to using the insertText
        return insertText;
    }
    function getCommitCharacters(entry, context) {
        if (entry.kind === PConst.Kind.warning) { // Ambient JS word based suggestion
            return undefined;
        }
        if (context.isNewIdentifierLocation || !context.isInValidCommitCharacterContext) {
            return undefined;
        }
        const commitCharacters = ['.', ',', ';'];
        if (context.enableCallCompletions) {
            commitCharacters.push('(');
        }
        return commitCharacters;
    }
    function isInValidCommitCharacterContext(document, position) {
        if (lt_320) {
            // Workaround for https://github.com/microsoft/TypeScript/issues/27742
            // Only enable dot completions when the previous character is not a dot preceded by whitespace.
            // Prevents incorrectly completing while typing spread operators.
            if (position.character > 1) {
                const preText = document.getText({
                    start: { line: position.line, character: 0 },
                    end: position,
                });
                return preText.match(/(\s|^)\.$/ig) === null;
            }
        }
        return true;
    }
}
function convertCompletionItemKind(kind) {
    switch (kind) {
        case PConst.Kind.primitiveType:
        case PConst.Kind.keyword:
            return 14;
        case PConst.Kind.const:
        case PConst.Kind.let:
        case PConst.Kind.variable:
        case PConst.Kind.localVariable:
        case PConst.Kind.alias:
        case PConst.Kind.parameter:
            return 6;
        case PConst.Kind.memberVariable:
        case PConst.Kind.memberGetAccessor:
        case PConst.Kind.memberSetAccessor:
            return 5;
        case PConst.Kind.function:
        case PConst.Kind.localFunction:
            return 3;
        case PConst.Kind.method:
        case PConst.Kind.constructSignature:
        case PConst.Kind.callSignature:
        case PConst.Kind.indexSignature:
            return 2;
        case PConst.Kind.enum:
            return 13;
        case PConst.Kind.enumMember:
            return 20;
        case PConst.Kind.module:
        case PConst.Kind.externalModuleName:
            return 9;
        case PConst.Kind.class:
        case PConst.Kind.type:
            return 7;
        case PConst.Kind.interface:
            return 8;
        case PConst.Kind.warning:
            return 1;
        case PConst.Kind.script:
            return 17;
        case PConst.Kind.directory:
            return 19;
        case PConst.Kind.string:
            return 21;
        default:
            return 10;
    }
}
function handleKindModifiers(item, tsEntry) {
    if (tsEntry.kindModifiers) {
        const kindModifiers = (0, modifiers_1.parseKindModifier)(tsEntry.kindModifiers);
        if (kindModifiers.has(PConst.KindModifiers.optional)) {
            if (!item.insertText) {
                item.insertText = item.label;
            }
            if (!item.filterText) {
                item.filterText = item.label;
            }
            item.label += '?';
        }
        if (kindModifiers.has(PConst.KindModifiers.deprecated)) {
            item.tags = [1];
        }
        if (kindModifiers.has(PConst.KindModifiers.color)) {
            item.kind = 16;
        }
        if (tsEntry.kind === PConst.Kind.script) {
            for (const extModifier of PConst.KindModifiers.fileExtensionKindModifiers) {
                if (kindModifiers.has(extModifier)) {
                    if (tsEntry.name.toLowerCase().endsWith(extModifier)) {
                        item.detail = tsEntry.name;
                    }
                    else {
                        item.detail = tsEntry.name + extModifier;
                    }
                    break;
                }
            }
        }
    }
}
function rangeUnion(a, b) {
    const start = (a.start.line < b.start.line || (a.start.line === b.start.line && a.start.character < b.start.character)) ? a.start : b.start;
    const end = (a.end.line > b.end.line || (a.end.line === b.end.line && a.end.character > b.end.character)) ? a.end : b.end;
    return { start, end };
}
function getLineText(document, line) {
    const endOffset = document.offsetAt({ line: line + 1, character: 0 });
    const end = document.positionAt(endOffset);
    const text = document.getText({
        start: { line: line, character: 0 },
        end: end.line === line ? end : document.positionAt(endOffset - 1),
    });
    return text;
}
// workspaceSymbol
function convertNavigateToItem(item, document) {
    const info = {
        name: getLabel(item),
        kind: convertScriptElementKind(item.kind),
        location: {
            uri: document.uri,
            range: convertTextSpan(item.textSpan, document),
        },
    };
    const kindModifiers = item.kindModifiers ? (0, modifiers_1.parseKindModifier)(item.kindModifiers) : undefined;
    if (kindModifiers?.has(PConst.KindModifiers.deprecated)) {
        info.tags = [1];
    }
    return info;
}
function getLabel(item) {
    const label = item.name;
    if (item.kind === 'method' || item.kind === 'function') {
        return label + '()';
    }
    return label;
}
function convertScriptElementKind(kind) {
    switch (kind) {
        case PConst.Kind.method: return 6;
        case PConst.Kind.enum: return 10;
        case PConst.Kind.enumMember: return 22;
        case PConst.Kind.function: return 12;
        case PConst.Kind.class: return 5;
        case PConst.Kind.interface: return 11;
        case PConst.Kind.type: return 5;
        case PConst.Kind.memberVariable: return 8;
        case PConst.Kind.memberGetAccessor: return 8;
        case PConst.Kind.memberSetAccessor: return 8;
        case PConst.Kind.variable: return 13;
        default: return 13;
    }
}
// inlayHints
function convertInlayHint(hint, document) {
    const result = {
        position: document.positionAt(hint.position),
        label: hint.text,
        kind: hint.kind === 'Type' ? 1
            : hint.kind === 'Parameter' ? 2
                : undefined,
    };
    result.paddingLeft = hint.whitespaceBefore;
    result.paddingRight = hint.whitespaceAfter;
    return result;
}
// documentHighlight
function convertHighlightSpan(span, document) {
    return {
        kind: span.kind === 'writtenReference'
            ? 3
            : 2,
        range: convertTextSpan(span.textSpan, document),
    };
}
// selectionRanges
function convertSelectionRange(range, document) {
    return {
        parent: range.parent
            ? convertSelectionRange(range.parent, document)
            : undefined,
        range: convertTextSpan(range.textSpan, document),
    };
}
// rename
function convertFileTextChanges(changes, fileNameToUri, getTextDocument) {
    const workspaceEdit = {};
    for (const change of changes) {
        if (!workspaceEdit.documentChanges) {
            workspaceEdit.documentChanges = [];
        }
        const uri = fileNameToUri(change.fileName);
        if (change.isNewFile) {
            workspaceEdit.documentChanges.push({ kind: 'create', uri: uri.toString() });
            workspaceEdit.documentChanges.push({
                textDocument: {
                    uri: uri.toString(),
                    version: null, // fix https://github.com/johnsoncodehk/volar/issues/2025
                },
                edits: change.textChanges.map(edit => ({
                    newText: edit.newText,
                    range: {
                        start: { line: 0, character: edit.span.start },
                        end: { line: 0, character: edit.span.start + edit.span.length },
                    },
                })),
            });
        }
        else {
            const doc = getTextDocument(uri);
            workspaceEdit.documentChanges.push({
                textDocument: {
                    uri: uri.toString(),
                    version: null, // fix https://github.com/johnsoncodehk/volar/issues/2025
                },
                edits: change.textChanges.map(edit => convertTextChange(edit, doc)),
            });
        }
    }
    return workspaceEdit;
}
// rename file
function convertRenameLocations(newText, locations, fileNameToUri, getTextDocument) {
    const workspaceEdit = {};
    for (const location of locations) {
        if (!workspaceEdit.changes) {
            workspaceEdit.changes = {};
        }
        const uri = fileNameToUri(location.fileName);
        const doc = getTextDocument(uri);
        if (!workspaceEdit.changes[uri.toString()]) {
            workspaceEdit.changes[uri.toString()] = [];
        }
        let _newText = newText;
        if (location.prefixText) {
            _newText = location.prefixText + _newText;
        }
        if (location.suffixText) {
            _newText = _newText + location.suffixText;
        }
        workspaceEdit.changes[uri.toString()].push({
            newText: _newText,
            range: convertTextSpan(location.textSpan, doc),
        });
    }
    return workspaceEdit;
}
// hover
function convertQuickInfo(ts, info, document, fileNameToUri, getTextDocument) {
    const parts = [];
    const displayString = ts.displayPartsToString(info.displayParts);
    const documentation = previewer.markdownDocumentation(info.documentation ?? [], info.tags, fileNameToUri, getTextDocument);
    if (displayString) {
        parts.push(['```typescript', displayString, '```'].join('\n'));
    }
    if (documentation) {
        parts.push(documentation);
    }
    const markdown = {
        kind: 'markdown',
        value: parts.join('\n\n'),
    };
    return {
        contents: markdown,
        range: convertTextSpan(info.textSpan, document),
    };
}
// documentSymbol
function convertNavTree(item, document) {
    if (!shouldIncludeEntry(item)) {
        return [];
    }
    let remain = item.childItems ?? [];
    return item.spans.map(span => {
        const childItems = [];
        remain = remain.filter(child => {
            const childStart = child.spans[0].start;
            const childEnd = child.spans[child.spans.length - 1].start + child.spans[child.spans.length - 1].length;
            if (childStart >= span.start && childEnd <= span.start + span.length) {
                childItems.push(child);
                return false;
            }
            return true;
        });
        const nameSpan = item.spans.length === 1
            ? (item.nameSpan ?? span)
            : span;
        const fullRange = {
            start: Math.min(span.start, nameSpan.start),
            end: Math.max(span.start + span.length, nameSpan.start + nameSpan.length),
        };
        const symbol = {
            name: item.text,
            kind: getSymbolKind(item.kind),
            range: convertTextSpan({
                start: fullRange.start,
                length: fullRange.end - fullRange.start,
            }, document),
            selectionRange: convertTextSpan(nameSpan, document),
            children: childItems.map(item => convertNavTree(item, document)).flat(),
        };
        const kindModifiers = (0, modifiers_1.parseKindModifier)(item.kindModifiers);
        if (kindModifiers.has(PConst.KindModifiers.deprecated)) {
            symbol.deprecated = true;
            symbol.tags ??= [];
            symbol.tags.push(1);
        }
        return symbol;
    });
}
const getSymbolKind = (kind) => {
    switch (kind) {
        case PConst.Kind.module: return 2;
        case PConst.Kind.class: return 5;
        case PConst.Kind.enum: return 10;
        case PConst.Kind.interface: return 11;
        case PConst.Kind.method: return 6;
        case PConst.Kind.memberVariable: return 7;
        case PConst.Kind.memberGetAccessor: return 7;
        case PConst.Kind.memberSetAccessor: return 7;
        case PConst.Kind.variable: return 13;
        case PConst.Kind.const: return 13;
        case PConst.Kind.localVariable: return 13;
        case PConst.Kind.function: return 12;
        case PConst.Kind.localFunction: return 12;
        case PConst.Kind.constructSignature: return 9;
        case PConst.Kind.constructorImplementation: return 9;
    }
    return 13;
};
function shouldIncludeEntry(item) {
    if (item.kind === PConst.Kind.alias) {
        return false;
    }
    return !!(item.text && item.text !== '<function>' && item.text !== '<class>');
}
// foldingRanges
function convertOutliningSpan(outliningSpan, document) {
    const start = document.positionAt(outliningSpan.textSpan.start);
    const end = adjustFoldingEnd(start, document.positionAt(outliningSpan.textSpan.start + outliningSpan.textSpan.length), document);
    return {
        startLine: start.line,
        endLine: end.line,
        startCharacter: start.character,
        endCharacter: end.character,
        kind: convertOutliningSpanKind(outliningSpan.kind),
    };
}
function convertOutliningSpanKind(kind) {
    switch (kind) {
        case 'comment': return 'comment';
        case 'region': return 'region';
        case 'imports': return 'imports';
        case 'code':
        default: return undefined;
    }
}
const foldEndPairCharacters = ['}', ']', ')', '`'];
// https://github.com/microsoft/vscode/blob/bed61166fb604e519e82e4d1d1ed839bc45d65f8/extensions/typescript-language-features/src/languageFeatures/folding.ts#L61-L73
function adjustFoldingEnd(start, end, document) {
    // workaround for #47240
    if (end.character > 0) {
        const foldEndCharacter = document.getText({
            start: { line: end.line, character: end.character - 1 },
            end,
        });
        if (foldEndPairCharacters.includes(foldEndCharacter)) {
            const endOffset = Math.max(document.offsetAt({ line: end.line, character: 0 }) - 1, document.offsetAt(start));
            return document.positionAt(endOffset);
        }
    }
    return end;
}
// formatting
function convertTextChange(edit, document) {
    return {
        range: convertTextSpan(edit.span, document),
        newText: edit.newText,
    };
}
// callHierarchy
function convertCallHierarchyIncomingCall(item, ctx) {
    const uri = ctx.fileNameToUri(item.from.file);
    const document = ctx.getTextDocument(uri);
    return {
        from: convertCallHierarchyItem(item.from, ctx),
        fromRanges: item.fromSpans
            .map(span => convertTextSpan(span, document))
            .filter(span => !!span),
    };
}
function convertCallHierarchyOutgoingCall(item, fromDocument, ctx) {
    return {
        to: convertCallHierarchyItem(item.to, ctx),
        fromRanges: item.fromSpans
            .map(span => convertTextSpan(span, fromDocument))
            .filter(span => !!span),
    };
}
function convertCallHierarchyItem(item, ctx) {
    const rootPath = ctx.languageService.getProgram()?.getCompilerOptions().rootDir ?? '';
    const uri = ctx.fileNameToUri(item.file);
    const document = ctx.getTextDocument(uri);
    const useFileName = isSourceFileItem(item);
    const name = useFileName ? path.basename(item.file) : item.name;
    const detail = useFileName ? path.relative(rootPath, path.dirname(item.file)) : item.containerName ?? '';
    const result = {
        kind: typeConverters.SymbolKind.fromProtocolScriptElementKind(item.kind),
        name,
        detail,
        uri: uri.toString(),
        range: convertTextSpan(item.span, document),
        selectionRange: convertTextSpan(item.selectionSpan, document),
    };
    const kindModifiers = item.kindModifiers ? (0, modifiers_1.parseKindModifier)(item.kindModifiers) : undefined;
    if (kindModifiers?.has(PConst.KindModifiers.deprecated)) {
        result.tags = [1];
    }
    return result;
}
function isSourceFileItem(item) {
    return item.kind === PConst.Kind.script || item.kind === PConst.Kind.module && item.selectionSpan.start === 0;
}
// base
function convertDocumentSpanToLocation(documentSpan, ctx) {
    const uri = ctx.fileNameToUri(documentSpan.fileName);
    const document = ctx.getTextDocument(uri);
    const range = convertTextSpan(documentSpan.textSpan, document);
    return {
        uri: uri.toString(),
        range,
    };
}
function convertDefinitionInfoAndBoundSpan(info, document, ctx) {
    if (!info.definitions) {
        return [];
    }
    const originSelectionRange = convertTextSpan(info.textSpan, document);
    return info.definitions
        .map(entry => {
        const link = convertDocumentSpantoLocationLink(entry, ctx);
        if (link) {
            link.originSelectionRange ??= originSelectionRange;
            return link;
        }
    })
        .filter(entry => !!entry);
}
function convertDocumentSpantoLocationLink(documentSpan, ctx) {
    const targetUri = ctx.fileNameToUri(documentSpan.fileName);
    const document = ctx.getTextDocument(targetUri);
    const targetSelectionRange = convertTextSpan(documentSpan.textSpan, document);
    const targetRange = documentSpan.contextSpan
        ? convertTextSpan(documentSpan.contextSpan, document)
        : targetSelectionRange;
    const originSelectionRange = documentSpan.originalTextSpan
        ? convertTextSpan(documentSpan.originalTextSpan, document)
        : undefined;
    return {
        targetUri: targetUri.toString(),
        targetRange,
        targetSelectionRange,
        originSelectionRange,
    };
}
function convertTextSpan(textSpan, document) {
    if (!document) {
        return {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
        };
    }
    return {
        start: document.positionAt(textSpan.start),
        end: document.positionAt(textSpan.start + textSpan.length),
    };
}
//# sourceMappingURL=lspConverters.js.map