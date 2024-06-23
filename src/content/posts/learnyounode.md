---
title: learnyounode
tags:
  - node
  - JavaScript
date: 2015-06-11 22:41:30
category: 技术
---

Learn You The Node.js For Much Win!
![learnyounode](/imgs/learnyounode.png)
花了几天业余时间做完这个 `Node.js` 入门的题目，梳理一下知识点。

<!-- more -->

## HELLO WORLD

> 编写一个程序，在终端（标准输出 stdout）打印出 "HELLO WORLD"。

学习一门语言的最好方法就是先写一个 Hello Wolrd 程序。这道题很简单，每个人都会。

    console.log("HELLO WORLD")

## BABY STEPS

> 编写一个简单的程序，使其能接收一个或者多个命令行参数，并且在终端（标准输出 stdout）中打印出这些参数的总和。

接受的参数可以通过 `process.argv` 来访问，它是一个数组。前两位是固定的，第一位是 `node` ，第二位是文件的路径，后面就是程序输入的内容的了。

> 首先，请先编写一个包含如下带简易代码的程序来熟悉一下：

>     console.log(process.argv)

> 通过执行命令 node program.js 并在后面多加几个参数，来运行我们的程序，比如：

>     $ node program.js 1 2 3

> 这样，你就会得到这样一个数组：

>     [ 'node', '/path/to/your/program.js', '1', '2', '3' ]

那么有了这些知识后，程序写起来也就很简单了。

    var result = 0;
    process.argv.forEach(function(el,index){
    	if (index>1) {
    		result += +el;
    	}
    });
    console.log(result);

## MY FIRST I/O!

> 编写一个程序，执行一个同步的文件系统操作，读取一个文件，并且在终端（标准输出 std
> out）打印出这个文件中的内容的行数。类似于执行 cat file | wc -l 这个命令。

> 所要读取的文件的完整路径会在命令行第一个参数提供。

首先要对一个文件进行操作，需要用到 `fs` 这个模块，我们可以用 `var fs = require('fs');` 来引入。然后可以通过 `fs` 这个变量来访问整个 `fs` 模块了。

> 在 fs 中，所有的同步（或者阻塞）的操作文件系统的方法名都会以 'Sync' 结尾。要读取
> 一个文件，你将需要使用 fs.readFileSync('/path/to/file') 方法。这个方法会返回一
> 个包含文件完整内容的 Buffer 对象。
> Buffer 对象是 Node 用来高效处理数据的方式，无论该数据是 ascii 还是二进制文件，或
> 者其他的格式。Buffer 可以很容易地通过调用 toString() 方法转换为字符串。如：var s
> tr = buf.toString()。

这样我们要做的就是先引入 `fs` 模块，然后读取输入的数据。我们的目的是计算行数，可以知道，每行末尾其实都是有一个 `\n` 的，我们只要计算 `\n` 的个数就可以了。

    var fs = require('fs');
    var data = fs.readFileSync(process.argv[2]);
    var str = data.toString();
    var array = str.split('\n');
    console.log(array.length-1);

## MY FIRST ASYNC I/O!

> 编写一个程序，执行一个异步的对文件系统的操作：读取一个文件，并且在终端（标准输出
> stdout）打印出这个文件中的内容的行数。类似于执行 cat file | wc -l 这个命令。

> 所要读取的文件的完整路径会在命令行第一个参数提供。

这道题上一道几乎一样，只是变成了异步的读取。这是就需要用到 `fs.readFile()` ，而不是 `fs.readFileSync()` 。

> 记住，我们习惯中的 Node.js 回调函数都有像如下所示的特征：

> function callback (err, data) { /_ ... _/ }

> 所以，你可以通过检查第一个参数的真假值来判断是否有错误发生。如果没有错误发生，你
> 会在第二个参数中获取到一个 Buffer 对象。和 readFileSync() 一样，你可以传入 'utf8
> ' 作为它的第二个参数，然后把回调函数作为第三个参数，这样，你得到的将会是一个字符
> 串，而不是 Buffer。

    var fs = require('fs');
    var data = fs.readFile(process.argv[2],function(err,data){
        if(err){
            throw console.error(err);
        }
        var list = data.toString().split('\n');
        console.log(list.length-1);
    });

