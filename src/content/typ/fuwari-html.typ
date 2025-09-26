// Typst helpers for Fuwari plugins (HTML target)
// Import this in .html.typ posts to get GitHub cards and convenience wrappers.

// Admonitions via rehype-components: emit <note>/<tip>/... elements
#let fw_note(body) = html.elem("note")[#body]
#let fw_tip(body) = html.elem("tip")[#body]
#let fw_important(body) = html.elem("important")[#body]
#let fw_warning(body) = html.elem("warning")[#body]
#let fw_caution(body) = html.elem("caution")[#body]

// GitHub repo card
// Renders via rehype-components in Astro config
#let github(repo) = html.elem("github", attrs: (repo: repo))
#let gh(repo) = html.elem("github", attrs: (repo: repo))

// Footnotes helpers (HTML structure compatible with remark-footnotes output)
// Usage:
//   In text:  Here's a footnote #fw_fn_ref(1).
//   At end:   #fw_footnotes([ #fw_fn_item(1)[Footnote text goes here.] ])
// These emit the same DOM structure and attributes as Markdown footnotes,
// which allows existing site CSS to style Typst pages consistently.

#let fw_fn_ref(n: int) = {
  let id = str(n)
  html.elem("sup")[
    #html.elem(
      "a",
      attrs: (
        href: "#user-content-fn-" + id,
        id: "user-content-fnref-" + id,
        "data-footnote-ref": "",
        "aria-describedby": "footnote-label",
      ),
    )[#id]
  ]
}

#let fw_fn_item(n: int, body) = {
  let id = str(n)
  html.elem("li", attrs: (id: "user-content-fn-" + id))[
    #html.elem("p")[
      #body
      #html.elem(
        "a",
        attrs: (
          href: "#user-content-fnref-" + id,
          "data-footnote-backref": "",
          "aria-label": "Back to reference " + id,
          class: "data-footnote-backref",
        ),
      )["↩"]
    ]
  ]
}

#let fw_footnotes(list) = html.elem("div", attrs: (class: "footnotes"))[ #html.elem("ol")[#list] ]

// ------------------------------------------------------------
// HTML convenience wrappers (common elements)
// Import as:  #import "../typ/fuwari-html.typ": fw_a, fw_p, fw_ul, fw_ol, fw_li, fw_img, fw_hr, fw_blockquote, fw_pre, fw_table, fw_thead, fw_tbody, fw_tr, fw_th, fw_td, fw_sup, fw_span, fw_ec, fw_ec_titled, fw_tfile, fw_spoiler

#let fw_a(href, body) = html.elem("a", attrs: (href: href))[#body]
#let fw_p(body) = html.elem("p")[#body]
#let fw_ul(body) = html.elem("ul")[#body]
#let fw_ol(body) = html.elem("ol")[#body]
#let fw_li(body) = html.elem("li")[#body]
#let fw_blockquote(body) = html.elem("blockquote")[#body]
#let fw_sup(body) = html.elem("sup")[#body]
#let fw_span(body) = html.elem("span")[#body]

// Void/self-closing like elements
#let fw_img(src, alt, width) = {
  html.elem("img", attrs: (src: src, alt: alt, width: width))
}
#let fw_hr() = html.elem("hr")

// Tables
#let fw_table(body) = html.elem("table")[#body]
#let fw_thead(body) = html.elem("thead")[#body]
#let fw_tbody(body) = html.elem("tbody")[#body]
#let fw_tr(body) = html.elem("tr")[#body]
#let fw_th(body) = html.elem("th")[#body]
#let fw_td(body) = html.elem("td")[#body]

// Expressive Code helper (simple forms)
#let fw_ec(lang, code) = html.elem("ec", attrs: (lang: lang, code: code))
#let fw_ec_titled(lang, title, code) = html.elem("ec", attrs: (lang: lang, title: title, code: code))

// Typst file embedding helper
#let fw_tfile(file, embed, alt) = html.elem("tfile", attrs: (file: file, embed: embed, alt: alt))

// Spoiler
#let fw_spoiler(body) = html.elem("spoiler")[#body]

// Definition list helpers
#let fw_dl(body) = html.elem("dl")[#body]
#let fw_dt(body) = html.elem("dt")[#body]
#let fw_dd(body) = html.elem("dd")[#body]

// Variants
#let fw_table_cls(cls, body) = html.elem("table", attrs: (class: cls))[#body]
#let fw_a_target(href, target, body) = html.elem("a", attrs: (href: href, target: target))[#body]

// Iframe helper for video embeds
#let fw_iframe(
  src,
  width,
  height,
  title,
  allow,
  frameborder,
  allowfullscreen,
  scrolling,
  border,
  framespacing,
) = html.elem(
  "iframe",
  attrs: (
    src: src,
    width: width,
    height: height,
    title: title,
    allow: allow,
    frameborder: frameborder,
    allowfullscreen: allowfullscreen,
    scrolling: scrolling,
    border: border,
    framespacing: framespacing,
  ),
)

// ------------------------------------------------------------
// Inline Typst -> SVG
// 现已统一为 full doc 内联方式：
//   #html.elem("tsvg", attrs: (code: "#set page(margin: 0em, height: auto)\n..."))
// 或者将完整文档放入 code 属性，不再提供专门的“行内公式”包装宏。
