---
title: 草稿文章示例
published: 2022-07-01
tags: [demo, markdown]
category: Examples
draft: true
device: Windows
---

# 草稿状态

写长文或者还在搭框架的时候，通常不想让半成品直接出现在线上列表里。Fuwari 支持在文章头部的 frontmatter 里加上 `draft: true`，这样本地预览可以照常调试，但生产构建时会自动把它排除在所有公开页面之外。

等正文、配图和排版都核对稳妥准备发布时，只需要把 frontmatter 中的 `draft` 改成 `false` 即可：

```markdown
---
title: Draft Example
published: 2024-01-11T04:40:26.381Z
tags: [demo, markdown]
category: Examples
draft: false
---
```