## FILTERED LS

> 编写一个程序来打印出指定目录下的文件列表，并且以特定的文件名扩展名来过滤这个列表
> 。这次会有两个参数提供给你，第一个是所给的文件目录路径（如：path/to/dir），第二
> 个参数则是需要过滤出来的文件的扩展名。

> 举个例子：如果第二个参数是 txt，那么你需要过滤出那些扩展名为 .txt 的文件。

> 注意，第二个参数将不会带有开头的 .。

> 你需要在终端中打印出这个被过滤出来的列表，每一行一个文件。另外，你必须使用异步的
> I/O 操作。

这个也很简单，把文件名通过 `.` 来分成两个部分，后面的就是后戳名了。

    var fs = require('fs');
    var path = process.argv[2];
    var extname = process.argv[3];

    fs.readdir(path,function(err,list){
        if(err){
            throw err;
        }else{
            list.forEach(function(file){
                if(file.split('.')[1] === extname){
                    console.log(file);
                }
            });
        }
    });

## MAKE IT MODULAR

> 这个问题和前面一个一样，但是这次会介绍模块的概念。你将需要创建两个文件来解决这个
> 问题。

> 编写一个程序来打印出所给文件目录的所含文件的列表，并且以特定的文件名后缀来过滤这
> 个列表。这次将会提供两个参数，第一个参数是要列举的目录，第二个参数是要过滤的文件
> 扩展名。你需要在终端中打印出过滤出来的文件列表（一个文件一行）。此外，你必须使用
> 异步 I/O。

> 你得编写一个模块 文件去做大部分的事情。这个模块必须导出（export）一个函数，这个
> 函数将接收三个参数：目录名、文件扩展名、回调函数，并按此顺序传递。文件扩展名必须
> 和传递给你的程序的扩展名字符串一模一样。也就是说，请不要把它转成正则表达式或者加
> 上 "." 前缀或者做其他的处理，而是直接传到你的模块中去，在模块中，你可以做一些处
> 理来使你的过滤器能正常工作。

> 这个回调函数必须以 Node 编程中惯用的约定形式（err, data）去调用。这个约定指明了
> ，除非发生了错误，否则所传进去给回调函数的第一个参数将会是 null，第二个参数才会
> 是你的数据。在本题中，这个数据将会是你过滤出来的文件列表，并且是以数组的形式。如
> 果你接收到了一个错误，如：来自 fs.readdir() 的错误，则必须将这个错误作为第一个，
> 也是唯一的参数传递给回调函数，并执行回调函数。

> 你绝对不能直接在你的模块文件中把结果打印到终端中，你只能在你的原始程序文件中编写
> 打印结果的代码。

> 当你的程序接收到一些错误的时候，请简单的捕获它们，并且在终端中打印出相关的信息

> 这里有四则规定，你的模块必须遵守：

> - 导出一个函数，这个函数能准确接收上述的参数。
> - 当有错误发生，或者有数据的时候，准确调用回调函数。
> - 不要改变其他的任何东西，比如全局变量或者 stdout。
> - 处理所有可能发生的错误，并把它们传递给回调函数。

> 遵循一些约定的好处是，你的模块可以被任何其他也遵守这些约定的人所使用。因此，这里
> 你新建的模块可以被其他 learnyounode 的学习者使用，或者拿去验证，都会工作得很好。

首先是我们的模块文件，可以从上一题改造过来,并命名为 'program-6-require.js' 。它要做的事情就是返回一个过滤后的文件名的数组。

    var fs = require('fs');
    module.exports = function(path, extname, callback) {
        fs.readdir(path, function(err, list) {
            if (err) {
                return callback(err, null);
            } else {
                list = list.filter(function(file) {
                    return file.split('.')[1] === extname;
                });
            }
            callback(null, list);
        });
    };

然后在程序文件中调用这个模块，将模块中返回数组的内容打印出来就可以了。

    var mymodule = require('./program-6-require');
    var path = process.argv[2];
    var extname = process.argv[3];

    mymodule(path,extname,function(err,files){
        if(err){
            return console.log(err);
        }
        files.forEach(function(file){
            console.log(file);
        });
    });

