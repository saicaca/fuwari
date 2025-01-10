---
title: My journey with Typst
published: 2025-01-06
description: |
  I applied to University of Aalto's game development and design program,
  and this blogpost covers the process of my journey with Typst
  with an emphasis on how i used Typst to make a 10+ minute draft which had some ideas
  to the condensed version which fit in the time limit of 2 minutes.
tags: []
category: Examples
draft: false
prevTitle: "Fractured Elements Breakdown"
prevSlug: "fractured-elements-breakdown"
nextTitle: ""
nextSlug: ""
---

# My journey with Typst

I have been following [Typst](https://Typst.app/) for a while now.
::github{repo="Typst/Typst"}
It first piqued my interest
when I saw it's a modern replacement for LaTeX,
especially since it's written in Rust!

The first thing I made using Typst is my [CV](https://github.com/pawarherschel/Typst/blob/main/output/CV.pdf).
::github{repo="pawarherschel/Typst"}
I just took an aesthetically pleasing enough template
and just shoved the stuff I had made into it.

As for my website,
after 5 iterations
(more coming after Typst has HTML export, or I get bored with this template)
trying templates and building my website myself,
I finally decided to use [fuwari](https://fuwari.vercel.app/).
::github{repo="saicaca/fuwari"}
I wanted to show my CV on the website,
so I started
digging around for what
I can do
to make the process less error prone
while also reducing the amount of work I do.

I was debating between
- Parsing the Abstract Syntax Tree (AST)
    - I wanted to learn [`winnow`](https://github.com/winnow-rs/winnow), a parser combinator library in rust
- Hacking on the compiler
    - So, I could use existing tools, and then expose the modified version as a TypeScript module, via Foreign Function Interface (FFI)
        - I've been trying to find reasons to use FFI to JS/Python.

However, in the end, I decided to just embed the PDF,
that also didn't pan out well either,
Rather, I ended up using the SVG export
and then embedding the SVG as a temporary measure.
Afterwards,
I ended up modifying the template,
so it uses a YAML file as the source of truth,
and then using the YAML file to get the required data.
This ensured that all my data for CV was in a centralized place.

# Making the application video

As part of the application deliverables,
I had to submit a short introduction video
(they mentioned 2-minute max).
I decided I wanted to
- make slides
- add voice (somehow),
- also show my face (again, somehow).

The only thing I was sure about was
that I have to make a presentation 
and edit it
(probably using `KDenLive` since it's open source).

## Script

![Double diamond pattern with texts "Gather all facts and use everything" "Remove easy unnecessary content" "Figure out what is really important and add those" "Aggressively remove content or move it elsewhere" and the bottom has script lengths 10 minutes to 5 minutes to 2.5 minutes to 1.9 minutes](https://r2.sakurakat.systems/typst-journey--double-diamond.svg "double diamond pattern diagram for creating the script.")

I then proceeded to write a long script with everything I wanted in
detail.
After I completed the script and preliminary slides,
I found out I need to reduce the content to just essentials,
as;
even if speed ran through the script perfectly,
there's no way it's going to fit it in 2 minutes.

Then I proceeded to eliminate content from the script,
I turned the headings into content,
content into bullet points,
put the explanation into the slides,
just doing whatever I can while trying to make sure
the content isn't too confusing.
My aim was to get the video done.
I made sure to keep track of whom all I'm "stealing" ideas from,
and asking for feedback,
so I could then credit them at the end.

The process for script was just word vomit,
and then refine, refine, refine
(see: [^developers-developers-developers]).
In the end,
the script turned out to be good enough for me at least.
I would've preferred to not rust through the content
and give more explanation,
but it's fine,
staying under the time limit was more important.

## Slides

I went through many iterations for the slides.
I didn't like the design or how I organized the content.
You can also see the difference in code quality
if you compare the original and condensed slides.
The original had a lot of hard-coded values,
and the content didn't respect the margins
as I was (ab)using focus slides
the final version uses relative sizes,
and the content respects the margins.

The only thing I don't like about the new slides is
that I had to enclose everything in a `block`
and duplicated a lot of work.
However, it's still miles better than the original.

I started with the [UniStra theme for Touying](https://Typst.app/universe/package/Touying-unistra-pristine),
then tried [Grape Suite](https://Typst.app/universe/package/grape-suite),
[Diatypst](https://Typst.app/universe/package/diatypst),
but in the end, I ended up using [Touying](https://Typst.app/universe/package/touying)
with the [metropolis theme](https://touying-typ.github.io/docs/themes/metropolis) and
[Catppuccin](https://catppuccin.com/)
[colors](https://catppuccin.com/palette#:~:text=Macchiato-,Mocha,-Project).
I also tried to consistently add subtle hints such as:
- using a different font for stuff I consider creative
- adding `=` to show the heading level
- showing original and preview image paths
- adding highlights
- and so on.

I made many decisions subconsciously,
but I hope people will still notice them.
Out of all the people I asked for feedback,
only one person explicitly mentioned the hints.

The most hacky thing I had to do was removing formatting from links.
I still don't know if there's a better way to do it.
I ended up making a recursive function,
that extracts just the text parts.

The Typst compiler didn't allow me to make it recursive.
I ended up duplicating the function
and making them call each other instead of recursing (see: [Table of Links section](#table-of-links)).
The solution is fragile, and it broke when I tried to move it to the top.

![can we have x at home eme with text Me: Can we use recursion in our slides? Typst: We already have recursion at home. recursion at home: snippet of code from condensed-slides.typ](https://r2.sakurakat.systems/typst-journey--we-have-recursion-at-home.svg "Can we have recursion at home")

## Video

I was planning to use my phone to change slides using [KDE Connect](https://kdeconnect.kde.org/),
my tablet to read the script,
and record my screen for video.

### Slides

KDE connect has a presentation remote,
but I didn't know which key presses it sent.
I dug into the source code
and found out it uses page up and down to change slides.

I used [Tinymist](https://github.com/Myriad-Dreamin/tinymist) to present my slides,
but Tinymist doesn't support page up and down to change slides,
so I modified it.
This was a 2-line change.
That being said,
dealing with the build system was nowhere as simple.
I couldn't figure out
what was wrong,
so I asked in the
[Tinymist thread](https://discord.com/channels/1054443721975922748/1260973804637786224)
in
[Typst's discord](https://discord.gg/2uDybryKPe),
and got it to work that way.

### Script

I added helper functions to the script,
so I could budget how much time I have to say a section.
I recorded myself saying the script
and then estimated how much time I can spend on the slide.
It also helped me stay under the 2-minute limit.
I also reduced the margin on the page,
so the content is close together,
and my eyes don't dart laterally while reading.
I had to add reminders to breathe (lol).
Furthermore,
I also had to mark the words where I have to slow down on,
either for clarity reasons
or because my tongue got twisted while saying them.

### Editing

In the end,
I ended up recording audio clips of me saying the sections,
since I can't learn the script
or even say it in one go.

I exported the slides as SVGs,
since I used them as video frames.
I imported the SVGs into KDenLive,
and for some reason it didn't work as expected.
On top of that,
I was under time pressure.
Earlier, I had set up [OBS](https://obsproject.com/) for only recording the slides
and not the other UI.
I ended up taking screenshots of the slides using OBS,
and used them as frames.

I aligned the slides with their audio,
and then realized
I didn't know how many video frames I could give to the slides.
I then modified the script's helper functions
to calculate video frames on top of everything else.
I wanted to give more time for the text-heavy slides
and the slides with GIFs.
I proceeded to give minimal time for others.

As for the slides where I'm talking about myself,
I composed the webcam footage of me speaking into the video
and hoped that people will notice it.
I used photos I captured in VRChat as the video background when I'm speaking.
The photos were chosen based on how I wanted the mood to be.
For example,
- Introduction slides: bright and hopeful
    - The original images had my friend
    - I joined her to ask how it's going
    - and the whole scene just felt like she was the final boss of a video game.
    - I thought it looked really good and had to take the image.
    - World: [Observatorium Aureatus](https://vrchat.com/home/world/wrld_f3fbb28f-f83f-4ed4-a6fc-8a20c9d7d43e/info)
    - Youtube Preview: [VRChat world - Observatorium Aureatus](https://www.youtube.com/watch?v=rg5BrawnhN8)

![](https://r2.sakurakat.systems/typst-journey--video-bg-1.jpg)
- The [bevy](https://bevyengine.org/) slide: technology
    - Pong might've been better, but it would've been too plain.
    - The world I took the photo in is an artwork that shows old web aesthetics.
    - World: [Sensory Rooms](https://vrchat.com/home/world/wrld_3f4e1cf3-9551-4599-86bb-a1945dba41d6/info)
    - Youtube Preview: [Sensory Rooms - OST (Original Soundtrack)](https://www.youtube.com/watch?v=B91JfFg0ec0)

![](https://r2.sakurakat.systems/typst-journey--video-bg-2.jpg)
- The quote slide: somber and heartfelt
    - It has a big, beating heart
    - The world was made in memory of someone the creator knew who died by suicide.
    - World: [VoN: Fragmented Love & Silence](https://vrchat.com/home/world/wrld_10af394e-064d-430c-b0d5-84f7780f2881/info)
    - No Youtube preview available


![](https://r2.sakurakat.systems/typst-journey--video-bg-3.jpg)

I also tried to match my clothing with the background.

# Changes to the website

I used my website as an online portfolio,
I added more metadata to the source of truth,
and moved it to TOML (since I don't like YAML).

# Changes to my CV

I modified my CV's internal working so it's easier to modify
and tailor the CV according to the job I'm applying to.

# Details

## Script

### The `next-slide` function

Takes in seconds as budget and derives the required information.

### The `outline` section

Creates a table of content
to jump to different parts of the script.
Since the headings have a consistent format,
I navigate through the AST and get the heading text,
and the page numbers.

## Slides

### Tips

Use table instead of grid
and rect instead of block
to visually see if the content is behaving correctly.

Typst is really composable.
Rather than having ever possible customization in the element,
Typst requires you to wrap the content you want to customize,
for example:

- Want a link? Wrap it in `link`

![](https://r2.sakurakat.systems/typst-journey--tips-1.svg)

- Want to align the content? Wrap it in `align`

![](https://r2.sakurakat.systems/typst-journey--tips-2.svg)

- Want multiple equal width columns? use `columns`

![](https://r2.sakurakat.systems/typst-journey--tips-3.svg)

- Want multiple fit-to-content width columns? use `grid`

![](https://r2.sakurakat.systems/typst-journey--tips-4.svg)

- Want to consume the whole height? use `block` with `height: 1fr`

![](https://r2.sakurakat.systems/typst-journey--tips-5.svg)

- and so on

Also found out the better fit for images is `contain`
because I don't want the images to get cropped.
![](https://r2.sakurakat.systems/typst-journey--tips-6.svg)

With `#h(1fr)` you can have text in the left and also in the right.
![](https://r2.sakurakat.systems/typst-journey--tips-7.svg)

### `filepath`

Shows the path for the original file's path in the repo,
and the preview file's path for the slides if required.
The text is formatted in a way that makes sure it doesn't
create newlines.
- `#sym.wj` (word joiner)
    - doesn't change the text and prevents the word from being broken up
- `~` (non-breaking space)
    - adds a space and prevents the word from being broken up

Got both of them from this video
[Six Things I Bet You Didn't Know About Typst | Laurenz Mädje @ Typst Meetup](https://youtu.be/WQyqyrRQcSw)

### `#show: appendix`

This felt weird,
but it makes sense to me if I think about it like:\
After this point, all the content is given to the appendix function
as the content parameter.

### Table of Links

As mentioned earlier,
I tried to make a recursive function `content-to-text`,
but Typst compiler complained,
so I duplicated the function and made them call each other.
`content-to-text1`
and `content-to-text0`
both do the same thing.
I then made `content-to-text` an alias for one of the functions,
doesn't matter which.

First they check if the argument has text,
if it has,
then the work is done,
and no further calls need to be made.
If the argument is an array-like structure,
then calls are made to each element
and then they’re all joined together.
Finally,
if the argument has a single child element,
the call is made on the child.

In the end,
the functions look pretty simple,
but I had to do quite a bit of debugging to figure them out.
Tinymist's Visual Studio Code extension came handy for the process.
Also,
defensively programming
(see lines with `SOMETHING HAS WENT WRONG!!!!!`)
really helped bring attention when errors happened.

# Future work

I want to remake my CV and make it aesthetically appealing.

---

Typst file for the diagrams available [here](/public/typst-journey.typ)

---

[^developers-developers-developers]: <iframe loading="lazy" width="560" height="315" src="https://www.youtube-nocookie.com/embed/8fcSviC7cRM?si=iK0q32g4S3KQUDiv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>