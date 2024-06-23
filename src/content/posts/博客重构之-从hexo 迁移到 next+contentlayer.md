---
title: 博客重构之-从hexo 迁移到 next+contentLayer
date: 2023-12-20 17:25:56
tags:
  - blog
  - hexo
  - next.js
category: 技术
---

基于 hexo 的博客用了多年了，有很多主题和插件可以用，用的还是挺舒服的。但是最近打算把它从 hexo 迁移走，原因：

- 对博客的掌控感太弱，想要加一些功能就需要等 hexo 更新或者主题作者更新
- 单纯就是想折腾一下而已（这才是主要原因吧

最终打算迁移到 next.js 的方案，前后端一体，既可以纯静态站点也可以有作为普通的有后端服务的网站，挺符合我的诉求。而且对网站的掌控力也会比用 hexo 高很多，当然代价就是要花费更多的时间。

## 目标

迁移的目标：

- 保持原有博文链接不变
- 迁移评论系统：原本使用的 disqus ，对墙内来说可用性太差了

## 备份

备份：采用[jiacai2050/blog-backup: Backup blogposts to PDF for offline storage, built with Puppeteer and ClojureScript (github.com)](https://github.com/jiacai2050/blog-backup) 备份老的博客为 pdf 文件，留个纪念。

## 方案

技术选型：

- 框架： next.js
- 内容生产： contentlayer.js
- 样式：tailwindcss

### hexo markdown 语法兼容

为了兼容 hexo 中的一些特有语法比如 `<!-- more -->` `{% asset_img me.jpg 搬家 %}` 等类似的私有语法，需要通过 remark 来开发一些插件来进行兼容。

#### `<!-- more -->` 的兼容

对于 `<!-- more -->` 的兼容，一开始写 remark 插件来找到 markdown 文件中的 `<!-- more -->` 来后把前面的部分拆分出来，挂在一个自定义变量上比如叫 brief ，后面渲染的时候从上面读就好了。

后来实现的时候还是碰到了一些问题，拿到的都是没有渲染的 markdown 文件而非渲染好的 html 。由于使用了 contentlayer，从 markdown 转换到 html 的过程是由 contentlayer 控制的，你可以在其中添加插件。但是不知道是插件顺序的问题还是怎么的总是调不对，索性放弃这条路。

直接在 contentlayer 中添加了一个字段，对已经渲染好的 html 文件做截取，把前 500 个字符作为文章的 brief ，虽然自定义性差了点，但是先能跑。具体代码如下：

```js
/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields: import("contentlayer/source-files").ComputedFields = {
  permalink: {
    type: "string",
    resolve: (doc) => {
		...
  },
  brief: {
    type: "string",
    resolve: (doc) => {
      // TODO: 使用 remark 插件来处理文章中 <!-- more --> 注释
      const htmlContent = doc.body.html
      return htmlContent.substring(0, 500)
    },
  },
  readingTime: { type: "json", resolve: (doc) => readingTime(doc?.body?.raw) },
}
```

#### 图片引入语法兼容

hexo 中有很多类似 `{% asset_img me.jpg 搬家 %}` 类似这种语法来引入图片，一开始是尝试通过 remark 插件来把这些东西转换成普通的 markdown 语法，然后走正常的 markdown 转换。但实际操作下来，总是有问题，最终输出的内容还是 `![搬家](me.jpg)` ,并不是期望的 `<img />` 标签。

我理解的是我先把 markdown 中的不标准语法转换成了标准语法，然后再从标准语法走普通的 markdown 渲染到 html，但是不知道是哪里的问题，可能是插件顺序也好，或者我对 remark 的插件原理上理解有问题，导致无论如何也无法渲染成最终的 `<img />` 标签，除非我在插件里面直接把 `{% asset_img me.jpg 搬家 %}` 修改为 `<img alt="搬家" src="/me.jpg" />` ，但是总觉的这样不好，怕会影响到其他 remark 插件的处理。

原本的插件代码：

```js
import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

const targetImgDir = path.join(process.cwd(), 'public/imgs');
const markdownPath = path.join(process.cwd(), 'source/posts');
const isLoggingEnabled = true; // 设置为true以启用日志，为false则禁用日志

function log(message: string) {
  if (isLoggingEnabled) {
    console.log(message);
  }
}

function handleAssetReference(sourceFilePath: string, imgFileName: string): string | null {
  // 获取当前Markdown文件的名称（不包括后缀）
  const filenameWithoutExtension = path.basename(sourceFilePath, path.extname(sourceFilePath));

  // 获取当前Markdown文件的路径
  const mdDir = path.dirname(sourceFilePath);

  // 根据文件名动态构建可能的图片路径
  const possiblePaths = [
    path.join(mdDir, filenameWithoutExtension, imgFileName),
    path.join(mdDir, '../imgs', imgFileName),
  ];
  let sourcePath: string | null = null;

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      sourcePath = possiblePath;
      break;
    }
  }

  if (!sourcePath) {
    log(`Image ${imgFileName} not found for file ${sourceFilePath}`);
    return null;
  }

  // 复制图片到 public/imgs 文件夹下的相应目录
  const targetPath = path.join(targetImgDir, filenameWithoutExtension, imgFileName);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true }); // 确保目录存在
  fs.copyFileSync(sourcePath, targetPath);
  log(`Copied image from ${sourcePath} to ${targetPath}`);

  // 返回新的相对路径
  return `/imgs/${filenameWithoutExtension}/${imgFileName}`;
}

function replaceAssetImgPlugin() {
  return (tree: any, file: any) => {
    visit(tree, 'text', (node: any) => {
      // 处理自定义 asset_img 语法
      const customAssetImgPattern = /\{% asset_img (.*?)\s+(.*?) %\}/g;
      node.value = node.value.replace(customAssetImgPattern, (_, imgFileName, imgAltText) => {
        return `![${imgAltText}](${imgFileName})`;
      });
    });

    // 处理标准的 markdown 图像引用
    visit(tree, 'image', (node: any) => {

      const sourceFilePath = path.join(markdownPath, file.data.rawDocumentData.flattenedPath);
      const imgFileName = path.basename(node.url);
      const newURL = handleAssetReference(sourceFilePath, imgFileName);
      if (newURL) {
        node.url = newURL;

      }
    });
  };
}

export default replaceAssetImgPlugin;

```

里面干了几件事情：

- 找到所有的自定义图片引用语法，并解析出图片名称
- 根据图片名称，从给定的目录中去找具体的图片文件
- 把找到的图片文件复制到 `public/imgs/` 目录下，然后把自定义语法修改为标准的 markdown 图片引用语法，同时把里面的图片应用地址修改为复制后的图片地址，确保 next.js 能够正常访问到这些图片

但这条路没有走通，最后索性一想，何必这么绕圈子。反正已经要从 hexo 迁移走了，它原本的不标准语法已经没有存在的意义了， 那么直接替换就好了。所以写了个脚本，直接把目录下的所有 markdown 文件中的不标准图片引用语法修改为了标准的语法，并替换了应用地址，这样就一劳永逸了。脚本代码如下：

```ts
const fs = require("fs")
const path = require("path")

// 定义目标图片文件夹路径
const targetImgDir = path.join(process.cwd(), "public/imgs")
// 定义 Markdown 文件路径
const markdownPath = path.join(process.cwd(), "source/posts")

function handleAssetReference(sourceFilePath, imgFileName) {
  // 获取当前Markdown文件的名称（不包括后缀）
  const filenameWithoutExtension = path.basename(
    sourceFilePath,
    path.extname(sourceFilePath)
  )
  // 获取当前Markdown文件的路径
  const mdDir = path.dirname(sourceFilePath)
  // 定义可能的图片路径数组
  const possiblePaths = [
    path.join(mdDir, filenameWithoutExtension, imgFileName),
    path.join(mdDir, "../imgs", imgFileName),
  ]
  let sourcePath = null

  // 遍历所有可能的图片路径，找到存在的图片路径
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      sourcePath = possiblePath
      break
    }
  }

  // 如果没有找到图片路径，打印错误信息
  if (!sourcePath) {
    console.log(`Image ${imgFileName} not found for file ${sourceFilePath}`)
    return imgFileName
  }

  // 定义目标图片路径，并创建该路径的文件夹
  const targetPath = path.join(
    targetImgDir,
    filenameWithoutExtension,
    imgFileName
  )
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  // 将源图片复制到目标路径
  fs.copyFileSync(sourcePath, targetPath)
  console.log(`Copied image from ${sourcePath} to ${targetPath}`)

  // 返回新的图片URL
  return `/imgs/${filenameWithoutExtension}/${imgFileName}`
}

function processMarkdownFile(filePath) {
  // 读取Markdown文件内容
  let content = fs.readFileSync(filePath, "utf-8")

  // 定义自定义图片引用的正则表达式
  const customAssetImgPattern = /\{% asset_img (.*?)\s+(.*?) %\}/g
  // 替换Markdown文件中的自定义图片引用
  content = content.replace(
    customAssetImgPattern,
    (_, imgFileName, imgAltText) => {
      const newURL = handleAssetReference(filePath, imgFileName)
      return `![${imgAltText}](${newURL})`
    }
  )

  // 将处理后的内容写回文件
  fs.writeFileSync(filePath, content)
  console.log(`Processed file: ${filePath}`)
}

function processMarkdownFilesInDir(dir) {
  // 读取目录下的所有文件
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    // 如果是Markdown文件，则处理该文件
    if (path.extname(filePath) === ".md") {
      processMarkdownFile(filePath)
    }
  }
}

// 处理指定目录下的所有Markdown文件
processMarkdownFilesInDir(markdownPath)
```

### 内容获取

采用新的解决方案（坑啊，当时我迁移的时候还不知道，刚迁移完才发现已经不维护了）：[Getting Started – Contentlayer](https://contentlayer.dev/docs/getting-started-cddd76b7) , 通过把内容转换成类型安全的 JSON 文件，方便在系统中 import 调用。
特性：

- 验证文件格式：通过提前声明要求的 frontMeta 的字段，来规范字段

```js
// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files"

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/posts/${post._raw.flattenedPath}`,
    },
  },
}))

