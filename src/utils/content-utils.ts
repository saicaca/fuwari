import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string; // current segment name
	fullPath: string; // joined path like "Java/MouseMacros"
	count: number; // includes children
	url: string;
	children: Category[];
};

type CategoryNodeInternal = Category & {
	childrenMap: Map<string, CategoryNodeInternal>;
};

function createCategoryNode(
	name: string,
	fullPath: string,
): CategoryNodeInternal {
	return {
		name,
		fullPath,
		count: 0,
		url: getCategoryUrl(fullPath),
		children: [],
		childrenMap: new Map<string, CategoryNodeInternal>(),
	};
}

function normalizeCategory(raw: unknown): string {
	if (!raw) return "";
	if (typeof raw === "string") return raw.trim();
	return String(raw).trim();
}

function addCategoryToTree(
	root: Map<string, CategoryNodeInternal>,
	segments: string[],
	uncategorizedLabel: string,
) {
	// If no valid segments, treat as uncategorized
	if (segments.length === 0) {
		const key = uncategorizedLabel;
		const existing = root.get(key) ?? createCategoryNode(key, key);
		existing.count += 1;
		root.set(key, existing);
		return;
	}

	let currentMap = root;
	let currentPath = "";

	segments.forEach((segment) => {
		currentPath = currentPath ? `${currentPath}/${segment}` : segment;
		let node = currentMap.get(segment);
		if (!node) {
			node = createCategoryNode(segment, currentPath);
			currentMap.set(segment, node);
		}
		node.count += 1; // accumulate counts on all levels
		currentMap = node.childrenMap;
	});
}

function mapToSortedCategories(
	map: Map<string, CategoryNodeInternal>,
): Category[] {
	const nodes = Array.from(map.values()).sort((a, b) =>
		a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
	);

	return nodes.map((node) => ({
		name: node.name,
		fullPath: node.fullPath,
		count: node.count,
		url: node.url,
		children: mapToSortedCategories(node.childrenMap),
	}));
}

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const uncategorizedLabel = i18n(I18nKey.uncategorized);
	const rootMap = new Map<string, CategoryNodeInternal>();

	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		const normalized = normalizeCategory(post.data.category);
		const segments = normalized
			.split("/")
			.map((s) => s.trim())
			.filter(Boolean);

		addCategoryToTree(rootMap, segments, uncategorizedLabel);
	});

	return mapToSortedCategories(rootMap);
}
