---
title: PTA 天梯赛 L1 刷题总结（三）：15 分题型
published: 2025-02-26
description: 按五大常见题型复盘 PTA 天梯赛 L1 阶段的 15 分题，拆解解题思路、STL 写法优化与输入输出避坑点。
tags: [algorithm, pta, cpp, note]
category: 编程与算法
draft: false
device: Windows
---

做完 10 分题往上迈一步，就来到 15 分题了。把这批题刷下来之后，我按核心数据结构和处理套路归成了五大类：**哈希映射、结构体、按题意模拟、字符串处理、矩阵处理**。实战里拿到题先定性它属于哪一类，再顺手核对输入边界、状态标记和输出格式，基本就能稳稳拿下。

## 一、哈希映射问题

### L1-003 个位数统计

题目给出一个不超过 1000 位的正整数 `N`，要求统计其中每种个位数字 `D` 出现的次数 `M`，并按 `D` 的升序逐行以 `D:M` 的格式输出。碰到这种位数动辄上百上千的整数，整型肯定是存不下的，第一反应就该转成字符串来逐位遍历。

> 常见实现中，`int` 是 32 位有符号整数，范围约为 $-2^{31}$ 到 $2^{31}-1$；`long long` 通常是 64 位，范围约为 $-2^{63}$ 到 $2^{63}-1$。1000 位整数远超这两种类型的范围，应按字符串处理。

**写法一：定长数组计数**

每个数字和出现次数是一一映射的关系，而个位数字总共只有 `0` 到 `9` 这十种，直接开一个长度为 10 的整型数组做哈希表就足够了。遍历字符串时每扫到一个字符，对应桶的计数加 `1`；最后从小到大扫一遍数组，跳过次数为 `0` 的数字按格式输出即可。

写这个版本有两个细节容易踩坑：一是计数数组必须先用 `memset(s, 0, sizeof(s))` 清零（记得引入 `<cstring>` 或 `<string.h>`），否则里面是脏数据；二是 `str[i]` 拿到的是字符，必须用 `str[i] - '0'` 转成对应的整数下标。

```cpp
#include <iostream>
#include <string>
#include <string.h>

using namespace std;

int main()
{
   string str;
   int s[10];
   int i;
   cin>>str;
   memset(s,0,sizeof(s)); //关键，对数组初始化都设置为0，否则会出错
   for(i=0;i<str.length();i++)
  {
       s[str[i]-'0']++;    //注意str[i]是一个字符，要str[i]-'0'来转化为int类型
  }
   for(i=0;i<10;i++)
  {
       if(s[i]!=0)
           cout<<i<<":"<<s[i]<<endl;
  }
   return 0;
}
```

**写法二：直接上 `map`**

平时刷力扣的时候，这类映射计数我更习惯直接用 STL 的 `map`。对比数组写法，它省去了手动初始化和判断是否为 `0` 的步骤，而且自带排序。这里顺带整理一下用 `map` 时最常用的三个知识点：

> 1. **头文件与默认排序**：定义 `map` 记得加上 `#include <map>`。比如 `map<string, int>` 表示从 `string` 到 `int` 的映射，而且 `map` 默认会按 key 值从小到大自动排好序。
> 2. **元素访问方式**：既可以用下标直接访问（如下面的 `mp[c - '0']`），也可以用迭代器 `map<int, int>::iterator it` 遍历，通过 `it->first` 拿键、`it->second` 拿值。除了代码里的 `while`，用 `for` 循环遍历也很常见：`for(map<int,int>::iterator it = mp.begin(); it != mp.end(); it++) { cout << it->first << ":" << it->second << endl; }`。
> 3. **范围 `for` 循环**：`for(char c : str)` 可以直接按字符遍历 `str`，拿到的 `c` 就相当于方法一里的 `str[i]`，写起来比维护下标顺手不少。

```cpp
#include <iostream>
#include <string>
#include <string.h>
#include <map>

using namespace std;

int main()
{
   string str;
   cin>>str;
   map<int,int> mp;
   for(char c:str)
  {
       mp[c-'0']++;
  }
   map<int, int>::iterator it = mp.begin();

while (it != mp.end()) {
cout << it->first << ":" << it->second << endl;
it++;
}

   return 0;
}
```

## 二、结构体问题

### L1-005 考试座位号

