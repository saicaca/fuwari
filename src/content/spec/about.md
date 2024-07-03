## 背景

![image](https://img.undf.top/ob/5a6e68e7ea68562b2499934f9f0402f4.png)

博客建立到现在已经近三年了，期间各种写作方式，各种主题，都折腾了不少，简单聊聊，分享一下。详细的操作方式这里就不啰嗦了，相信胆大心细的你肯定能解决。
## 关于主题

主题从最初的 [keep]( https://github.com/XPoet/hexo-theme-keep?tab=readme-ov-file )到有名的 [butterfly](https://github.com/jerryc127/hexo-theme-butterfly) 被我折腾的花里胡哨，再然后折腾的尽头是极简，所以主题换成 [cards](https://github.com/ChrAlpha/hexo-theme-cards) 非常简约，但是时间久了看腻了，就换成了现在的 [stellar](https://github.com/xaoxuu/hexo-theme-stellar) 简约而又不简单。
现在是 [Fuwari](https://github.com/saicaca/fuwari).
## 关于发布流程

说到博客的写作流程，最初当然是最基础的 `hexo g` `hexo d` 发布到 Github 当然非常麻烦，后来学会了通过 Github Action 实现[自动部署](https://juejin.cn/post/6943895271751286821)这之后就方便了一些，开始尝试在线的编辑器，最初用过 [HexoPlusPlus](https://github.com/HexoPlusPlus/HexoPlusPlus) 类似于现在的 [QEXO](https://github.com/Qexo/Qexo) 都是在浏览器编辑文件，然后上传到 github 触发自动部署，但因为编辑器不太好使，而且不太方便，还是用 VScode 最舒服，就这样大概用了一年多。

不过，去年我开始用 Obsidian 记笔记，规划项目等等，所以就想把博客编辑放到这里，通过 [github-publisher](https://github.com/ObsidianPublisher/obsidian-github-publisher) 插件上传到 Github 触发 Action 实现部署
## 关于域名和备案

域名最初当然是 github 生成的[默认域名](https://wxydejoy.github.io) (现在这里是很久之前的 butterfly 主题博客)后来买了 `wxydejoy.top` 并通过阿里云进行备案（备案才能使用国内 CDN）后来觉得域名太长换了 `undf.top`。

备案的话，需要三个月以上的服务器才行，当时是 27 块通过新人优惠在阿里云买了三个月，然后就是填资料等电话等等等等，繁琐但不复杂。不过服务器到期后阿里云会发邮件警告：域名未指向服务（解决方案是建个 OSS 将域名指向它然后开启访问鉴权，通过 github Action 每周访问一次，这样就可以 0 成本实现）
## 关于网站加速与防御

刚开始，博客当然是使用 github page 部署，国内基本无法访问，后来使用 [Vercel](https://vercel.com/) 进行部署，速度也是一般般，类似的还有 [Cloudflare Page](https://pages.cloudflare.com/) 国内访问速度都很感人。

现在，使用的是[又拍云 CDN](https://www.upyun.com) 通过加入 [又拍云联盟](https://www.upyun.com/league) 实现，当然你也可以使用腾讯阿里等等，但是一定要开启各种防护，防止被攻击欠费（前段时间我就被刷了一点点流量，莫名其妙）。

防御第一条：禁止国外 IP 访问 CDN，通过 DNS 将其指向源站（Github），然后就是限制各种访问频率，一般小站访问量也不会太多，每分钟能有几百次差不多了。