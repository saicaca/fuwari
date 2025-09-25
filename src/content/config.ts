import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
  // Typst-only blog: support only .typ files in the posts collection
  // Note: base is resolved from project root
  // Exclude Typst SVG target files from posts collection; they are imported by HTML posts.
  loader: glob({
    base: "./src/content/posts",
    // Typst-only blog: include only .typ sources and exclude SVG targets
    pattern: ["**/*.typ", "!**/*.svg.typ"],
  }),
  schema: z.object({
    title: z.string(),
    // Coerce dates from strings (for Typst frontmatter compatibility)
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
    // Typst frontmatter may provide rich values; accept any and coerce later
    description: z.any().optional(),
    image: z.string().optional().default(""),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().nullable().default(""),
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
export const collections: {
  posts: ReturnType<typeof defineCollection>;
  spec: ReturnType<typeof defineCollection>;
} = {
  posts: postsCollection,
  spec: specCollection,
};
