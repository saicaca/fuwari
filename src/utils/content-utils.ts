import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

type PostEntry = CollectionEntry<"posts">;

// Unlisted posts are hidden from lists/search, but can be accessed by direct URL
function isListedPost(post: PostEntry) {
	return post.data.unlisted !== true;
}

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts(options: { includeUnlisted?: boolean } = {}) {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	// Default: exclude unlisted from lists. Use includeUnlisted for direct post pages.
	const filteredPosts = options.includeUnlisted
		? allBlogPosts
		: allBlogPosts.filter((post) => isListedPost(post));
	const sorted = filteredPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts(
	options: { includeUnlisted?: boolean } = {},
) {
	const sorted = await getRawSortedPosts(options);
	const navPosts = options.includeUnlisted
		? sorted.filter((post) => isListedPost(post))
		: sorted;

	for (let i = 1; i < navPosts.length; i++) {
		navPosts[i].data.nextSlug = navPosts[i - 1].slug;
		navPosts[i].data.nextTitle = navPosts[i - 1].data.title;
	}
	for (let i = 0; i < navPosts.length - 1; i++) {
		navPosts[i].data.prevSlug = navPosts[i + 1].slug;
		navPosts[i].data.prevTitle = navPosts[i + 1].data.title;
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

	const listedPosts = allBlogPosts.filter((post) => isListedPost(post));

	const countMap: { [key: string]: number } = {};
	listedPosts.forEach((post: { data: { tags: string[] } }) => {
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
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const listedPosts = allBlogPosts.filter((post) => isListedPost(post));
	const count: { [key: string]: number } = {};
	listedPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
