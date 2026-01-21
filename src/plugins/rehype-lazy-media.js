import { visit } from "unist-util-visit";

const hasNoLazy = (props) => {
	if (!props) return false;
	if (props["data-no-lazy"] !== undefined || props["data-hero"] !== undefined) {
		return true;
	}
	const className = props.className;
	if (typeof className === "string") {
		return className.split(" ").some((c) => c === "no-lazy" || c === "hero");
	}
	if (Array.isArray(className)) {
		return className.some((c) => c === "no-lazy" || c === "hero");
	}
	return false;
};

export function rehypeLazyMedia() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName === "img") {
				node.properties ||= {};
				if (hasNoLazy(node.properties)) return;
				if (node.properties.loading === undefined) {
					node.properties.loading = "lazy";
				}
				if (node.properties.decoding === undefined) {
					node.properties.decoding = "async";
				}
				return;
			}
			if (node.tagName === "iframe") {
				node.properties ||= {};
				if (hasNoLazy(node.properties)) return;
				if (node.properties.loading === undefined) {
					node.properties.loading = "lazy";
				}
			}
		});
	};
}
