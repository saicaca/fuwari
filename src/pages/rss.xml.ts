import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIRoute } from "astro";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";
import { extractTypstExcerpt } from "../typst/reading-time.ts";

function stripInvalidXmlChars(str: string): string {
  // Use RegExp constructor to avoid deno-lint no-control-regex on literals.
  // Character classes per https://www.w3.org/TR/xml/#charsets
  const invalidRanges =
    "[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F-\\x9F\\uFDD0-\\uFDEF\\uFFFE\\uFFFF]";
  const re = new RegExp(invalidRanges, "g");
  return str.replace(re, "");
}

export const GET: APIRoute = async (context) => {
  const blog = await getSortedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || "No description",
    site: context.site ?? "https://fuwari.vercel.app",
    items: await Promise.all(
      blog.map(async (post) => {
        // For Typst entries, compile a lightweight text excerpt for RSS content
        const excerpt = await extractTypstExcerpt(post.filePath || "");
        const cleanedContent = stripInvalidXmlChars(excerpt);
        const description: string =
          typeof post.data.description === "string" ? post.data.description : post.data.title;
        return {
          title: post.data.title,
          pubDate: post.data.published,
          description,
          link: url(`/posts/${post.id}/`),
          content: sanitizeHtml(cleanedContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          }),
        };
      }),
    ),
    customData: `<language>${siteConfig.lang}</language>`,
  });
};
