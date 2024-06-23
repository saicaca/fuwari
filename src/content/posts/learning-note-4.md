---
title: 前端开发学习笔记四
published: 2014-12-31 00:09:34
tags:
  - 学习笔记
  - JavaScript
category: 技术
---

固定导航栏根据页面滚动条距离来自动定位的效果，其中心思想就是通过判定当前滚动条的值与页面中相应内容值大小的关系来选择。js 代码如下（用到了 jQuery 库）：

<!-- more -->

        $(document).ready(function () {
            $(window).scroll(function () {
                var top = $(window).scrollTop();
                var menu = $("#menu");
                var items = $("#content").find(".item");
                //滚动条发生滚动时，要获取相应的值。
                var currentId = "";
                //让导航菜单实现在滚动条滚动的时候自动设置焦点
                items.each(function () {
                    var This = $(this);
                    var itemTop = This.offset().top;
                    if (top > itemTop - 200) {
                        currentId = This.attr("id");
                    } else {
                        return false;
                    }
                })
                //给相应楼层的a 设置 current，取消其他链接的current
                var currentLink = menu.find(".current");
                if (currentId && currentId != "#"+currentLink.attr("href")) {
                    currentLink.removeClass("current");
                    menu.find("[href=#" + currentId + "]").addClass("current");
                }
            })
        })
