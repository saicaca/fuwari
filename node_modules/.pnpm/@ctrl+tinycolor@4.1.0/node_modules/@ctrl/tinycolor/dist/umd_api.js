"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const css_color_names_js_1 = require("./css-color-names.js");
const format_input_js_1 = require("./format-input.js");
const from_ratio_js_1 = require("./from-ratio.js");
const index_js_1 = require("./index.js");
const random_js_1 = require("./random.js");
const readability_js_1 = require("./readability.js");
const to_ms_filter_js_1 = require("./to-ms-filter.js");
const tinycolorumd = {
    TinyColor: index_js_1.TinyColor,
    readability: readability_js_1.readability,
    mostReadable: readability_js_1.mostReadable,
    random: random_js_1.random,
    names: css_color_names_js_1.names,
    fromRatio: from_ratio_js_1.fromRatio,
    legacyRandom: from_ratio_js_1.legacyRandom,
    toMsFilter: to_ms_filter_js_1.toMsFilter,
    inputToRGB: format_input_js_1.inputToRGB,
    stringInputToObject: format_input_js_1.stringInputToObject,
    isValidCSSUnit: format_input_js_1.isValidCSSUnit,
};
exports.default = tinycolorumd;
