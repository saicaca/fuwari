"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.mergeWorkspaceEdits = mergeWorkspaceEdits;
const language_core_1 = require("@volar/language-core");
const vscode_uri_1 = require("vscode-uri");
const cancellation_1 = require("../utils/cancellation");
const dedupe = require("../utils/dedupe");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
function register(context) {
    return (uri, position, newName, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => ({ position, newName }), function* (docs) {
            let _data;
            for (const mappedPosition of (0, featureWorkers_1.getGeneratedPositions)(docs, position, data => {
                _data = data;
                return (0, language_core_1.isRenameEnabled)(data);
            })) {
                yield {
                    position: mappedPosition,
                    newName: (0, language_core_1.resolveRenameNewName)(newName, _data),
                };
            }
            ;
        }, async (plugin, document, params) => {
            if (token.isCancellationRequested) {
                return;
            }
            const recursiveChecker = dedupe.createLocationSet();
            let result;
            await withLinkedCode(document, params.position, params.newName);
            return result;
            async function withLinkedCode(document, position, newName) {
                if (!plugin[1].provideRenameEdits) {
                    return;
                }
                if (recursiveChecker.has({ uri: document.uri, range: { start: position, end: position } })) {
                    return;
                }
                recursiveChecker.add({ uri: document.uri, range: { start: position, end: position } });
                const workspaceEdit = await plugin[1].provideRenameEdits(document, position, newName, token);
                if (!workspaceEdit) {
                    return;
                }
                if (!result) {
                    result = {};
                }
                if (workspaceEdit.changes) {
                    for (const editUri in workspaceEdit.changes) {
                        const textEdits = workspaceEdit.changes[editUri];
                        for (const textEdit of textEdits) {
                            let foundMirrorPosition = false;
                            recursiveChecker.add({ uri: editUri, range: { start: textEdit.range.start, end: textEdit.range.start } });
                            const decoded = context.decodeEmbeddedDocumentUri(vscode_uri_1.URI.parse(editUri));
                            const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                            const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                            const linkedCodeMap = virtualCode && sourceScript
                                ? context.language.linkedCodeMaps.get(virtualCode)
                                : undefined;
                            if (sourceScript && virtualCode && linkedCodeMap) {
                                const embeddedDocument = context.documents.get(context.encodeEmbeddedDocumentUri(sourceScript.id, virtualCode.id), virtualCode.languageId, virtualCode.snapshot);
                                for (const linkedPos of (0, featureWorkers_1.getLinkedCodePositions)(embeddedDocument, linkedCodeMap, textEdit.range.start)) {
                                    if (recursiveChecker.has({ uri: embeddedDocument.uri, range: { start: linkedPos, end: linkedPos } })) {
                                        continue;
                                    }
                                    foundMirrorPosition = true;
                                    await withLinkedCode(embeddedDocument, linkedPos, newName);
                                }
                            }
                            if (!foundMirrorPosition) {
                                if (!result.changes) {
                                    result.changes = {};
                                }
                                if (!result.changes[editUri]) {
                                    result.changes[editUri] = [];
                                }
                                result.changes[editUri].push(textEdit);
                            }
                        }
                    }
                }
                if (workspaceEdit.changeAnnotations) {
                    for (const uri in workspaceEdit.changeAnnotations) {
                        if (!result.changeAnnotations) {
                            result.changeAnnotations = {};
                        }
                        result.changeAnnotations[uri] = workspaceEdit.changeAnnotations[uri];
                    }
                }
                if (workspaceEdit.documentChanges) {
                    if (!result.documentChanges) {
                        result.documentChanges = [];
                    }
                    result.documentChanges = result.documentChanges.concat(workspaceEdit.documentChanges);
                }
            }
        }, data => {
            return (0, transform_1.transformWorkspaceEdit)(data, context, 'rename');
        }, workspaceEdits => {
            const mainEdit = workspaceEdits[0];
            const otherEdits = workspaceEdits.slice(1);
            mergeWorkspaceEdits(mainEdit, ...otherEdits);
            if (mainEdit.changes) {
                for (const uri in mainEdit.changes) {
                    mainEdit.changes[uri] = dedupe.withTextEdits(mainEdit.changes[uri]);
                }
            }
            return workspaceEdits[0];
        });
    };
}
function mergeWorkspaceEdits(original, ...others) {
    for (const other of others) {
        for (const uri in other.changeAnnotations) {
            if (!original.changeAnnotations) {
                original.changeAnnotations = {};
            }
            original.changeAnnotations[uri] = other.changeAnnotations[uri];
        }
        for (const uri in other.changes) {
            if (!original.changes) {
                original.changes = {};
            }
            if (!original.changes[uri]) {
                original.changes[uri] = [];
            }
            const edits = other.changes[uri];
            original.changes[uri] = original.changes[uri].concat(edits);
        }
        if (other.documentChanges) {
            if (!original.documentChanges) {
                original.documentChanges = [];
            }
            for (const docChange of other.documentChanges) {
                (0, transform_1.pushEditToDocumentChanges)(original.documentChanges, docChange);
            }
        }
    }
}
//# sourceMappingURL=provideRenameEdits.js.map