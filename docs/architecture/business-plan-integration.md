# 商业计划书系统整合方案

## 目标与范围
- **统一内容结构**：将现有 5 大核心模块、正反馈/90 天执行计划整合为一份可配置的商业计划书模板。
- **生产级交付**：补齐鉴权、额度扣减、数据持久化、审计日志等实践，确保生成过程在生产环境可运行。
- **弹性扩展**：保留对不同创意类型的扩展能力，方便后续增加行业化插件。

## 现状概览
| 模块 | 当前状态 | 问题 |
| --- | --- | --- |
| `/business-plan?sessionId=...` 页面 | 走 `mockGuide`，单页渲染 | 无正反馈/执行计划；数据全在内存 |
| `practical-stage-generator.ts` | 定义了 90 天计划生成（含正反馈） | 未接入 UI/流程；依赖无实际注入 |
| `90天聚焦实战计划详解.md` | 手册级文案 | 无结构化数据；无法个性化 |
| Session API | 仅写入内存 Map | 无数据库、无过期策略、无鉴权 |
| 信用积分 | 500 积分扣减逻辑散落在 `ai-services-integration` | 与新流程未联动 |

## 整体架构
```
+--------------------------+
|   Next.js App Router     |
+--------------------------+
| BusinessPlanController   |
|  ├─ SessionService       |  负责持久化 / 状态校验
|  ├─ BiddingSnapshotRepo  |  从竞价侧读取结果
|  ├─ ContentComposer      |  ⇦★ 本次新增
|      ├─ CoreGuideBuilder |      整合5大核心模块
|      ├─ PracticalPlanner |      调用 practical-stage-generator
|      └─ TemplateLibrary  |      读取 Markdown/JSON 模板
|  └─ CreditService        |  积分校验/扣费
+--------------------------+
         ↓ REST/HTTP
+--------------------------+
|   AI Service Orchestrator|  统一托管 DeepSeek/GLM 等
+--------------------------+
|    PostgreSQL / Redis    |
+--------------------------+
```

## 关键设计
### 1. 数据模型调整
| 表 | 字段 | 说明 |
| --- | --- | --- |
| `business_plan_sessions` | `id`, `user_id`, `idea_id`, `snapshot (jsonb)`, `status`, `expires_at`, `created_at` | 替代内存 Map；`snapshot` 存竞价摘要 + 聚合结果 |
| `business_plan_reports` | `id`, `session_id`, `guide (jsonb)`, `version`, `metadata`, `created_at`, `updated_at` | 上线后可缓存最终指南 |
| `business_plan_audit` | `id`, `session_id`, `action`, `payload`, `created_by`, `created_at` | 追踪生成/下载/分享 |

> Redis 可选用于加速 `session` + `report` 缓存；DB 落地为权威来源。

### 2. 后端流程
1. **入口**：竞价页点击生成 → `POST /api/business-plan-session`
   - 校验 `JWT`/Session；读取用户积分（积分不足直接报错）。
   - 调用 `BiddingSnapshotRepo` 获取最新竞价结果（避免传大 JSON）。
   - 扣积分（使用事务 + 乐观锁）。
   - 在 `business_plan_sessions` 插入记录，状态 `pending`。
2. **内容编排**（`ContentComposer`）
   - `CoreGuideBuilder`：根据竞价数据生成 5 个核心模块。
   - `PracticalPlanner`：组装正反馈/90 天计划。
     - 读取 Markdown 模板（90 天文档）并根据上下文填充占位符，或
     - 直接调用 `PracticalStageGenerator.generatePracticalStageContent(context)`。
   - `TemplateLibrary`：行业/阶段模板，可扩展为 JSON Schema。
   - 最终合并为 `LandingCoachGuide` 结构（新字段需扩展该 interface）。
3. **持久化**
   - 成功后将 `guide` 存到 `business_plan_reports`，`session.status` → `completed`。
   - 失败时 `status` → `failed`，写 `audit`，回滚积分。
