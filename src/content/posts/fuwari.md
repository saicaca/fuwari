---
title: Fuwari静态博客+Cloudflare Pages，只需一个域名，带你搭建博主同款博客！
published: 2024-10-14
description: 'Fuwari是一个静态博客框架，Cloudflare Pages是一个托管静态网站的服务，将他俩结合即可得到一个快速安全无需托管的高效博客'
image: "https://oss.onani.cn/fuwari-blog/img/2024-10-15-09-04-45-image.webp"
tags: [Fuwari, Cloudflare Pages]
category: '运维'
draft: false 
lang: ''
---

### 你需要准备的东西

1. 一个牛逼的脑子，支持并行运算至少两个单位以上的事件。遇到问题先思考，想不通就搜索，搜索不到就去和AI调情，不要上来就问问问

2. [Git - Downloads (git-scm.com)](https://git-scm.com/downloads)：最牛逼的版本控制器，这里用于对Github进行操作，当然，你也可以尝试使用[GitHub Desktop | Simple collaboration from your desktop](https://github.com/apps/desktop)但就我而言，这玩意更难用

3. [Node.js — Run JavaScript Everywhere (nodejs.org)](https://nodejs.org/en)：Fuwari基于Node.js，你需要安装这个来搭建博客

4. 一个[Github](https://github.com)账号：用于创建一个代码仓库存放Fuwari文件

5. 一个[Cloudflare](https://cloudflare.com)账号：用于创建一个Pages并且绑定域名支持访问

6. [MarkText](https://www.marktext.cc)：这是一个可视化MarkDown编辑器，因为Fuwari的每一篇文章/页面都是MarkDown，所以需要一个好用的编辑器

7. 你得会用MarkDown语法来编写文章，如果你不会可以参见：[Markdown 基本语法 | Markdown 官方教程](https://markdown.com.cn/basic-syntax/)

### 流程图

本地部署Fuwari，编写文章 -> 推送更改到远程Github仓库 -> Cloudflare Pages检测到仓库更新自动构建新的网站静态文件 -> 网站成功更改

### 让我们开搞吧！

#### 首先，我们来本地部署Fuwari

1. Fork仓库：
   
   ::github{repo="saicaca/fuwari"}

2. 避免有小废物不会Fork仓库，这里附上图片教程

3. ![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-12-15-44-image.webp)![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-12-17-03-image.webp)

4. 然后将仓库克隆到本地：`git clone <你的仓库URL>`（推荐使用SSH，可以不用魔法来推送更改）

5. 首先，全局安装pnpm：`npm install -g pnpm`（如果npm国内拉取过慢，请尝试cnpm：[npmmirror 镜像站](https://npmmirror.com/)）

6. 然后在项目根目录安装依赖：`pnpm install`  和 `pnpm add sharp`

7. 至此，你成功在本地部署了Fuwari

> [!TIP]
> 
> 你也可以使用创建一个新的空仓库然后手动上传文件，并且可以将仓库可见性设为：Private

#### 改写Fuwari的基本信息并且清理多余文件

> 刚创建的Fuwari可能带有一些示例的博主名，ICON，URL，介绍和示例文章，为了让用户知道这是你的博客，我们需要一一改写

1. 在根目录下的 `src` 文件夹中，你可以找到 `config.ts` 我们来开始改写
   
   - title：你的博客主标题
   
   - subtitle：你的博客副标题。可选，在首页会显示为“主标题 - 副标题”
   
   - lang：博客显示语言。注释已经列出了一些常用的值，如：en, zh_CN, zh_TW, ja, ko
   
   - themeColor：hue值则是你的博客主题色，可以在你的博客右上角的画板图标确定喜欢的颜色再填写![](https://oss.onani.cn/fuwari-blog/img/2024-10-15-09-16-30-image.webp)
   
   - banner：src：即banner图片，支持http/https URL
   
   - favicon：src：即网站图标，支持http/https URL
   
   - links：即友情链接，这些链接在导航栏上
   
   - avatar：即你的头像
   
   - name：即你的名字
   
   - bio：即个性签名，会显示在头像和名字下面
   
   - `NavBarConfig` 为导航栏设置的超链接。`ProfileConfig` 为你的用户的超链接，分别如图![](https://oss.onani.cn/fuwari-blog/img/2024-10-15-17-49-30-image.webp)
   
   - icon：你需要前往[Font Awesome](https://fontawesome.com/search)去搜索你想要的图标，比如QQ，则填写 `fa6-brands:qq` ，如图。Fuwari支持这几种类型：`fa6-brands`, `fa6-regular`, `fa6-solid`, `material-symbols`![](https://oss.onani.cn/fuwari-blog/img/2024-10-15-17-47-10-image.webp)
   
   - 这里我附上我的 `config.ts` 
   
   - ```ts
     import type {
       LicenseConfig,
       NavBarConfig,
       ProfileConfig,
       SiteConfig,
     } from './types/config'
     import { LinkPreset } from './types/config'
     
     export const siteConfig: SiteConfig = {
       title: '二叉树树的博客',
       subtitle: '爱你所爱！',
       lang: 'zh_CN',         // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
       themeColor: {
         hue: 355,         // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
         fixed: false,     // Hide the theme color picker for visitors
       },
       banner: {
         enable: true,
         src: 'assets/images/222.webp',   // Relative to the /src directory. Relative to the /public directory if it starts with '/'
         position: 'center',      // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
         credit: {
           enable: false,         // Display the credit text of the banner image
           text: '',              // Credit text to be displayed
           url: ''                // (Optional) URL link to the original artwork or artist's page
         }
       },
       favicon: [    // Leave this array empty to use the default favicon
          {
            src: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2973517380&spec=5',    // Path of the favicon, relative to the /public directory
            //theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
            sizes: '128x128',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
          }
       ]
     }
     
     export const navBarConfig: NavBarConfig = {
       links: [
         LinkPreset.Home,
         LinkPreset.Archive,
         LinkPreset.About,
         {
           name: '随机图',
           url: 'https://pic.onani.cn',     // Internal links should not include the base path, as it is automatically added
           external: true,                               // Show an external link icon and will open in a new tab
         },
         {
           name: 'GitHub',
           url: 'https://github.com/saicaca/fuwari',     // Internal links should not include the base path, as it is automatically added
           external: true,                               // Show an external link icon and will open in a new tab
         },
       ],
     }
     
     export const profileConfig: ProfileConfig = {
       avatar: 'assets/images/111.webp',  // Relative to the /src directory. Relative to the /public directory if it starts with '/'
       name: '二叉树树',
       bio: 'Protect What You Love./爱你所爱！',
       links: [
         // {
           // name: 'Twitter',
           // icon: 'fa6-brands:twitter',       // Visit https://icones.js.org/ for icon codes
                                             // You will need to install the corresponding icon set if it's not already included
                                             // `pnpm add @iconify-json/<icon-set-name>`
           // url: 'https://twitter.com',
         // },
         // {
           // name: 'Steam',
           // icon: 'fa6-brands:steam',
           // url: 'https://store.steampowered.com',
         // },
         {
           name: 'GitHub',
           icon: 'fa6-brands:github',
           url: 'https://github.com/afoim',
         },
         {
           name: 'QQ',
           icon: 'fa6-brands:qq',
           url: 'https://qm.qq.com/q/Uy9kmDXHYO',
         },
         {
           name: 'QQ',
           icon: 'fa6-solid:envelope',
           url: 'mailto:acofork@foxmail.com',
         },
       ],
     }
     
     export const licenseConfig: LicenseConfig = {
       enable: true,
       name: 'CC BY-NC-SA 4.0',
       url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
     }
     ```

2. 清理多余文件。在根目录下的 `src/content/posts` 文件夹中会有一些示例文章，这些文章介绍了一些MarkDown语法和技巧，可以让你更快上手Fuwari和fuwari，我们可以将其保存到别处

3. 至此，你已经可以开始撰写文章了

#### 让我们开始写作！

1. 首先，在项目根目录执行：`pnpm new-post <这里填写你的文章标题>`

2. 然后，在根目录下的 `src/content/posts` 文件夹中会多出一个 `xxx.md`文件

3. 我们使用MarkText打开这个文件，你可以看到一些基本信息，我们只需要关注几个重要的信息

4. ```markdown
   title: xxx
   published: 2024-10-14
   description: ''
   image: ''
   tags: []
   category: ''
   draft: false 
   lang: ''
   ```
   
   - title：文章标题
   
   - published：文章创建时间
   
   - description：文章描述，正常会显示在文章标题下面
   
   - image：文章封面图（同目录需要写 `./` 如：`./assets/images/2024-10-14-11-33-28-image.webp`）
   
   - tag：文章标签
   
   - category：文章分类

5. 我们还需要更改根目录下的 `astro.config.mjs` 。在第34行更改 `stie:` 为你的站点URL，如： `site: "https://onani.cn",`

6. 欸？有的人就会问了，MarkDown固然好，但是我要如何处理图片的置入呢

7. 这也很简单，多亏了MarkText这款软件，我们也可以像编辑Typecho一样直接使用Ctrl+CV来在MarkDown语法中置入图片，但是我们需要一些小设置：
   
   - 依次点击：MarkText软件的左上角的三条杠 -> File -> Perferences -> 左侧的Image分类 -> 如图设置 -> 注意更改第一个选项为Copy开头的选项，将Perfer开关打开，然后上下两个文本框一个填写绝对路径一个填写相对路径
   
   - ![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-12-54-21-image.webp)
   
   - 这样，当置入图片时，会往 `assets/images` 文件夹复制一份，然后通过`![1](assets/images/1.webp)`写入MarkDown文件。这样网站就能成功读取到图片啦。而你只需要Ctrl+CV，其他操作MarkText都会自动处理

8. 至此，你已经会用MarkText编写MarkDown语法的博文了

#### 本地预览，然后发布到Github

1. 当你认为你的文章已经写得差不多时，想要看看效果？请到项目根目录执行：`pnpm dev`，稍等片刻，你就可以本地预览你的博客啦![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-13-03-44-image.webp)

2. 好！接下来我们需要使用Git将我们所做的更改发布到Github
   
   - 首先，你需要让Git知道你是谁：`git config --global user.name "你的Github用户名"`和`git config --global user.email "你的Github邮箱@example.com"`
   
   - 然后，更改远程仓库为ssh*（如果是通过ssh克隆的不用改）：`git remote set-url origin git@github.com:xxx/xxx`
   
   - 随后，让我们提交所有文件：`git add .`
   
   - 之后，让我们发布一个本地提交：`git commit -m "项目初始化"`
   
   - 最后，让我们将本地更改提交到远程仓库：`git push`

3. 此时，你的Github仓库应该已经有了新的提交![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-13-10-12-image.webp)

#### 让Cloudflare连接上Github，使用Pages服务展示你的博客（FREE！）

1. 前往Cloudflare的 Workers 和 Pages 页面，创建一个新Pages![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-13-14-28-image.webp)

2. 然后选择连接Git存储库，连接你的Github，随后设置构建命令：`pnpm build`  ，然后设置构建输出目录：`dist` ，如图![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-13-16-15-image.webp)

3. 绑定自定义域，访问自定义域即可访问你的博客！![](https://oss.onani.cn/fuwari-blog/img/2024-10-14-13-17-00-image.webp)

4. 随后，你只需要在本地编写文章，然后[使用Git将更改推送到远程仓库](#本地预览然后发布到github)，Cloudflare就会自动部署，更新你的博客！
