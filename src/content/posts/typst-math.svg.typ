#import "@preview/fletcher:0.5.8" as fletcher: diagram, edge, node
#import "@preview/cetz:0.4.0"
#let desc = [alpha,beta,gamma Typst math in HTML]
#metadata(
  (
    title: "Typst Math Demo",
    published: "2025-09-21",
    description: desc,
    tags: ("Math", "Typst"),
    category: "Demo",
  ),
)<frontmatter>

#set page(margin: 0em, height: auto)
#set text(
  font: ((name: "Libertinus Serif", covers: "latin-in-cjk"), "Noto Serif SC"),
  lang: "zh",
  region: "cn",
)
#show emph: text.with(font: ((name: "Libertinus Serif", covers: "latin-in-cjk"), "LXGW WenKai"))
#show raw: text.with(font: "Maple Mono NF")
#image("guide/cover.jpeg")
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
      K edge("d")\
      S edge("d")\
      F
    $,
  ),
)