题目要求针对每个查询的试机座位号，在一行里输出对应考生的准考证号和考场座位号，中间用 1 个空格隔开。

每个考生都绑定了准考证号、试机座位号和考场座位号三项信息，遇到这种需要把不同类型字段捆在一起的数据，最自然的选择就是结构体。

> 比如 `struct studentInfo { int id; char gender; string name; } Bob, stu[10];`
> 其中 `studentInfo` 是结构体名，`Bob` 是单个结构体变量，`stu[10]` 是包含 10 个学生信息的结构体数组；访问成员用 `.` 或 `->`。

**写法一：结构体数组线性查找**

准考证号是 16 位数字，直接用 `string` 存最稳妥。先把 `N` 个学生的信息全部读进结构体数组，接着读入每次待查的试机号，遍历数组比对即可。顺便提个小技巧：当循环次数和循环体里的下标逻辑无关时，直接写 `while(m--)` 会简洁很多。

```cpp
#include <iostream>
#include <cstdio>
#define N 100000
using namespace std;

struct node
{
   string z;
   int s,k;
}stu[N];
int main()
{
   int i,m,n,l;
   cin>>n;
   for(i=0;i<n;i++)
  {
      cin>>stu[i].z>>stu[i].s>>stu[i].k;
  }
   cin>>m;
   while(m--)
  {
       cin>>l;
       for(i=0;i<n;i++)
      {
           if(stu[i].s==l)
               cout<<stu[i].z<<" "<<stu[i].k<<endl;
      }
  }
   return 0;
}
```

**写法二：`map` + 结构体一步到位**

每次查询都要从头扫一遍数组有点笨重。其实可以直接建立“试机号 -> 结构体（准考证号、考场座位号）”的 `map` 映射，查询时直接 `mp[l]` 就能精准取出来，写法也更利落：

```cpp
#include <iostream>
#include <cstdio>
#include <map>
#define N 100000
using namespace std;

struct node
{
   string z;//准考证号
   int k; //考场座位号
}stu;

int main()
{
   int i,m,n,l;
   map<int,node> mp;
   cin>>n;
   int s;
   for(i=0;i<n;i++)
  {
      cin>>stu.z>>s>>stu.k;
      mp[s] = stu;
  }
   cin>>m;
   while(m--)
  {
       cin>>l;
       cout<<mp[l].z<<" "<<mp[l].k<<endl;
  }
   return 0;
}
```

### L1-030 一帮一

给定按全班名次排好序的名单，要在尚未分组的同学中，把名次最靠前的同学与名次最靠后的异性同学配对，并按前者名次从高到低逐行输出每组姓名。

每个学生要同时记录名次顺序、姓名和性别，同样适合用结构体数组（头部宏定义 `#define N 10000`）。写这题有两个关键点要先想明白：

- **外层循环的边界是 `n / 2`**：输入本身已经按名次从高到低排好，只遍历前一半同学作为每组的“前者”即可，不然排名靠后的同学就会被错排到前面去。
- **必须维护配对标志位**：举个例子，如果第一名和最后一名是同性，第一名就会跳过最后一名去和倒数第二名组队，等到第二名配对时，最后一名反而是可用的。因此结构体里要多加一个标志位，读入时统一初始化为 `0`，配对成功后置为 `1`。

落实到代码就是两重循环：外层按名次从前往后走，内层从 `j = n - 1` 倒着扫到 `j > i`。只要遇到尚未配对且性别不同的同学，就输出两人姓名、打上已配对标记，再 `break` 跳出内层循环（注意 `break` 只跳出当前这一层循环）。

```cpp
#include <iostream>
#define N 10000
using namespace std;
struct node
{
   int x,f;
   string m;
}s[N];
int main()
{
   int i,j,n;
   cin>>n;
   for(i=0;i<n;i++)
  {
       cin>>s[i].x>>s[i].m;
       s[i].f=0;
  }
   for(i=0;i<n/2;i++)
  {
       for(j=n-1;j>i;j--)
      {
           if(s[i].x!=s[j].x&&s[j].f!=1)
          {
               cout<<s[i].m<<" "<<s[j].m<<endl;
               s[j].f=1;
               break;
          }
      }
  }
   return 0;
}
```

## 三、按题意模拟

这一大类没什么花哨的数据结构，拼的就是读题细致程度和把文字规则准确翻译成代码的能力。

