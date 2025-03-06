import { visit } from "unist-util-visit";
import { h } from "hastscript";

export function rehypeWrapperSpan() {
    return (tree) => {
        visit(tree, "element", (node, index, parent) => {
            if (parent?.tagName === "pre" && node.tagName === "code") {
                node.children = [h("span", node.children)];
                return visit.SKIP;
            }
        });
    };
}
