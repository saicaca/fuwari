import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "技术博客与编程分享",
		site: context.site ?? "https://fuwari.vercel.app",
		customData: `
			<language>${siteConfig.lang}</language>
			<managingEditor>${profileConfig.links.find(l => l.url.includes('github'))?.url || ''} (${profileConfig.name})</managingEditor>
			<webMaster>${profileConfig.links.find(l => l.url.includes('github'))?.url || ''} (${profileConfig.name})</webMaster>
			<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml"/>
		`,
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.slug}/`),
				content: sanitizeHtml(parser.render(cleanedContent), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
				customData: `
					<author>${profileConfig.name}</author>
					<category>${post.data.category || "技术"}</category>
				`,
			};
		}),
	});
}