### L1-015 跟奥巴马一起画方块

题目在一行中给出正方形边长 `N` 和字符 `C`，要求用 `C` 画出正方形，且输出的行数实际上是列数的 50%（四舍五入取整）。

用双重循环就行，外层管行、内层管列，给定的边长 `N` 就是列数。整道题唯一的坑在取整上：**C++ 里 `int` 除法默认是向下取整**，想做到四舍五入得写成 `l = (n + 1) / 2;`。

### L1-016 查验身份证

开两个数组分别存权重和校验码，身份证号直接用字符串存储方便按位核对。按题意把前 17 位加权求和再取模，拿对应校验码和身份证最后一位比对是否一致即可。

### L1-017 到底有多二

输入给出整数 `N`，“犯二的程度”定义为数字 `2` 的个数与总位数之比；如果是负数，结果还要乘以 `1.5`；如果是偶数，结果再乘以 `2`。

因为 `N` 最多有 50 位，照例用 `string` 读入后遍历统计 `2` 的个数。写的时候容易漏掉几个小细节：

- **位数必须扣掉负号**：若首位是 `'-'`，用 `flag = 1` 做标记，后面既能拿它判断是否需要乘以 `1.5`，也能直接用 `l - flag` 算出有效数字的位数。
- **偶数的判断**：不用转整数，直接看最后一位字符转成的数字能否被 `2` 整除即可，满足就乘以 `2`。
- **精度与格式**：算比值时记得强转为 `double` 避免整除丢精度，最后用 `printf("%.2f", b)` 保留两位小数再补上 `%`。

```cpp
#include <iostream>
#include <cstdio>
using namespace std;

int main()
{
   string s;
   double b;
   int i,cnt=0;
   cin>>s;
   int flag=0;
   if(s[0]=='-') flag=1;
   int l = s.length();
   for(i=flag;i<s.length();i++)
  {
       if(s[i]-'0'==2)
           cnt++;
  }
   b = (double)cnt/(l-flag)*100;
   if(flag==1)
       b*=1.5;
   if((s[l-1]-'0')%2==0)
       b*=2;
   printf("%.2f",b);
   cout<<"%";
   return 0;
}
```

### L1-019 谁先倒

这题的核心是把胜负逻辑写严密：只有当一方喊出的数字等于两人划拳之和、且另一方没喊中时，喊中的那方才算输并喝酒；如果两人同时喊中或都没喊中，都不喝酒直接进下一轮。所以 `if` 判断里一定要同时校验两个条件。

每轮更新完双方喝的杯数后，紧接着检查有没有人超过自己的酒量（严格大于）。只要有人倒下，立刻输出先倒下的人和另一方喝的杯数，并 `break` 结束循环。

两个顺手的习惯提醒一下：一是代码中用 `getchar()` 清了一下回车符（在全用 `cin` 的场景下其实可省略，它是用来从标准输入流读走残留回车的）；二是这题一行要读四个变量，变量名尽量起得有辨识度，不然写到判断条件时很容易把自己绕晕。

```cpp
#include <iostream>
#include <cstdio>
using namespace std;

int main()
{
   int a,b,n,i,yf,jf,yh,jh,ma,mb;
   ma=mb=0;
   cin>>a>>b;
   getchar();  //不用也可以，目的是清空回车符，从标准输入流读取一个字符，读回车符时退出
   cin>>n;
   for(i=0;i<n;i++)
  {
       cin>>jh>>jf>>yh>>yf;
       if(jf==jh+yh&&yf!=jh+yh)
           ma++;
       if(yf==jh+yh&&jf!=jh+yh)
           mb++;
       if(ma>a||mb>b)
      {
         if(mb>b)
          {
               cout<<"B"<<endl;
               cout<<ma;
          }
          if(ma>a)
          {
              cout<<"A"<<endl;
              cout<<mb;
          }
          break;
      }

  }

   return 0;
}
```

### L1-062 幸运彩票

思路很直接，用字符串保存彩票号码，按题意拆位判断并输出即可。

### L1-069 胎压监测

用长度为 4 的数组存下四个轮胎的胎压，先扫一遍配合 `max()` 找出最大胎压值。审题时要看清报警的两个触发条件：**最大胎压与当前胎压之差大于阈值**，或者**当前胎压低于最低报警胎压**。再遍历一遍数组，只要满足其中任意一条，异常轮胎计数加 `1` 并顺手记下当前编号。最后根据异常轮胎数是 `0`、`1` 还是大于 `1` 分别输出对应提示。

