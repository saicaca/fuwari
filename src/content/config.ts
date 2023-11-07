import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        published: z.date(),
        description: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
    })
})
export const collections = {
    'blog': blogCollection,
}