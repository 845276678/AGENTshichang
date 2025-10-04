# 2025-10 关键事件汇总

> 以下为 2025-10-04 前后发生的生产事故与修复记录，详见 `archive/` 目录中的原始报告。

## 1. 认证时序问题（2025-10-02）
- 现象：WebSocket 连接早于 JWT 验证完成导致 401；前端二次重连触发限流。
- 处理：在后端增加 `verifyToken` 阻塞初始化；前端延迟 500ms 拉起 WS，并增加指数退避。
- 后续动作：写入统一健康检查、补充登陆链路监控。
- 详见 [`archive/authentication-timing-fixes.md`](archive/authentication-timing-fixes.md)。

## 2. 商业计划生成失败（2025-10-03）
- 现象：竞价完成后生成商业计划超时，数据库成本字段未回滚。
- 处理：拆分长任务为阶段调用、引入幂等锁；补记账本回滚逻辑。
- 后续：增加压测、设置 AI 服务备用提供商。
- 报告：[`archive/business-plan-generation-fix.md`](archive/business-plan-generation-fix.md)，[`archive/final-root-cause-analysis.md`](archive/final-root-cause-analysis.md)，[`archive/root-cause-analysis.md`](archive/root-cause-analysis.md)。

## 3. 生产 502 事件（2025-10-04）
- 现象：部署后 502，Nginx 未转发 WebSocket，PM2 旧进程占用 8080。
- 处理：统一使用滚动部署脚本、在 Nginx 中补全 `Upgrade` 头、PM2 reload。
- 成果：同日发布成功报告，详见：
  - [`archive/deployment-issue-2025-10-04.md`](archive/deployment-issue-2025-10-04.md)
  - [`archive/deployment-fix-2025-10-04.md`](archive/deployment-fix-2025-10-04.md)
  - [`archive/deployment-success-2025-10-04.md`](archive/deployment-success-2025-10-04.md)

## 4. Docker 构建冲突
- 现象：多平台构建时 Alpine 镜像缺失 `python3`、`make`，导致 `node-gyp` 失败。
- 处理：在 Dockerfile 中补装构建依赖；缓存 pnpm store，并清理旧 peer deps。
- 文档：[`archive/docker-build-fix.md`](archive/docker-build-fix.md)。

## 5. 换行符 & Git 配置
- 现象：Windows 端提交 CRLF，引发 Prisma 迁移失败与脚本 diff。
- 处理：仓库设置 `.gitattributes` 强制 LF；提供脚本批量修复历史文件。
- 参考：[`archive/line-ending-fixes.md`](archive/line-ending-fixes.md)`、`[`archive/line-ending-issues-resolution.md`](archive/line-ending-issues-resolution.md)。

## 6. 同类问题审计
- 关联排查：梳理同类事故、共享复盘模板。
- 文档：[`archive/similar-issues-audit.md`](archive/similar-issues-audit.md) 与 [`archive/work-summary-2025-10-04.md`](archive/work-summary-2025-10-04.md)。

## 快速回顾表
| 事件 | 影响面 | 修复用时 | 关键动作 |
|------|--------|----------|----------|
| 认证时序 | 登录/WS | 2h | 顺序化校验、延迟重连 |
| 商业计划 | AI 生成 | 6h | 阶段拆分、消息幂等锁 |
| 生产 502 | 全站 | 4h | Nginx 配置、PM2 滚动重启 |
| Docker 冲突 | CI 构建 | 1h | 补依赖、清缓存 |
| 换行符 | 全平台 | 3h | `.gitattributes`、批量转换 |

> 若需复盘模板或完整日志，请直接打开各 Archive 文档。
