---
title: JavaScript 异步编程
date: 2015-07-05 04:16:56
tags:
  - async
  - JavaScript
category: 技术
---

工作中需要实现一个功能，简化一下大概是这么一个逻辑。

    bills.getData = function (monthNow) {

        //DONE Get data of monthNow.
        //url = 通过 monthNow 来决定 url 地址
        var url = "api/data.json";

        //noinspection JSUnusedGlobalSymbols
        $.ajax({
            url: url,
            dataType: "json",
            type: "GET",
            success: function (d) {
                Data = d;
            },
            error: function (d) {
                window.console.log("error");
            }
        });
    	return Data
    };

    data = bills.getData(monthNow);

结果测试的时候发现完全不对。
调试了一下发现，当 `bills.getData` 执行完毕将 Data `return` 出去并且跟着的赋值语句也执行完毕后，才触发了 `ajax` 中 `success` 事件。
这样明显是错误的，分析一下原因：由于 `ajax` 请求是异步的，所以实际的情况是， `bills.getDate()` 里的 `success` 还没有执行完毕， Data 就已经已经 `return` 了。
导致最后的赋值语句其实是错误的，它并没有被赋值为 `ajax` 请求成功结果，这没有达到我们的预期。
所以这里需要对代码结构进行改变，我们需要在确认 `ajax` 请求完毕成功后，再执行赋值语句。
这里有两种方法了达到效果，分别是 `callback` 和 `promise` 。
为了方便，我这里选择了 `callback` 的形式。那么代码就是下面这个样子

    // Data 是全局变量
    bills.getData = function (monthNow, callback) {

        //DONE Get data of monthNow.
        //url = 通过 monthNow 来决定 url 地址
        var url = "api/data.json";

        //noinspection JSUnusedGlobalSymbols
        $.ajax({
            url: url,
            dataType: "json",
            type: "GET",
            success: function (d) {
                Data = d;
                if (typeof callback === 'function') {
                    callback();
                }
            },
            error: function (d) {
                window.console.log("error");
            }
        });
    };
    bills.getData(monthNow,doSomeThing);
    function doSomeThing(){
        //doSomeThing with Data
    }

这样就可以保证 `callback` 中的 `data` 是 `ajax` 请求成功后的结果。
