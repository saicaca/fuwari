---
title: Custom components
published: 2022-07-01
description: Rehype-powered components designed to extend the functionality of the markdown blog files.
tags: [Markdown, Blogging, Demo]
category: Component
draft: true
---


:::note
These are custom-built, rehype-powered components designed to extend the functionality of the markdown blog files.
:::


# Carousel image block

The `:::carousel` component allows you to group multiple images into a single, swipeable or clickable container. Instead of scrolling past endless content, your readers can focus on the specific items you want to highlight.

```markdown

:::carousel
![Caption for the first image](image_url_1)
![Caption for the second image](image_url_2)
![Caption for the third image](image_url_3)
:::

```

## Example
:::carousel     
![This is page number 1](https://tc.alcy.cc/tc/20260121/8a6007b9178ba02e7a3347d5ef8a6f38.webp)
![This is page 2 : Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.](https://tc.alcy.cc/tc/20260429/7071e598488a27cca64b5ef47d40c43d.webp)
![](https://tc.alcy.cc/tc/20260121/bda7b294007f6e23a8ab9c198d8a645f.webp)
:::

---
