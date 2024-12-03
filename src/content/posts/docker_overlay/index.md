---
title: 解决docker overlay2占用过大的问题
published: 2024-11-01
description: 解决docker overlay2占用过大的问题
tags: [docker, overlay2]
category: Service
image: ./images/docker.jpg
draft: false
---
# 进入docker目录，找到docker 容器目录
```bash
$ cd /var/lib/docker/containers && ls -ll
total 12
drwx--x--- 4 root root 4096 Nov  1 02:02 21296f3504e09953864b2240c0e15425c792d0c5b04c3d5b9cf649fb9a485053
drwx--x--- 4 root root 4096 Nov  1 02:02 3d64ad211220deabf3e8a1ccbaa4a1e6294e2007be9f8d2ad3105f81df7c3106
drwx--x--- 4 root root 4096 Nov  1 02:02 93da05ad5d9d2ce691f418f6a205c25f365ce959404ca6cefc39574e37d01f51
```

# 清理容器子目录中的json.log文件
```bash
$ cat /dev/null > /var/lib/docker/containers/21296f3504e09953864b2240c0e15425c792d0c5b04c3d5b9cf649fb9a485053/*-json.log
$ cat /dev/null > /var/lib/docker/containers/93da05ad5d9d2ce691f418f6a205c25f365ce959404ca6cefc39574e37d01f51/*-json.log
$ cat /dev/null > /var/lib/docker/containers/3d64ad211220deabf3e8a1ccbaa4a1e6294e2007be9f8d2ad3105f81df7c3106/*-json.log
```

# 参考文章
1. [docker overlay2占用大量磁盘空间处理方法](https://www.choupangxia.com/2020/01/30/docker-overlay2/)