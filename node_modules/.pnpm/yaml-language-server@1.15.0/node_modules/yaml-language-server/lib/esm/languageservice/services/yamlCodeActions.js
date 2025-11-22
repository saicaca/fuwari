/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeAction, CodeActionKind, Command, Position, Range, TextEdit, } from 'vscode-languageserver-types';
import { YamlCommands } from '../../commands';
import * as path from 'path';
import { TextBuffer } from '../utils/textBuffer';
import { YAML_SOURCE } from '../parser/jsonParser07';
import { getFirstNonWhitespaceCharacterAfterOffset } from '../utils/strings';
import { matchOffsetToDocument } from '../utils/arrUtils';
import { CST, isMap, isSeq } from 'yaml';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { FlowStyleRewriter } from '../utils/flow-style-rewriter';
import * as _ from 'lodash';
export class YamlCodeActions {
    constructor(clientCapabilities) {
        this.clientCapabilities = clientCapabilities;
        this.indentation = '  ';
    }
    configure(settings) {
        this.indentation = settings.indentation;
    }
    getCodeAction(document, params) {
        if (!params.context.diagnostics) {
            return;
        }
        const result = [];
        result.push(...this.getConvertToBooleanActions(params.context.diagnostics, document));
        result.push(...this.getJumpToSchemaActions(params.context.diagnostics));
        result.push(...this.getTabToSpaceConverting(params.context.diagnostics, document));
        result.push(...this.getUnusedAnchorsDelete(params.context.diagnostics, document));
        result.push(...this.getConvertToBlockStyleActions(params.context.diagnostics, document));
        result.push(...this.getKeyOrderActions(params.context.diagnostics, document));
        return result;
    }
    getJumpToSchemaActions(diagnostics) {
        const isOpenTextDocumentEnabled = this.clientCapabilities?.window?.showDocument?.support ?? false;
        if (!isOpenTextDocumentEnabled) {
            return [];
        }
        const schemaUriToDiagnostic = new Map();
        for (const diagnostic of diagnostics) {
            const schemaUri = diagnostic.data?.schemaUri || [];
            for (const schemaUriStr of schemaUri) {
                if (schemaUriStr) {
                    if (!schemaUriToDiagnostic.has(schemaUriStr)) {
                        schemaUriToDiagnostic.set(schemaUriStr, []);
                    }
                    schemaUriToDiagnostic.get(schemaUriStr).push(diagnostic);
                }
            }
        }
        const result = [];
        for (const schemaUri of schemaUriToDiagnostic.keys()) {
            const action = CodeAction.create(`Jump to schema location (${path.basename(schemaUri)})`, Command.create('JumpToSchema', YamlCommands.JUMP_TO_SCHEMA, schemaUri));
            action.diagnostics = schemaUriToDiagnostic.get(schemaUri);
            result.push(action);
        }
        return result;
    }
    getTabToSpaceConverting(diagnostics, document) {
        const result = [];
        const textBuff = new TextBuffer(document);
        const processedLine = [];
        for (const diag of diagnostics) {
            if (diag.message === 'Using tabs can lead to unpredictable results') {
                if (processedLine.includes(diag.range.start.line)) {
                    continue;
                }
                const lineContent = textBuff.getLineContent(diag.range.start.line);
                let replacedTabs = 0;
                let newText = '';
                for (let i = diag.range.start.character; i <= diag.range.end.character; i++) {
                    const char = lineContent.charAt(i);
                    if (char !== '\t') {
                        break;
                    }
                    replacedTabs++;
                    newText += this.indentation;
                }
                processedLine.push(diag.range.start.line);
                let resultRange = diag.range;
                if (replacedTabs !== diag.range.end.character - diag.range.start.character) {
                    resultRange = Range.create(diag.range.start, Position.create(diag.range.end.line, diag.range.start.character + replacedTabs));
                }
                result.push(CodeAction.create('Convert Tab to Spaces', createWorkspaceEdit(document.uri, [TextEdit.replace(resultRange, newText)]), CodeActionKind.QuickFix));
            }
        }
        if (result.length !== 0) {
            const replaceEdits = [];
            for (let i = 0; i <= textBuff.getLineCount(); i++) {
                const lineContent = textBuff.getLineContent(i);
                let replacedTabs = 0;
                let newText = '';
                for (let j = 0; j < lineContent.length; j++) {
                    const char = lineContent.charAt(j);
                    if (char !== ' ' && char !== '\t') {
                        if (replacedTabs !== 0) {
                            replaceEdits.push(TextEdit.replace(Range.create(i, j - replacedTabs, i, j), newText));
                            replacedTabs = 0;
                            newText = '';
                        }
                        break;
                    }
                    if (char === ' ' && replacedTabs !== 0) {
                        replaceEdits.push(TextEdit.replace(Range.create(i, j - replacedTabs, i, j), newText));
                        replacedTabs = 0;
                        newText = '';
                        continue;
                    }
                    if (char === '\t') {
                        newText += this.indentation;
                        replacedTabs++;
                    }
                }
                // line contains only tabs
                if (replacedTabs !== 0) {
                    replaceEdits.push(TextEdit.replace(Range.create(i, 0, i, textBuff.getLineLength(i)), newText));
                }
            }
            if (replaceEdits.length > 0) {
                result.push(CodeAction.create('Convert all Tabs to Spaces', createWorkspaceEdit(document.uri, replaceEdits), CodeActionKind.QuickFix));
            }
        }
        return result;
    }
    getUnusedAnchorsDelete(diagnostics, document) {
        const result = [];
        const buffer = new TextBuffer(document);
        for (const diag of diagnostics) {
            if (diag.message.startsWith('Unused anchor') && diag.source === YAML_SOURCE) {
                const range = Range.create(diag.range.start, diag.range.end);
                const actual = buffer.getText(range);
                const lineContent = buffer.getLineContent(range.end.line);
                const lastWhitespaceChar = getFirstNonWhitespaceCharacterAfterOffset(lineContent, range.end.character);
                range.end.character = lastWhitespaceChar;
                const action = CodeAction.create(`Delete unused anchor: ${actual}`, createWorkspaceEdit(document.uri, [TextEdit.del(range)]), CodeActionKind.QuickFix);
                action.diagnostics = [diag];
                result.push(action);
            }
        }
        return result;
    }
    getConvertToBooleanActions(diagnostics, document) {
        const results = [];
        for (const diagnostic of diagnostics) {
            if (diagnostic.message === 'Incorrect type. Expected "boolean".') {
                const value = document.getText(diagnostic.range).toLocaleLowerCase();
                if (value === '"true"' || value === '"false"' || value === "'true'" || value === "'false'") {
                    const newValue = value.includes('true') ? 'true' : 'false';
                    results.push(CodeAction.create('Convert to boolean', createWorkspaceEdit(document.uri, [TextEdit.replace(diagnostic.range, newValue)]), CodeActionKind.QuickFix));
                }
            }
        }
        return results;
    }
    getConvertToBlockStyleActions(diagnostics, document) {
        const results = [];
        for (const diagnostic of diagnostics) {
            if (diagnostic.code === 'flowMap' || diagnostic.code === 'flowSeq') {
                const node = getNodeforDiagnostic(document, diagnostic);
                if (isMap(node.internalNode) || isSeq(node.internalNode)) {
                    const blockTypeDescription = isMap(node.internalNode) ? 'map' : 'sequence';
                    const rewriter = new FlowStyleRewriter(this.indentation);
                    results.push(CodeAction.create(`Convert to block style ${blockTypeDescription}`, createWorkspaceEdit(document.uri, [TextEdit.replace(diagnostic.range, rewriter.write(node))]), CodeActionKind.QuickFix));
                }
            }
        }
        return results;
    }
    getKeyOrderActions(diagnostics, document) {
        const results = [];
        for (const diagnostic of diagnostics) {
            if (diagnostic?.code === 'mapKeyOrder') {
                let node = getNodeforDiagnostic(document, diagnostic);
                while (node && node.type !== 'object') {
                    node = node.parent;
                }
                if (node && isMap(node.internalNode)) {
                    const sorted = _.cloneDeep(node.internalNode);
                    if ((sorted.srcToken.type === 'block-map' || sorted.srcToken.type === 'flow-collection') &&
                        (node.internalNode.srcToken.type === 'block-map' || node.internalNode.srcToken.type === 'flow-collection')) {
                        sorted.srcToken.items.sort((a, b) => {
                            if (a.key && b.key && CST.isScalar(a.key) && CST.isScalar(b.key)) {
                                return a.key.source.localeCompare(b.key.source);
                            }
                            if (!a.key && b.key) {
                                return -1;
                            }
                            if (a.key && !b.key) {
                                return 1;
                            }
                            if (!a.key && !b.key) {
                                return 0;
                            }
                        });
                        for (let i = 0; i < sorted.srcToken.items.length; i++) {
                            const item = sorted.srcToken.items[i];
                            const uItem = node.internalNode.srcToken.items[i];
                            item.start = uItem.start;
                            if (item.value?.type === 'alias' ||
                                item.value?.type === 'scalar' ||
                                item.value?.type === 'single-quoted-scalar' ||
                                item.value?.type === 'double-quoted-scalar') {
                                const newLineIndex = item.value?.end?.findIndex((p) => p.type === 'newline') ?? -1;
                                let newLineToken = null;
                                if (uItem.value?.type === 'block-scalar') {
                                    newLineToken = uItem.value?.props?.find((p) => p.type === 'newline');
                                }
                                else if (CST.isScalar(uItem.value)) {
                                    newLineToken = uItem.value?.end?.find((p) => p.type === 'newline');
                                }
                                if (newLineToken && newLineIndex < 0) {
                                    item.value.end = item.value.end ?? [];
                                    item.value.end.push(newLineToken);
                                }
                                if (!newLineToken && newLineIndex > -1) {
                                    item.value.end.splice(newLineIndex, 1);
                                }
                            }
                            else if (item.value?.type === 'block-scalar') {
                                const nwline = item.value.props.find((p) => p.type === 'newline');
                                if (!nwline) {
                                    item.value.props.push({ type: 'newline', indent: 0, offset: item.value.offset, source: '\n' });
                                }
                            }
                        }
                    }
                    const replaceRange = Range.create(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
                    results.push(CodeAction.create('Fix key order for this map', createWorkspaceEdit(document.uri, [TextEdit.replace(replaceRange, CST.stringify(sorted.srcToken))]), CodeActionKind.QuickFix));
                }
            }
        }
        return results;
    }
}
function getNodeforDiagnostic(document, diagnostic) {
    const yamlDocuments = yamlDocumentsCache.getYamlDocument(document);
    const startOffset = document.offsetAt(diagnostic.range.start);
    const yamlDoc = matchOffsetToDocument(startOffset, yamlDocuments);
    const node = yamlDoc.getNodeFromOffset(startOffset);
    return node;
}
function createWorkspaceEdit(uri, edits) {
    const changes = {};
    changes[uri] = edits;
    const edit = {
        changes,
    };
    return edit;
}
//# sourceMappingURL=yamlCodeActions.js.map