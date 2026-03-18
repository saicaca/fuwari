# 服务器部署说明

## 部署形态

- 外网入口：`https://li7.linuxdo.space:8443/blog/`
- 后台入口：`https://li7.linuxdo.space:8443/blog/admin/import/`
- Node 服务监听：`127.0.0.1:4322`
- 主服务：`fuwari-blog.service`
- 发布服务：`fuwari-blog-publish.service`
- 项目根目录：`/www/wwwroot/fuwari-blog`
- 当前版本软链接：`/www/wwwroot/fuwari-blog/current`
- 版本目录：`/www/wwwroot/fuwari-blog/releases/<release-id>`
- 共享目录：`/www/wwwroot/fuwari-blog/shared`

## 目录结构

```bash
/www/wwwroot/fuwari-blog/
├── current -> /www/wwwroot/fuwari-blog/releases/20260318-131200-c0f8fdc
├── incoming/
├── releases/
│   ├── 20260318-131200-c0f8fdc/
│   └── 20260318-140500-publish/
└── shared/
    ├── .env.production
    ├── runtime/
    ├── content/posts/imported/
    └── public/imported-assets/
```

说明：

- GitHub Actions 在 Runner 上构建完整 release 包，再上传到 `incoming/`
- `deploy-server.sh` 在服务器上解压到 `releases/<release-id>/`
- `current` 只负责指向当前在线版本
- `shared/.env.production` 独立于 release，切版本不会丢
- `shared/content/posts/imported/` 会在部署时挂进 release，保留后台导入的文章
- `shared/public/imported-assets/` 会在部署时挂进 release，保留后台导入下载的图片
- `shared/runtime/` 会在部署时挂进 release，保留导入历史等运行时数据

## 首次部署

1. 先准备 GitHub Actions Secrets：

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `DEPLOY_ENV_FILE`

2. `DEPLOY_ENV_FILE` 至少包含：

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=4322
SIYUAN_API_URL=http://127.0.0.1:3000
SIYUAN_API_TOKEN=replace-with-your-siyuan-token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret
AUTO_PUBLISH_AFTER_IMPORT=1
PUBLISH_SERVICE_NAME=fuwari-blog-publish.service
KEEP_RELEASES=5
```

3. 手动触发一次仓库内 `Deploy to Server` 工作流。

首发成功后会自动完成这些事：

- 创建 `incoming/`、`releases/`、`shared/`
- 安装/更新 `fuwari-blog.service`
- 安装/更新 `fuwari-blog-publish.service`
- 安装版本管理命令 `fuwari-release`
- 切换 `current`
- 重启主服务并做健康检查

## GitHub Actions 实际流程

工作流现在是这条链路：

1. GitHub Runner `checkout` 对应 commit
2. Runner 执行 `pnpm install`、`pnpm check`、`pnpm build`
3. Runner 打包完整 release（包含 `dist/`、源码、`node_modules/`、`ops/`、`REVISION`）
4. Release 包上传到服务器 `incoming/<release-id>.tar.gz`
5. 服务器执行 `ops/deploy-server.sh`
6. `deploy-server.sh` 解包到 `releases/<release-id>/`
7. `current` 切到新版本
8. `systemctl restart fuwari-blog.service`
9. 本机健康检查通过后完成部署；失败则自动回滚到上一个版本

## Nginx 路由

把 `ops/nginx/fuwari-blog.location.conf` 里的两个 `location` 段加入：

- `/www/server/panel/vhost/nginx/li7.linuxdo.space.conf` 的 `8080` server
- `/www/server/panel/vhost/nginx/li7.linuxdo.space.conf` 的 `8443 ssl` server

然后执行：

```bash
/www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf
/www/server/nginx/sbin/nginx -s reload -c /www/server/nginx/conf/nginx.conf
```

## 版本查看与手动切换

查看当前版本：

```bash
fuwari-release current
```

查看历史版本：

```bash
fuwari-release list
```

手动切到某个版本：

```bash
fuwari-release switch 20260318-131200-c0f8fdc
```

切换命令会自动：

- 修改 `current` 软链接
- 重启 `fuwari-blog.service`
- 做健康检查
- 失败时自动回滚

## 导入后的发布链路

后台导入仍然保留自动发布，但现在也走 release 机制：

1. 后台导入写入 `shared/content/posts/imported/*.md`
2. 异步触发 `fuwari-blog-publish.service`
3. 发布服务基于当前版本复制出一个新 release
4. 在新 release 内执行 `pnpm build`
5. 构建成功后切换 `current`
6. 重启主服务并做健康检查

这样后台发布失败时，不会直接把当前在线版本的 `dist/` 打残。

## 常用排障命令

```bash
systemctl status fuwari-blog.service --no-pager
systemctl status fuwari-blog-publish.service --no-pager
journalctl -u fuwari-blog.service -n 50 --no-pager
journalctl -u fuwari-blog-publish.service -n 50 --no-pager
fuwari-release current
fuwari-release list
readlink -f /www/wwwroot/fuwari-blog/current
```

## 风险点

- release 包会包含 `node_modules/`，单次部署上传体积会比纯源码同步大
- 服务器部署不再依赖本地构建，但后台导入后的发布仍会在服务器上执行一次 `pnpm build`
- `KEEP_RELEASES` 太小会影响回滚窗口，太大则会占磁盘
- 如果手动改了 `shared/.env.production`，需要重启服务才能让主进程读到新环境变量
