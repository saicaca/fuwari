---
title: 改造博客的代码块
published: 2024-10-25
updated: 2025-02-28
description: "增加更多的功能（已抛弃）"
image: ""
tags: [Fawari, Astro, Shiki, 博客]
category: "前端"
draft: false
lang: ""
---

:::caution
因为有更好的方案，该做法已被抛弃<br>
请参考 [增强代码块功能](/posts/前端/增强代码块功能/)
:::

## 添加 shiki 官方的 transformers

> `shiki`是 Astro&Fuwari 默认的代码块渲染器 </br>
> `transformers`可以实现代码高亮等功能 </br>
> 官网地址：[transformers🔗](https://shiki.matsu.io/packages/transformers)

### 改动点

1. 在配置里添加 transformers

```js file=astro.config.mjs
import { // [!code ++]
  transformerMetaHighlight, // [!code ++]
  transformerMetaWordHighlight, // [!code ++]
  transformerNotationDiff, // [!code ++]
  transformerNotationErrorLevel, // [!code ++]
  transformerNotationHighlight, // [!code ++]
  transformerNotationWordHighlight, // [!code ++]
} from "@shikijs/transformers"; // [!code ++]

export default defineConfig({
  markdown: {
    shikiConfig: {
      transformers: [
        // ...
        transformerNotationDiff(), // [!code ++]
        transformerNotationHighlight(), // [!code ++]
        transformerNotationWordHighlight(), // [!code ++]
        transformerNotationErrorLevel(), // [!code ++]
        transformerMetaHighlight(), // [!code ++]
        transformerMetaWordHighlight(), // [!code ++]
      ],
    },
  },
});
```

2. 添加样式

```astro file=src\components\misc\Markdown.astro
<style is:global>
/* transformerNotationDiff */
.line.diff.add {
  background-color: #174d2c;
}
.line.diff.remove {
  background-color: #440e11;
}
.line.diff.add:before {
  content: '+ ';
  color: #4affa8;
  opacity: 0.6;
}
.line.diff.remove:before {
  content: '- ';
  color: #ff5e61;
  opacity: 0.6;
}

/* transformerNotationHighlight */
.line.highlighted {
  background-color: #3c3f45;
}

/* transformerNotationWordHighlight */
.highlighted-word {
  background-color: #3c3f45;
  border: 1px solid #464b52;
  padding: 1px 3px;
  margin: -1px -2px;
  border-radius: 4px;
}

/* transformerNotationErrorLevel */
.line.highlighted.error {
  background-color: #440e11;
}
.line.highlighted.warning {
  background-color: #583410;
}
</style>
```

## 添加代码块的标题栏

> 像这样在语言的后面可以加上`file=路径\文件名`

````md file=demo.md
```astro file=src\components\misc\Markdown.astro

```
````

### 改动点

1. 在`📁plugins`里创建`remark-code-title.js`文件

```js file=remark-code-title.js
import { visit } from "unist-util-visit";

export function remarkCodeTitle() {
  return (tree, { data }) => {
    const nodesToInsert = [];
    visit(tree, "code", (node, index) => {
      const language = node.lang;
      let meta = node.meta;

      if (!language) {
        return
      }

      const className = "remark-code-title";
      let titleNode;

      // 只显示语言
      titleNode = {
        type: "html",
        value: `<div class="${className}">
            <div id="only-lang">${language}</div>
            <div id="separate-line"></div>
          </div>`.trim(),
      };

      if (meta) {
        // 排除掉其他 meta 项
        const metas = meta.split(" ").filter((m) => m.includes("file="));

        if (metas.length > 0) {
          meta = metas[0].replace("file=", "");

          // 显示文件名和语言
          titleNode = {
            type: "html",
            value: `<div class="${className}">
                <div id="filename-with-lang">
                  <div>${meta}</div>
                  <div>${language}</div>
                </div>
                <div id="separate-line">
                </div>
              </div>`.trim(),
          };
        }
      }

      // 保存需要插入的元素
      nodesToInsert.push({ index, titleNode });
    });

    // 插入元素
    for (const { index, titleNode } of nodesToInsert.reverse()) {
      tree.children.splice(index, 0, titleNode);
    }
  };
}
```

2. 导入插件

```js file=astro.config.mjs
import { remarkCodeTitle } from "./src/plugins/remark-code-title.js"; // [!code ++]

export default defineConfig({
  markdown: {
    remarkPlugins: [
      // ...
      remarkCodeTitle, // [!code ++]
    ],
  },
});
```
