---
title: Unlisted Posts Feature
published: 2026-01-19
description: How to hide posts from lists while keeping them accessible via direct links.
tags: [Example, Feature]
category: Examples
draft: false
unlisted: false
---

##  🔍What is the "Unlisted" Feature?

The `unlisted` feature allows you to hide specific posts from public listings while keeping them accessible via a direct URL. This is perfect for sharing content with a limited audience without cluttering your blog's main feed.

## 🛠️ How to Use It

Simply add `unlisted: true` to your post's frontmatter:

```markdown
---
title: "My Secret Post"
published: 2026-01-18
unlisted: true
---
```

### Where are Unlisted Posts Hidden?
When a post is set to `unlisted: true`, it will **not** appear in:

*    🏠**Home page** post list
*    📂**Archive page**
*    🏷️**Tag & Category** listings
*    🔍**Search results** (Pagefind)
*    📡**RSS feed**

---

##  How to Access Unlisted Posts

Unlisted posts remain accessible **only via their direct URL**. The URL follows the standard pattern:

`https://your-site.com/posts/[your-post-slug]/`

> **Example:**
> If your file is `unlisted-sample.md` and your site is `https://fuwari.vercel.app`, the URL will be:
> [https://fuwari.vercel.app/posts/unlisted-sample/](https://fuwari.vercel.app/posts/unlisted-sample/)

---

## ⚠️ Security Note: Unlisted ≠ Private

**This feature provides obscurity, not absolute privacy.**
Anyone with the direct link can still view the content. If you need to restrict access to sensitive information, please use server-level authentication (e.g., Basic Auth or middleware).

---

## 💡 Use Cases

*   **Draft Reviews:** Share a nearly-finished post with friends or colleagues for feedback.
*   **Targeted Content:** Create guides or write-ups intended only for a specific group.
*   **Clean Feed:** Prevent short notes or experimental posts from cluttering your main archive.



