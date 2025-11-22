/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../utils/markup"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLDataProvider = void 0;
    exports.generateDocumentation = generateDocumentation;
    const markup_1 = require("../utils/markup");
    class HTMLDataProvider {
        isApplicable() {
            return true;
        }
        /**
         * Currently, unversioned data uses the V1 implementation
         * In the future when the provider handles multiple versions of HTML custom data,
         * use the latest implementation for unversioned data
         */
        constructor(id, customData) {
            this.id = id;
            this._tags = [];
            this._tagMap = {};
            this._valueSetMap = {};
            this._tags = customData.tags || [];
            this._globalAttributes = customData.globalAttributes || [];
            this._tags.forEach(t => {
                this._tagMap[t.name.toLowerCase()] = t;
            });
            if (customData.valueSets) {
                customData.valueSets.forEach(vs => {
                    this._valueSetMap[vs.name] = vs.values;
                });
            }
        }
        getId() {
            return this.id;
        }
        provideTags() {
            return this._tags;
        }
        provideAttributes(tag) {
            const attributes = [];
            const processAttribute = (a) => {
                attributes.push(a);
            };
            const tagEntry = this._tagMap[tag.toLowerCase()];
            if (tagEntry) {
                tagEntry.attributes.forEach(processAttribute);
            }
            this._globalAttributes.forEach(processAttribute);
            return attributes;
        }
        provideValues(tag, attribute) {
            const values = [];
            attribute = attribute.toLowerCase();
            const processAttributes = (attributes) => {
                attributes.forEach(a => {
                    if (a.name.toLowerCase() === attribute) {
                        if (a.values) {
                            a.values.forEach(v => {
                                values.push(v);
                            });
                        }
                        if (a.valueSet) {
                            if (this._valueSetMap[a.valueSet]) {
                                this._valueSetMap[a.valueSet].forEach(v => {
                                    values.push(v);
                                });
                            }
                        }
                    }
                });
            };
            const tagEntry = this._tagMap[tag.toLowerCase()];
            if (tagEntry) {
                processAttributes(tagEntry.attributes);
            }
            processAttributes(this._globalAttributes);
            return values;
        }
    }
    exports.HTMLDataProvider = HTMLDataProvider;
    /**
     * Generate Documentation used in hover/complete
     * From `documentation` and `references`
     */
    function generateDocumentation(item, settings = {}, doesSupportMarkdown) {
        const result = {
            kind: doesSupportMarkdown ? 'markdown' : 'plaintext',
            value: ''
        };
        if (item.description && settings.documentation !== false) {
            const normalizedDescription = (0, markup_1.normalizeMarkupContent)(item.description);
            if (normalizedDescription) {
                result.value += normalizedDescription.value;
            }
        }
        if (item.references && item.references.length > 0 && settings.references !== false) {
            if (result.value.length) {
                result.value += `\n\n`;
            }
            if (doesSupportMarkdown) {
                result.value += item.references.map(r => {
                    return `[${r.name}](${r.url})`;
                }).join(' | ');
            }
            else {
                result.value += item.references.map(r => {
                    return `${r.name}: ${r.url}`;
                }).join('\n');
            }
        }
        if (result.value === '') {
            return undefined;
        }
        return result;
    }
});
