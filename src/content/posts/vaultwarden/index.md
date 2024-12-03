---
title: 家里云部署 vaultwarden
published: 2024-11-02
description: 通过 vps 中转访问家里云搭建的 vaultwarden
tags: [vaultwarden]
category: Service
image: ./images/vaultwarden.png
draft: false
---

# 进入你的项目目录
```bash
$ cd <your vaultwarden project path>
```

# 创建 docker-compose.yml
```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    environment:
      DOMAIN: <your vaultwarden domain>
      # SIGNUPS_ALLOWED: "false" # 是否允许注册
      ROCKET_TLS: '{certs="/ssl/certificate.crt",key="/ssl/private.key"}'
    volumes:
      - <宿主机挂载数据目录路径>:/data
      - <宿主机证书存放目录>:/ssl # 与上面ROCKET_TLS配置对应
    ports:
      - <宿主机端口>:80
```

# 运行服务
```bash
$ docker-compose up -d
```

# 配置 VPS nginx
```shell
server {
    listen <VPS监听 PORT> ssl;
    server_name <your vaultwarden domain>;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_certificate /path/to/certificate.crt; # ssl证书存储路径
    ssl_certificate_key /path/to/private.key; # 秘钥存储路径

    client_max_body_size 0;
    proxy_buffering off;
    ignore_invalid_headers off;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-NginX-Proxy true;

        real_ip_header X-Real-IP;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass https://<家里云 IP>:<家里云 监听 PORT>;
    }
}
```

# 检查并重启 nginx
```bash
$ nginx -t
$ service nginx restart
```

# 参考文章
1. [Vaultwarden Wiki 中文版](https://rs.ppgg.in/)