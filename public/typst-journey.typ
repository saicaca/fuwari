#import "@preview/cetz:0.3.1"
#set page(width: auto, height: auto, margin: 10pt)
#set text(font: "JetBrainsMonoNL Nerd Font Mono")
#cetz.canvas({
  import cetz.draw: *

  scale(2)

  let h-scaler = 4.5em
  let text-width = 8.5em

  let a = 0 * h-scaler
  let b = 1 * h-scaler
  let c = 2 * h-scaler
  let d = 3 * h-scaler
  let e = 4 * h-scaler

  line(
    (a, 0),
    (b, 1),
    (c, 0),
    (d, 1),
    (e, 0),
    (d, -1),
    (c, 0),
    (b, -1),
    (a, 0),
    close: true,
  )

  line(
    stroke: (dash: "dashed"),
    (a, 1.3),
    (a, -1.3),
    name: "A",
  )
  line(
    stroke: (dash: "dashed"),
    (b, 1.3),
    (b, -1.3),
    name: "B",
  )
  line(
    stroke: (dash: "dashed"),
    (c, 1.3),
    (c, -1.3),
    name: "C",
  )
  line(
    stroke: (dash: "dashed"),
    (d, 1.3),
    (d, -1.3),
    name: "D",
  )
  line(
    stroke: (dash: "dashed"),
    (e, 1.3),
    (e, -1.3),
    name: "E",
  )

  cetz.decorations.flat-brace(
    (a, 1.3),
    (b, 1.3),
    name: "first-rise",
  )
  cetz.decorations.flat-brace(
    (b, 1.3),
    (c, 1.3),
    name: "first-dip",
  )
  cetz.decorations.flat-brace(
    (c, 1.3),
    (d, 1.3),
    name: "second-rise",
  )
  cetz.decorations.flat-brace(
    (d, 1.3),
    (e, 1.3),
    name: "second-dip",
  )

  content(
    "first-rise.spike",
    block(
      width: text-width,
      par(
        align(
          center + horizon,
          text(baseline: -0.3em)[Gather all facts and use everything],
        ),
      ),
    ),
    anchor: "base",
  )
  content(
    "first-dip.spike",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: -0.3em)[Remove easy unnecessary content],
        ),
      ),
    ),
    anchor: "base",
  )
  content(
    "second-rise.spike",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: -0.3em)[Figure out what is really important and add those],
        ),
      ),
    ),
    anchor: "base",
  )
  content(
    "second-dip.spike",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: -0.3em)[Aggressively remove content or move it elsewhere],
        ),
      ),
    ),
    anchor: "base",
  )

  content(
    "A.end",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: 0.3em)[Script Length: ],
        ),
      ),
    ),
    anchor: "north",
  )
  content(
    "B.end",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: 0.3em)[10 minutes],
        ),
      ),
    ),
    anchor: "north",
  )
  content(
    "C.end",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: 0.3em)[5 minutes],
        ),
      ),
    ),
    anchor: "north",
  )
  content(
    "D.end",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: 0.3em)[2.5 minutes],
        ),
      ),
    ),
    anchor: "north",
  )
  content(
    "E.end",
    block(
      width: text-width,
      par(
        align(
          center,
          text(baseline: 0.3em)[1.9 minutes],
        ),
      ),
    ),
    anchor: "north",
  )
})

#pagebreak()

#show quote: it => {
  [#it.attribution: "#it.body" #linebreak()]
}

#quote(attribution: "Me")[Can we use recursion in our slides?]
#quote(attribution: "Typst")[We already have recursion at home.]
recursion at home:

```typst
#let content-to-text1 = c => if c.has("text") {
  c.text
} else if c.has("children") {
  c.children.map(child => content-to-text0(child))
} else if c.has("styled") {
  content-to-text0(c.child)
}

#let content-to-text0 = c => if c.has("text") {
  c.text
} else if c.has("children") {
  c.children.map(child => content-to-text1(child)).join("")
} else if c.has("child") {
  content-to-text1(c.child)
}

#let content-to-text = content-to-text0
```

#pagebreak()

rect > content\
normal rect

#rect[rect[content]]

link > rect > content\
the whole rect is a link

#link("https://example.com/")[
  #rect(stroke: blue)[
    #text(fill: blue)[#underline(stroke: (dash: "dashed"))[\#link(\"https://example.com\")[\#rect[content]]]]
  ]
]

rect > link > content\
the content inside the rect is a link,\
but not the rect itself

#rect[
  #link("https://example.com/")[
    #text(fill: blue)[#underline(stroke: (dash: "dashed"))[\#rect[\#link(\"https://example.com/\")[content]]]]
  ]
]

