import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        published: z.date(),
        description: z.string().optional(),
        cover: z.object({
            url: z.string(),
            alt: z.string(),
        }),
        tags: z.array(z.string()).optional(),
    })
})
export const collections = {
    'blog': blogCollection,
}