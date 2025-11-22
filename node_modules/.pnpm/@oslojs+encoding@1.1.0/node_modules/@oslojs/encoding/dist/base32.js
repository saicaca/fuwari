export function encodeBase32UpperCase(bytes) {
    return encodeBase32_internal(bytes, base32UpperCaseAlphabet, EncodingPadding.Include);
}
export function encodeBase32UpperCaseNoPadding(bytes) {
    return encodeBase32_internal(bytes, base32UpperCaseAlphabet, EncodingPadding.None);
}
export function encodeBase32LowerCase(bytes) {
    return encodeBase32_internal(bytes, base32LowerCaseAlphabet, EncodingPadding.Include);
}
export function encodeBase32LowerCaseNoPadding(bytes) {
    return encodeBase32_internal(bytes, base32LowerCaseAlphabet, EncodingPadding.None);
}
/** Replaced: Use encodeBase32UpperCase() instead. */
export function encodeBase32(bytes) {
    return encodeBase32UpperCase(bytes);
}
/** Replaced: Use encodeBase32UpperCaseNoPadding() instead. */
export function encodeBase32NoPadding(bytes) {
    return encodeBase32UpperCaseNoPadding(bytes);
}
function encodeBase32_internal(bytes, alphabet, padding) {
    let result = "";
    for (let i = 0; i < bytes.byteLength; i += 5) {
        let buffer = 0n;
        let bufferBitSize = 0;
        for (let j = 0; j < 5 && i + j < bytes.byteLength; j++) {
            buffer = (buffer << 8n) | BigInt(bytes[i + j]);
            bufferBitSize += 8;
        }
        if (bufferBitSize % 5 !== 0) {
            buffer = buffer << BigInt(5 - (bufferBitSize % 5));
            bufferBitSize += 5 - (bufferBitSize % 5);
        }
        for (let j = 0; j < 8; j++) {
            if (bufferBitSize >= 5) {
                result += alphabet[Number((buffer >> BigInt(bufferBitSize - 5)) & 0x1fn)];
                bufferBitSize -= 5;
            }
            else if (bufferBitSize > 0) {
                result += alphabet[Number((buffer << BigInt(6 - bufferBitSize)) & 0x3fn)];
                bufferBitSize = 0;
            }
            else if (padding === EncodingPadding.Include) {
                result += "=";
            }
        }
    }
    return result;
}
export function decodeBase32(encoded) {
    return decodeBase32_internal(encoded, base32DecodeMap, DecodingPadding.Required);
}
export function decodeBase32IgnorePadding(encoded) {
    return decodeBase32_internal(encoded, base32DecodeMap, DecodingPadding.Ignore);
}
function decodeBase32_internal(encoded, decodeMap, padding) {
    const result = new Uint8Array(Math.ceil(encoded.length / 8) * 5);
    let totalBytes = 0;
    for (let i = 0; i < encoded.length; i += 8) {
        let chunk = 0n;
        let bitsRead = 0;
        for (let j = 0; j < 8; j++) {
            if (padding === DecodingPadding.Required) {
                if (encoded[i + j] === "=") {
                    continue;
                }
                if (i + j >= encoded.length) {
                    throw new Error("Invalid padding");
                }
            }
            if (padding === DecodingPadding.Ignore) {
                if (i + j >= encoded.length || encoded[i + j] === "=") {
                    continue;
                }
            }
            if (j > 0 && encoded[i + j - 1] === "=") {
                throw new Error("Invalid padding");
            }
            if (!(encoded[i + j] in decodeMap)) {
                throw new Error("Invalid character");
            }
            chunk |= BigInt(decodeMap[encoded[i + j]]) << BigInt((7 - j) * 5);
            bitsRead += 5;
        }
        if (bitsRead < 40) {
            let unused;
            if (bitsRead === 10) {
                unused = chunk & 0xffffffffn;
            }
            else if (bitsRead === 20) {
                unused = chunk & 0xffffffn;
            }
            else if (bitsRead === 25) {
                unused = chunk & 0xffffn;
            }
            else if (bitsRead === 35) {
                unused = chunk & 0xffn;
            }
            else {
                throw new Error("Invalid padding");
            }
            if (unused !== 0n) {
                throw new Error("Invalid padding");
            }
        }
        const byteLength = Math.floor(bitsRead / 8);
        for (let i = 0; i < byteLength; i++) {
            result[totalBytes] = Number((chunk >> BigInt(32 - i * 8)) & 0xffn);
            totalBytes++;
        }
    }
    return result.slice(0, totalBytes);
}
const base32UpperCaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const base32LowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz234567";
const base32DecodeMap = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
    j: 9,
    k: 10,
    l: 11,
    m: 12,
    n: 13,
    o: 14,
    p: 15,
    q: 16,
    r: 17,
    s: 18,
    t: 19,
    u: 20,
    v: 21,
    w: 22,
    x: 23,
    y: 24,
    z: 25,
    "2": 26,
    "3": 27,
    "4": 28,
    "5": 29,
    "6": 30,
    "7": 31
};
var EncodingPadding;
(function (EncodingPadding) {
    EncodingPadding[EncodingPadding["Include"] = 0] = "Include";
    EncodingPadding[EncodingPadding["None"] = 1] = "None";
})(EncodingPadding || (EncodingPadding = {}));
var DecodingPadding;
(function (DecodingPadding) {
    DecodingPadding[DecodingPadding["Required"] = 0] = "Required";
    DecodingPadding[DecodingPadding["Ignore"] = 1] = "Ignore";
})(DecodingPadding || (DecodingPadding = {}));
