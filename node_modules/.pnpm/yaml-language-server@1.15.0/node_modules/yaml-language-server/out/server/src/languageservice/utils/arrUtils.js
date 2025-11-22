"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayEqual = exports.filterInvalidCustomTags = exports.matchOffsetToDocument = exports.removeDuplicatesObj = exports.getLineOffsets = void 0;
function getLineOffsets(textDocString) {
    const lineOffsets = [];
    const text = textDocString;
    let isLineStart = true;
    for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        const ch = text.charAt(i);
        isLineStart = ch === '\r' || ch === '\n';
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
exports.getLineOffsets = getLineOffsets;
function removeDuplicatesObj(objArray) {
    const nonDuplicateSet = new Set();
    const nonDuplicateArr = [];
    for (const obj in objArray) {
        const currObj = objArray[obj];
        const stringifiedObj = JSON.stringify(currObj);
        if (!nonDuplicateSet.has(stringifiedObj)) {
            nonDuplicateArr.push(currObj);
            nonDuplicateSet.add(stringifiedObj);
        }
    }
    return nonDuplicateArr;
}
exports.removeDuplicatesObj = removeDuplicatesObj;
function matchOffsetToDocument(offset, jsonDocuments) {
    for (const jsonDoc of jsonDocuments.documents) {
        if (jsonDoc.internalDocument && jsonDoc.internalDocument.range[0] <= offset && jsonDoc.internalDocument.range[2] >= offset) {
            return jsonDoc;
        }
    }
    if (jsonDocuments.documents.length === 1) {
        return jsonDocuments.documents[0];
    }
    return null;
}
exports.matchOffsetToDocument = matchOffsetToDocument;
function filterInvalidCustomTags(customTags) {
    const validCustomTags = ['mapping', 'scalar', 'sequence'];
    if (!customTags) {
        return [];
    }
    return customTags.filter((tag) => {
        if (typeof tag === 'string') {
            const typeInfo = tag.split(' ');
            const type = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
            // We need to check if map is a type because map will throw an error within the yaml-ast-parser
            if (type === 'map') {
                return false;
            }
            return validCustomTags.indexOf(type) !== -1;
        }
        return false;
    });
}
exports.filterInvalidCustomTags = filterInvalidCustomTags;
function isArrayEqual(fst, snd) {
    if (!snd || !fst) {
        return false;
    }
    if (snd.length !== fst.length) {
        return false;
    }
    for (let index = fst.length - 1; index >= 0; index--) {
        if (fst[index] !== snd[index]) {
            return false;
        }
    }
    return true;
}
exports.isArrayEqual = isArrayEqual;
//# sourceMappingURL=arrUtils.js.map