/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a Carousel component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created Carousel component.
 */
export function CarouselComponent(_properties, children) {
	if (!Array.isArray(children) || children.length === 0)
		return h("div", { class: "hidden" }, "Invalid carousel directive.");

	// Return a container that keeps the children (images) in the DOM
	// but hidden, so Astro can process the paths and the client can read them.
	return h(
		"div",
		{
			class: "carousel-component",
			style: "min-height: 100px;", // Prevent total collapse before hydration
		},
		[
			h(
				"div",
				{
					class: "carousel-content",
					style: "display: none;",
				},
				children,
			),
		],
	);
}
