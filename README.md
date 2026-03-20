# Fuwari 思源博客发布系统

基于 Astro + Fuwari 改造，目标是把思源笔记里的文档通过受控导入链路发布到博客前台，并把后台导入、冲突处理、本地全文编辑和发布流程统一到一套可控工作流里。

当前仓库已经落地这些能力：

- 前台博客站点，生产访问路径是 `https://li7.linuxdo.space:8443/blog/`
- 管理后台，生产访问路径是 `https://li7.linuxdo.space:8443/blog/admin/import/`
- 思源服务端代理，浏览器不直连思源 Token
- 导入预演、真实写入、导入历史、后台鉴权
- AI 自动打标签
- 冲突详情查看与处理，不再只返回一行模糊 reason
- 单篇全文 Markdown 编辑，支持直接改真实目标文件
- 未导入文档的全文草稿持久化，执行导入时优先使用草稿
- `local_override` 本地优先策略，支持恢复思源同步
- 批量执行遇到冲突时跳过冲突继续写入
- 导入后可触发后台发布任务，重建前台站点

## 目录说明

- `src/pages/admin/`：后台页面
- `src/pages/api/admin/`：后台 API
- `src/utils/admin/`：思源代理、鉴权、导入、编辑器、发布辅助逻辑
- `src/utils/admin/protected-blocks.ts`：受保护块控制
- `.runtime/admin/import-history.json`：导入历史记录
- `.runtime/admin/import-drafts.json`：未导入文档的全文草稿
- `ops/`：生产部署资产
- `docs/deploy-server.md`：服务器部署说明

## 本地开发

```bash
pnpm install
pnpm dev
```

至少准备这些环境变量：

```bash
HOST=127.0.0.1
PORT=4322
SIYUAN_API_URL=http://127.0.0.1:3000
SIYUAN_API_TOKEN=replace-with-your-siyuan-token
CPA_BASE_URL=https://api.example.com
CPA_API_KEY=replace-with-your-cpa-key
CPA_MODEL=replace-with-your-model-name
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret
AUTO_PUBLISH_AFTER_IMPORT=1
PUBLISH_SERVICE_NAME=fuwari-blog-publish.service
```

> `CPA_BASE_URL` / `CPA_API_KEY` / `CPA_MODEL` 用于导入时 AI 自动打标签，不配置则跳过。

## 受控导入模型

系统当前有两套正文策略：

- `managed`
  - 文章由思源受控导入
  - `SYNC` 区块可被思源正文重写
  - `LOCAL` 区块保留本地补充内容
- `local_override`
  - 文章正文以后以本地文件或本地草稿为准
  - 后续导入默认不再用思源正文覆盖
  - 可在后台执行“恢复思源同步”回到 `managed`

受保护区块规则：

- `<!-- SYNC:START --> ... <!-- SYNC:END -->`
- `<!-- LOCAL:START --> ... <!-- LOCAL:END -->`

保护区块状态：

- `managed`：结构完整，可继续受控同步
- `broken`：区块被破坏
- `absent`：区块缺失

导入状态：

- `new`
- `synced`
- `updated`
- `conflict`
- `local_override`

## 后台导入工作流

### 1. 文档选择

- 支持搜索思源文档
- 支持目录树展开与递归选择
- 搜索结果、目录树、任务结果里都可直接进入单篇编辑

### 2. Dry Run

`POST /api/admin/import/jobs/`

预演会生成每篇文档的执行计划，输出：

- `create`
- `update`
- `skip`
- `block`

并带上这些关键信息：

- `targetPath`
- `existingPath`
- `syncStrategy`
- `conflictType`
- `conflictDetail`

### 3. 单篇全文编辑

`GET /api/admin/import/editor/?id=<docId>`
`PUT /api/admin/import/editor/`
`DELETE /api/admin/import/editor/?id=<docId>`

行为规则：

- 已导入文章
  - 读取本地真实 Markdown 文件全文
  - 保存时直接写回目标文件
  - 保存后自动切换为 `local_override`
- 未导入文章
  - 先按当前思源内容生成目标 Markdown
  - 保存时写入 `.runtime/admin/import-drafts.json`
  - 后续执行同步时优先吃这份草稿

### 4. 冲突详情与处理

`POST /api/admin/import/conflicts/resolve/`

当前支持：

- `slug_occupied`
- `batch_duplicate_slug`
- `protected_blocks_invalid`

可执行动作：

- 打开全文编辑器，直接改 frontmatter 中的 `slug`
- `takeover_existing`
  - 接管保护区块损坏/缺失的现有文件
  - 保留现有正文
  - 补必要元数据并切到 `local_override`
- `restore_managed_sync`
  - 清除本地优先状态或未导入草稿
  - 回到受控导入模式

### 5. 批量执行

真实执行仍走：

`POST /api/admin/import/jobs/`

当前规则：

- 非冲突文档继续写入
- 冲突文档保留在结果里，不再整批阻断
- 返回摘要字段：
  - `writtenCount`
  - `newCount`
  - `updatedCount`
  - `skipCount`
  - `conflictCount`
- 发生部分成功时，任务状态为 `attention`

### 6. 真实写入与发布

1. 写入 `src/content/posts/imported/`
2. 图片资源自动下载到 `public/imported-assets/<slug>/`
3. 导入历史写入 `.runtime/admin/import-history.json`
4. 若 `AUTO_PUBLISH_AFTER_IMPORT=1`，自动触发 `fuwari-blog-publish.service`

## 导入优先级

正文与元数据的最终优先级是：

1. 单篇全文草稿 / 本地真实全文
2. 批量 metadata 默认值
3. 思源导出内容

## 生产部署

推荐部署形态：

- Astro Node 适配器跑在 `127.0.0.1:4322`
- Nginx 统一从 `/blog/` 反代
- `systemd` 托管主站服务（`fuwari-blog.service`）和发布服务（`fuwari-blog-publish.service`）

具体命令和配置看 [docs/deploy-server.md](./docs/deploy-server.md)。

## GitHub Actions 部署

仓库内已经提供 `.github/workflows/deploy.yml`，需要准备这些 Secrets：

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `DEPLOY_ENV_FILE`

`DEPLOY_ENV_FILE` 内容模板：

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=4322
SIYUAN_API_URL=http://127.0.0.1:3000
SIYUAN_API_TOKEN=replace-with-your-siyuan-token
CPA_BASE_URL=https://api.example.com
CPA_API_KEY=replace-with-your-cpa-key
CPA_MODEL=replace-with-your-model-name
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret
AUTO_PUBLISH_AFTER_IMPORT=1
PUBLISH_SERVICE_NAME=fuwari-blog-publish.service
KEEP_RELEASES=5
```

注意：

- GitHub Actions 会在 Runner 上完成 `pnpm install`、`pnpm check`、`pnpm build`
- 服务器只接收构建好的 release 包，然后切换 `current` 软链接并重启 `fuwari-blog.service`
- `src/content/posts/imported/`、`public/imported-assets/`、`.runtime/` 会挂到服务器共享目录，避免覆盖已导入文章、资源和历史记录
- 可以在服务器上用 `fuwari-release list`、`fuwari-release current`、`fuwari-release switch <release-id>` 查看和切换版本
