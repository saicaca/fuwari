"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encoders = void 0;
const base_64_1 = require("base-64");
const binary = (input) => {
    let binary = "";
    const bytes = new Uint8Array(input);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        const buffer = bytes[i];
        if (buffer)
            binary += String.fromCharCode(buffer);
    }
    return binary;
};
const hex = (input) => [...new Uint8Array(input)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
// @see https://stackoverflow.com/questions/35155089/node-sha-256-base64-digest
// @see https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
const base64 = (input) => (0, base_64_1.encode)(binary(input));
const base64url = (input) => base64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
exports.encoders = {
    base64,
    base64url,
    hex,
    binary,
};