4. **前端展示**
   - `/business-plan` 根据 `sessionId` 拉取 `report`。
   - Skeleton + 渐进渲染，按模块折叠：
     1. 专家评估 (`aiInsights`)
     2. 商业模式 (`businessModel`)
     3. 市场洞察 (`marketAnalysis`)
     4. 落地路线 (`implementationPlan` + 正反馈子模块)
     5. 财务/指标 (`financialProjections`)
     6. 90 天实战计划（新增大模块，含周计划/里程碑/正反馈机制）
   - 提供导出按钮（PDF/Markdown），下载时走 `GET /api/business-plan-report/:id/export`。
5. **导出 API**
   - `GET /api/business-plan-report/:id/export` 需鉴权，确保请求用户与报告归属。
   - 默认输出 Markdown；通过 `?format=pdf` 可生成 PDF，成功后写入 `BusinessPlanAudit`（action=`REPORT_EXPORTED`）。
   - PDF 渲染基于 `@react-pdf/renderer`，接口已设置 `dynamic = "force-dynamic"` 以兼容 serverless 渲染。
   - 导出响应设置 `Content-Disposition` 附带规范化文件名，缓存策略使用 `Cache-Control: no-store`。


### 3. practical-stage-generator 整合
- **上下文输入**：`PracticalStageContext` 需要 `ideaDescription`、`userGoals`、`previousStagesOutput`；竞价输出中已有 `ideaContent`、`aiMessages`，可以映射：
  - `userGoals.shortTerm` ← 竞价中的支持者目标 or 用户填写
  - `scenario` ← 90 天 Markdown 模板中的行业分组
  - `previousStagesOutput` ← CoreGuideBuilder 结果
- **调用方式**：在 `ContentComposer` 中 new `PracticalStageGenerator`，按阶段（技术/需求/正反馈/商业验证）生成，组合成一张 90 天甘特表。
- **正反馈机制**：生成器第 4 阶段已有 `## 正反馈机制设计`，直接将 `output.content.sections` 挂到新模块 `executionPlan.feedbackLoop`。
- **模板同步**：`90天聚焦实战计划详解.md` 切成结构化 JSON（或移至 `TemplateLibrary`），用于 fallback/国际化。

### 4. 安全与限流
- 每个用户 24 小时最多生成 N 次（防刷 & 成本控制）。
- 对接积分系统的扣减需幂等（基于 `sessionId`）。
- 生成中断时，允许通过 `POST /api/business-plan-session/:id/retry` 恢复。
- 审计日志包括请求参数、AI 模型调用次数、耗时，便于成本分析。

### 5. 运维与监控
- **指标**：
  - 生成成功率（Completed / Created）
  - 平均生成时长、P95
  - 积分扣减失败率
  - AI 服务响应时间/错误率
- **日志**：使用 `pino`/`winston` + ELK；关键日志打 `sessionId`。
- **报警**：生成失败连续 >3 次、AI 额度超阈值、积分扣减回滚触发告警。

### 6. 测试策略
- 单测：`ContentComposer` 输出结构、`PracticalStageGenerator` 输入输出。
- 集成：`POST /business-plan-session` → DB → `GET /business-plan`。
- 端到端：Vitest/Playwright，模拟竞价→生成→查看。
- 负载：压测 `ContentComposer` 与外部 AI 调用，确保在并发时资源充足。

## 里程碑规划
| 阶段 | 预计 | 关键产出 |
| --- | --- | --- |
| M1 架构改造 | 1 周 | 数据表迁移、SessionService、积分幂等 |
| M2 内容编排 | 1.5 周 | ContentComposer、PracticalPlanner、模板 JSON 化 |
| M3 前端 UI + 导出 | 1 周 | 新模块渲染、下载、自适应布局 |
| M4 灰度 + 监控 | 0.5 周 | 限流、日志、Grafana 面板 |

## 落地注意事项
- 90 天文档需与产品一起维护（可放入 CMS 或 S3，支持多语言）。
- practical-stage-generator 依赖 AI 服务，需确认 prompt 合规及 token 成本。
- PDF 导出可考虑 `@react-pdf/renderer` 或 serverless Puppeteer，需加超时保护。
- 生产环境务必开启缓存、retry、防抖机制，避免 AI 服务抖动导致多次扣费。

---

该方案整合了现有五大核心模块与 90 天实战/正反馈内容，同时覆盖后端持久化、AI 调度、前端展示和运维要求，可作为后续开发基线。请审阅后指示下一步。