## HTTP CLIENT

> 编写一个程序来发起一个 HTTP GET 请求，所请求的 URL 为命令行参数的第一个。然后将 每一个 "data" 事件所得的数据，以字符串形式在终端（标准输出 stdout）的新的一行打印出来。

> 完成这个练习，你需要使用 Node.js 核心模块之一：http。

> http.get() 方法是用来发起简单的 GET 请求的快捷方式，使用这个方法可以一定程度简化 你的程序。http.get() 的第一个参数是你想要 GET 的 URL，第二个参数则是回调函数。

> 与其他的回调函数不同，这个回调函数有如下这些特征：

> function callback (response) { /_ ... _/ }

> response 对象是一个 Node 的 Stream 类型的对象，你可以将 Node Stream 当做一个会触 发一些事件的对象，其中我们通常所需要关心的事件有三个： "data"，"error" 以及 "end "。你可以像这样来监听一个事件：

> response.on("data", function (data) { /_ ... _/ })

> 'data' 事件会在每个数据块到达并已经可以对其进行一些处理的时候被触发。数据块的大 小将取决于数据源。

> 你从 http.get() 所获得的 response 对象/Stream 还有一个 setEncoding() 的方法。如 果你调用这个方法，并为其指定参数为 utf8，那么 data 事件中会传递字符串，而不是标 准的 Node Buffer 对象，这样，你也不用再手动将 Buffer 对象转换成字符串了。

有了上面那些提示，实现起来还是很容易的。

    var http = require('http');

    http.get(process.argv[2],function(response){
        response.setEncoding('utf8');
        response.on("data",function(data){
            console.log(data);
        });
        response.on("error",function(err){
            throw err;
        });
        response.on("end",function(){
            // console.log(date);
        });
    });

## HTTP COLLECT

> 编写一个程序，发起一个 HTTP GET 请求，请求的 URL 为所提供给你的命令行参数的第一
> 个。收集所有服务器所返回的数据（不仅仅包括 "data" 事件）然后在终端（标准输出 std
> out）用两行打印出来。

> 你所打印的内容，第一行应该是一个整数，用来表示你所收到的字符串内容长度，第二行则
> 是服务器返回给你的完整的字符串结果。

我们要做的就是先把所有的数据都收集起来，然后在请求结束后把他们凭借起来就可以了。

    var http = require('http');
    var url = process.argv[2];

    http.get(url,function(response){
        var list = [];
        // response.setEncoding('utf8');
        response.on("data",function(data){
            list.push(data.toString());
        });
        response.on("error",function(err){
            throw err;
        });
        response.on("end",function(){
            var str = '';
            list.forEach(function(s){
                str += s;
            });
            console.log(str.length);
            console.log(str);
        });
    });

## JUGGLING ASYNC

> 这次的问题和之前的问题（HTTP 收集器）很像，也是需要使用到 http.get() 方法。然而
> ，这一次，将有三个 URL 作为前三个命令行参数提供给你。

> 你需要收集每一个 URL 所返回的完整内容，然后将它们在终端（标准输出 stdout）打印出
> 来。这次你不需要打印出这些内容的长度，仅仅是内容本身即可（字符串形式）；每个 URL
> 对应的内容为一行。重点是你必须按照这些 URL 在参数列表中的顺序将相应的内容排列打
> 印出来才算完成。

这里有几个问题：

    1 要收集每个 url 返回的完整内容
    2 判断是否所有请求完成
    3 按 url 顺序打印出所获得内容

### 第一个问题

这个很简单，和前面的题一样。

### 第二个问题

要判断所有请求是否都完成了，我们需要一个列表来存放发的状态，如果它的请求完成了，就给他标注出来。

### 第三个问题

