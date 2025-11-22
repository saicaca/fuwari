"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegularIndex = exports.createMulticharIndex = exports.emptyRegularIndex = exports.emptyMulticharIndex = void 0;
exports.emptyMulticharIndex = {};
exports.emptyRegularIndex = {};
function extendIndex(item, index) {
    var currentIndex = index;
    for (var pos = 0; pos < item.length; pos++) {
        var isLast = pos === item.length - 1;
        var char = item.charAt(pos);
        var charIndex = currentIndex[char] || (currentIndex[char] = { chars: {} });
        if (isLast) {
            charIndex.self = item;
        }
        currentIndex = charIndex.chars;
    }
}
function createMulticharIndex(items) {
    if (items.length === 0) {
        return exports.emptyMulticharIndex;
    }
    var index = {};
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        extendIndex(item, index);
    }
    return index;
}
exports.createMulticharIndex = createMulticharIndex;
function createRegularIndex(items) {
    if (items.length === 0) {
        return exports.emptyRegularIndex;
    }
    var result = {};
    for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
        var item = items_2[_i];
        result[item] = true;
    }
    return result;
}
exports.createRegularIndex = createRegularIndex;
