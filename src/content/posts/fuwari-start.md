---
title: 从这里开始
published: 2024-05-01
description: 整理 Fuwari 博客本地调试、构建发布与独立页面扩展的常用备忘，并附带一份 Markdown 语法渲染测试样板。
tags: [demo, markdown]
category: module
draft: true
device: Windows
---

这篇是自留的 Fuwari 快速上手备忘草稿，记录日常本地调试、构建推送和扩展独立页面的几个高频操作，后半部分顺带保留了一套完整的 Markdown 语法样板方便随时自检排版。想看更系统的主题搭建流程，可以直接参考这份 [参考教程](https://2x.nz/posts/fuwari/)。

## 本地运行与发布流程

平时写新文章或调样式时，先在本地把开发服务器跑起来实时预览：

```shell
pnpm dev
```

改完准备上线前，习惯先跑一遍完整构建，确认没有语法或打包报错后再提交推送：

```shell
pnpm build
git push
```

## 创建独立页面

如果想给博客加一些非文章类的独立页面（比如个人介绍、友链等），直接往 `src/content/spec/` 目录下放 Markdown 文件，Fuwari 默认会走通用的 Markdown 页面模板来渲染。

要是某个页面需要更自由的自定义布局，可以按两步来扩展：先在 `src/pages/[spec].astro` 中排除掉对应的 slug，再参照 `src/pages/about.astro` 的结构单独新建一个页面文件即可。

---

以下内容保留为 Markdown 基础语法渲染测试样板，便于日常检查排版样式：

# An h1 header

Paragraphs are separated by a blank line.

2nd paragraph. _Italic_, **bold**, and `monospace`. Itemized lists
look like:

- this one
- that one
- the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺

## An h2 header

Here's a numbered list:

1. first item
2. second item
3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

```
define foobar() {
    print "Welcome to flavor country!";
}
```

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

```python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
```

### An h3 header

Now a nested list:

1. First, get these ingredients:

   - carrots
   - celery
   - lentils
2. Boil some water.
3. Dump everything in the pot and follow
   this algorithm:

   find wooden spoon
   uncover pot
   stir
   cover pot
   balance wooden spoon precariously on pot handle
   wait 10 minutes
   goto first step (or shut off burner when done)

   Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

Tables can look like this:

size material color

---

9 leather brown
10 hemp canvas natural
11 glass transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

---

keyword text

---

red Sunsets, apples, and
other red or reddish
things.

green Leaves, grass, frogs
and other things it's
not easy being.

---

A horizontal rule follows.

---

Here's a definition list:

apples
: Good for making applesauce.
oranges
: Citrus!
tomatoes
: There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
| Line too
| Line tree

and images can be specified like so:

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$
I = \int \rho R^{2} dV
$$

$$
\begin{equation*}
\pi
=3.1415926535
 \;8979323846\;2643383279\;5028841971\;6939937510\;5820974944
 \;5923078164\;0628620899\;8628034825\;3421170679\;\ldots
\end{equation*}
$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.

[//]: #
[^1]: Footnote text goes here.
