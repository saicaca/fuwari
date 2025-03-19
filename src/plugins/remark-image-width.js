import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    return (tree) => {
        var regex = / w:([0-9]+)%/;
        
        visit(
			tree,
			(node) => node.type === "image",
			(node, index, parent) => {
                var alt = node.alt;
                if (alt.search(regex) != -1) {
                    var width = `${alt.match(regex)[1]}%`;
                    node.data = {hProperties: {width: width}};
                    node.alt = alt.replace(regex, "");
                }
			}
		);

        visit(
			tree,
			(node) => node.type === 'figcaption',
			(node, index, parent) => {
                var text = node.children[0].value
                if (text.search(regex) != -1) {
                    var width = `${text.match(regex)[1]}%`;
                    node.data = {hName: "figcaption", hProperties: {style: `width: ${width};`}};
                    node.children[0].value = text.replace(regex, "");
                }
			}
		);

    }
}