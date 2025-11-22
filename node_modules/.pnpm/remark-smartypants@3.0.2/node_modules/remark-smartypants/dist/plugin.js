import { retext } from "retext";
import { visit } from "unist-util-visit";
import smartypants from "retext-smartypants";
const VISITED_NODES = new Set(["text", "inlineCode", "paragraph"]);
const IGNORED_HTML_ELEMENTS = new Set(["style", "script"]);
const check = (node, index, parent) => {
    return (parent &&
        (parent.type !== "mdxJsxTextElement" ||
            ("name" in parent &&
                typeof parent.name === "string" &&
                !IGNORED_HTML_ELEMENTS.has(parent.name))) &&
        VISITED_NODES.has(node.type) &&
        (isLiteral(node) || isParagraph(node)));
};
/**
 * remark plugin to implement SmartyPants.
 */
const remarkSmartypants = (options) => {
    const processor = retext().use(smartypants, {
        ...options,
        // Do not replace ellipses, dashes, backticks because they change string
        // length, and we couldn't guarantee right splice of text in second visit of
        // tree
        ellipses: false,
        dashes: false,
        backticks: false,
    });
    const processor2 = retext().use(smartypants, {
        ...options,
        // Do not replace quotes because they are already replaced in the first
        // processor
        quotes: false,
    });
    return (tree) => {
        let allText = "";
        let startIndex = 0;
        const nodes = [];
        visit(tree, check, (node) => {
            if (isLiteral(node)) {
                allText +=
                    node.type === "text" ? node.value : "A".repeat(node.value.length);
            }
            else if (isParagraph(node)) {
                // Inject a "fake" space because otherwise, when concatenated below,
                // smartypants will fail to recognize opening quotes at the start of
                // paragraphs
                allText += " ";
            }
            nodes.push(node);
        });
        // Concat all text into one string, to properly replace quotes around links
        // and bold text
        allText = processor.processSync(allText).toString();
        for (const node of nodes) {
            if (isLiteral(node)) {
                const endIndex = startIndex + node.value.length;
                if (node.type === "text") {
                    const processedText = allText.slice(startIndex, endIndex);
                    node.value = processor2.processSync(processedText).toString();
                }
                startIndex = endIndex;
            }
            else if (isParagraph(node)) {
                // Skip over the space we added above
                startIndex += 1;
            }
        }
    };
};
function isLiteral(node) {
    return "value" in node && typeof node.value === "string";
}
function isParagraph(node) {
    return node.type === "paragraph";
}
export default remarkSmartypants;
