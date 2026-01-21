import { defineCollection, z } from "astro:content";

const categorySchema = z.preprocess((value) => {
	if (Array.isArray(value)) {
		return value
			.map((entry) => (typeof entry === "string" ? entry.trim() : ""))
			.filter((entry) => entry !== "");
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? [trimmed] : [];
	}
	return [];
}, z.array(z.string()));

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: categorySchema,
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
const portfolioCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string(),
		image: z.string(),
		url: z.string(),
		category: z.string().optional().default("Project"),
		date: z.date().optional(),
		order: z.number().optional().default(0),
		lang: z.string().optional().default(""),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	portfolio: portfolioCollection,
};
