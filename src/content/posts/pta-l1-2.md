---
title: PTA 天梯赛 L1 刷题总结（二）：10 分题型
published: 2025-02-26
description: 复盘 PTA 天梯赛 L1 阶段常见的 10 分题型，分享输入输出规律、常见踩坑点与代码精简思路。
tags: [algorithm, pta, cpp, note]
category: 编程与算法
draft: false
device: Windows
---

刷完这批 PTA 天梯赛 L1 的 10 分题后，我发现它们主要考查输入输出处理、基础分支循环以及 STL 的直接调用。写这类题有个很实用的习惯：题目通常按样例逐组处理就行，没必要为了凑出“最后统一输出”的效果而专门开数组把全部输入存下来。

不过分数不高不代表不会翻车。交题前我通常会反复核对三个最容易丢分的细节：**计数变量有没有初始化、行尾有没有多出空格、换行位置对不对**。下面按题型把这批 10 分题的解题思路和代码演进捋一遍。

## 1. 数字与拼音映射

### L1-007 念数字

题目要求输入一个整数，逐位输出对应的拼音，如果是负数则先输出 `fu`。数字 `0` 到 `9` 和拼音本身是一一映射的关系，如果直接按字符串读入，既能保留从高位到低位的原始顺序，也能顺手处理开头的负号。

为了看清写法上的差异，这里我保留了三种实现做对比。第一种按常规思路把输入当整数来取模拆分，因为取模拿到的是倒序的各位数字，必须先存进数组再逆序输出，代码相对啰嗦一些：

```cpp
#include <stdio.h>
#include <stdlib.h>

void num(int s)
{
switch (s)
{
case 1:
printf("yi");break;
case 2:
printf("er");break;
case 3:
printf("san");break;
case 4:
printf("si");break;
case 5:
printf("wu");break;
case 6:
printf("liu");break;
case 7:
printf("qi");break;
case 8:
printf("ba");break;
case 9:
printf("jiu");break;
case 0:
printf("ling");break;
}
}
int main()
{
int n,i,j;
int a[100]={0};
scanf("%d",&n);
if(n<0)
  {
       printf("fu ");
       n*=(-1);
  }
   i=0;
   while(n/10)
  {
       a[i++]=n%10;
       n/=10;
  }
   a[i]=n;
   for(j=i;j>=0;j--)
  {
       if(j==0) num(a[j]);
       else
      {
           num(a[j]);
           printf(" ");
      }
  }
return 0;
}
```

### 二维字符数组

对比下来，改成字符串读入加查表就省事多了。下面第二种写法用二维字符数组存好 `0` 到 `9` 的拼音，通过 `strlen(s)` 拿到字符串长度，再靠 `s[i] - '0'` 把数字字符转成对应下标。对于首字符是否为负号这种只有两种情况的分支，用条件运算符一行就能完成标志位初始化：

```cpp
#include <iostream>
#include<cstring>
#include<cstdio>
using namespace std;
int main() {
   char a[10][10] = {"ling", "yi", "er", "san", "si", "wu", "liu", "qi", "ba", "jiu"};
   char s[1000];
   scanf("%s",s);
   int len=strlen(s);
   int flag = s[0] == '-' ? 1 : 0;
   if(flag == 1)
      printf("fu");
   for(int i = flag; i < len; i++)
  {
       if(i == 0)
      {
           printf("%s",a[s[i]-'0']);
           continue;
      }

       printf(" %s",a[s[i]-'0']);
  }
   return 0;
}
```

### `string` 数组

如果更习惯直接用 C++ 的 `string`，第三种写法会更顺手一些。同样用 `flag` 记录遍历的起始下标：若首字符是 `'-'`，就先输出 `fu `，然后从下标 `1` 开始逐位查表，最后一位不带空格即可：

```cpp
#include <iostream>
#include <string>

using namespace std;

int main()
{
   string s[10]={"ling","yi","er","san","si","wu","liu","qi","ba","jiu"};
   string a;
   int h;
   int i,flag;
   flag=0;
   cin>>a;
   if(a[0]=='-')
  {
       flag=1;
       cout<<"fu ";
  }
   for(int i=flag;a[i]!='\0';i++)
  {
        h = a[i]-'0';
       if(i<a.length()-1)
           cout<<s[h]<<" ";
       else
            cout<<s[h];
  }

   return 0;
}

```

## 2. 排序

### L1-010 比较大小

