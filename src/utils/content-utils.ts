import type { CollectionEntry } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// Common filter for listing-eligible posts
function includePostInListings({
  data,
  filePath,
}: {
  data: { draft?: boolean };
  filePath?: string;
}) {
  const isDraft = import.meta.env.PROD ? data.draft === true : false;
  const isSvgTyp = typeof filePath === "string" && filePath.endsWith(".svg.typ");
  // Exclude draft posts (in prod) and Typst SVG targets from listings/routes
  return !isDraft && !isSvgTyp;
}

// Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
  const allBlogPosts = await (await import("astro:content")).getCollection(
    "posts",
    includePostInListings,
  );

  const sorted = allBlogPosts.sort((a, b) => {
    const dateA = new Date(a.data.published);
    const dateB = new Date(b.data.published);
    return dateA > dateB ? -1 : 1;
  });
  return sorted;
}

export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
  const sorted = await getRawSortedPosts();

  for (let i = 1; i < sorted.length; i++) {
    sorted[i].data.nextSlug = sorted[i - 1].id;
    sorted[i].data.nextTitle = sorted[i - 1].data.title;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    sorted[i].data.prevSlug = sorted[i + 1].id;
    sorted[i].data.prevTitle = sorted[i + 1].data.title;
  }

  return sorted;
}
export type PostForList = {
  id: string;
  data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
  const sortedFullPosts = await getRawSortedPosts();

  // delete post.body
  const sortedPostsList = sortedFullPosts.map((post) => {
    const slugCandidate = (post as unknown as Record<string, unknown>).slug;
    const id = typeof slugCandidate === "string" ? slugCandidate : post.id;
    return { id, data: post.data };
  });

  return sortedPostsList;
}
export type Tag = {
  name: string;
  count: number;
};

export async function getTagList(): Promise<Tag[]> {
  const allBlogPosts = await (await import("astro:content")).getCollection<"posts">(
    "posts",
    includePostInListings,
  );

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
  name: string;
  count: number;
  url: string;
};

export async function getCategoryList(): Promise<Category[]> {
  const allBlogPosts = await (await import("astro:content")).getCollection<"posts">(
    "posts",
    includePostInListings,
  );
  const count: { [key: string]: number } = {};
  allBlogPosts.forEach((post: { data: { category: string | null } }) => {
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
