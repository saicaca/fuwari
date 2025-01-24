---
title: 解决docker inode、日志占用过大的问题
published: 2024-11-01
description: 解决docker overlay2占用过大的问题
tags: [docker, inode, log]
category: Service
image: ./images/docker.jpg
draft: false
---

# inode
## inode是什么
> inode是文件系统中的一个数据结构，用于存储文件或目录的元数据信息，如文件大小、所属用户、所属组、权限、创建时间、修改时间等等。每个inode都有一个唯一的编号，称为inode号。
>
> 当文件或目录被创建时，会分配一个inode号和一定的磁盘空间存储文件内容。文件名与inode号之间建立一个映射关系，通过文件名可以找到对应的inode，然后再根据inode中的元数据信息找到文件的内容。
>
> 因为文件名与inode号之间的映射关系是存储在目录中的，所以目录也需要使用inode来存储其元数据信息。一个目录的inode中会包含目录下所有文件的inode号和文件名的对应关系。
>
> 总之，inode是文件系统中的一个重要概念，它为文件和目录的管理提供了基础，使得文件系统能够高效地管理和存储文件和目录。
## 查看inode占用
```bash
df -i
```
## 查看目录文件数量
```bash
find / -xdev -printf '%h\n' | sort | uniq -c | sort -k 1 -n
```
## 删除文件数目较多的目录即可
```bash
rm -rf <directory>
```

# 日志
## 查找docker容器日志以及显示其大小
```bash
find /var/lib/docker/containers/ -name "*json.log" | xargs du -h | sort -hr

# 380M    /var/lib/docker/containers/<container_id>/<container_id>-json.log
```

## 根据container_id查找docker container name
```bash
docker inspect --format='{{.Name}}' <container_id>

# /<container_name>
```

## 根据container_name查找日志路径
```bash
docker inspect --format='{{.LogPath}}' <container_name>

# <container_log_path>
```

## 删除日志
### 根据路径删除
```bash
truncate -s 0 <container_log_path>
```
### 删除所有container日志
```bash
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

## 设置日志大小限制
### 修改docker配置文件
```bash
vim /etc/docker/daemon.json
```
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```
### 重启docker
```bash
systemctl restart docker
```
### 重启container
#### docker命令启动的container
```bash
docker rm -f <container_id_or_name>
```
#### docker-compose启动的container
```bash
docker compose down
```
```bash
docker compose up -d
```



# 参考文章
1. [docker overlay2占用大量磁盘空间处理方法](https://www.choupangxia.com/2020/01/30/docker-overlay2/)
2. [Reducing Docker Logs Size: A Practical Guide to Log Management](https://linuxiac.com/reducing-docker-logs-file-size/)
3. [因inodes占用资源过多导致no space left on device的问题](https://www.xiaowu95.wang/posts/f193e084/)