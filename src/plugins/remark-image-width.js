import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    return (tree) => {
        var regex = / width:([0-9]+)%/;
        
        visit(
			tree,
			(node) => node.type === "image",
			(node, index, parent) => {
                if (node.alt.search(regex) != -1) {
                    var width = `${node.alt.match(regex)[1]}%`;
                    node.data = {hProperties: {width: width}};
                    node.alt = node.alt.replace(regex, "");
                }
			}
		);

        visit(
			tree,
			(node) => node.type === 'figcaption',
			(node, index, parent) => {
                if (parent.alt.search(regex) != -1) {
                    var width = `${parent.alt.match(regex)[1]}%`;
                    node.data = {hName: "figcaption", hProperties: {style: `width: ${width};`}};
                    node.children[0].value = parent.alt.replace(regex, "");
                }
			}
		);

    }
}