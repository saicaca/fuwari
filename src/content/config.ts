import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z
			.string()
			.optional()
			.nullable()
			.transform((val) => val ?? ""),
		image: z
			.string()
			.optional()
			.nullable()
			.transform((val) => val ?? ""),
		tags: z
			.array(z.string())
			.optional()
			.nullable()
			.transform((val) => val ?? []),
		category: z
			.string()
			.optional()
			.nullable()
			.transform((val) => val ?? ""),
		lang: z
			.string()
			.optional()
			.nullable()
			.transform((val) => val ?? ""),

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
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