```cpp
#include <cstdio>
#include <iostream>
#include <cmath>
using namespace std;

int main()
{
   int a[4];
   int yu,ya;
   scanf("%d %d %d %d",&a[0],&a[1],&a[2],&a[3]);
   scanf("%d %d",&ya,&yu);

   int maxY = 0,cnt =0,index,i;
   for(i=0;i<4;i++)
  {
       maxY = max(maxY,a[i]);
  }
   for(i=0;i<4;i++)
  {
       if(maxY-a[i]>yu||a[i]<ya)
      {
           cnt++;
           index = i;
      }
  }
   if(cnt==0) cout<<"Normal";
   else if(cnt==1) printf("Warning: please check #%d!",index+1);
   else cout<<"Warning: please check all the tires!";
   return 0;
}
```

### L1-077 大笨钟的心情

这题同样不知道一共有多少行输入，规则是读到不在 `[0, 23]` 范围内的非法数据时结束。直接把循环条件写成 `while(cin >> n && n >= 0 && n <= 23)` 就很干净，写完注意核对输出格式。

## 四、字符串处理

15 分题里字符串占的比重最大，我把常见操作拆成了五个小专题：字符串转整数、提取整数各位、按终止标记读入、子串查找，以及按位推导规律。

### 字符串转换为整数

### L1-025 正整数 A+B

题目中合法的 `A` 和 `B` 都在 `[1, 1000]` 区间内，但输入里可能混着超范围的数、负数、小数甚至一堆乱码；规则约定以输入中出现的**第一个空格**作为 `A` 和 `B` 的分隔。不合法的加数输出 `?`，只要任意一个加数是 `?`，等式结果也输出 `?`。

既然输入不保证是纯整数，就必须先按字符串来接。这里输入有个关键点：用 `cin >> a` 读完 `A` 之后，**一定要跟一个 `getchar()` 吃掉紧随其后的那个分隔空格**，再用 `getline(cin, b)` 把剩下整行读给 `B`（防止 `B` 里面本身还带空格）。

由于合法的 `A`、`B` 都是 `[1, 1000]` 的整数，我单独封装了一个 `pan()` 函数做合法性校验和字符串转整数：逐字符遍历，一旦发现字符不在 `'0'` 到 `'9'` 之间就立刻返回 `-1`；否则按十进制累加 `sum = sum * 10 + a[i] - '0'`，遍历完返回结果。拿到转化后的 `A`、`B` 后，按两者是否落在 `[1, 1000]` 内分四种情况输出对应等式即可：

```cpp
#include <iostream>
#include <cstdio>
#include <string>
using namespace std;

int pan(string a,int len)
{
   int i,sum=0;
   for(i=0;i<len;i++)
  {
       if(a[i]<'0'||a[i]>'9')
           return -1;
       else
           sum=sum*10+a[i]-'0';
  }

   return sum;
}
int main()
{
   string a,b;
   cin>>a;
   getchar();
   getline(cin,b);
   int lena = a.length();
   int lenb = b.length();
   int A = pan(a,lena);
   int B = pan(b,lenb);
   if((A>0&&A<=1000)&&(B>0&&B<=1000))
       cout<<A<<" + "<<B<<" = "<<A+B;
   if((A>0&&A<=1000)&&(B<1||B>1000))
       cout<<A<<" + ? = ?";
   if(B>0&&B<=1000&&(A<1||A>1000))
       cout<<"? + "<<B<<" = ?";
   if((A<1||A>1000)&&(B<1||B>1000))
       cout<<"? + ? = ?";
   return 0;
}
```

### 提取整数的每一位

### L1-033 出生年

输入一行给出出生年份 `y`（范围 `[1, 3000]`）和目标年份中不同数字的个数 `n`，要求输出年龄 `x` 和首次满足条件的年份，中间以 1 个空格分隔，行首尾无多余空格，且不足 4 位的年份要在前面补零。

题干已经点得很清楚：“`n` 个数字都不相同”就是指不同数字恰好有 `n` 个。利用 **`set` 自动去重**的特性，从出生年份开始一年一年往上枚举，把当前年份的每一位 `insert()` 进 `set`，一旦 `s.size() == n` 就 `break` 退出，最后按格式输出年龄和年份。

