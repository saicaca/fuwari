---
title: 前端面试题(1)
date: 2015-02-06 20:44:05
tags:
  - 面试题
  - JavaScript
category: 技术
---

在群里有人分享了一套试题，拿来练练手。

### 1、请用 HTML5 标准完成以下布局

![图1](/imgs/interval/QQ截图20150206124835.png)

<!-- more -->

    HTML:
    	<header>HEADER</header>
    	<nav>NAV</nav>
    	<aside>ASIDE</aside>
    	<section>SECTION</section>
    	<footer>FOOTER</footer>
    CSS:
    	body{
    		color: white;
    		font-size: 14px;
    		text-align: center;
    	}
    	header{
    		background-color: black;
    	}
    	nav{
    		background-color: gray;
    	}
    	aside{
    		width: 30%;
    		height: 200px;
    		float: left;
    		background-color: red;
    	}
    	section{
    		width: 70%;
    		height: 200px;
    		margin-left: 30%;
    		background-color: blue;
    	}
    	footer{
    		background-color: orange;
    	}

### 2、相应框架布局 css 编写，实现以下两种情况即可。

![图2](/imgs/interval/QQ截图20150206124951.png)

    HTML:
    	<div class="box1">1</div>
    	<div class="box2">2</div>
    CSS:
    	div{width: 600px;height: 50px}
    	.box1{background-color: red;}
    	.box2{background-color: blue;}
    	@media screen and (min-width:1024px ) {
    		div{
    			float: left;
    		}
    	}
    	@media screen and (max-width: 1024px) {
    		div{
    			float: none;
    		}
    	}

### 3、实现一行数据中同时含有图片和文字垂直居中（不能使用 table，注意兼容性）

    HTML:
    	<div class="box1">
    		<div class="wrap1">
    			<p>我要居中</p>
    			<img src="http://images.cnitblog.com/blog/607355/201408/100022249123500.png" alt="liveReload">
    		</div>
    	</div>
    	<div class="box2">
    		<div class="wrap2">
    			<p>我也要居中</p>
    			<img src="http://images.cnitblog.com/blog/607355/201408/100022249123500.png" alt="liveReload">
    		</div>
    	</div>
    	<div class="box3">
    		<div class="wrap3">
    			<p>我也要居中</p>
    			<img src="http://images.cnitblog.com/blog/607355/201408/100022249123500.png" alt="liveReload">
    		</div>
    	</div>
    CSS:
    	.box1,.box2,.box3,.box4{
    		width: 33%;
    		height: 300px;
    		float: left;
    		border: 1px solid #00FFFF
    	}
    	/*方法1，用display:table*/
    	.box1{
    		display: table;
    	}
    	.wrap1{
    		display: table-cell;
    		vertical-align: middle;
    		text-align: center;
    	}
    	/*方法2，用绝对定位法*/
    	.box2{
    		position: relative;
    	}
    	.wrap2{
    		width: 150px;
    		height: 150px;
    		border: 1px solid black;
    		position: absolute;
    		left: 0;
    		right: 0;
    		top: 0;
    		bottom: 0;
    		margin: auto;
    	}
    	/*方法3，用translate方法*/
    	.box3{
    		position: relative;
    	}
    	.wrap3{
    		position: absolute;
    		top: 50%;
    		left: 50%;
    		-webkit-transform: translate(-50%,-50%);
    		   -moz-transform: translate(-50%,-50%);
    		    -ms-transform: translate(-50%,-50%);
    		     -o-transform: translate(-50%,-50%);
    		        transform: translate(-50%,-50%);
    	}

### 4、请描述一下 cookie，sessionStorage 和 localStorage 的异同点。

共同点：都是保存在浏览器端的数据。
区别：
cookie 数据始终在同源的 http 请求中携带（即使不需要），即 cookie 在浏览器和服务器间来回传递。而 sessionStorage 和 localStorage 不会自动把数据发给服务器，仅在本地保存。cookie 数据还有路径（path）的概念，可以限制 cookie 只属于某个路径下。
**存储大小**限制也不同，cookie 数据不能超过 4k，同时因为每次 http 请求都会携带 cookie，所以 cookie 只适合保存很小的数据，如会话标识。sessionStorage 和 localStorage 虽然也有存储大小的限制，但比 cookie 大得多，可以达到 5M 或更大。
**数据有效期**不同， sessionStorage：仅在当前浏览器窗口关闭前有效，自然也就不可能持久保持； localStorage：始终有效，窗口或浏览器关闭也一直保存，因此用作持久数据； cookie 在设置的 cookie 过期时间之前一直有效，即使窗口或浏览器关闭。
**作用域不同**， sessionStorage 不在不同的浏览器窗口中共享，即使是同一个页面； localStorage 在所有同源窗口中都是共享的；cookie 也是在 所有同源窗口中都是共享的。

### 5、请指出以下代码的性能问题，并进行优化。

    var str=" 123";
    str +=" 456 ,";
    str +=" 789 ,";
    str +=" 012" ;

