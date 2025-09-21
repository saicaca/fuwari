//# Typst HTML demo mirroring the Video embed Markdown example
#import "../typ/fuwari-html.typ": github, fw_iframe

#let desc = [Embed external videos via iframes in a Typst HTML post]
#metadata((
  title: "Include Video in Typst Posts",
  published: "2025-09-24",
  description: desc,
  tags: ("Example", "Video", "Typst"),
  category: "Examples",
))<frontmatter>

= Include Video in the Posts (Typst HTML)

Just copy the embed code from YouTube or other platforms, and paste it in the Typst file using HTML elements.

== YouTube

#fw_iframe(
  "https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_",
  "100%",
  "468",
  "YouTube video player",
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  "0",
  "true",
  "",
  "",
  "",
)

== Bilibili

#fw_iframe(
  "//player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&p=1",
  "100%",
  "468",
  "",
  "",
  "no",
  "true",
  "no",
  "0",
  "0",
)