export default makeSource({ contentDirPath: "posts", documentTypes: [Post] })
```

用起来还挺好用的，相当于把不标准的 markdown 文件通过一个预先定义的 schema 定义好，然后根据这些 schema 生成 ts 类型定义文件，这样就可以直接在你的代码中获得类型安全的文档模型。

最终我的 contentlayer 配置文件如下：

```js
import { writeFileSync } from "fs"
import { defineDocumentType, makeSource } from "contentlayer/source-files"
import readingTime from "reading-time"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import rehypeHighlight from "rehype-highlight"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

const root = process.cwd()
const isProduction = process.env.NODE_ENV === "production"
/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  // const slugger = new GithubSlugger()
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        if (tag in tagCount) {
          tagCount[tag] += 1
        } else {
          tagCount[tag] = 1
        }
      })
    }
  })
  writeFileSync("./app/tag-data.json", JSON.stringify(tagCount))
}

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields: import("contentlayer/source-files").ComputedFields = {
  slug: {
    type: "string",
    // 返回当前文件所在目录的相对路径，比如 posts/2021-01-01-hello-world.md
    resolve: (doc) => `/${doc?._raw?.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => {
      // 返回当前文件所在目录的相对路径去除 posts 后的路径，比如 2021-01-01-hello-world.md
      return doc?._raw?.flattenedPath?.split("/")?.slice(1)?.join("/")
    },
  },
  permalink: {
    type: "string",
    resolve: (doc) => {
      const date = new Date(doc.date)
      const year = date.getFullYear()

      // 确保月份和日期始终有两位数字
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")

      const slugAsParams = doc?._raw?.flattenedPath
        ?.split("/")
        ?.slice(1)
        ?.join("/")

      return `/${year}/${month}/${day}/${slugAsParams}`
    },
  },
  brief: {
    type: "string",
    resolve: (doc) => {
      // TODO: 使用 remark 插件来处理文章中 <!-- more --> 注释
      const htmlContent = doc.body.html
      return htmlContent.substring(0, 500)
    },
  },
  readingTime: { type: "json", resolve: (doc) => readingTime(doc?.body?.raw) },
}

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.md`,
  contentType: "markdown",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    update: {
      type: "date",
      required: false,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      default: [],
    },
    category: {
      type: "string",
      required: true,
      default: "",
    },
    image: {
      type: "string",
      required: false,
    },
    draft: {
      type: "boolean",
      required: false,
    },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: "./source",
  documentTypes: [Post],
  markdown: {
    rehypePlugins: [
	// 各种问题导致只能先把所有插件禁用掉了
      // rehypeSlug,
      // rehypeCodeTitles,
      // @ts-ignore
      // [rehypeHighlight],
      // rehypeHighlight,
      // [rehypePrism, { ignoreMissing: true }],
      // [
      //   rehypeAutolinkHeadings,
      //   {
      //     properties: {
      //       className: ["anchor"],
      //     },
      //   },
      // ],
    ],
    // remarkPlugins: [remarkGfm],
  },
  onSuccess: async (importData) => {
    const { allPosts } = await importData()
    createTagCount(allPosts)
    // createSearchIndex(allPosts)
  },
})
```

配合 next-contentlayer 这个插件，就可以直接 next.js 应用中使用 post 这个我定义好的类型了：

```js
import { Post } from "contentlayer/generated"

