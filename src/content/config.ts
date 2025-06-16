import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().nullable().transform(val => val ?? ""),
		image: z.string().nullable().transform(val => val ?? ""),
		tags: z.array(z.string()).nullable().transform(val => val ?? []),
		category: z.string().nullable().transform(val => val ?? ""),
		lang: z.string().nullable().transform(val => val ?? ""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
export const collections = {
	posts: postsCollection,
};