和上一题不同，这里没必要把年份转成字符串，直接按位拆整数更省事。因为并不关心各位顺序，只需反复取 `h % 10` 塞进 `set` 再执行 `h /= 10`。由于年份按 4 位看齐（不足 4 位要补前导零），直接把循环次数固定为 `j = 4`，就能自然把前导零也一起插进 `set`：

> `while(j--) { s.insert(n % 10); n /= 10; }`

注意拆位过程会改掉变量本身的值，所以循环里要拿临时变量 `h` 拷贝一份当前年份 `m`；同时 `set<int> s` 要定义在每次外层循环内部，保证年份递增后重新统计。最后用 `printf("%d %04d", m - y, m)` 搞定前导补零：

```cpp
#include <iostream>
#include <cstring>
#include <cstdio>
#include <set>
using namespace std;

int main()
{
   int y,n,m;
   cin>>y>>n;
   m = y;

   while(1)
  {
      int h = m;
      set<int> s;   //注意定义的位置
      int j=4;
      while(j--)
      {
          s.insert(h%10);
          h/=10;
      }
       if(s.size()==n) break;
       m++;
  }
   printf("%d %04d",m-y,m);
   return 0;
}
```

### 遇到终止标记时停止输入

除了按终止标记逐行读入，还有一种常见场景是输入一整行字符串——用 `getline(cin, str)` 读入后，直接拿 `str.length()` 就能配合 `for` 循环遍历整行（比如下面的 L1-058）。

### L1-035 情人节

按点赞顺序每行输入一个人名（不超过 10 个英文字母的非空单词），以单独的英文句点 `.` 标志结束。若存在第 2 个人 `A` 和第 14 个人 `B`，输出 `A and B are inviting you to dinner...`；若只有 `A` 没有 `B`，输出 `A is the only one for you...`；若连 `A` 都没有，输出 `Momo... No one is for you ...`。

输入条数未知且给了明确的结束符 `.`，直接用 `while` 循环读入，碰到 `.` 就停。同时维护一个计数器统计总人数，最后按人数 `>= 14`、`>= 2 && < 14`、`< 2` 三种情况输出。人名既可以全存进字符串数组，也可以只留第 2 个和第 14 个。

**写法一：字符串数组 + `while(1)`**

把读到的所有人名都塞进字符串数组，遇到 `'.'` 时 `break` 跳出：

```cpp
#include <iostream>
#define N 10000
using namespace std;

int main()
{
   string s[N];
   int i=0;
   while(1)
  {
       cin>>s[i];
       if(s[i][0]=='.')
           break;
       i++;

  }
   if(i>1&&i<=13)
           cout<<s[1]<<" is the only one for you...";
   if(i<=1)
       cout<<"Momo... No one is for you ...";
   if(i>13)
           cout<<s[1]<<" and "<<s[13]<<" are inviting you to dinner...";
   return 0;
}
```

**写法二：只记目标人名 + `while(cin >> s && s != ".")`**

对比下来，其实没必要开数组把所有人名都存下来，只用两个字符串变量 `A`、`B` 在第 2 次和第 14 次顺手接住就行。同时把结束条件直接写进 `while(cin >> s && s != ".")`（注意这里是双引号字符串 `"."`），代码紧凑不少：

```cpp
#include <iostream>
#define N 10000
using namespace std;

int main()
{
   string s,A,B;
   int i=0;
   while(cin>>s&&s!=".")
  {
       i++;
       if(i==2) A = s;
       if(i==14) B = s;

  }
   if(i>1&&i<=13)
           cout<<A<<" is the only one for you...";
   else if(i<=1)
       cout<<"Momo... No one is for you ...";
   else
        cout<<A<<" and "<<B<<" are inviting you to dinner...";
   return 0;
}
```

### L1-044 稳赢

根据对方每局的出招给出必赢的招式，但要求每隔 `K` 次故意让出一场平局，读到 `End` 时退出。

写石头剪刀布的克制关系，其实不用专门写函数或堆一堆 `if-else`。这里有个挺巧的写法：把三种出招按顺序放进数组 `string s[3] = {"ChuiZi", "JianDao", "Bu"};`，会发现赢招正好满足**下标差 2 再对 3 取模**的规律——比如锤子对应布、布对应剪刀，也就是 `s[(i + 2) % 3]`。读入对方招式后，扫一遍数组找到对应下标 `i` 就行。

