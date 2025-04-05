import deepmerge from "@fastify/deepmerge";
import { type Child, type Properties, h } from "hastscript";
import type {
	Image,
	Link,
	Paragraph,
	PhrasingContent,
	Root,
	RootContent,
} from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import type { Visitor } from "unist-util-visit";

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

interface LinkAttributes {
	target: string;
	rel: string;
}

interface Options {
	className: string;
	excludedPaths: (string | RegExp)[];
	lazyLoad: boolean;
	linkAttributes: LinkAttributes;
}

type UserOptions = DeepPartial<Options>;

const defaultOptions: Options = {
	className: "",
	excludedPaths: [],
	lazyLoad: false,
	linkAttributes: { target: "", rel: "" },
};

const remarkImageCaption: Plugin<[UserOptions?], Root> = (options) => {
	const mergedOptions = deepmerge()(defaultOptions, options ?? {}) as Options;

	const transformer: Transformer<Root> = async (tree) => {
		const visitor: Visitor<Paragraph> = (paragraphNode, index, parent) => {
			if (
				index === undefined ||
				parent === undefined ||
				parent.type !== "root" ||
				paragraphNode.data !== undefined
			)
				return;

			const customNodes = createCustomNodes(paragraphNode, mergedOptions);

			if (customNodes.length) {
				parent.children.splice(index, 1, ...customNodes);
			}
		};

		visit(tree, "paragraph", visitor);
	};

	return transformer;
};

const isExcluded = (input: string, patterns: (string | RegExp)[]): boolean => {
	for (const pattern of patterns) {
		if (typeof pattern === "string") {
			if (input.includes(pattern)) return true;
		} else if (pattern instanceof RegExp) {
			if (pattern.test(input)) return true;
		}
	}

	return false;
};

const isSoftBreak = (node: PhrasingContent): boolean => {
	return node.type === "text" && (node.value === "\n" || node.value === "\r\n");
};

const containsOnlyImageRelatedChildren = (
	node: Paragraph | Link,
	patterns: (string | RegExp)[],
): boolean => {
	return node.children.every(
		(child) =>
			(child.type === "image" && !isExcluded(child.url, patterns)) ||
			child.type === "break" ||
			isSoftBreak(child),
	);
};

const extractValidImageNodes = (
	paragraphNode: Paragraph,
	options: Options,
): Image[] => {
	const hasImages = containsOnlyImageRelatedChildren(
		paragraphNode,
		options.excludedPaths,
	);

	return hasImages
		? paragraphNode.children.filter((child) => child.type === "image")
		: [];
};

const extractValidImageLinkNodes = (
	paragraphNode: Paragraph,
	options: Options,
): Link[] => {
	const hasImageLinks = paragraphNode.children.every(
		(child) =>
			child.type === "link" &&
			child.children.length &&
			containsOnlyImageRelatedChildren(child, options.excludedPaths),
	);

	return hasImageLinks
		? ((paragraphNode.children as Link[]).map((child) => ({
				...child,
				children: child.children.filter(
					(subChild) => subChild.type === "image",
				),
			})) as Link[])
		: [];
};

const createImageProperties = (
	imageNode: Image,
	lazyLoad: boolean,
): Properties => {
	return {
		alt: imageNode.alt,
		src: imageNode.url,
		...(lazyLoad && { loading: "lazy" }),
	};
};

const createFigureFromImages = (
	imageNodes: Image[],
	options: Options,
): RootContent => {
	const canNest = imageNodes.every((imageNode) => imageNode.title);

	let children: Child[];

	if (canNest) {
		children = imageNodes.map((imageNode) =>
			h("figure", {}, [
				h("img", createImageProperties(imageNode, options.lazyLoad), []),
				h("figcaption", {}, [imageNode.title]),
			]),
		);
	} else {
		children = imageNodes.map((imageNode) =>
			h("img", createImageProperties(imageNode, options.lazyLoad), []),
		);
	}

	return {
		type: "text",
		value: "",
		data: {
			hName: "figure",
			hProperties: {
				...(options.className ? { class: options.className } : {}),
			},
			hChildren: [
				h("div", {}, ...children),
				...(!canNest && imageNodes[0].title
					? [h("figcaption", {}, [imageNodes[0].title])]
					: []),
			],
		},
	};
};

const isAbsoluteUrl = (url: string): boolean => {
	return /^[a-z][a-z\d+\-.]*:/i.test(url);
};

const createFigureFromLink = (
	linkNode: Link,
	options: Options,
): RootContent => {
	const imageNodes = linkNode.children as Image[];
	const canNest = imageNodes.some((imageNode) => imageNode.title);
	const target = options.linkAttributes.target;
	const rel = options.linkAttributes.rel;

	let children: Child[];

	if (canNest) {
		children = imageNodes.map((imageNode) =>
			h("figure", {}, [
				h("img", createImageProperties(imageNode, options.lazyLoad), []),
				...(imageNode.title ? [h("figcaption", {}, [imageNode.title])] : []),
			]),
		);
	} else {
		children = imageNodes.map((imageNode) =>
			h("img", createImageProperties(imageNode, options.lazyLoad), []),
		);
	}

	return {
		type: "text",
		value: "",
		data: {
			hName: "figure",
			hProperties: {
				...(options.className ? { class: options.className } : {}),
			},
			hChildren: [
				h(
					"a",
					{
						href: linkNode.url,
						...(isAbsoluteUrl(linkNode.url) && {
							...(target && { target }),
							...(rel && { rel }),
						}),
					},
					...children,
				),
				...(linkNode.title ? [h("figcaption", {}, [linkNode.title])] : []),
			],
		},
	};
};

const createCustomNodes = (
	paragraphNode: Paragraph,
	options: Options,
): RootContent[] => {
	const nodes: RootContent[] = [];

	let extractedNodes: Image[] | Link[] = extractValidImageNodes(
		paragraphNode,
		options,
	);

	if (extractedNodes.length) {
		const newNode = createFigureFromImages(extractedNodes, options);
		nodes.push(newNode);
		return nodes;
	}

	extractedNodes = extractValidImageLinkNodes(paragraphNode, options);

	if (extractedNodes.length) {
		for (const extractedNode of extractedNodes) {
			const newNode = createFigureFromLink(extractedNode, options);
			nodes.push(newNode);
		}
		return nodes;
	}

	return [];
};

export default remarkImageCaption;
export type { UserOptions };
