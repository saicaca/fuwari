---
title: CSS3 实现人物赛跑动画
published: 2015-05-21 05:32:53
tags:
  - CSS3
  - 奔跑
category: 技术
---

最近公司的一个手机项目里面有一个动画，就是一个人在跑道上跑步。为了能在手机端发挥更好的性能，选择了全部用 CSS3 来做一个动画。
因为是第一次做，碰到了很多问题，记录下来。

<!-- moer -->

效果图是这样的：
![All](/imgs/income-animation-all.png)

## 分析

拿到效果图先分析一下，可以看到动画分为一下四个部分：

- 跑动的小人
- 运动的路
- 左边的路牌
- 收益的牌子

### 小人

小人很好解决，通过使用一张跑步的分解图片，
![person](/imgs/income-person.png)
然后通过逐帧的变动它的`background-position'就可以了，真是简单啊。

    .person {
        width: 62px;
        height: 110px;
        background: url(../imgs/plan/person1.png) -7px 0 no-repeat;
        background-size: auto 110px;
        animation: run .5s infinite;			//要注意加上各种浏览器的前戳，尤其是-webkit-，在这我就不加了
        position: absolute;
        top: 40%;
        left: 110*.84px;
    }
    @keyframes run {
        0% {
            background-position: -7px 0
        }
        25% {
            background-position: -79px 0
        }
        50% {
            background-position: -150px 0
        }
        75% {
            background-position: -216px 0
        }
        100% {
            background-position: -283px 0
        }
    }

然而小人就成这样了了，
![person-wrong](/imgs/income-person-wrong.gif)
简直惨不忍睹，分析原因，原来是因为 keyframes 默认是有过渡的。也就是说，我的`background-position`是从-7 线性的渐变到-283，这当然不是我想要的结果。想到这样该是动画时间函数的问题，就去查`animation-timing-funciton`的取值：

<!--more-->

> linear：
> 线性过渡。等同于贝塞尔曲线(0.0, 0.0, 1.0, 1.0)
> ease：
> 平滑过渡。等同于贝塞尔曲线(0.25, 0.1, 0.25, 1.0)
> ease-in：
> 由慢到快。等同于贝塞尔曲线(0.42, 0, 1.0, 1.0)
> ease-out：
> 由快到慢。等同于贝塞尔曲线(0, 0, 0.58, 1.0)
> ease-in-out：
> 由慢到快再到慢。等同于贝塞尔曲线(0.42, 0, 0.58, 1.0)
> **_step-start：_**
> 等同于 steps(1, start)
> **_step-end：_**
> 等同于 steps(1, end)
> **_steps(<integer>[, [ start | end ] ]?)：_**
> 接受两个参数的步进函数。第一个参数必须为正整数，指定函数的步数。第二个参数取值可以是 start 或 end，指定每一步的值发生变化的时间点。第二个参数是可选的，默认值为 end。
> cubic-bezier(<number>, <number>, <number>, <number>)：
> 特定的贝塞尔曲线类型，4 个数值需在[0, 1]区间内

`step`这个属性就是我们想要的，让他从一个状态直接跳到另个状态，而不是过渡过去。给上面的.person 再加上这条属性就可以了

    animation-timing-function: step-start;

![person-run](/imgs/income-person-run.gif)
这样小人跑步就解决了。

### 路

路一开始还想不到好的方法，本来想的是直接截一大段，弄两张图，然后让两张图交替的出现。但是这样图片会很大，即耗费网络资源又感觉方法很笨。看着跑道分析了一下，想到了一个好方法。
![runway](/imgs/income-runway.png)
通过截取跑道的最小组成部分，纵向平铺，然后让他的`background-position`每次挪此图高度的一半就可以了。
![runway-run](/imgs/income-runway-run.gif)
这样跑道也解决了。

### 左边的路牌

这个很简单，给她设置绝对定位，然后更改`top`值就可以了。
要注意的是，最后一块牌子要在到中间后停在那，加上这个属性就可以了。

    animation-fill-mode: forwards;

> animation-fill-mode 属性规定动画在播放之前或之后，其动画效果是否可见。
> **取值**
> none： 不改变默认行为。
> forwards： 当动画完成后，保持最后一个属性值（在最后一个关键帧中定义）。
> backwards： 在 animation-delay 所指定的一段时间内，在动画显示之前，应用开始属性值（在第一个关键帧中定义）。
> both： 向前和向后填充模式都被应用。

### 收益的牌子

和左边的路标一样，很简单。就是出现和消失而已。

## 组合

将动画的四个部分解决后，剩下的就是将他们组合起来了。
![process](/imgs/income-animation-process.png)
上图是第一块路标从屏幕出现到消失过程的流程图，其他两块路标的过程只需要将动画延迟相应的时间段就可以了。
这中间还有一个问题，就是让小人和路定点停下来。
这个用 CSS3 貌似实现不了，于是退而求其次，选择了用 js 来控制。通过给它的设置属性`webkit-animation-play-state: paused`和`webkit-animation-play-state: running`就可让它停下来后继续动了。
最后要在动画完成后，弹出一个弹窗。这个通过检测`animationEnd`事件来实现,下面是实现方法。

    /* From Modernizr */
    function whichAnimationEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var animations = {
          'animation':'animationend',
          'OAnimation':'oAnimationEnd',
          'MozAnimation':'animationend',
          'WebkitAnimation':'webkitAnimationEnd'
        }

        for(t in animations){
            if( el.style[t] !== undefined ){
                return animations[t];
            }
        }
    }

    /* Listen for a transition! */
    var transitionEvent = whichAnimationEvent();
    whichAnimationEvent && e.addEventListener(whichAnimationEvent, function() {
    	//doSomething
    });

    /*
    	The "whichTransitionEvent" can be swapped for "animation" instead of "transition" texts, as can the usage :)
    */

## 效果

这是最后的完成效果。
[点这儿看动画](http://kisnows.com/F2E-practice/running/index.html)
