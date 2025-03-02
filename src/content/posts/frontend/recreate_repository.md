---
title: 从头开整Fuwari
published: 2025-02-27
updated: 2025-03-01
description: ' '
image: ''
tags: [Fuwari]
category: '前端'
draft: false 
lang: ''
series: 杂谈
---

`Fuwari`最新版更新了目录功能，然而之前改了太多东西，合并起来很麻烦，
而且也找到了增强代码块的[新方案](/posts/frontend/code_block_ex/)，所以直接重开了一个项目。

还增加了文章的`更新时间`
```yml ins={4}
---
title: 从头开整Fuwari
published: 2025-02-27
updated: 2025-03-01
description: ' '
image: ''
tags: [Fuwari]
category: '前端'
draft: false 
lang: ''
---
```

顺便看到两个新功能（还未实装）

post pinning：https://github.com/saicaca/fuwari/pull/317

link-card：https://github.com/saicaca/fuwari/pull/324