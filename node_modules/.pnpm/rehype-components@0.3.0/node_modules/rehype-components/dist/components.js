import { visit, SKIP } from "unist-util-visit";
import { isElement } from "hast-util-is-element";
const rehypeComponents = function (options) {
    const { components = {} } = options;
    return (tree, vfile) => {
        const context = { tree, vfile, processor: this };
        visit(tree, (node, index, parent) => {
            if (!isElement(node)) {
                return;
            }
            const component = components[node.tagName];
            if (component && parent && index != null) {
                // Invoke the component function
                let returnedContent = component(node.properties || {}, node.children, context);
                // Normalize returned content to an array
                if (returnedContent == null) {
                    returnedContent = [];
                }
                else if (!Array.isArray(returnedContent)) {
                    returnedContent = [returnedContent];
                }
                if (!returnedContent.every(isElementContent)) {
                    throw new Error(`rehype-components: Component function is expected to return ElementContent or an array of ElementContent, but got ${JSON.stringify(returnedContent)}.`);
                }
                // Replace the node with the normalized content
                parent.children.splice(index, 1, ...returnedContent);
                // This return value is a tuple that tells unist-util-visit to skip the
                // children of the replaced node. Because we may have replaced the node.
                return [SKIP, index];
            }
        });
    };
};
function isElementContent(value) {
    if (isElement(value)) {
        return true;
    }
    if (objectHasKey(value, "type")) {
        if (value.type === "text") {
            return true;
        }
        if (value.type === "comment") {
            return true;
        }
    }
    return false;
}
function objectHasKey(obj, key) {
    return typeof obj === "object" && obj !== null && key in obj;
}
export default rehypeComponents;