三个数比大小不用手写一堆 `if` 交换，直接交给 STL 的 `std::sort(first, last)` 就行。需要注意它作用的是左闭右开区间，默认按升序排列，所以三个元素的数组区间要写成 `sort(a, a + 3)`；如果题目要求降序或其他排序规则，再额外传入比较函数：

```cpp
#include <iostream>
#include <algorithm>
using namespace std;

int main()
{
   int a[3];
   cin>>a[0]>>a[1]>>a[2];
   sort(a,a+3);
   for(int i=0;i<3;i++)
  {
       if(i<2)
           cout<<a[i]<<"->";
       else cout<<a[i];
  }
   return 0;
}

```

## 3. 格式化输出

### L1-008 求整数段和

这类带对齐要求的输出题，用 `printf` 比 `cout` 省心很多。`printf("%5d", value)` 可以直接把整数按 5 个字符宽度右对齐输出。这道题最容易栽在换行上：用计数器控制每 5 个数换一次行时，要多加一个 `i != n` 的判断，避免刚好凑满 5 的倍数时在最后一个数后面多打一个空行：

```cpp
#include <iostream>
#include <cstdio>

using namespace std;

int main()
{
   int m,n,flag,sum;
   cin>>m>>n;
   sum=flag=0;
   for(int i=m;i<=n;i++)
  {
       printf("%5d",i);
       flag++;
       if(flag%5==0&&i!=n)
           printf("\n");
       sum+=i;
  }
   cout<<endl;
   cout<<"Sum = "<<sum;
   return 0;
}

```

## 4. 分类计算

### L1-031 到底是不是太胖了

按公式算出标准体重后再做三路分支即可。写绝对值判断时留意区分类型：整数绝对值用 `abs`，浮点数则用 `fabs`。另外整理条件分支时要留神，公共的输出逻辑千万别手滑塞进某个 `else` 分支里：

```cpp
#include <iostream>
#include <math.h>
using namespace std;

int main()
{
   int n,W,w,H;
   cin>>n;
   while(n--)
  {
       cin>>H>>W;
       w=(H-100)*1.8;
       if(fabs(W-w)<w*0.1)
           cout<<"You are wan mei!"<<endl;
       else if(W>w)
           cout<<"You are tai pang le!"<<endl;
       else
           cout<<"You are tai shou le!"<<endl;
  }
   return 0;
}

```

## 5. 素数判断

### L1-028 判断素数

经典的试除法判断素数，枚举因子只需试到 `sqrt(n)` 就够了。写循环时从 `2` 开始试除，最容易漏掉的边界是 `1`——它不是素数，必须在最终输出判断里单独拦住：

```cpp
#include <iostream>
#include <math.h>
#include <cstdio>
using namespace std;

int main()
{
   int i,j,n,m;
   cin>>n;
   for(i=0;i<n;i++)
  {
        int flag=0;
        cin>>m;
       for(j=2;j<=sqrt(m);j++)
      {
           if(m%j==0)
          {
               flag=1;
               break;
          }
      }
           if(flag==1||m==1)
               cout<<"No"<<endl;
           else if(flag==0)
               cout<<"Yes"<<endl;
  }
   return 0;
}
```

## 6. 满足条件后退出

### L1-041 寻找 250

碰到输入数量未知的题目，不用纠结先读总数，直接持续读取就行。边读边维护计数，第一次遇到 `250` 时输出当前位置，随即 `break` 跳出循环：

```cpp
#include <iostream>
#include <string>
#define N 10010
using namespace std;

int main()
{
   int i;
   int m=0;
   do
  {
       cin>>i;
       if(i==250)
      {
           cout<<m+1;
           break;
      }
       m++;
  }while(1);

   return 0;
}

```

## 7. 按规则判断

### L1-055 谁是赢家

这种纯规则题思路很直白：分别统计观众票数和三名评委的投票，然后照着题面给出的获胜条件直接翻译成 `if` 判断就行。动手前唯一要确认清楚的，就是 `0` 和 `1` 各自对应哪位选手，别把两位选手的票数记反了：

```cpp
#include <iostream>
#include <cstdio>
using namespace std;

int main()
{
   int i,pa,pb,a,b,c,qa,qb;
   cin>>pa>>pb;
   qa=qb=0;
   for(i=0;i<3;i++)
  {
        cin>>a;
        a==0?qa++:qb++;
  }
   if((pa>pb&&qa>=1)||(pa<pb&&qa==3))
       cout<<"The winner is "<<"a"<<": "<<pa<<" + "<<qa;
   else
       cout<<"The winner is "<<"b"<<": "<<pb<<" + "<<qb;
   return 0;
}
```
