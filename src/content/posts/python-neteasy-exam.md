---
title: 网易云课堂考试题-python
date: 2015-01-29 00:23:14
tags:
  - python
category: 技术
---

# 题目内容：

> 两位整数相乘形成的最大回文数是 9009 = 99 × 91。编写程序，求得任意输入的 n 位整数相乘形成的最大回文数。
> 输入格式:
> 正整数 n
> 输出格式：
> n 位整数相乘形成的最大回文数
> 输入样例：
> 2
> 输出样例：
> 9009

程序：

```py
    def is_palindrome(num): 	#判断是否是回文
    	n = str(num)
    	if n == n[::-1]:
    		return True
    	else:
    		return False

    n = int(input())

    a = 1
    arr1 = []
    arr2 = []
    while len(str(a)) < n + 1: 		#将n位数的数字加到数组中，同时抛弃n-1位数
    	if len(str(a)) > n - 1:
    		arr1.append(a)
    		arr2.append(a)
    	a = a + 1

    maxPalindrome = 1
    for i in arr1[::-1]: 		#从后面往前开始遍历，取得最大的回文数
    	for j in arr2[::-1]:
    		if i*j > maxPalindrome and is_palindrome(i*j):
    			maxPalindrome = i*j
    print(maxPalindrome)
```

# 总结

感觉算法太粗暴，运行效率较低，但一时还没想到更好的算法。