要按照 url 的顺序打印出内容，那么我们在保存数据的时候就要记录下它的 index ，最后按照这个 index 打印就可以了。

    var http = require('http');
    var urls = process.argv.slice(2,process.argv.length);
    var datas = [];
    var end = [];
    var is = false;
    urls.forEach(function(url,index){
        http.get(url,function(response){
            var list = [];
            response.setEncoding('utf8');
            response.on("data",function(data){
                list.push(data);
            });
            response.on("error",function(err){
                throw err;
            });
            response.on("end",function(){
                var str = '';
                list.forEach(function(s){
                    str += s;
                });
                datas[index] = str;
                end.push(true);
                if (isEnd()) {
                    for (var i = 0; i < datas.length; i++) {
                        console.log(datas[i]);
                    }
                }
            });
        });

    });
    function isEnd(){
        if (end.length === urls.length) {
            end.forEach(function(blo){
                if(blo){
                    is = true;
                }else{
                    is = false;
                }
            });
        }
        return is;
    }

这道题，我的方法略显繁琐。下面附上官方答案，以并参考。

    var http = require('http')
    var bl = require('bl')
    var results = []
    var count = 0

    function printResults () {
      for (var i = 0; i < 3; i++)
        console.log(results[i])
    }

    function httpGet (index) {
      http.get(process.argv[2 + index], function (response) {
        response.pipe(bl(function (err, data) {
          if (err)
            return console.error(err)

          results[index] = data.toString()
          count++

          if (count == 3)
            printResults()
        }))
      })
    }

    for (var i = 0; i < 3; i++)
      httpGet(i)

## TIME SERVER

> 编写一个 TCP 时间服务器

> 你的服务器应当监听一个端口，以获取一些 TCP 连接，这个端口会经由第一个命令行参数
> 传递给你的程序。针对每一个 TCP 连接，你都必须写入当前的日期和 24 小时制的时间，如
> 下格式：

> "YYYY-MM-DD hh:mm"

> 然后紧接着是一个换行符。

> 月份、日、小时和分钟必须用零填充成为固定的两位数：

> "2013-07-06 17:42"

官方的提示：

> 这次练习中，我们将会创建一个 TCP 服务器。这里将不会涉及到任何 HTTP 的事情，因此
> 我们只需使用 net 这个 Node 核心模块就可以了。它包含了所有的基础网络功能。

> net 模块拥有一个名叫 net.createServer() 的方法，它会接收一个回调函数。和 Node 中
> 其他的回调函数不同，createServer() 所用的回调函数将会被调用多次。你的服务器每收
> 到一个 TCP 连接，都会调用一次这个回调函数。这个回调函数有如下特征：

> function callback (socket) { /_ ... _/ }

> net.createServer() 也会返回一个 TCP 服务器的实例，你必须调用 server.listen(portN
> umber) 来让你的服务器开始监听一个特定的端口。

> 一个典型的 Node TCP 服务器将会如下所示：

> var net = require('net')
> var server = net.createServer(function (socket) {
> // socket 处理逻辑
> })
> server.listen(8000)

> 记住，请一定监听由第一个命令行参数指定的端口。

> socket 对象包含了很多关于各个连接的信息（meta-data），但是它也同时是一个 Node 双
> 工流（duplex Stream），所以，它即可以读，也可以写。对这个练习来说，我们只需要对
> socket 写数据和关闭它就可以了。

> 使用 socket.write(data) 可以写数据到 socket 中，用 socket.end() 可以关闭一个 s
> ocket。另外， .end() 方法也可以接收一个数据对象作为参数，因此，你可简单地使用 so
> cket.end(data) 来完成写数据和关闭两个操作。

有了官方提示，一切都很简单了。

    var net = require('net');

    var port = process.argv[2];
    var getTime = function(){
        var date = new Date(),
            year = date.getFullYear(),
            month = formate(date.getMonth()+1),
            day = formate(date.getDate()),
            hour = formate(date.getHours()),
            minute = formate(date.getMinutes());
        var time = year + "-"+month+"-"+day+" "+hour+":"+minute;
        function formate(time){
            return (time.toString().length>1?'':'0')+time;
        }
        return time;
    };

    var server = net.createServer(function(socket){
        socket.write(getTime()+'\n');
        socket.end();
    });
    server.listen(port);

## HTTP FILE SERVER

> 编写一个 HTTP 文件 服务器，它用于将每次所请求的文件返回给客户端。

> 你的服务器需要监听所提供给你的第一个命令行参数所制定的端口。

