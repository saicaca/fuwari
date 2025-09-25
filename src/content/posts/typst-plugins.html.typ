//# Typst HTML demo that uses Fuwari plugins
//# Import helpers to emit components understood by rehype-components + CSS
#import "@preview/fletcher:0.5.8" as fletcher: diagram, edge, node
#import "@preview/cetz:0.4.0"
#import "../typ/fuwari-html.typ": *
#let desc = [Use Fuwari plugins inside Typst HTML, demonstrating parity with Markdown features]
#metadata(
  (
    title: "Typst + Fuwari Plugins",
    published: "2025-09-21",
    description: desc,
    tags: ("Typst", "Fuwari", "Plugins"),
    category: "Demo",
  ),
)<frontmatter>

= Typst + Fuwari Plugins (HTML Target)

This page demonstrates using original Fuwari components in Typst when targeting HTML.

== Admonitions
#fw_note[You can write note content here. 1234 56789 1023]
#fw_tip[Tip without custom title.]
#fw_important[Important content body.]
#fw_warning[Take care when mixing targets.]
#fw_caution[Use .html.typ files to enable components.]

=== Custom Titles

// Provide a custom title by marking the first child as a label
// using the `has-directive-label` flag understood by the component.
#html.elem("note", attrs: ("has-directive-label": "true"))[
  #html.elem("p")[MY CUSTOM TITLE]
  #html.elem("p")[This is a note with a custom title.]
]

=== GitHub-style (equivalent)

// Equivalent of GitHub-style admonitions like > [!TIP] …
// Use the corresponding element name directly.
#fw_tip[The GitHub syntax is also supported via mapping.]

== GitHub Card

#github("saicaca/fuwari")

// Note: inline formula (<tsvg>) support has been removed.
// Use full Typst documents via <tfile> instead.

== Import another Typst post (SVG)

Below embeds the SVG-target post as a component:

#fw_tfile("src/content/posts/typst-math.svg.typ", "inline", "")

Image mode (base64 <img>):

// Place <tfile> directly (not wrapped in a <p>) so the
// rehype pipeline doesn't drop or reorder it.
#fw_tfile("src/assets/images/demo-banner.png", "img", "typst-embedded")

== Spoiler

Try hovering: #fw_spoiler[This text stays hidden unless hovered.]

== Links

External: #fw_a_target("https://astro.build", "_blank")[Astro]

Anchor: #fw_a("#code-blocks")[Jump to code blocks]

== Images & Lightbox

Base64 images within this page (e.g., math as <img>) participate in the lightbox.
You can also embed images via HTML directly:


#fw_img("https://placehold.co/800x480/png", "placeholder", "100%")


== Code Blocks (Expressive Code)

Regular syntax highlighting:

#fw_ec("js", "console.log(\"This code is syntax highlighted!\")")

With line numbers and wrapping:

#html.elem("ec", attrs: (
  lang: "ts",
  showLineNumbers: "true",
  code: "function greet(name: string) {\n  return `Hello, ${name}`\n}\n\nconsole.log(greet(\"Typst\"))",
))

= _你好_
=== 12

== 不好
= 12
=== ~！@
