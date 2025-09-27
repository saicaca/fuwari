//# Typst HTML demo replicating the Markdown Example post
#import "../typ/fuwari-html.typ": *
#show raw.where(block: true): it => { html.elem("ec", attrs: (lang: it.lang, code: it.text)) }
#let desc = [Replicate common Markdown features using Typst + HTML elements]
#metadata((
  title: "Markdown Features in Typst (HTML)",
  published: "2025-09-24",
  description: desc,
  tags: ("Markdown", "Examples", "Typst"),
  category: "Examples",
))<frontmatter>
= An h1 header
```rust
fn main()
```
Paragraphs are separated by a blank line.```rust fn main()```

_Italic_, *also italic*, *_mix_*, and `monospace`.

== Unordered list
#fw_ul[
  #fw_li[this one]
  #fw_li[that one]
  #fw_li[the other one]
]
123
== Blockquote
#fw_blockquote[
  #fw_p[Block quotes are written like so.]
  #fw_p[They can span multiple paragraphs, if you like.]
]

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all in chapters 12--14"). Three dots ... will be converted to an ellipsis. Unicode is supported. ☺

== An h2 header

Here's a numbered list:

#fw_ol[
  #fw_li[first item]
  #fw_li[second item]
  #fw_li[third item]
]

Here's an indented code sample:

#fw_ec("text", "# Let me re-iterate ...\nfor i in 1 .. 10 { do-something(i) }")

Delimited code block with syntax highlighting:

#fw_ec(
  "python",
  "import time\n# Quick, count to ten!\nfor i in range(10):\n    # (but not *too* quick)\n    time.sleep(0.5)\n    print(i)",
)

=== Nested list

#fw_ol[
  #fw_li[First, get these ingredients:
    #fw_ul[
      #fw_li[#fw_img("https://placehold.co/800x480/png", "An exemplary image", "100%")]
      #fw_li[#fw_tfile("src/content/posts/typst-math.svg.typ", "inline", "typst-math")]
      #fw_li[lentils]
    ]
  ]
  #fw_li[Boil some water.]
  #fw_li[Dump everything in the pot and follow this algorithm:]
]

Here's a link to #fw_a("http://foo.bar")[a website], to a #fw_a("local-doc.html")[local doc], and to a #fw_a("#an-h2-header")[section heading in the current doc]. Here's a footnote #html.elem("sup")[#html.elem("a", attrs: (href: "#user-content-fn-1", id: "user-content-fnref-1", "data-footnote-ref": "", "aria-describedby": "footnote-label"))[1]].

/* Tables section removed intentionally: this site no longer renders tables. */

Images:

#fw_img("https://placehold.co/800x480/png", "An exemplary image", "100%")

Display math example (use a Typst SVG file for true rendering):

#fw_tfile("src/content/posts/typst-math.svg.typ", "inline", "typst-math")

#fw_hr()

#html.elem("tsvg", attrs: (code: "#set page(margin: 0em, height: auto)\n$ a^2 + b^2 = c^2 $"))

#html.elem("tsvg", attrs: (
  mode: "doc",
  code: "#import \"@preview/fletcher:0.5.8\" as fletcher: diagram, edge, node
#import \"@preview/cetz:0.4.0\"
#let desc = [alpha,beta,gamma Typst math in HTML]
#metadata(
  (
    title: \"Typst Math Demo\",
    published: \"2025-09-21\",
    description: desc,
    tags: (\"Math\", \"Typst\"),
    category: \"Demo\",
  ),
)<frontmatter>

#set page(margin: 0em, height: auto)
#set text(
  font: ((name: \"Libertinus Serif\", covers: \"latin-in-cjk\"), \"Noto Serif SC\"),
  lang: \"zh\",
  region: \"cn\",
)
#show emph: text.with(font: ((name: \"Libertinus Serif\", covers: \"latin-in-cjk\"), \"LXGW WenKai\"))
#show raw: text.with(font: \"Maple Mono NF\")
#image(\"src/assets/images/demo-avatar.png\")
= Typst Math Demo
你好 _你不好_ *你好好* 123 _*123你*_ we

Inline math like $a^2 + b^2 = c^2$ works.
```rust
fn main()
```
== Display Math

$ A = pi r^2 $

== Matrix Example

$M = mat(
  1, 2, 3;
  0, 1, 4;
  5, 6, 0,
)$

#figure(
  diagram(
    cell-size: 0.5mm,
    $
      K edge(\"d\")\
      S edge(\"d\")\
      F
    $,
  ),
)
",
))

= 123

#html.elem("p")[Footnotes: #html.elem("a", attrs: (id: "fn1"))[1] Footnote text goes here.]
