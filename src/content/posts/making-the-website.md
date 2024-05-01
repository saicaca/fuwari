---
title: Making the website
published: 2024-04-17
description: 'My experience with customizing the website to add the cv page. I talk about the various issues I encountered, what ultimately worked, and the annoyances of using TypeScript coming from rust.'
image: 'https://r2.sakurakat.systems/making-the-website-banner.png'
tags: [ 'Programming', 'TypeScript', 'Rust', 'async', 'git', 'rant', 'meta', ]
category: 'Programming'
draft: false
---


This is the first post of the website (and it's going to be a rant lol).

---

# The rant

I've tried many times to make a website from scratch, but I always ended up abandoning it.
[^personal-website-1]
[^personal-website-2]
[^personal-website-3]
[^godot-game-as-website]

Writing <span>Rust</span> might be a pain in the ass,
but once it compiles,
I can be pretty sure it will work as I intended it to.
This wasn't the case for me while writing <span>TypeScript</span>.
Some might call it a "skill issue," but I consider it a flaw in the language itself.
I know that <span>TypeScript</span> <span>!=</span> <span>JavaScript</span>/ECMAScript (what do people call it nowadays
anyway?).

## The "skill issue" and my experience

I wanted to display my CV on the website,
that was the main why I created the website.
This blog is just a side product.
I had already spent a while "customizing" the [Typst](https://typst.app/) template.
Being a programmer, I wanted to
make sure there's only one source of truth, in other words, the [repo](https://github.com/pawarherschel/typst) on my
GitHub.
So, I can use that to embed the PDF on the website.
There were two problems so far, first I had to find a way to
get the PDF, second I had to find a way to embed the PDF.
I had a hunch that it should be possible since I've seen
websites do it before.
I just had to figure out _how_ to do it.

### Getting the PDF

The easiest way would've been if I could just use like an `iframe` or something to put the PDF where the content is
supposed to be.
So I tried using the `iframe` tag with `src="<link here>"`...
and I found out that `embed` is also a tag but, for whatever reason I thought I needed a JS library.
I found out that Mozilla has one!
"Thats great!
A library from the creators themselves!",
I thought to myself thinking it will be easy.
I don't like it when things that can be pre-rendered need to be rendered on the client.
So, I put the example code Mozilla gave in the front matter instead of in the web page.
Aaaaaaand it obviously didn't work first try.
So, I tried a bunch of other things before giving up.

This is the part where I remembered that Typst has an [NPM package](https://www.npmjs.com/package/typst) with the same
name.
My brain at that time thought, "Oh, lets download the git repo somewhere and then use the typst package to compile the
PDF!"
So I took the most reasonable choice and downloaded the repo to `node_modules` since it can be cached if the need arises
and `node_modules` is usually in `.gitignore`.
I brushed off the idea of using git submodules since *I* will be the one responsible to keep the repo in sync.

### Downloading the repository

At first, I searched the NPM pack repo for a library that is used to interact with git.
The first one I found hadn't been updated in years.
So I thought the easiest way would be to execute shell commands.
I used `exec` from `node:child_process` to do it.
But I kept getting had by async and promises.

At first, it just worked somehow.
So I made [gist](https://gist.github.com/pawarherschel/7ef2514d2aaf6ac6ca574daa909c935f) to show my friends what kind of
monstrosity I wrote.
After that, I tried to deploy it on cloudflare pages... and that's where it started falling apart.
The website failed to build.

After debugging for a while, I found out that the repo wasn't being cloned.
But it worked on my machine (HA! Classic.).
At some point during debugging, I came to the conclusion that the problem is the shell command spawning, since thats the
only async code I have.
So, I put console logs everywhere.

### Enter async hell

I spent hours trying to debug why I was getting everything correct when printing to console, but in the HTML generated,
the SVG was empty.
So, I tried to remove async functions all together by trying to run them in a blocking manner similar
to tokio's [^tokio] `Runtime::block_on<F: Future>(&self, future: F) -> F::Output` [^block_on].

But nothing I found worked remotely as I intended.
I was searching for a unicorn all the while I kept getting empty SVGs.
I found out that the variable I was using to store the SVG was undefined.

As a Hail Mary, embraced the rightwards drift and put everything inside the callback functions for the happy path.
AND IT WORKED!
But now the problem was that the code was very ugly.
In an attempt to redeem myself, I tried to put all the logic into a single async function which uses `async`/`await`
syntax instead of callback.
That's where I found out that using `promise.then()` and, `.on('event')` didn't automatically make the code perform as
if it was sync.
It was still running all the sync code first and then all the async code.

Turning all the async functions into promises and using the `async`/`await` syntax made the code behave as I intended.

## Redemption

The code looks good enough for me at the time of writing.

```typescript
import MainGridLayout from "../layouts/MainGridLayout.astro";

import {i18n} from "../i18n/translation";
import I18nKey from "../i18n/i18nKey";

import {exec} from "node:child_process";
import {readFile, access} from "node:fs/promises";

import * as typst from "typst";
import {DOMParser} from "xmldom";
import * as util from "node:util";
import * as fs from "node:fs";

const execPromise = util.promisify(exec);

await execPromise("git --version").then(() => {
    console.log("git is installed");
}).catch(() => {
    throw new Error("git is not available");
});

const folder: "exists" | "not" = await access("node_modules/git/typst", fs.constants.F_OK)
    .then(() => {
        return "exists";
    })
    .catch(() => {
        return "not";
    });

if (folder === "exists") {
    const {gitCloneOut, gitCloneErr} = await execPromise("git -C node_modules/git/typst pull");
} else if ("not") {
    console.log("Cloning typst");
    const {
        gitCloneOut,
        gitCloneErr
    } = await execPromise("git clone https://github.com/pawarherschel/typst.git node_modules/git/typst");
}

await typst.compile("node_modules/git/typst/cv.typ", "node_modules/git/typst/output/cv.svg", {
    fontPath: "node_modules/git/typst/src/fonts/",
});

const svgString = await readFile("node_modules/git/typst/output/cv.svg", "utf-8");

if (svgString === "") {
    throw new Error("Empty svg string");
} else {
    const svgStringPreview = svgString.substring(0, 20);
    console.log(`svg string: ${svgStringPreview}}`);
}

const parser = new DOMParser();
const dom = parser.parseFromString(svgString, "image/svg+xml");
const svgElement = dom.documentElement;
```

I miss the utility functions and standardized utility classes like `Option<T>` and `Result<O, E>`.
But it is what it is.

---

# Afterword

> Hey kat, you started by trying to embed the PDF, but you ended up using SVG instead?

Uh, OK, so, *IDEALLY*, I'd like to export to HTML, so all the wonderful styles can be applied to the CV. However, at
this point, Typst doesn't support exporting to HTML.
There is an active [RFC](https://github.com/typst/typst/issues/721) where the latest comment was last month.

> The CV looks fine in light mode, but it's horrible in the dark mode.

The next update I'd like to make is somehow querying the Typst document to extract out the components and rendering them
with HTML.
That way it would be less fragile, and it should load even faster.
Since Typst is written in <span>Rust</span>, I might be able to get the AST if I use the Typst crate.
However, I haven't done any research about the feasibility related to that + I still need to finish my research.

---
[^personal-website-1]: [personal-website on GitHub](https://github.com/pawarherschel/personal-website)
[^personal-website-2]: [personal-website-v2 on GitHub](https://github.com/pawarherschel/personal-website-v2)
[^personal-website-3]: [personal-website-v3 on GitHub](https://github.com/pawarherschel/personal-website-v3)
[^godot-game-as-website]: [CyberKataclysm on GitHub](https://github.com/pawarherschel/CyberKataclysm)
[^tokio]: [tokio on GitHub](https://github.com/tokio-rs/tokio)
[^block_on]: [the `block_on` function on docs.rs](https://docs.rs/tokio/latest/tokio/runtime/struct.Runtime.html#method.block_on)