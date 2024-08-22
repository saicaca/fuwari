---
title: 【翼龙面板搭建 EP2】前端的安装
published: 2023-07-19
description: ''
image: ''
tags: [Pterodactyl Panel,不再更新]
category: '教程'
draft: false 
---
## EP2：翼龙前端

我这个香港机的很多服务都是 Docker 内运行的，一开始还感觉不行，细看文档后，可以是可以，但是看的我好晕……

由于我已经安装过 1panel，所以就直接借用 1panel 来部署了

关于 1panel 的安装，请查看 [EP1](/posts/pterodactyl-ep1)

先在 1panel 建一个新的站，选择运行环境，然后选择反向代理或者静态网站，如图

![weAA.png](https://img.yiair.cc/images/weAA.png)

其他东西就根据自己的需求来填就好了

### 下载文件

找一个你觉得合适的目录，好记的或者够短的，总之你觉得合适就行

以我为例，SSH 连接服务器后，创建`/opt/pterodactyl`并进入

```
mkdir -p /opt/pterodactyl
cd /opt/pterodactyl
```
创建好目录后，就该拉取`docker-compose.yml`了，如下

```
curl -Lo docker-compose.yml https://raw.githubusercontent.com/pterodactyl-china/panel/1.0-develop/docker-compose.example.yml
# 将可执行权限应用于yml文件
chmod +x docker-compose.yml
```

接下来在 1panel 里进入网站目录，编辑`docker-compose.yml`，配置相关信息

以下是直接从文档照搬的东西，不需要的可以直接跨过去

### 配置说明
#### 环境变量
当您不提供自己的 `.env` 文件时，有多个环境变量可以配置面板，有关每个可用选项的详细信息，请参见下表。

注意：如果您的 `APP_URL` 以 `https://` 开头，您还需要提供 `LE_EMAIL` 以便生成证书。

| 变量               | 描述                           | 必需项 |
|------------------|------------------------------|-----|
| `APP_URL`        | 可以访问面板的 URL（包括协议）            | 是   |
| `APP_TIMEZONE`   | 面板所使用的时区                     | 是   |
| `LE_EMAIL`       | 用于生成 letsencrypt 证书的邮箱       | 是   |
| `DB_HOST`        | MySQL 主机                     | 是   |
| `DB_PORT`        | MySQL 端口                     | 是   |
| `DB_DATABASE`    | MySQL 数据库名称                  | 是   |
| `DB_USERNAME`    | MySQL 用户名                    | 是   |
| `DB_PASSWORD`    | 指定用户的 MySQL 密码               | 是   |
| `CACHE_DRIVER`   | 缓存驱动程序（详见[缓存驱动程序](#缓存驱动程序)）。 | 是   |
| `SESSION_DRIVER` |                              | 是   |
| `QUEUE_DRIVER`   |                              | 是   |
| `REDIS_HOST`     | Redis 数据库的主机名或IP地址            | 是   |
| `REDIS_PASSWORD` | 用于保护 redis 数据库的密码            | 可选  |
| `REDIS_PORT`     | Redis 数据库端口                | 可选  |
| `MAIL_DRIVER`    | 邮件驱动程序（详见 [邮件驱动程序](#邮件驱动程序)） | 是   |
| `MAIL_FROM`      | 发件邮箱                         | 是   |
| `MAIL_HOST`      | 邮件驱动主机                       | 可选  |
| `MAIL_PORT`      | 邮件驱动端口                       | 可选  |
| `MAIL_USERNAME`  | 邮件驱动用户名                     | 可选  |
| `MAIL_PASSWORD`  | 邮件驱动密码                       | 可选  |

##### 缓存驱动程序
您可以根据自己的喜好选择不同的缓存驱动程序。
我们推荐在使用 docker 时使用 redis，因为它可以在容器中轻松启动。

| 驱动程序   | 描述                                 | 所需变量                                               |
| -------- | ------------------------------------ | ------------------------------------------------------ |
| redis    | redis 运行的主机          | `REDIS_HOST`                                           |
| redis    | redis 运行的端口             | `REDIS_PORT`                                           |
| redis    | redis 数据库密码              | `REDIS_PASSWORD`                                       |

#####  邮件驱动程序
你可以根据你的需要选择不同的邮件驱动。
每个驱动程序都需要设置 `MAIL_FROM`。

| 驱动程序   | 描述                                 | 所需变量                                                       |
| -------- | ------------------------------------ | ------------------------------------------------------------- |
| mail     | 使用已安装的php邮件                   |                                                               |
| mandrill | [Mandrill](http://www.mandrill.com/) | `MAIL_USERNAME`                                               |
| postmark | [Postmark](https://postmarkapp.com/) | `MAIL_USERNAME`                                               |
| mailgun  | [Mailgun](https://www.mailgun.com/)  | `MAIL_USERNAME`, `MAIL_HOST`                                  |
| smtp     | 任何SMTP服务器都可以配置               | `MAIL_USERNAME`, `MAIL_HOST`, `MAIL_PASSWORD`, `MAIL_PORT`    |

设置完之后，我们就该启动面板了

```
docker-compose up -d
```

如果一切正常，你可以在 1panel 的容器界面看到一个名为``的容器

接下来我们将添加首位用户，也就是管理员用户

```
docker-compose exec panel php artisan p:user:make
```

账号的密码应该满足以下条件：8 个字符，大小写混合，至少一个数字

接下来就是反代前端以及连接后端了