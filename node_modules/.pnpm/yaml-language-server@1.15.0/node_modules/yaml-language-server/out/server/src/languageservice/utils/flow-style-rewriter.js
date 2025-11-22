"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowStyleRewriter = void 0;
const yaml_1 = require("yaml");
class FlowStyleRewriter {
    constructor(indentation) {
        this.indentation = indentation;
    }
    write(node) {
        if (node.internalNode.srcToken['type'] !== 'flow-collection') {
            return null;
        }
        const collection = node.internalNode.srcToken;
        const blockType = collection.start.type === 'flow-map-start' ? 'block-map' : 'block-seq';
        const parentType = node.parent.type;
        const blockStyle = {
            type: blockType,
            offset: collection.offset,
            indent: collection.indent,
            items: [],
        };
        for (const item of collection.items) {
            yaml_1.CST.visit(item, ({ key, sep, value }) => {
                if (blockType === 'block-map') {
                    const start = [{ type: 'space', indent: 0, offset: key.offset, source: this.indentation }];
                    if (parentType === 'property') {
                        // add a new line if part of a map
                        start.unshift({ type: 'newline', indent: 0, offset: key.offset, source: '\n' });
                    }
                    blockStyle.items.push({
                        start: start,
                        key: key,
                        sep: sep,
                        value: value,
                    });
                }
                else if (blockType === 'block-seq') {
                    blockStyle.items.push({
                        start: [
                            { type: 'newline', indent: 0, offset: value.offset, source: '\n' },
                            { type: 'space', indent: 0, offset: value.offset, source: this.indentation },
                            { type: 'seq-item-ind', indent: 0, offset: value.offset, source: '-' },
                            { type: 'space', indent: 0, offset: value.offset, source: ' ' },
                        ],
                        value: value,
                    });
                }
                if (value.type === 'flow-collection') {
                    return yaml_1.visit.SKIP;
                }
            });
        }
        return yaml_1.CST.stringify(blockStyle);
    }
}
exports.FlowStyleRewriter = FlowStyleRewriter;
//# sourceMappingURL=flow-style-rewriter.js.map