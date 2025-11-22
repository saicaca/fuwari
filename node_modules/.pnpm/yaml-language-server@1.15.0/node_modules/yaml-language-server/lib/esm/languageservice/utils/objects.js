/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function equals(one, other) {
    if (one === other) {
        return true;
    }
    if (one === null || one === undefined || other === null || other === undefined) {
        return false;
    }
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== 'object') {
        return false;
    }
    if (Array.isArray(one) !== Array.isArray(other)) {
        return false;
    }
    let i, key;
    if (Array.isArray(one)) {
        if (one.length !== other.length) {
            return false;
        }
        for (i = 0; i < one.length; i++) {
            if (!equals(one[i], other[i])) {
                return false;
            }
        }
    }
    else {
        const oneKeys = [];
        for (key in one) {
            oneKeys.push(key);
        }
        oneKeys.sort();
        const otherKeys = [];
        for (key in other) {
            otherKeys.push(key);
        }
        otherKeys.sort();
        if (!equals(oneKeys, otherKeys)) {
            return false;
        }
        for (i = 0; i < oneKeys.length; i++) {
            if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
                return false;
            }
        }
    }
    return true;
}
export function isNumber(val) {
    return typeof val === 'number';
}
// eslint-disable-next-line @typescript-eslint/ban-types
export function isDefined(val) {
    return typeof val !== 'undefined';
}
export function isBoolean(val) {
    return typeof val === 'boolean';
}
export function isString(val) {
    return typeof val === 'string';
}
/**
 * Check that provided value is Iterable
 * @param val the value to check
 * @returns true if val is iterable, false otherwise
 */
export function isIterable(val) {
    return Symbol.iterator in Object(val);
}
/**
 * Convert error to string witch should be sended to telemetry.
 * @param err any error
 */
export function convertErrorToTelemetryMsg(err) {
    if (!err)
        return 'null';
    if (err instanceof Error) {
        return err.stack ?? err.toString();
    }
    return err.toString();
}
//# sourceMappingURL=objects.js.map