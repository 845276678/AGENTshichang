# 部署与交付指引

> 结合 `archive/` 内的部署文档，统一整理生产、预发与多云环境的上线手册。

## 基本流程
1. 准备环境变量（AI Key、数据库、Redis、S3/OSS）。
2. 执行 `pnpm build && pnpm prisma migrate deploy`，确认无 schema drift。
3. 通过 `pnpm deploy:server` 运行自定义脚本，将 Next.js 构建产物与 `server.js` 同步至服务器。
4. 运行 `pm2 reload all` 或平台原生命令滚动重启，期间监控健康检查与日志。

## 自动脚本与工具
- `deploy.ps1`/`deploy.sh`：一键执行依赖安装、打包、上传与回滚点创建。
- `sync-env.ts`：校验必填环境变量并输出缺失项。
- 日志采集：默认使用 `pm2 logs`，可选对接 Aliyun SLS 或 Zeabur 内置面板。

## 阿里云部署要点
- 基础设施：ECS + SLB + RDS（Postgres）+ OSS。
- 安全组：开放 80/443/8080，限制数据库只允许内网访问。
- Nginx 反向代理示例在 `archive/aliyun-setup-guide.md` 中，需启用 gzip、WebSocket 升级与缓存策略。
- 建议使用 OSS 存储静态资源与导出的商业计划文件，定期同步到备份桶。

## Zeabur / Serverless 方案
- 通过仪表盘挂载 Git 仓库，设置 Build Command `pnpm install && pnpm build`。
- 环境变量在项目面板集中管理；注意将 AI Key 标记为 Secret。
- 强制开启健康检查路径 `/api/health`，避免冷启动超时。
- 若遇到 502，可参照 `archive/zeabur-deployment-guide.md` 中的排查列表（流量配置、区域选择、超时策略）。

## 生产上线前检查
- 使用 `archive/production-readiness-check.md` 的清单覆盖：
  - 基础设施（CPU、内存、磁盘、带宽）。
  - 应用层（API、WebSocket、AI 服务限速）。
  - 安全与监控（告警接入、日志留存、应急联系人）。
- 结合 `archive/production-environment-check.md`、`archive/production-testing-plan.md` 逐项验证功能、回归和压测。

## 回滚与故障预案
- 部署脚本自动创建时间戳压缩包，可通过 `deploy --rollback <timestamp>` 快速恢复。
- 数据库迁移回滚前务必执行 `pg_dump`。
- 常见问题：
  - 502：检查反向代理转发头、服务器健康状态、AI 服务限流。
  - 构建失败：按照 `archive/deployment-scripts.md` 提供的依赖清理方案处理。
  - Docker 依赖冲突：参考 `docs/incidents/archive/docker-build-fix.md`。

## 附录
- 详细脚本与分步截图：[`archive/deployment-scripts.md`](archive/deployment-scripts.md)
- 阿里云接入手册：[`archive/aliyun-setup-guide.md`](archive/aliyun-setup-guide.md)
- 生产环境部署细节：[`archive/production-deployment-guide.md`](archive/production-deployment-guide.md)
- Zeabur 调试记录：[`archive/zeabur-deployment-guide.md`](archive/zeabur-deployment-guide.md)
