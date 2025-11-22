import { h } from 'hastscript';
import { map } from 'unist-util-map';
const isDirectiveNode = (node) => {
    const { type } = node;
    return type === 'textDirective' || type === 'leafDirective' || type === 'containerDirective';
};
const mapDirectiveNode = (node) => {
    if (isDirectiveNode(node)) {
        const { properties, tagName } = h(node.name, node.attributes);
        return Object.assign(Object.assign({}, node), { data: {
                hName: tagName,
                hProperties: properties
            } });
    }
    return node;
};
const transformNodeTree = (nodeTree) => map(nodeTree, mapDirectiveNode);
const remarkDirectiveRehype = () => transformNodeTree;
export default remarkDirectiveRehype;