> 同时，第二个会提供给你的程序的参数则是所需要响应的文本文件的位置。在这一题中，你
> 必须使用 fs.createReadStream() 方法以 stream 的形式作出请求相应。

这里需要用到 `http` 的 `http.createServer()` 方法，和前面的 `net` 类似，不同的是它使用 HTTP 协议进行通讯。还有下面这个`fs`的方法。

> fs 这个核心模块也含有一些用来处理文件的流式（stream） API。你可以使用 fs.createR
> eadStream() 方法来为命令行参数指定的文件创建一个 stream。这个方法会返回一个 stre
> am 对象，该对象可以使用类似 src.pipe(dst) 的语法把数据从 src 流传输(pipe) 到 dst
> 流中。通过这种形式，你可以轻松地把一个文件系统的 stream 和一个 HTTP 响应的 strea
> m 连接起来。

    var fs = require('fs'),
        http = require('http');

    var port = process.argv[2],
        path = process.argv[3];

    var fileStream = fs.createReadStream(path);

    var server = http.createServer(function(req,res){
        res.writeHead(200,{'content-type':'text/plain'});
        fileStream.pipe(res);
    });

    server.listen(port);

## HTTP UPPERCASERER

> 编写一个 HTTP 服务器，它只接受 POST 形式的请求，并且将 POST 请求主体（body）所带
> 的字符转换成大写形式，然后返回给客户端。

> 你的服务器需要监听由第一个命令行参数所指定的端口。

这里只要知道 `toUpperCase()` 这个方法就可以了。

    var http = require('http');
    var port = process.argv[2];

    var server = http.createServer(function(req,res){
        var post = '';

        // console.log(req.method);
        if (req.method !== "POST") {
            return res.end("The method must be POST");
        }
        res.writeHead(200,{'content-type':'text/plain'});

        req.on('data',function(data){
            post += data;
        });

        req.on('end',function(){
            res.end(post.toString().toUpperCase());
        });

    });

    server.listen(port);

## HTTP JSON API SERVER

> 编写一个 HTTP 服务器，每当接收到一个路径为 '/api/parsetime' 的 GET 请求的时候，
> 响应一些 JSON 数据。我们期望请求会包含一个查询参数（query string），key 是 "iso"
> ，值是 ISO 格式的时间。

> 如:

> /api/parsetime?iso=2013-08-10T12:10:15.474Z

> 所响应的 JSON 应该只包含三个属性：'hour'，'minute' 和 'second'。例如：

> {

      	"hour": 14,
      	"minute": 23,
      	"second": 15
    }

> 然后增再加一个接口，路径为 '/api/unixtime'，它可以接收相同的查询参数（query stri
> ng），但是它的返回会包含一个属性：'unixtime'，相应值是一个 UNIX 时间戳。例如:

> { "unixtime": 1376136615474 }

> 你的服务器需要监听第一个命令行参数所指定的端口。

首先我们要有俩个方法来分别将时间转换为相应格式的 `JSON` 文件。然后我们需要用到 `url` 这个模块，可以用它来解析请求。

    var http = require('http'),
        url = require('url');

    var port = process.argv[2];

    var parseTime = function(time){
        return{
            "hour": time.getHours(),
            "minute": time.getMinutes(),
            "second": time.getSeconds()
        };
    };
    var getUnixTime = function(time){
        return{
            "unixtime": time.getTime()
        };
    };

    var server = http.createServer(function(req,res){
        // console.log(url.parse(req.url,true));
        var queryString = url.parse(req.url,true).query,
            time = new Date(queryString.iso),
            pathname = url.parse(req.url,true).pathname,
            result;
        if (req.method != "GET") {
            res.end('Method must be GET');
        }
        if (pathname === '/api/parsetime') {
            result  = parseTime(time);
        }else if(pathname ===  '/api/unixtime'){
            result = getUnixTime(time);
        }

        if (result) {
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(result));
        }else{
            res.writeHead(404);
            res.end('404,not found');
        }
    });

    server.listen(Number(port));

# 最后

因为我也是第一次接触，所以对代码有问题的。欢迎与我讨论，互相学习。

以上所有的代码都整合放在[这里了](https://github.com/kisnows/learnyounode-solutions);
