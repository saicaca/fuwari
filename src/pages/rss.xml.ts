import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";
import { absoluteUrl } from "@/utils/url-utils";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const site = absoluteUrl("/", context.site ?? undefined);
	const channelTitle = escapeXml(siteConfig.title);
	const channelDescription = escapeXml(siteConfig.subtitle || "No description");
	const channelLanguage = escapeXml(siteConfig.lang);

	const itemsXml = blog
		.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			const renderedContent = sanitizeHtml(parser.render(cleanedContent), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			});
			const link = absoluteUrl(`/posts/${post.id}/`, context.site ?? undefined);
			const description = escapeXml(post.data.description || "");
			const title = escapeXml(post.data.title);

			return [
				"<item>",
				`<title>${title}</title>`,
				`<link>${escapeXml(link)}</link>`,
				`<guid>${escapeXml(link)}</guid>`,
				`<pubDate>${post.data.published.toUTCString()}</pubDate>`,
				`<description>${description}</description>`,
				`<content:encoded><![CDATA[${renderedContent}]]></content:encoded>`,
				"</item>",
			].join("");
		})
		.join("");

	const styledXml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		`<?xml-stylesheet type="text/xsl" href="${url("/rss.xsl")}"?>`,
		'<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
		"<channel>",
		`<title>${channelTitle}</title>`,
		`<description>${channelDescription}</description>`,
		`<link>${escapeXml(site)}</link>`,
		`<language>${channelLanguage}</language>`,
		itemsXml,
		"</channel>",
		"</rss>",
	].join("\n");

	return new Response(styledXml, {
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
		},
	});
}
