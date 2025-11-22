/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isDocument, isScalar, visit } from 'yaml';
export function getParent(doc, nodeToFind) {
    let parentNode;
    visit(doc, (_, node, path) => {
        if (node === nodeToFind) {
            parentNode = path[path.length - 1];
            return visit.BREAK;
        }
    });
    if (isDocument(parentNode)) {
        return undefined;
    }
    return parentNode;
}
export function isMapContainsEmptyPair(map) {
    if (map.items.length > 1) {
        return false;
    }
    const pair = map.items[0];
    return isScalar(pair.key) && isScalar(pair.value) && pair.key.value === '' && !pair.value.value;
}
export function indexOf(seq, item) {
    for (const [i, obj] of seq.items.entries()) {
        if (item === obj) {
            return i;
        }
    }
    return undefined;
}
/**
 * Check that given offset is in YAML comment
 * @param doc the yaml document
 * @param offset the offset to check
 */
export function isInComment(tokens, offset) {
    let inComment = false;
    for (const token of tokens) {
        if (token.type === 'document') {
            _visit([], token, (item) => {
                if (isCollectionItem(item) && item.value?.type === 'comment') {
                    if (token.offset <= offset && item.value.source.length + item.value.offset >= offset) {
                        inComment = true;
                        return visit.BREAK;
                    }
                }
                else if (item.type === 'comment' && item.offset <= offset && item.offset + item.source.length >= offset) {
                    inComment = true;
                    return visit.BREAK;
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
export function isCollectionItem(token) {
    return token['start'] !== undefined;
}
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
                else if (ci === visit.BREAK)
                    return visit.BREAK;
                else if (ci === visit.REMOVE) {
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
            else if (ci === visit.BREAK)
                return visit.BREAK;
            else if (ci === visit.REMOVE) {
                token.items.splice(i, 1);
                i -= 1;
            }
        }
    }
    return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}
//# sourceMappingURL=astUtils.js.map