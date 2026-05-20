import type { APIRoute } from "astro";
import { profileConfig, siteConfig } from "@/config";

const rssXsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  exclude-result-prefixes="atom content">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="${siteConfig.lang.replace("_", "-")}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title><xsl:value-of select="/rss/channel/title" /> RSS</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f6f7fb;
            --card: rgba(255, 255, 255, 0.82);
            --text: #20242a;
            --muted: #667085;
            --line: rgba(16, 24, 40, 0.1);
            --primary: #6d5dfc;
            --primary-soft: rgba(109, 93, 252, 0.12);
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #111318;
              --card: rgba(25, 28, 36, 0.82);
              --text: #f4f6fb;
              --muted: #a8b0c0;
              --line: rgba(255, 255, 255, 0.12);
              --primary-soft: rgba(137, 126, 255, 0.18);
            }
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, var(--primary-soft), transparent 34rem),
              var(--bg);
            color: var(--text);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.6;
          }

          .page {
            width: min(920px, calc(100% - 2rem));
            margin: 0 auto;
            padding: 4rem 0;
          }

          .hero {
            margin-bottom: 1.25rem;
            padding: 1.5rem;
            border: 1px solid var(--line);
            border-radius: 1rem;
            background: var(--card);
            backdrop-filter: blur(18px);
          }

          .eyebrow {
            margin: 0 0 0.4rem;
            color: var(--primary);
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-size: clamp(2rem, 5vw, 3.5rem);
            line-height: 1.05;
          }

          .description {
            margin: 0.85rem 0 0;
            color: var(--muted);
          }

          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1.25rem;
          }

          a {
            color: inherit;
          }

          .button {
            display: inline-flex;
            align-items: center;
            min-height: 2.5rem;
            padding: 0.45rem 0.8rem;
            border-radius: 0.7rem;
            background: var(--primary);
            color: white;
            font-weight: 700;
            text-decoration: none;
          }

          .hint {
            display: flex;
            align-items: center;
            color: var(--muted);
            font-size: 0.92rem;
          }

          .feed {
            display: grid;
            gap: 0.85rem;
          }

          .item {
            display: block;
            padding: 1.1rem 1.25rem;
            border: 1px solid var(--line);
            border-radius: 1rem;
            background: var(--card);
            text-decoration: none;
            transition: transform 0.2s ease, border-color 0.2s ease;
          }

          .item:hover {
            transform: translateY(-2px);
            border-color: var(--primary);
          }

          .item-title {
            margin: 0;
            font-size: 1.15rem;
            line-height: 1.35;
          }

          .item-date {
            margin-top: 0.3rem;
            color: var(--muted);
            font-size: 0.86rem;
          }

          .item-description {
            margin: 0.6rem 0 0;
            color: var(--muted);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <p class="eyebrow">RSS Feed</p>
            <h1><xsl:value-of select="/rss/channel/title" /></h1>
            <p class="description"><xsl:value-of select="/rss/channel/description" /></p>
            <div class="actions">
              <a class="button" href="{/rss/channel/link}">Visit ${profileConfig.name}</a>
              <span class="hint">Copy this page URL into your RSS reader.</span>
            </div>
          </section>

          <section class="feed">
            <xsl:for-each select="/rss/channel/item">
              <a class="item" href="{link}">
                <h2 class="item-title"><xsl:value-of select="title" /></h2>
                <div class="item-date"><xsl:value-of select="pubDate" /></div>
                <p class="item-description"><xsl:value-of select="description" /></p>
              </a>
            </xsl:for-each>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

export const GET: APIRoute = () => {
	return new Response(rssXsl, {
		headers: {
			"Content-Type": "text/xsl; charset=utf-8",
		},
	});
};
