/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Position } from 'vscode-languageserver-types';
export function insertionPointReturnValue(pt) {
    return -pt - 1;
}
export function binarySearch(array, sought) {
    let lower = 0;
    let upper = array.length - 1;
    while (lower <= upper) {
        const idx = Math.floor((lower + upper) / 2);
        const value = array[idx];
        if (value === sought) {
            return idx;
        }
        if (lower === upper) {
            const insertionPoint = value < sought ? idx + 1 : idx;
            return insertionPointReturnValue(insertionPoint);
        }
        if (sought > value) {
            lower = idx + 1;
        }
        else if (sought < value) {
            upper = idx - 1;
        }
    }
}
export function getLineStartPositions(text) {
    const lineStartPositions = [0];
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '\r') {
            // Check for Windows encoding, otherwise we are old Mac
            if (i + 1 < text.length && text[i + 1] === '\n') {
                i++;
            }
            lineStartPositions.push(i + 1);
        }
        else if (c === '\n') {
            lineStartPositions.push(i + 1);
        }
    }
    return lineStartPositions;
}
export function getPosition(pos, lineStartPositions) {
    let line = binarySearch(lineStartPositions, pos);
    if (line < 0) {
        const insertionPoint = -1 * line - 1;
        line = insertionPoint - 1;
    }
    return Position.create(line, pos - lineStartPositions[line]);
}
//# sourceMappingURL=documentPositionCalculator.js.map