再看“每隔 `K` 局平局一次”的规则（例如 `K = 2` 时，前两局赢、第三局平）：用一个从 `1` 开始的局数计数器 `c`，只要 `c % (k + 1) == 0`，这一局就原样输出 `s[i]` 打平。至于读到 `End` 终止循环，和上一题的套路完全一样。

```cpp
#include <iostream>

using namespace std;

int main()
{
   string s[3]={"ChuiZi","JianDao","Bu"};
   string str;
   int n,i;
   cin>>n;
   int c=1;
   while(1)
  {
       cin>>str;
       if(str=="End")
           break;
       for(i=0;i<3;i++)
      {
           if(str==s[i])
          {
               if(c%(n+1)!=0)
                   cout<<s[(i+2)%3]<<endl;
               else cout<<s[i]<<endl;
          }
      }
        c++;
  }

   return 0;
}
```

### L1-058 6 翻了

从左到右扫描输入的一行句子：若出现超过 3 个连续的 `6`，就把这串连续的 `6` 替换成 `9`；若超过 9 个连续的 `6`，则替换成 `27`；其他内容保持不变。

这题的难点就在两处：统计连续 `6` 的长度，以及把它替换成目标数字。先用 `getline(cin, s)` 读入整行，再直接借助 `string` 自带的 `replace()` 函数原地替换就行：

> `str.replace(pos, len, str2);` 表示用 `str2` 替换 `str` 中从 `pos` 位置开始、长度为 `len` 的子串。

实现里内层用了一句空循环 `for(j = 0; i + j < s.size() && s[i + j] == '6'; j++);`（别漏掉末尾的分号），专门用来数出从 `i` 开始这串连续 `6` 的长度 `j`，接着按 `j > 9` 和 `j > 3` 的顺序调用 `replace()` 即可：

```cpp
#include <iostream>

using namespace std;

int main()
{
    string s;
   int i,j,n;
   getline(cin,s);
   for(i=0;i<s.length();i++)
  {
       for(j=0;i+j<s.size()&&s[i+j]=='6';j++);//记得这里有个分号，只是这样求一串6的长度
if(j>9) s.replace(i,j,"27");//j就是一串6的长度
else if(j>3) s.replace(i,j,"9");
  }
   cout<<s;
   return 0;
}
```

### 判断字符串是否包含子串

### L1-070 吃火锅

逐行读入朋友发来的消息（每行不超过 80 个字符、以回车结尾；读到某一行只有一个英文句点 `.` 时结束，该行不计入总数）。第一行输出消息总条数；第二行输出第一次出现 `chi1 huo3 guo1` 是第几条（从 1 开始计数）以及包含该关键词的总条数，中间空一格；如果从头到尾都没提到过，第二行输出 `-_-#`。题目保证输出的所有数字不超过 100。

首先每行是一条完整消息，中间大概率带空格，不能用 `cin >>` 来读：

> 注意二者区别：`cin >> str` 遇到空格就会停止输入，而 `getline()` 才能拿到包含空格的完整一行字符串。

判断这一行里有没有出现 `chi1 huo3 guo1`，直接调用 `string` 的 `find()` 函数即可：

> 在 `string` 类型中，`str.find(str2)` 若找到子串，会返回 `str2` 在 `str` 中首次出现的下标；若不包含，则返回 `string::npos`。

写的时候用变量分别记录总行数、命中总次数以及首次命中的行号。**有个很容易写混的坑**：输出表情 `-_-#` 的条件是**提到次数为 `0`**，而不是消息总行数为 `0`，定义变量和写 `if` 时别搞混了。

```cpp
#include <cstdio>
#include <iostream>
#include <string>

using namespace std;
int main()
{
   string s;
   string str = "chi1 huo3 guo1";
   int cnt = 0,ans = 0,first = 0,flag=0 ;
   while(getline(cin,s)&&s!=".")
  {
       cnt++;
       if(s.find(str)!=string::npos)
      {
           ans++;
           if(ans == 1)  first = cnt;
      }
  }
   cout<<cnt<<endl;
   if(ans ==0)  cout<<"-_-#";
else cout<<first<<" "<<ans;
return 0;
}
```

### L1-078 吉老师的回归

