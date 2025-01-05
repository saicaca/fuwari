import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
  schema: () =>
    z.object({
      title: z.string(),
      published: z.date(),
      updated: z.date().optional(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional().default(""),
      image: z.string().optional().default(""),
      tags: z.array(z.string()).optional().default([]),
      category: z.string().optional().default(""),
      lang: z.string().optional().default(""),

      /* For internal use */
      prevTitle: z.string().default(""),
      prevSlug: z.string().default(""),
      nextTitle: z.string().default(""),
      nextSlug: z.string().default(""),
    }),
});

const specCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/spec" }),
  schema: z.object({
    title: z.string(),
  }),
});
export const collections = {
  posts: postsCollection,
  spec: specCollection,
};
