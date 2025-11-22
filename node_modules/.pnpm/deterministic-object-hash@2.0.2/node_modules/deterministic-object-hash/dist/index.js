"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicString = void 0;
const node_crypto_1 = require("node:crypto");
const isPlainObject_1 = __importDefault(require("./isPlainObject"));
const encoders_1 = require("./encoders");
/** Creates a deterministic hash for all inputs. */
async function deterministicHash(input, algorithm = "SHA-1", output = "hex") {
    const encoder = new TextEncoder();
    const data = encoder.encode(deterministicString(input));
    const hash = await node_crypto_1.webcrypto.subtle.digest(algorithm, data);
    return encoders_1.encoders[output](hash);
}
exports.default = deterministicHash;
function deterministicString(input) {
    if (typeof input === 'string') {
        //wrap in quotes (and escape queotes) to differentiate from stringified primitives
        return JSON.stringify(input);
    }
    else if (typeof input === 'symbol' || typeof input === 'function') {
        //use `toString` for an accurate representation of these
        return input.toString();
    }
    else if (typeof input === 'bigint') {
        //bigint turns into a string int, so I need to differentiate it from a normal int
        return `${input}n`;
    }
    else if (input === globalThis || input === undefined || input === null || typeof input === 'boolean' || typeof input === 'number' || typeof input !== 'object') {
        //cast to string for any of these
        return `${input}`;
    }
    else if (input instanceof Date) {
        //using timestamp for dates
        return `(${input.constructor.name}:${input.getTime()})`;
    }
    else if (input instanceof RegExp || input instanceof Error || input instanceof WeakMap || input instanceof WeakSet) {
        //use simple `toString`. `WeakMap` and `WeakSet` are non-iterable, so this is the best I can do
        return `(${input.constructor.name}:${input.toString()})`;
    }
    else if (input instanceof Set) {
        //add the constructor as a key
        let ret = `(${input.constructor.name}:[`;
        //add all unique values
        for (const val of input.values()) {
            ret += `${deterministicString(val)},`;
        }
        ret += '])';
        return ret;
    }
    else if (Array.isArray(input) ||
        input instanceof Int8Array ||
        input instanceof Uint8Array ||
        input instanceof Uint8ClampedArray ||
        input instanceof Int16Array ||
        input instanceof Uint16Array ||
        input instanceof Int32Array ||
        input instanceof Uint32Array ||
        input instanceof Float32Array ||
        input instanceof Float64Array ||
        input instanceof BigInt64Array ||
        input instanceof BigUint64Array) {
        //add the constructor as a key
        let ret = `(${input.constructor.name}:[`;
        //add all key/value pairs
        for (const [k, v] of input.entries()) {
            ret += `(${k}:${deterministicString(v)}),`;
        }
        ret += '])';
        return ret;
    }
    else if (input instanceof ArrayBuffer || input instanceof SharedArrayBuffer) {
        //each typed array must be in multiples of their byte size.
        //see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects
        if (input.byteLength % 8 === 0) {
            return deterministicString(new BigUint64Array(input));
        }
        else if (input.byteLength % 4 === 0) {
            return deterministicString(new Uint32Array(input));
        }
        else if (input.byteLength % 2 === 0) {
            return deterministicString(new Uint16Array(input));
        }
        else {
            /** @todo - Change this to a system that breaks it down into parts. E.g. byteLength of 17 = BigUint64Array*2 and Uint8Array */
            let ret = '(';
            for (let i = 0; i < input.byteLength; i++) {
                ret += `${deterministicString(new Uint8Array(input.slice(i, i + 1)))},`;
            }
            ret += ')';
            return ret;
        }
    }
    else if (input instanceof Map || (0, isPlainObject_1.default)(input)) {
        //all key/values will be put here for sorting by key
        const sortable = [];
        //get key/value pairs
        const entries = (input instanceof Map
            ? input.entries()
            : Object.entries(input));
        //add all key value pairs
        for (const [k, v] of entries) {
            sortable.push([deterministicString(k), deterministicString(v)]);
        }
        //if not a map, get Symbol keys and add them
        if (!(input instanceof Map)) {
            const symbolKeys = Object.getOwnPropertySymbols(input);
            //convert each symbol key to a key/value pair
            for (let i = 0; i < symbolKeys.length; i++) {
                sortable.push([
                    deterministicString(symbolKeys[i]),
                    deterministicString(
                    //have to ignore because `noImplicitAny` is `true` but this is implicitly `any`
                    //@ts-ignore
                    input[symbolKeys[i]])
                ]);
            }
        }
        //sort alphabetically by keys
        sortable.sort(([a], [b]) => a.localeCompare(b));
        //add the constructor as a key
        let ret = `(${input.constructor.name}:[`;
        //add all of the key/value pairs
        for (const [k, v] of sortable) {
            ret += `(${k}:${v}),`;
        }
        ret += '])';
        return ret;
    }
    //a class/non-plain object
    const allEntries = [];
    for (const k in input) {
        allEntries.push([
            deterministicString(k),
            deterministicString(
            //have to ignore because `noImplicitAny` is `true` but this is implicitly `any`
            //@ts-ignore
            input[k])
        ]);
    }
    //get all own property symbols
    const symbolKeys = Object.getOwnPropertySymbols(input);
    //convert each symbol key to a key/value pair
    for (let i = 0; i < symbolKeys.length; i++) {
        allEntries.push([
            deterministicString(symbolKeys[i]),
            deterministicString(
            //have to ignore because `noImplicitAny` is `true` but this is implicitly `any`
            //@ts-ignore
            input[symbolKeys[i]])
        ]);
    }
    //sort alphabetically by keys
    allEntries.sort(([a], [b]) => a.localeCompare(b));
    //add the constructor as a key
    let ret = `(${input.constructor.name}:[`;
    //add all of the key/value pairs
    for (const [k, v] of allEntries) {
        ret += `(${k}:${v}),`;
    }
    ret += '])';
    return ret;
}
exports.deterministicString = deterministicString;
