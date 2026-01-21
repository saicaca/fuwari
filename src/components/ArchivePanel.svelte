<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { isDateInFuture } from "../utils/date-utils";
import { getPostUrlBySlug } from "../utils/url-utils";
import { normalizeCategoryList } from "../utils/category-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];
export let lang: string | undefined = undefined;

const isProd = import.meta.env.PROD;

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");
const hasTags = tags.length > 0;
const hasCategories = categories.length > 0 || !!uncategorized;
const headerKey = hasTags
	? I18nKey.tags
	: hasCategories
		? I18nKey.categories
		: I18nKey.archive;
const selectedValues = [
	...(hasTags ? tags : []),
	...(hasCategories ? categories : []),
	...(uncategorized ? ["uncategorized"] : []),
];

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string[] | string | null;
		published: Date;
	};
	lang: string;
	isScheduled?: boolean;
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

onMount(async () => {
	let filteredPosts: Post[] = sortedPosts;

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => tags.includes(tag)),
		);
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter((post) => {
			const postCategories = normalizeCategoryList(post.data.category);
			if (postCategories.length === 0) return false;
			return categories.some((c) =>
				postCategories.some(
					(entry) => entry === c || entry.startsWith(`${c}/`),
				),
			);
		});
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter(
			(post) => normalizeCategoryList(post.data.category).length === 0,
		);
	}

	const now = Date.now();
	const withSchedule = filteredPosts.map((post) => ({
		...post,
		isScheduled: isDateInFuture(post.data.published, now),
	}));

	filteredPosts = isProd
		? withSchedule.filter((post) => !post.isScheduled)
		: withSchedule;

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
});
</script>

<div class="card-base px-8 py-6">
    <div class="mb-5">
        <h1 class="text-4xl font-bold text-90 transition">
            {i18n(headerKey, lang)}
        </h1>
        {#if selectedValues.length > 0}
            <div class="mt-3 flex flex-wrap gap-2 text-sm font-semibold transition px-1 py-1">
                {#each selectedValues as value}
                    <span class="inline-flex items-center gap-2 rounded-full bg-[var(--btn-plain-bg-hover)] px-3 py-1 text-[var(--primary)] border border-[var(--primary)]/40">
                        <span class="inline-block h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                        <span>{value}</span>
                    </span>
                {/each}
            </div>
        {/if}
    </div>
    {#each groups as group}
        <div>
            <div class="flex flex-row w-full items-center h-[3.75rem]">
                <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                    {group.year}
                </div>
                <div class="w-[15%] md:w-[10%]">
                    <div
                            class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
                    ></div>
                </div>
                <div class="w-[70%] md:w-[80%] transition text-left text-50">
                    {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount, lang)}
                </div>
            </div>

            {#each group.posts as post}
                <a
                        href={getPostUrlBySlug(post.slug, lang)}
                        lang={post.lang}
                        aria-label={post.data.title}
                        class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                >
                    <div class="flex flex-row justify-start items-center h-full">
                        <!-- date -->
                        <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                            {formatDate(post.data.published)}
                        </div>

                        <!-- dot and line -->
                        <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                            <div
                                    class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
                            ></div>
                        </div>

                        <!-- post title -->
                        <div
                                class={`w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden ${
						!isProd && post.isScheduled
							? "text-green-600 group-hover:text-green-600 dark:text-green-400 dark:group-hover:text-green-400"
							: ""
					}`}
                        >
                            {post.data.title}
                        </div>

                        <!-- tag list -->
                        <div
                                class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
                        >
                            {formatTag(post.data.tags)}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/each}
</div>
