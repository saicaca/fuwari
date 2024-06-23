---
title: 快速排序的实现
date: 2015-01-30 07:05:32
tags:
  - 算法
category: 技术
---

快速排序是一种经常用到的排序方法，它的时间复杂度为 O(nlogn)。因为大多数情况下速度都比一般的排序方法快，用的比较多，自己就琢磨着实现了一下。

# 原理

快速排序用到了分治法的原理：
&emsp;&emsp;从数组中随机取出一个数字，将这个数组分为两个部分。将取出的数字作为基准数，小于基准数的放到它的左边，大于基准数的放到它的右边。这样基准数左边的都是比它小的，右边的都是比它大的。然后再对基准数的左边和右边重复前面的过程，直到每个部分的数组长度为 1。最后再将这些分开的数组组合起来就成功了。步骤如下：

1. 从数组中随机抽取一个数组作为基准数，将数组中的每个数字与基准数比较，小于基准数的放到基准数左边，大于基准数的放到基准数右边。
2. 对上面结束后的左右两个部分重复步骤 1。
3. 当所有部分的长度为 1 时停止。

<!-- more -->

# 实现

下面是自己熟悉的语言的实现(用第一个数作为基准数,并且采用递归的方法)：

## Python 版本

```python
    def quick_sort(lst,left,right):
    	i = left;
    	j = right
    	if i >= j:
    		return lst
    	k = lst[i]
    	while i < j:
    		while i < j and lst[j] >= k:		#lst[j]<=k时，循环结束，并将其值赋给lst[i]
    			j -= 1
    		lst[i] = lst[j]
    		while i < j and lst[i] <= k:		#lst[i]>=k时，循环结束，并将其值赋给lst[j]
    			i += 1
    		lst[j] = lst[i]
    	lst[i] = k								#当i>=j时，将k的值赋给lst[i]
    	quick_sort(lst,left,i-1)
    	quick_sort(lst,j+1,right)
    	return lst
```

## JavaScript 版

```js
function quick_sort(lst, l, r) {
  var i = l,
    j = r,
    k = lst[l]
  if (i >= j) {
    return lst
  }
  while (i < j) {
    for (; i < j; j--) {
      if (lst[j] <= k) {
        lst[i] = lst[j]
        i++
        break
      }
    }
    for (; i < j; i++) {
      if (lst[i] >= k) {
        lst[j] = lst[i]
        j--
        break
      }
    }
  }
  lst[i] = k
  quick_sort(lst, l, i - 1)
  quick_sort(lst, j + 1, r)
  return lst
}
```

## C 语言版

```c
    void qucik_sort(int lst[],int l,int r)
    {
    	if(l < r)
    	{
    		int i = l, j = r, k = lst[l];
    		while (i < j){
    			for (; i < j; --j)
    			{
    				if (lst[j] <= k)
    				{
    					lst[i] = lst [j];
    					i++;
    					break;
    				}
    			}
    			for (; i < j; ++i)
    			{
    				if (lst[i] >= k)
    				{
    					lst[j] = lst[i];
    					j--;
    					break;
    				}
    			}
    		}
    		lst[i] = k;
    		qucik_sort(lst, l, i-1);
    		qucik_sort(lst, j+1, r);
    	}
    }
```
