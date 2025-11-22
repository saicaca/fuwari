"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCollectionItem = exports.isInComment = exports.indexOf = exports.isMapContainsEmptyPair = exports.getParent = void 0;
const yaml_1 = require("yaml");
function getParent(doc, nodeToFind) {
    let parentNode;
    (0, yaml_1.visit)(doc, (_, node, path) => {
        if (node === nodeToFind) {
            parentNode = path[path.length - 1];
            return yaml_1.visit.BREAK;
        }
    });
    if ((0, yaml_1.isDocument)(parentNode)) {
        return undefined;
    }
    return parentNode;
}
exports.getParent = getParent;
function isMapContainsEmptyPair(map) {
    if (map.items.length > 1) {
        return false;
    }
    const pair = map.items[0];
    return (0, yaml_1.isScalar)(pair.key) && (0, yaml_1.isScalar)(pair.value) && pair.key.value === '' && !pair.value.value;
}
exports.isMapContainsEmptyPair = isMapContainsEmptyPair;
function indexOf(seq, item) {
    for (const [i, obj] of seq.items.entries()) {
        if (item === obj) {
            return i;
        }
    }
    return undefined;
}
exports.indexOf = indexOf;
/**
 * Check that given offset is in YAML comment
 * @param doc the yaml document
 * @param offset the offset to check
 */
function isInComment(tokens, offset) {
    let inComment = false;
    for (const token of tokens) {
        if (token.type === 'document') {
            _visit([], token, (item) => {
                if (isCollectionItem(item) && item.value?.type === 'comment') {
                    if (token.offset <= offset && item.value.source.length + item.value.offset >= offset) {
                        inComment = true;
                        return yaml_1.visit.BREAK;
                    }
                }
                else if (item.type === 'comment' && item.offset <= offset && item.offset + item.source.length >= offset) {
                    inComment = true;
                    return yaml_1.visit.BREAK;
                }
            });
        }
        else if (token.type === 'comment') {
            if (token.offset <= offset && token.source.length + token.offset >= offset) {
                return true;
            }
        }
        if (inComment) {
            break;
        }
    }
    return inComment;
}
exports.isInComment = isInComment;
function isCollectionItem(token) {
    return token['start'] !== undefined;
}
exports.isCollectionItem = isCollectionItem;
function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === 'symbol')
        return ctrl;
    for (const field of ['key', 'value']) {
        const token = item[field];
        if (token && 'items' in token) {
            for (let i = 0; i < token.items.length; ++i) {
                const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === yaml_1.visit.BREAK)
                    return yaml_1.visit.BREAK;
                else if (ci === yaml_1.visit.REMOVE) {
                    token.items.splice(i, 1);
                    i -= 1;
                }
            }
            if (typeof ctrl === 'function' && field === 'key')
                ctrl = ctrl(item, path);
        }
    }
    const token = item['sep'];
    if (token) {
        for (let i = 0; i < token.length; ++i) {
            const ci = _visit(Object.freeze(path), token[i], visitor);
            if (typeof ci === 'number')
                i = ci - 1;
            else if (ci === yaml_1.visit.BREAK)
                return yaml_1.visit.BREAK;
            else if (ci === yaml_1.visit.REMOVE) {
                token.items.splice(i, 1);
                i -= 1;
            }
        }
    }
    return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}
//# sourceMappingURL=astUtils.js.map