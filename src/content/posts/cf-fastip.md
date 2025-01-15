---
title: 试试Cloudflare IP优选！让Cloudflare在国内再也不是减速器！
published: 2024-10-14
description: '使用SaaS双域名来让你的网站解析的IP进行分流优选，提高网站可用性和速度'
image: "https://oss.onani.cn/fuwari-blog/img/QmePpCr1YsDEBjm5f4TWc5FiEJtQp9ppzHqAuMTvvzEmyz.webp"
tags: [Cloudflare SaaS]
category: '运维'
draft: false 
lang: ''
---

#### 未优选

![QmZoinxZgAzu7Skh7BqsxmDQGU1sXtLLskJcyQuRAQNKww.webp](https://oss.onani.cn/fuwari-blog/img/098f9ee71ae62603022e542878673e19bdcaf196.webp)

#### 已优选

![QmaNVwAwSRvqdL5SrvWVCGCQqmacP3d62yoLxofGscNoKq.webp](https://oss.onani.cn/fuwari-blog/img/e98ce10d846475aaec5cf73546d9b5caffefc4c0.webp)

---

结论：可见，优选过的网站响应速度有很大提升，并且出口IP也变多了。这能让你的网站可用性大大提高，并且加载速度显著变快。
**优选节点使用：[cloudflare.182682.xyz](https://cloudflare.182682.xyz)**

# 针对于A、AAAA、CNAME

> 我们需要**两个域名**（比如：onani.cn和acofork.cn）

这里我们让onani.cn成为主力域名，让acofork.cn成为辅助域名

---

1. 首先新建一个DNS解析，指向你的**源站**，**开启cf代理**
   ![QmfBKgDe77SpkUpjGdmsxqwU2UabvrDAw4c3bgFiWkZCna.webp](https://oss.onani.cn/fuwari-blog/img/c94c34ee262fb51fb5697226ae0df2d804bf76fe.webp)

2. 前往 SSL/TLS -> 自定义主机名。设置回退源为你刚才的DNS解析的域名（xlog.acofork.cn），添加自定义主机名为你最终想让用户访问的域名（onani.cn）并且按照指示在主力域名（onani.cn）添加TXT所有权验证和TXT证书验证，直到证书状态和主机名状态都变为有效
   ![QmRYrwjeDMDQCj8G9RYkpjC3X4vpwE77wpNpbqKURwBber.webp](https://oss.onani.cn/fuwari-blog/img/f6170f009c43f7c6bee4c2d29e2db7498fa1d0dc.webp)

3. 继续在你的辅助域名添加一条解析。CNAME到优选节点：cloudflare.182682.xyz，**不开启cf代理**
   ![QmNwkMqDEkCGMu5jsgE6fj6qpupiqMrqqQtWeAmAJNJbC4.webp](https://oss.onani.cn/fuwari-blog/img/4f9f727b0490e0b33d360a2363c1026003060b29.webp)

4. 最后在你的主力域名添加解析。域名为之前在辅助域名的自定义主机名（onani.cn），目标为刚才的cdn.acofork.cn，**不开启cf代理**
   ![QmeK3AZghae4J4LcJdbPMxBcmoNEeF3hXNBmtJaDki8HYt.webp](https://oss.onani.cn/fuwari-blog/img/6f51cb2a42140a9bf364f88a5715291be616a254.webp)

5. 优选完毕，尝试访问

6. （可选）你也可以将cdn子域的NS服务器更改为阿里云\华为云\腾讯云云解析做线路分流解析
   
   > 优选工作流：用户访问 -> 由于最终访问的域名设置了CNAME解析，所以实际上访问了cdn.acofork.cn，并且携带 **源主机名：onani.cn** -> 到达cloudflare.182682.xyz进行优选 -> 优选结束，cf边缘节点识别到了携带的 **源主机名：onani.cn** 查询发现了回退源 -> 回退到回退源内容（xlog.acofork.cn） -> 访问成功

# 针对于Cloudflare Page

1. 你可以直接将你绑定到Page的子域名直接更改NS服务器到阿里云\华为云\腾讯云云解析做线路分流解析

# 针对于Cloudflare Workers

1. 在Workers中添加路由，然后直接将你的路由域名从指向`xxx.worker.dev`改为`cloudflare.182682.xyz`等优选域名即可

---

### 疑难解答

1. Q：如果我的源站使用Cloudflare Tunnels
   A：需要在Tunnels添加两个规则，一个指向你的辅助域名，一个指向最终访问的域名。然后删除最终访问域名的DNS解析（**但是不要直接在Tunnels删，会掉白名单，导致用户访问404**）。然后跳过第一步
   
   > 原理：假设你已经配置完毕，但是Cloudflare Tunnels只设置了一个规则。
   > 分类讨论，假如你设置的规则仅指向辅助域名，那么在优选的工作流中：用户访问 -> 由于最终访问的域名设置了CNAME解析，所以实际上访问了cdn.acofork.cn，并且携带 **源主机名：onani.cn** -> 到达cloudflare.182682.xyz进行优选 -> 优选结束，cf边缘节点识别到了携带的 **源主机名：onani.cn** 查询发现了回退源 -> 回退源检测 **源主机名：onani.cn**不在白名单 -> 报错 404 Not Found。访问失败
   > 分类讨论，假如你设置的规则仅指向最终访问的域名，那么在优选的工作流中：用户访问 -> 由于最终访问的域名设置了CNAME解析，所以实际上访问了cdn.acofork.cn -> 由于cdn.acofork.cn不在Tunnels白名单，则访问失败

---

3. Q：如果我的源站使用了Cloudflare Origin Rule（端口回源）
   A：需要将规则的生效主机名改为最终访问的域名，否则不触发回源策略（会导致辅助域名无法访问，建议使用Cloudflare Tunnels）
   
   > 原理：假设你已经配置完毕，但是Cloudflare Origin Rule（端口回源）规则的生效主机名为辅助域名
   > 那么在优选的工作流中：用户访问 -> 由于最终访问的域名设置了CNAME解析，所以实际上访问了cdn.acofork.cn，并且携带 **源主机名：onani.cn** -> 到达cloudflare.182682.xyz进行优选 -> 优选结束，cf边缘节点识别到了携带的 **源主机名：onani.cn** 查询发现了回退源 -> 回退到回退源内容（xlog.acofork.cn）-> 但是由于**源主机名：onani.cn**不在Cloudflare Origin Rule（端口回源）的规则中 -> 无法触发回源策略，访问失败

4. Q：如果我的源站使用serv00
   A：需要在WWW Web Site界面添加两个规则，一个指向你的辅助域名，一个指向最终访问的域名。
   
   > 原理：假设你已经配置完毕，但是serv00仅配置其中一个域名
   > 那么在优选的工作流中：会导致访问错误，serv00将会拦截不在白名单的域名请求
