---
title: 部署minio
published: 2024-10-23
description: 在macmini中搭建minio服务
image: ./cover.png
tags: [minio]
category: Service
draft: false
---

# 下载minio
```
brew install minio/stable/minio
```

# 配置nginx
```
# Upstream definitions
upstream minio {
    server <minio ip>:<port>;
}

upstream console {
    ip_hash;
    server <minio ip>:<console port>;
}

# MinIO API Server
server {
    listen <port> ssl;
    server_name minio-api.beocean.net;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_certificate /etc/ssl/beocean.net/certificate.crt; # ssl证书存储路径
    ssl_certificate_key /etc/ssl/beocean.net/private.key; # 秘钥存储路径
    # Uncomment the following line if you have a dhparam file
    # ssl_dhparam /etc/letsencrypt/dhparam.pem;

    client_max_body_size 0;
    proxy_buffering off;
    ignore_invalid_headers off;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;

        proxy_pass http://minio;
    }
}

# MinIO Console Server
server {
    listen <port> ssl;
    server_name minio.beocean.net;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_certificate /etc/ssl/beocean.net/certificate.crt; # ssl证书存储路径
    ssl_certificate_key /etc/ssl/beocean.net/private.key; # 秘钥存储路径
    # Uncomment the following line if you have a dhparam file
    # ssl_dhparam /etc/letsencrypt/dhparam.pem;

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

        chunked_transfer_encoding off;

        proxy_pass http://console;
    }
}
```

# 配置环境变量
```
export MINIO_ROOT_USER=<username>
export MINIO_ROOT_PASSWORD=<password>
```

# 启动minio
```
screen

nohup minio server /path --address ":<port>" --console-address ":<console port>"  &
```

# 附录
1. [python-sdk地址](https://min.io/docs/minio/linux/developers/python/minio-py.html)
2. [参考文章](https://medium.com/@eng.fadishaar/configuring-nginx-proxy-for-minio-server-using-docker-compose-39921092e050)
