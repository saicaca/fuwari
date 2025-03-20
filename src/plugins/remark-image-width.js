import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    return (tree) => {
        var regex1 = / w-([0-9]+)%/;
        var regex2 = / m-auto/;
        
        visit(
			tree,
			(node) => node.type === "image",
			(node, index, parent) => {
                var alt = node.alt;
                node.data = {hProperties: {}};
                if (parent.type === "figure") {
                    parent.data.hProperties = {style: "width: fit-content;"};
                }
                if (alt.search(regex1) != -1) {
                    node.data.hProperties.width = `${alt.match(regex1)[1]}%`;
                    node.alt = node.alt.replace(regex1, "");
                }
                if (alt.search(regex2) != -1) {
                    node.data.hProperties.style = "margin-inline: auto;";
                    node.alt = node.alt.replace(regex2, "");
                    if (parent.type === "figure") {
                        parent.data.hProperties.style = null;
                    }
                }
			}
		);

        visit(
			tree,
			(node) => node.type === 'figcaption',
			(node, index, parent) => {
                var text = node.children[0].value
                node.data.hProperties = { style: "text-align: center;" };
                if (text.search(regex1) != -1) {
                    if (text.search(regex2) == -1) {
                        node.data.hProperties.style = node.data.hProperties.style + `width: ${text.match(regex1)[1]}%;`;
                    }
                    node.children[0].value = node.children[0].value.replace(regex1, "");
                }
                if (text.search(regex2) != -1) {
                    node.children[0].value = node.children[0].value.replace(regex2, "");
                }
			}
		);

    }
}