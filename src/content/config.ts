import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.string().datetime({ offset: true }),
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
// --- 定义 spec 集合，但不严格检查 frontmatter ---
const specCollection = defineCollection({
	type: 'content', // 确认是 Markdown/MDX 文件
	// 使用 passthrough() 来允许任何 frontmatter 字段且不检查类型
	schema: z.object({
	  // 这里可以留空，或者只定义你绝对确定存在且需要类型提示的字段（可选）
	  // 如果完全不关心，z.object({}).passthrough() 即可
	}).passthrough(), 
  });
  // --- 结束定义 ---
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
