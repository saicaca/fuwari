"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var editor_exports = {};
__export(editor_exports, {
  toTSX: () => toTSX
});
module.exports = __toCommonJS(editor_exports);
var import_svelte2tsx = require("svelte2tsx");
function toTSX(code, className) {
  let result = `
		let ${className}__AstroComponent_: Error
		export default ${className}__AstroComponent_
	`;
  try {
    let tsx = (0, import_svelte2tsx.svelte2tsx)(code, { mode: "ts" }).code;
    tsx = '/// <reference types="svelte2tsx/svelte-shims" />\n' + tsx;
    result = tsx.replace(
      "export default class extends __sveltets_2_createSvelte2TsxComponent(",
      `export default function ${className}__AstroComponent_(_props: typeof Component.props): any {}
let Component = `
    );
  } catch {
    return result;
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  toTSX
});
