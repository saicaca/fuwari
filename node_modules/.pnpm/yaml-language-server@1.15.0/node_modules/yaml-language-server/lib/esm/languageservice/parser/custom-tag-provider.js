import { isSeq, isMap } from 'yaml';
import { filterInvalidCustomTags } from '../utils/arrUtils';
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
        if (isMap(value) && this.type === 'mapping') {
            return value;
        }
        if (isSeq(value) && this.type === 'sequence') {
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
export function getCustomTags(customTags) {
    const tags = [];
    const filteredTags = filterInvalidCustomTags(customTags);
    for (const tag of filteredTags) {
        const typeInfo = tag.split(' ');
        const tagName = typeInfo[0];
        const tagType = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
        tags.push(new CommonTagImpl(tagName, tagType));
    }
    tags.push(new IncludeTag());
    return tags;
}
//# sourceMappingURL=custom-tag-provider.js.map