---
title: HTTP 缓存
published: 2016-03-08 04:57:46
tags:
  - http
  - 缓存
category: 技术
---

下午意外的接到了阿里钉钉前端的面试，很是欣喜。
面试内容从做的项目，到使用的技术 Angular、React、Express 等，让我感觉到自己的理解还是不够深刻。
比如我说我喜欢 React，大项目中需要配合 Redux 来用处理数据，然后就问到 Redux 到底解决了哪些问题，我没能清楚的答上来。但是整体上，面试的前面部分，自我感觉还是很不错的。
但是到最后，面试官说问一个比较基础的问题：如何在 HTTP 协议中控制缓存？
我懵了，平时工作中根本接触不到。只能凭自己感觉说，从文件名的更改以及在 HTTP 的 header 中设置相应参数来设置，但具体怎样设置，设置的内容是什么，我完全答不上来。感觉肯定是要挂在这里。不过俗话说的好，人不能在同一个地方跌到两次，谨以此篇记录 HTTP 缓存的相应内容。

# 概览

HTTP 控制缓存主要有一下几种方式：

1. Expires
1. Cache-Control
1. Last-Modified/If-Modified-Since
1. Etag/If-None-Match

接下来，就一个一个来了解。

## Expires

过期时间，有点类似于 cookies 里面的 Expires。可以在 header 中设置一个具体的过期时间，在这个过期时间内，浏览器都不会向服务器请求这个文件，会直接存本地的缓存中读取。
![1](/imgs/http-cache/headers.png)
上图是我博客中一个 js 文件的 HTTP header，可以看到其中红框 1 Expires 设置为当前 Date 的 4 个小时后，也就是说正常情况这个文件在 Expires 这个时间点以前的请求都会直接使用本地缓存，而不用从服务端重新获取。
需要注意的是，Expires 是 HTTP 1.0 的东西，现在绝大多数浏览器都默认使用 HTTP 1.1，所以用 Expires 控制缓存不是首选的方法。

## Cache-control

Cache-control 与 Expires 作用基本相同，都是标志出当前资源的有效期，以此来控制浏览器是使用本地缓存还是从服务器重新获取资源。不过，不同的地方在于，Cache-control 能够控制的更加细致，当 header 中同时存在 Expires 时，Cache-control 的优先级要更高一些。

<!-- more -->

> HTTP 协议头 Cache-Control 的值可以是 public、private、no-cache、no- store、no-transform、must-revalidate、proxy-revalidate、max-age
> 各个消息中的指令含义如下：

    Public      指示响应可被任何缓存区缓存。
    Private     指示对于单个用户的整个或部分响应消息，不能被共享缓存处理。这允许服务器仅仅描述当用户的部分响应消息，此响应消息对于其他用户的请求无效。
    no-cache    指示请求或响应消息不能缓存
    no-store    用于防止重要的信息被无意的发布。在请求消息中发送将使得请求和响应消息都不使用缓存。
    **max-age**   **指示客户机可以接收生存期不大于指定时间（以秒为单位）的响应。**
    min-fresh   指示客户机可以接收响应时间小于当前时间加上指定时间的响应。
    max-stale   指示客户机可以接收超出超时期间的响应消息。如果指定max-stale消息的值，那么客户机可以接收超出超时期指定值之内的响应消息。

![2](/imgs/http-cache/headers.png)
如图，红框 2 上面的 Cache-Control 这一栏，值为 public，max-age=14400. 就是说它的有效期是 14400s，也就是 4h，和上面的 Expires 的过期时间是一样的，但是它不像 Expires 那样必须给一个类似 Mon，07 Mar 2016 17:14:33 GMT 这样具体的时间，只需要给定一个最大寿命的时间就可以了。这个应该是比较常用的方法。

## Last-Modified/If-Modified-Since

1. **Last-Modified** 表示这个资源的最后修改时间，服务器在相应请求时，会告诉浏览器此资源的最后修改时间。
2. **If-Modified-Since** 发送 HTTP 请求时，浏览器会把缓存资源的最后修改时间一起发送到服务器去，服务器会用这个时间与服务器上实际文件的最后修改事件进行对比。如果时间一致，则返回 HTTP 状态码 304，浏览器接收到后会直接显示缓存的文件。如果时间不一致，则返回 HTTP 状态码 200 和新的文件内容，浏览器拿到文件后会丢掉本地旧文件，缓存新文件并展示出来。要注意的是 Last-Modified/If-Modified-Since 需要配合 Cache-control 使用，只有当本地的资源过期时（即超过了 max-age 定义的时间），才会向服务器发送相应的带有 If-Modified-Since 的请求。

## Etag/If-None-Match

1. **Etag/If-None-Match** 同样需要配合 Cache-control 使用。
2. **Etag** 服务器相应浏览器请求时，会告诉浏览器当前资源在服务的唯一标识，标识规则有服务器决定。If-None-Match 当资源过期时（即超过了 max-age 定义的时间），发现资源具有 Etag 声明，则在再次向服务器发送求情时带上 If-None-Match（即本地缓存资源的 Etag 值）。服务器收到请求后如果发现有 If-None-Match 则与服务端被请求资源的 Etag 进行比对，如果相同则说明资源无更改并返回 304，否则返回 200 和新的资源。

这四种方式的优先级可以通过一张图来说明：
![3](/imgs/http-cache/priority.png)
[图片来自](HTTP://www.cnblogs.com/skynet/archive/2012/11/28/2792503.html)
可以看到 Etag 的优先级是大于 Last-Modified 的。

参考文章： 1.[浏览器缓存机制](HTTP://www.cnblogs.com/skynet/) 2.[浏览器缓存相关的 HTTP 头介绍:Expires,Cache-Control,Last-Modified,ETag](HTTP://www.path8.net/tn/archives/2745)

3.[HTTP 的请求头标签 If-Modified-Since](HTTP://www.cnblogs.com/zh2000g/archive/2010/03/22/1692002.html)