#pagebreak()

#page(width: 50em)[
  Example 1:

  rect > content\
  no alignment

  #rect(width: 40em)[\#rect(width: 40em)[content]]

  rect > align > content\
  center align the content inside the rect

  #rect(width: 40em)[
    #align(center)[
      \#rect(width: 40em)[\#align(center)[content]]
    ]
  ]

  align > rect > content\
  center align the rect

  #align(center)[
    #rect[
      \#align(center)[\#rect[content]]
    ]
  ]

  #repeat[-]
  Example 2:

  align(right) > block > align(center) > rect > lorem(30)\
  center align the text and right align the paragraph

  #align(right)[
    #block(width: 40em)[
      #align(center)[
        #rect[
          #lorem(30)
        ]
      ]
    ]
  ]

  align(center) > block > align(right) > rect > lorem(30)\
  right align the text and center align the paragraph

  #align(center)[
    #block(width: 40em)[
      #align(right)[
        #rect[
          #lorem(30)
        ]
      ]
    ]
  ]
]
#pagebreak()

#page(width: 60em)[
  #rect[
    #columns(3)[
      #rect[#par(justify: true)[#lorem(30)]]
      #colbreak()
      #rect[#par(justify: true)[#lorem(30)]]
      #colbreak()
      #rect[#par(justify: true)[#lorem(30)]]
    ]
  ]
]

#pagebreak()


#table(
  columns: 3,
  rows: 2,
  stroke: (dash: "dashed"),
  rect(width: 15em)[width: 15em], rect(width: 10em)[width: 10em], rect(width: 5em)[width: 5em],
  box(width: 15em)[#repeat[😺]], box(width: 10em)[#repeat[😻]], box(width: 5em)[#repeat[😼]],
)


#pagebreak()

#columns(3)[
  #box[
    #table(
      columns: 3,
      rows: 1,
      stroke: (dash: "dashed"),
      rect(height: 1fr)[
        #rect[
          #par[
            imagine\
            this\
            is\
            an\
            image\
          ]
        ]
      ],
      block(height: 1fr)[
        #align(top)[
          #rect(width: 5em)[top]
        ]

        #align(horizon)[
          #rect(width: 5em)[horizon]
        ]

        #align(bottom)[
          #rect(width: 5em)[bottom]
        ]
      ],
      rect()[
        #let l = lorem(20).split(" ")
        #for word in l {
          [
            + #word #linebreak()
          ]
        }
      ],
    )
  ] #box[
    #table(
      columns: 3,
      rows: 1,
      stroke: (dash: "dashed"),
      rect(height: 1fr)[
        #rect[
          #par[
            imagine\
            this\
            is\
            an\
            image\
          ]
        ]
      ],
      block(height: 1fr)[
        #align(top)[
          #rect(width: 5em)[top]
        ]

        #align(horizon)[
          #rect(width: 5em)[horizon]
        ]

        #align(bottom)[
          #rect(width: 5em)[bottom]
        ]
      ],
      rect()[
        #let l = lorem(10).split(" ")
        #for word in l {
          [
            + #word #linebreak()
          ]
        }
      ],
    )
  ] #box[
    #table(
      columns: 3,
      rows: 1,
      stroke: (dash: "dashed"),
      rect[
        #rect[
          #par[
            imagine\
            this\
            is\
            an\
            image\
          ]
        ]
      ],
      block(height: 1fr)[
        #align(top)[
          #rect(width: 5em)[top]
        ]

        #align(horizon)[
          #rect(width: 5em)[horizon]
        ]

        #align(bottom)[
          #rect(width: 5em)[bottom]
        ]
      ],
      rect(height: 1fr)[
        #let l = lorem(5).split(" ")
        #for word in l {
          [
            + #word #linebreak()
          ]
        }
      ],
    )
  ]
]

#pagebreak()

#page(width: 1920pt, height: {1080pt/2})[
  #text(size: 2em)[
    #columns(3)[
      #rect(height: 1fr)[#figure(image("example.jpg", fit: "contain", height: 1fr, width: 100%), caption: "contain")]
      #colbreak()
      #rect(height: 1fr)[#figure(image("example.jpg", fit: "cover", height: 1fr, width: 100%), caption: "cover")]
      #colbreak()
      #rect(height: 1fr)[#figure(image("example.jpg", fit: "stretch", height: 1fr, width: 100%), caption: "stretch")]
    ]
  ]
]

#pagebreak()

#page(width: 50em)[
  kat #h(1fr) acquired\
  autism #h(1fr) kat #h(1fr) acquired #h(1fr) square
]