本次天梯赛共 `N` 道题，吉老师现在已经做完了 `M` 道；逐行检查题面，只要里面包含区分大小写的 `qiandao` 或 `easy`，吉老师就会跳过。要求输出吉老师当前正在做的那道题的题面（即做完 `M` 道之后紧接着要做的那道）；如果打算做的题目已经全部做完，输出 `Wo AK le`。

这题写的时候脑子得保持清醒。我们需要逐行读完题面，用变量 `t` 统计吉老师实际会做的题目数——也就是既不含 `qiandao` **又**不含 `easy` 的题（注意两个条件之间是 `&&` 关系，子串查找和上一题一致）。只要 `t == M + 1`，当前这一行就是吉老师正在做的题，直接输出并 `break`。反过来，如果把所有 `N` 行都扫完后仍然满足 `t <= M`（即实际需要做的题数不超过已完成数），说明全做完了，输出 `Wo AK le`。

**输入避坑提醒**：第一行读完 `n` 和 `m` 之后紧接着要循环调用 `getline()`，要么在 `cin >> n >> m;` 后紧跟一个 `getchar()` 吃掉行尾回车，要么直接写 `scanf("%d %d\n", &n, &m);`，否则第一轮 `getline()` 会把残留的空行读进去，结果直接全错。

```cpp
#include <iostream>
#include <cstdio>
#include <string>

using namespace std;

int main()
{
   int n,m,t=0;
   cin>>n>>m;
   //scanf("%d %d\n",&n,&m);
   getchar();
   string s;
   for(int i=0;i<n;i++)
  {
       getline(cin,s);
       //if(s.find("qiandao")==string::npos&&s.find("easy")==string::npos)
       if(s.find("qiandao")==-1&&s.find("easy")==-1)    //也可以用-1表示string::npos，虽然会显示等号两边类型不匹配的warning
      {
           t++;
      }
       if(t==m+1)
      {
          cout<<s;
          break;
      }
  }
   if(t<=m) cout<<"Wo AK le"<<endl;
   return 0;
}
```

### 按位推导规律

### L1-050 倒数第 N 个字符串

给定一个完全由小写英文字母组成的字符串等差递增序列，每个字符串长度固定为 `L`，从 `L` 个 `a` 开始、以 `1` 为步长递增。给定 `L` 和 `N`，要求输出该序列倒数第 `N` 个字符串。

刚看这题时我觉得还挺不好想的，卡了一会儿才转过弯：先把“倒数第 `N` 个”换算成“正数第 `M` 个”。长度 `L` 的小写字母串总共有 $26^L$ 个（代码中用 `pow(26, l)` 计算），从 `0` 开始编号的话，目标对应的就是 `m = t - n`。

顺着序列写几个出来找规律：`aaaa`、`aaab` … `aaaz`、`aaba`、`aabb`、`aabc` … `zzzz`，本质上就是满 26 进 1 的 26 进制计数。拿编号 `28`（第一个串记为 `0`）举个例子：`28 % 26 = 2` 对应最低位 `'a' + 2 = 'c'`，接着 `28 / 26 = 1`，再对 `26` 取余得 `1`，对应倒数第二位 `'b'`。就这样循环 `L` 次，不断把当前值模 `26` 再除以 `26`，就能从末位一路往前推导出每一位字符（推出来正好是 `aabc`），最后按正序逐位输出即可：

```cpp
#include <iostream>
#include <math.h>
#define N 10
using namespace std;

int main()
{
   int l,n,m,i,t;
   char r[N];
   cin>>l>>n;
   t = pow(26,l);
   m = t-n;
   for(i=l-1;i>=0;i--)
  {
       r[i] ='a'+m%26;
       m/=26;
  }
   for(i=0;i<l;i++)
       cout<<r[i];

   return 0;
}
```

## 五、矩阵处理

### 矩阵相乘

### L1-048 矩阵 A 乘以 B

输入先后给出两个矩阵 `A` 和 `B`，每个矩阵先在第一行给出行数 `R` 和列数 `C`。只有当 `Ca` 与 `Rb` 相等时，两矩阵才能相乘：规模匹配就按格式输出乘积矩阵 `AB`，否则输出 `Error: Ca != Rb`。

