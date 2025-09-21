// Central helper to inject Typst reading-time stats into remark frontmatter
// when rendering .astro pages/cards for Typst-based posts.

export interface RemarkFrontmatter {
  words: number;
  minutes: number;
  excerpt: string;
}

export async function computeTypstStatsIfMissing(
  entry: { id?: string; filePath?: string },
  current: RemarkFrontmatter,
): Promise<RemarkFrontmatter> {
  const { getEnvFlag } = await import("./env.ts");
  const DEBUG = getEnvFlag("TYPST_STATS_DEBUG");
  let remark: RemarkFrontmatter = current ?? {
    words: 0,
    minutes: 0,
    excerpt: "",
  };
  try {
    const fp = entry?.filePath;
    const need = (!remark || !remark.words) && typeof fp === "string" && fp.endsWith(".typ");
    if (!need) {
      // If minutes/words exist but excerpt missing, try to fill it
      if (!remark.excerpt && typeof fp === "string" && fp.endsWith(".typ")) {
        const { extractTypstExcerpt } = await import("../typst/reading-time.ts");
        const ex = await extractTypstExcerpt(fp);
        if (ex) remark.excerpt = ex;
      }
      return remark;
    }

    const { getTypstReadingStats, extractTypstExcerpt } = await import("../typst/reading-time.ts");
    const stats = await getTypstReadingStats(fp);
    if (stats) {
      remark = { ...remark, ...stats };
    }
    if (!remark.excerpt) {
      const ex = await extractTypstExcerpt(fp);
      if (ex) remark.excerpt = ex;
    }
    if (DEBUG) {
      try {
        console.log("[typst-stats] injected", {
          id: entry?.id,
          ...stats,
          excerpt: remark.excerpt?.slice?.(0, 60),
        });
      } catch (_err) {
        // ignore logging failures in non-TTY SSR environments
      }
    }
  } catch (e) {
    if (DEBUG) {
      try {
        console.warn("[typst-stats] failed", entry?.id, e);
      } catch (_err) {
        // ignore logging failures in non-TTY SSR environments
      }
    }
  }
  return remark;
}
