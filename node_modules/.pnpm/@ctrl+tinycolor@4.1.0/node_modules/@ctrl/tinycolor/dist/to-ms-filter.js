"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMsFilter = void 0;
const conversion_js_1 = require("./conversion.js");
const index_js_1 = require("./index.js");
/**
 * Returns the color represented as a Microsoft filter for use in old versions of IE.
 */
function toMsFilter(firstColor, secondColor) {
    const color = new index_js_1.TinyColor(firstColor);
    const hex8String = '#' + (0, conversion_js_1.rgbaToArgbHex)(color.r, color.g, color.b, color.a);
    let secondHex8String = hex8String;
    const gradientType = color.gradientType ? 'GradientType = 1, ' : '';
    if (secondColor) {
        const s = new index_js_1.TinyColor(secondColor);
        secondHex8String = '#' + (0, conversion_js_1.rgbaToArgbHex)(s.r, s.g, s.b, s.a);
    }
    return `progid:DXImageTransform.Microsoft.gradient(${gradientType}startColorstr=${hex8String},endColorstr=${secondHex8String})`;
}
exports.toMsFilter = toMsFilter;
