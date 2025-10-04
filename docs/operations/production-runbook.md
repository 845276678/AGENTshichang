# 生产运维总览

> 汇总环境检查、监控指标与测试计划，详细 checklist 存于 `archive/`。

## 环境巡检流程
1. **基础设施**：
   - 确认 ECS/容器实例 CPU < 70%、内存 < 75%、磁盘预留 > 20%。
   - 校验安全组/防火墙对外端口只开放 80/443/8080，数据库仅内网。
2. **服务健康**：
   - `GET /api/health` 返回 200。
   - WebSocket 心跳 `ping/pong` 记录无超时。
   - 三家模型 API 响应 < 3s，限速未触发。
3. **数据层**：
   - Prisma 连接成功，迁移版本与仓库一致。
   - Redis/消息队列（如启用）无积压。

> 详细项请参考 [`archive/environment-check-guide.md`](archive/environment-check-guide.md)。

## 上线前 Checklist
- 对照 [`archive/production-readiness-check.md`](archive/production-readiness-check.md)：
  - 功能覆盖：竞价流程、商业计划生成、导出与积分扣减。
  - 监控告警：AI 调用失败率、WebSocket 断线、数据库连接池。
  - 安全合规：API 速率限制、生僻词过滤、日志脱敏。
- 补充 [`archive/production-testing-plan.md`](archive/production-testing-plan.md)：
  - 核心流程回归、异常分支（余额不足、AI 降级、WebSocket 断线）。
  - 压测场景：并发 100 会话、导出批量计划、AI 服务限流模拟。

## 监控与告警
- 指标体系（来自 `archive/operations-monitoring.md`）：
  - 应用：成功率、P95 响应、ActiveSessions、WebSocket 在线数。
  - AI 服务：调用量、失败率、成本、速率限制命中。
  - 商业指标：竞价完成率、商业计划生成成功率、积分消耗。
- 告警阈值建议：
  - AI 调用失败率 > 5%（5 分钟窗口）。
  - WebSocket 断线率 > 10% 或重连失败>3 次。
  - 数据库连接耗尽超过 2 次/小时。
- 日志策略：
  - 统一格式 `{timestamp} {level} {module} {sessionId}`，保留 30 天。
  - 重大事件需手动标记并同步到事故记录文档。

## 灾备与演练
- 每周执行巡检脚本并记录在运维日志。
- 每月演练一次 AI 服务降级：模拟某家服务不可用，验证 `AIServiceManager` 降级策略。
- 定期验证备份：数据库 `pg_dump` + OSS 静态文件 + 配置文件。

## 附录
- 环境检查清单：[`archive/environment-check-guide.md`](archive/environment-check-guide.md)
- 生产就绪检查：[`archive/production-readiness-check.md`](archive/production-readiness-check.md)
- 测试计划：[`archive/production-testing-plan.md`](archive/production-testing-plan.md)
- 运维监控细则：[`archive/operations-monitoring.md`](archive/operations-monitoring.md)
