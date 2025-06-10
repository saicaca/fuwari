import { siteConfig } from "@/config";
import type { BlogPostData } from "@/types/config";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import sanitizeHtml from "sanitize-html";

interface Post {
	slug: string;
	frontmatter: BlogPostData;
	body: string | Promise<string>;
	compiledContent: () => Promise<string>;
}

export async function GET(context: APIContext) {
	const postImportResult = import.meta.glob("../content/posts/**/*.md", {
		eager: true,
	});
	const posts = Object.values(postImportResult) as Post[];

	const filtered = posts.filter((post) =>
		import.meta.env.PROD ? post.frontmatter.draft !== true : true,
	);

	const sorted = filtered.sort((a, b) => {
		const dateA = new Date(a.frontmatter.published);
		const dateB = new Date(b.frontmatter.published);
		return dateB.getTime() - dateA.getTime();
	});

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: await Promise.all(
			sorted.map(async (post) => {
				return {
					pubDate: new Date(post.frontmatter.published),
					link: `/posts/${post.slug}/`,
					content: sanitizeHtml(await post.compiledContent(), {
						allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					}),
					...post.frontmatter,
				};
			}),
		),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
