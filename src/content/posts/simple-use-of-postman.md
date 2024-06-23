---
title: Postman 的简单使用
date: 2016-02-27 05:51:47
tags:
  - Postman
  - 调试工具
category: 技术
---

Postman 是一款用来测试 WEB 接口的工具，可以简单的发送 GET 、POST、PUT、DELETE 等请求，可以在 chrome 商店里面搜索安装。
为了介绍它的功能，首先本地起一个服务器：

```js
var http = require("http")
var url = require("url")
var querystring = require("querystring")

http
  .createServer(function (req, res) {
    res.writeHead(200, { "content-type": "text/json" })
    if (req.method === "GET") {
      var params = url.parse(req.url, true).query
      res.write(params.name + " is " + params.age + " years old")
      res.on("error", function (err) {
        throw new Error(err)
      })
      res.end()
    } else {
      var resDate = []
      req
        .on("data", function (chunk) {
          resDate.push(chunk)
        })
        .on("end", function () {
          var params = querystring.parse(resDate.join(""))
          res.write(JSON.stringify(params))
          res.end()
        })
        .on("error", function (e) {
          throw new Error(e)
        })
    }
  })
  .listen(8088)
console.log("Server listen at localhost:8088")
```

用来监听 POST 和 GET 请求，并返回相应的数据。
接下来打开 Postman ，界面很简洁，所有的功能都在图上标注了出来
![postman](/imgs/simple-use-of-postman.png)
上图是模拟 post 请求，填好要发送的参数，点击 send ，就可以看到返回了正确的结果

```js
{
  "name": "moqiao",
  "age": "23"
}
```

GET 请求同理。
