import path from "node:path";
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
	file: string;
}

export async function GET(context: APIContext) {
	const postImportResult = await import.meta.glob("../content/posts/**/*.md", {
		eager: true,
	});
	const posts = Object.values(postImportResult) as Post[];
	console.log("posts", posts);

	const filtered = posts.filter((post) =>
		import.meta.env.PROD ? post.frontmatter.draft !== true : true,
	);

	const sorted = filtered.sort((a, b) => {
		const dateA = new Date(a.frontmatter.published);
		const dateB = new Date(b.frontmatter.published);
		return dateB.getTime() - dateA.getTime();
	});

	const postsWithUrls = sorted.map((post) => {
		const contentPath = path.relative(process.cwd(), post.file);
		let url = contentPath
			.replace(/^src\/content/, "")
			.replace(/\.md$/, "")
			.replace(/index$/, "");

		url = url.replace(/\\/g, "/");
		if (!url.startsWith("/")) {
			url = `/${url}`;
		}
		if (!url.startsWith("/posts/")) {
			url = `/posts${url}`;
		}
		return {
			...post,
			url: url,
		};
	});

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: await Promise.all(
			postsWithUrls.map(async (post) => ({
				pubDate: new Date(post.frontmatter.published),
				link: post.url,
				content: sanitizeHtml(await post.compiledContent(), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
				...post.frontmatter,
			})),
		),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
