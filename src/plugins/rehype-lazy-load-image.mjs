import { visit } from "unist-util-visit";

/**
 * Add loading="lazy" attribute to all images
 */
export function rehypeLazyLoadImage() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'img') {
				node.properties = node.properties || {};
				node.properties.loading = 'lazy';
			}
		});
	};
}

