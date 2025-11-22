"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOverlapCodeRange = findOverlapCodeRange;
exports.isInsideRange = isInsideRange;
exports.isEqualRange = isEqualRange;
exports.stringToSnapshot = stringToSnapshot;
exports.sleep = sleep;
function findOverlapCodeRange(start, end, map, filter) {
    let mappedStart;
    let mappedEnd;
    for (const [mapped, mapping] of map.toGeneratedLocation(start)) {
        if (filter(mapping.data)) {
            mappedStart = mapped;
            break;
        }
    }
    for (const [mapped, mapping] of map.toGeneratedLocation(end)) {
        if (filter(mapping.data)) {
            mappedEnd = mapped;
            break;
        }
    }
    if (mappedStart === undefined || mappedEnd === undefined) {
        for (const mapping of map.mappings) {
            if (filter(mapping.data)) {
                const mappingStart = mapping.sourceOffsets[0];
                const mappingEnd = mapping.sourceOffsets[mapping.sourceOffsets.length - 1] + mapping.lengths[mapping.lengths.length - 1];
                const overlap = getOverlapRange(start, end, mappingStart, mappingEnd);
                if (overlap) {
                    const curMappedStart = (overlap.start - mappingStart) + mapping.generatedOffsets[0];
                    const lastGeneratedLength = (mapping.generatedLengths ?? mapping.lengths)[mapping.generatedOffsets.length - 1];
                    const curMappedEndOffset = Math.min(overlap.end - mapping.sourceOffsets[mapping.sourceOffsets.length - 1], lastGeneratedLength);
                    const curMappedEnd = mapping.generatedOffsets[mapping.generatedOffsets.length - 1] + curMappedEndOffset;
                    mappedStart = mappedStart === undefined ? curMappedStart : Math.min(mappedStart, curMappedStart);
                    mappedEnd = mappedEnd === undefined ? curMappedEnd : Math.max(mappedEnd, curMappedEnd);
                }
            }
        }
    }
    if (mappedStart !== undefined && mappedEnd !== undefined) {
        return {
            start: mappedStart,
            end: mappedEnd,
        };
    }
}
function getOverlapRange(range1Start, range1End, range2Start, range2End) {
    const start = Math.max(range1Start, range2Start);
    const end = Math.min(range1End, range2End);
    if (start > end) {
        return undefined;
    }
    return {
        start,
        end,
    };
}
function isInsideRange(parent, child) {
    if (child.start.line < parent.start.line) {
        return false;
    }
    if (child.end.line > parent.end.line) {
        return false;
    }
    if (child.start.line === parent.start.line && child.start.character < parent.start.character) {
        return false;
    }
    if (child.end.line === parent.end.line && child.end.character > parent.end.character) {
        return false;
    }
    return true;
}
function isEqualRange(a, b) {
    return a.start.line === b.start.line
        && a.start.character === b.start.character
        && a.end.line === b.end.line
        && a.end.character === b.end.character;
}
function stringToSnapshot(str) {
    return {
        getText: (start, end) => str.substring(start, end),
        getLength: () => str.length,
        getChangeRange: () => undefined,
    };
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=common.js.map