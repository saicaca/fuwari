"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationSet = createLocationSet;
exports.withCodeAction = withCodeAction;
exports.withTextEdits = withTextEdits;
exports.withDocumentChanges = withDocumentChanges;
exports.withDiagnostics = withDiagnostics;
exports.withLocations = withLocations;
exports.withLocationLinks = withLocationLinks;
exports.withCallHierarchyIncomingCalls = withCallHierarchyIncomingCalls;
exports.withCallHierarchyOutgoingCalls = withCallHierarchyOutgoingCalls;
exports.withRanges = withRanges;
function createLocationSet() {
    const set = new Set();
    return {
        add,
        has,
    };
    function add(item) {
        if (has(item)) {
            return false;
        }
        set.add(getKey(item));
        return true;
    }
    function has(item) {
        return set.has(getKey(item));
    }
    function getKey(item) {
        return [
            item.uri,
            item.range.start.line,
            item.range.start.character,
            item.range.end.line,
            item.range.end.character,
        ].join(':');
    }
}
function withCodeAction(items) {
    return dedupe(items, item => [
        item.title
    ].join(':'));
}
function withTextEdits(items) {
    return dedupe(items, item => [
        item.range.start.line,
        item.range.start.character,
        item.range.end.line,
        item.range.end.character,
        item.newText,
    ].join(':'));
}
function withDocumentChanges(items) {
    return dedupe(items, item => JSON.stringify(item)); // TODO: improve this
}
function withDiagnostics(items) {
    return dedupe(items, item => [
        item.range.start.line,
        item.range.start.character,
        item.range.end.line,
        item.range.end.character,
        item.source,
        item.code,
        item.severity,
        item.message,
    ].join(':'));
}
function withLocations(items) {
    return dedupe(items, item => [
        item.uri,
        item.range.start.line,
        item.range.start.character,
        item.range.end.line,
        item.range.end.character,
    ].join(':'));
}
function withLocationLinks(items) {
    return dedupe(items, item => [
        item.targetUri,
        item.targetSelectionRange.start.line,
        item.targetSelectionRange.start.character,
        item.targetSelectionRange.end.line,
        item.targetSelectionRange.end.character,
        // ignore difference targetRange
    ].join(':'));
}
function withCallHierarchyIncomingCalls(items) {
    return dedupe(items, item => [
        item.from.uri,
        item.from.range.start.line,
        item.from.range.start.character,
        item.from.range.end.line,
        item.from.range.end.character,
    ].join(':'));
}
function withCallHierarchyOutgoingCalls(items) {
    return dedupe(items, item => [
        item.to.uri,
        item.to.range.start.line,
        item.to.range.start.character,
        item.to.range.end.line,
        item.to.range.end.character,
    ].join(':'));
}
function withRanges(items) {
    return dedupe(items, item => [
        item.start.line,
        item.start.character,
        item.end.line,
        item.end.character,
    ].join(':'));
}
function dedupe(items, getKey) {
    const map = new Map();
    for (const item of items.reverse()) {
        map.set(getKey(item), item);
    }
    return [...map.values()];
}
//# sourceMappingURL=dedupe.js.map