export function PostList({
  posts,
  pageSize = 10,
  currentPage = 1,
}: {
  posts: Post[]
  pageSize?: number
  currentPage?: number
}) {
  const currentPageList = getSpecificPagePosts(posts, {
    page: currentPage,
    pageSize,
  })
	……
}
```

## 路由结构

整体路由结构大致是下面这个样子：

```
/[year]/[month]/[day]/[post]

/tag/
/tag/[tag]/
/tag/[tag]/page/[pageNum]

/category/
/category/[category]/
/category/[category]/page/[pageNum]

```

文章的路径采用：`/[year]/[month]/[day]/{blogName}` 这种格式是为了兼容 hexo 下的文章永久链接。

实现思路：
如果以前用 hexo 的永久链接(permalink)的话，那么文章中都会有 `date` 这个 frontMeta 属性。基于这个属性，在 contentLayer 中给所有 post 添加一个 permalink 的属性：

```js
  permalink: {
    type: "string",
    resolve: (doc) => {
      const date = new Date(doc.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const slugAsParams = doc?._raw?.flattenedPath
        ?.split("/")
        ?.slice(1)
        ?.join("/")
      console.log("permalink", `/${year}/${month}/${day}/${slugAsParams}`)
      return `/${year}/${month}/${day}/${slugAsParams}`
    },
  },
```

这个属性返回的路径就和 hexo 以前的 permalink 保持一致了，类似：`2023/01/01/2022-year-end-summary/` 这种格式。

然后在你的 postList 中将所有的 post 跳转地址都指定到这个 permalink 属性上：

```jsx
<CardHeader>
  <CardTitle className="m-0">
    // 使用 permalink 属性
    <Link href={post.permalink} className="no-underline">
      {post.title}
    </Link>
  </CardTitle>
  <CardDescription className="space-x-1 text-xs">
    <span>{format(parseISO(post.date), "MMMM dd, yyyy")}</span>
    <span>{` • `}</span>
    <span>{post.readingTime.text}</span>
    <span>{` • `}</span>
    <span>
      <Link
        href={`/categories/${encodeURIComponent(
          post.categories?.toLowerCase()
        )}`}
        className="underline underline-offset-2"
      >
        {post.categories}
      </Link>
    </span>
  </CardDescription>
</CardHeader>
```

然后创建对应的路由结构：`/[year]/[month]/[day]/[post]` 的文件目录，在 最底层目录新建 `page.jsx` 用来渲染文章。

实现上，在 next.js 中，就需要在 app 目录中，根据这个路由结构建立对应的嵌套目录。非常的麻烦，尤其是下面的 tag 以及 category 相关的 page 最终都是和首页一样的文章列表，但是用了上面这种目录后就需要一遍遍的把基本重复的内容引用来引用去。

为什么翻页要用这种路径的形式而非 url 参数呢，是为了能够生成静态的页面，这样在 build 后可以作为静态博客部署，不需要服务器运行，和 hexo 类似。

## 评论系统

当时备选的有三个：

- giscus: https://github.com/giscus/giscus
- disqusJS： https://github.com/SukkaW/DisqusJS
- twikoo: https://github.com/twikoojs/twikoo

最终还是选择了 giscus ，使用起来比较简单，而且依托 github 的能力，编辑体验很不错。缺点是如果没有 github 账户就无法评论了。

不过评论本身也不是刚需，所以先解决有无的问题。

## 部署

目标：代码推送到仓库的主分支，那么就会触发自动部署功能。

虽然我自己有服务器，但是最终直接选择了部署在 vercel 上了，因为实在是太方便了。我的博客访问量也不高， vercel 免费账户远远够了，等有空了再打通自动化部署到自己服务器的流程吧。

## 总结

说要重构博客说了快一年，然后一直在拖。虽然重构工作量本身并不大，但是要静下心来，还要有大块的时间，最终一直拖到了现在总算勉强完成博客的重构，先给自己个赞吧。

然而有点尴尬的是，我在调代码高亮功能的时候发现 rehype-highlight 插件怎么调都有问题，后来去查 contentlayer 的文档和 issue 发现好家伙，这个仓库已经不维护了。当然原因也能理解，因为有个赞助项目的公司不赞助了。失去了经济来源了，所以暂时搁置维护也是情理之中。只是我这边找不到问题解决方案了，所以后续会下掉 contentlayer 。

不过时间就不得而知了。

# 参考文章

- [使用 Next.js + Hexo 重构我的博客 | Sukka's Blog (skk.moe)](https://blog.skk.moe/post/use-nextjs-and-hexo-to-rebuild-my-blog/)
- [SpectreAlan/blog-nextjs: 基于nextjs搭建的SSR个人博客 (github.com)](https://github.com/SpectreAlan/blog-nextjs)
- [把博客从 GatsbyJS 迁移至 NextJS (kejiweixun.com)](https://kejiweixun.com/blog/migrate-my-blog-from-gatsbyjs-to-nextjs)
- [從 Hexo 到 Gatsby - kpman | code](https://code.kpman.cc/2018/06/08/%E5%BE%9E-Hexo-%E5%88%B0-Gatsby/)
- [使用next.js重构博客 | liyang's blog (liyangzone.com)](https://liyangzone.com/article/2022-05-17-use-nextjs-rebuild-blog/)
- [enjidev/enji.dev: a monorepo for my personal website and projects, built with Turborepo + pnpm 📚 (github.com)](https://github.com/enjidev/enji.dev)
- [github.com/mirsazzathossain/mirsazzathossain.me](https://github.com/mirsazzathossain/mirsazzathossain.me)
- [github.com/js-template/metablog-free](https://github.com/js-template/metablog-free)
- [stevenspads/next-app-router-blog: A Next.js markdown blog template for developers. It uses the new Next.js App Router. (github.com)](https://github.com/stevenspads/next-app-router-blog)
- [shadcn/next-contentlayer: A template with Next.js 13 app dir, Contentlayer, Tailwind CSS and dark mode. (github.com)](https://github.com/shadcn/next-contentlayer)