不知如何解答，-\_-

### 6、编写一个用户类，需求如下：

1. 属性：id、name、password、age
2. 方法：获取用户脚本信息，返回 json 字符串 GetUserInfo
3. 方法：验证用户登录信息，ajax 实现，返回结果提示登录成功或失败即可 CheckLogin
4. 创建一个用户类的一个对象，并重写 GetUserInfo 方法

代码：

```js
var Person = {
  id: "ID",
  name: "Name",
  password: "PassWord",
  $age: null,
  get age() {
    if (this.$age == undefined) {
      return new Date().getFullYear() - 1993
    } else {
      return this.$age
    }
  },
  set age(val) {
    if (!isNaN(+val) && +val > 0 && +val < 120) {
      this.$age = +val
    } else {
      throw new Error(val + "不是正确的年龄")
    }
  },
  GetUserInfo: function () {
    return {
      id: this.id,
      name: this.name,
      password: this.password,
      age: this.age,
    }
  },
  CheckLogin: function (data, success, error) {
    //data为用户数据，success和error分别是成功和失败的回调函数
    var xmlhttp

    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest()
    } else {
      //for IE6
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
    }
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        if (xmlHttp.responseText === "OK") {
          if (typeof success === "function") {
            success()
            console.log("登陆成功")
          }
        } else {
          error()
          console.log("登录错误")
        }
      }
    }
    xmlhttp.open("POST", "Login", true)
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    )
    xmlhttp.send(data)
  },
}

var me = Object.create(Person)
me.id = "123"
me.name = "kisnows"
me.password = "kPassword"
var myData = me.GetUserInfo()
console.log(myData)
me.GetUserInfo = function () {
  console.log("Rewrite GetUserInfo")
}
```

### 7、jQuery 插件开发，有一数据列表页面，需求如下：

1. 奇数行无背景色
2. 偶数行背景色#EEE
3. 鼠标移入某行时背景色#0066CC，文字颜色变为白色，移出还原

假设是给 ul 下的 li 设置背景，代码如下：

```js
;(function ($) {
  $.fn.extend({
    ChageBg: function () {
      var lis = $(this).find("li")
      var bfBg, bfCl
      for (var i = lis.length - 1; i >= 0; i--) {
        lis[i].index = i
        if (i % 2 === 0) {
          $(lis[i]).css("backgroundColor", "#EEE")
          // lis[i].style.backgroundColor = '#EEE';
        }
        $(lis[i]).mouseover(function () {
          bfBg = $(this).css("backgroundColor")
          // console.log($(this),bfBg)
          bfCl = $(this).css("color")
          $(this).css({
            backgroundColor: "#0066CC",
            color: "#FFF",
          })
        })
        $(lis[i]).mouseout(function (pro) {
          $(this).css({
            backgroundColor: bfBg,
            color: bfCl,
          })
        })
      }
    },
  })
})(jQuery)
```

### 8、用 HTML5 播放一段视频或音频，并支持打点功能（从指定开始时间播放之制定结束时间，如一段视频长度为 10 秒，从第 2s 开始播放至第 8s 结束）

```html
HTML:
<video id="video1" controls="controls">
  <source src="/example/html5/mov_bbb.mp4" type="video/mp4" />
  <source src="/example/html5/mov_bbb.ogg" type="video/ogg" />
  Your browser does not support HTML5 video.
</video>
```

    只知道如何引入带控制条的音视频，打点功能不了解。网上也没有找到。
    希望知道的同学能够告诉我一下，谢谢了。

### 9、CSS3 的 transition 与 Animation 动画结束后的结束回调函数是什么。

此题答案来自网络[http://blog.csdn.net/renfufei/article/details/19617745](http://blog.csdn.net/renfufei/article/details/19617745)

> `ransitionend`事件和`animationend`事件是标准浏览器的动画结束回调函数。基于 webkit 的浏览器仍然依赖于前缀,我们必须先确定事件的前缀,然后才能调用:

    /* From Modernizr */
    function whichTransitionEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
          'transition':'transitionend',
          'OTransition':'oTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd',
          'MsTransition':'msTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    }

    /* 监听 transition! */
    var transitionEvent = whichTransitionEvent();
    transitionEvent && e.addEventListener(transitionEvent, function() {
        console.log('Transition 完成!  原生JavaScript回调执行!');
    });

    /*
        在 "whichTransitionEvent" 中,可以将 "transition"文本替换为  "animation",则处理的就是动画,此处代码省略...)
    */

## 总结

- 第四题做之前理解没有那么深,只知道它们都是存在浏览器端的本地数据，且 sessionStorage 和 localStorage 为 HTML5 的新特性，sessionStorage 为短期存储，localStorage 为长期存储。
- 第六题中的 CheckLogin 方法不知具体如何实现。
- 第八题打点功能不了解。
- 第九题之前没听说过。