拿草稿纸比划一下矩阵乘法的规则就很清楚了：结果矩阵 `C` 的规模是 `Ra × Cb`，其中元素 `c[i][j]` 等于 `A` 的第 `i` 行和 `B` 的第 `j` 列对应元素相乘再求和。

具体实现分三步走：

1. 读入两个矩阵的行数和列数后，直接创建对应大小的二维数组 `a`、`b`，用双重循环把元素读进去。
2. 先用 `if-else` 比对 `Ca` 和 `Rb`，不相等直接报错输出，后面完全不用算。
3. 乘法部分套三层循环：外两层枚举结果矩阵的行列 `i`、`j`，在第二层里把累加器 `sum` 重置为 `0`，最里层枚举 `k`（范围即 `Ca`，也就是 `Rb`）计算 `sum += a[i][k] * b[k][j]`。

**格式注意**：行首尾不能有多余空格。利用当前列下标 `j` 来卡边界就行——非行尾元素输出数值后补一个空格，到了 `j == cb - 1` 时输出数值并换行。

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
using namespace std;

int main()
{
   int i,j,k,ra,ca,rb,cb,sum;
   cin>>ra>>ca;
   int a[ra][ca];
   for(i=0;i<ra;i++)
  {
       for(j=0;j<ca;j++)
           cin>>a[i][j];
  }
   cin>>rb>>cb;
   int b[rb][cb];
   for(i=0;i<rb;i++)
  {
       for(j=0;j<cb;j++)
           cin>>b[i][j];
  }
   if(ca!=rb) printf("Error: %d != %d",ca,rb);
   else
  {
       cout<<ra<<" "<<cb<<endl;
       for(i=0;i<ra;i++)
      {
           for(j=0;j<cb;j++)
          {
                int sum=0;
                for(k=0;k<rb;k++)
                   sum+=a[i][k]*b[k][j];
               if(j==cb-1) cout<<sum<<endl;
               else  cout<<sum<<" ";
          }
      }
  }
   return 0;
}
```

### 倒置矩阵

### L1-054 福到了

读入指定字符和网格规模 `N`，要求输出倒置后的网格；但如果这个字正过来和倒过去长得一模一样，要先输出一行 `bu yong dao le`，再用输入指定的字符输出网格。

看到这题，第一反应往往是开一个二维数组或字符串数组存原网格，再开一个同样大小的网格把倒置结果存下来。但稍微推一下坐标映射就会发现，在 `N × N` 的网格里，原位置 `(i, j)` 倒置后对应的正好是 `(n - i - 1, n - j - 1)`，其实根本不需要额外占空间去存倒置后的网格，直接按映射关系边查边输出就行（注意输出时把原字符替换成指定字符）。

实现时有几个细节要顺手兜住：

- **吃掉回车**：读完指定字符 `c` 和规模 `n` 后，务必跟一个 `getchar()` 吃掉换行符（和前面 L1-078 同理），再用 `getline(cin, s[i])` 按行读入网格。
- **判断中心对称**：如果“不用倒了”，说明网格中心对称，每个位置和它倒置后的对称位置内容完全一致。遍历网格，只要发现 `s[i][j] != s[n - i - 1][n - j - 1]`，就把标志位 `flag` 置为 `1` 并 `break`；最后依据 `flag` 决定是否先输出 `bu yong dao le`。
- **直接映射输出**：输出 `(i, j)` 位置时，直接看原网格对称位置 `s[n - 1 - i][n - 1 - j]` 是不是 `'@'`——不是就输出空格，是就输出指定字符 `c`，每行末尾记得换行。

```cpp
#include <iostream>
#include <cstdio>
#define N 1000
using namespace std;

int main()
{
   char c;
   int n,i,j;
   int flag=0;
   cin>>c>>n;
   getchar();
   string s[N];
   char m[n][n];
   for(i=0;i<n;i++)
  {
       getline(cin,s[i]);
  }
   for(i=0;i<n;i++)
  {
       for(j=0;j<n;j++)
      {
           if(s[i][j]!=s[n-i-1][n-j-1])
              {
                 flag=1;
                 break;
              }
      }
  }
   if(!flag) cout<<"bu yong dao le"<<endl;
   for(i=0;i<n;i++)
  {
       for(j=0;j<n;j++)
          {
               if(s[n-1-i][n-1-j]!='@')
                   cout<<" ";
               else cout<<c;
          }
       cout<<endl;
  }
   return 0;
}
```
