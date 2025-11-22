(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "yaml", "../utils/arrUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCustomTags = void 0;
    const yaml_1 = require("yaml");
    const arrUtils_1 = require("../utils/arrUtils");
    class CommonTagImpl {
        constructor(tag, type) {
            this.tag = tag;
            this.type = type;
        }
        get collection() {
            if (this.type === 'mapping') {
                return 'map';
            }
            if (this.type === 'sequence') {
                return 'seq';
            }
            return undefined;
        }
        resolve(value) {
            if ((0, yaml_1.isMap)(value) && this.type === 'mapping') {
                return value;
            }
            if ((0, yaml_1.isSeq)(value) && this.type === 'sequence') {
                return value;
            }
            if (typeof value === 'string' && this.type === 'scalar') {
                return value;
            }
        }
    }
    class IncludeTag {
        constructor() {
            this.tag = '!include';
            this.type = 'scalar';
        }
        resolve(value, onError) {
            if (value && value.length > 0 && value.trim()) {
                return value;
            }
            onError('!include without value');
        }
    }
    /**
     * Converts the tags from settings and adds known tags such as !include
     * and returns Tags that can be used by the parser.
     * @param customTags Tags for parser
     */
    function getCustomTags(customTags) {
        const tags = [];
        const filteredTags = (0, arrUtils_1.filterInvalidCustomTags)(customTags);
        for (const tag of filteredTags) {
            const typeInfo = tag.split(' ');
            const tagName = typeInfo[0];
            const tagType = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
            tags.push(new CommonTagImpl(tagName, tagType));
        }
        tags.push(new IncludeTag());
        return tags;
    }
    exports.getCustomTags = getCustomTags;
});
//# sourceMappingURL=custom-tag-provider.js.map