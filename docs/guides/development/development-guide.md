# 开发协作总览

> 汇总自 `archive/` 内的详细文档，覆盖端到端研发节奏、后端/前端规范与本地环境要求。

## 项目节奏速览
- 采用 12 周滚动计划：
  - 第 1-2 周：完成基础设施、账号体系与设计系统落地。
  - 第 3-6 周：实现竞价核心流程、AI 服务编排与数据埋点。
  - 第 7-9 周：补齐高级功能（商业计划、信用体系、运营看板）。
  - 第 10-12 周：执行全链路压测、灰度发布与用户反馈闭环。
- 每周例行 2 次站会 + 周报，借助 Roadmap 看板追踪 `Todo → In Progress → Review → Done`。

## 数据与后端策略
- 数据层分三阶段扩展：
  - 基础层：账号、创意、竞价、AI 调用日志表。
  - 扩展层：积分账本、会话快照、运营指标（留存、GMV）。
  - 高级层：画像与推荐、事件溯源、归档视图。
- 后端服务遵循 `apps/api/**` 模块化结构，重点 API：
  - 认证登录 + 积分校验。
  - 竞价会话管理（创建、状态轮询、WebSocket 广播）。
  - 商业计划生成队列（生成、导出、审计）。
- 测试与发布要求：
  - 单测覆盖核心工具与流程编排。
  - 每日冒烟检查：健康检查、数据库连接、AI 调用限速、WebSocket 心跳。

## 前端实现要点
- 技术栈：Next.js App Router + Zustand + Tailwind；组件库自建（StageBasedBidding、UnifiedBiddingStage、LandingCoachDisplay）需保持无状态组合。
- UI/状态指南：
  - 所有阶段面板使用 Skeleton + Streaming 提升感知速度。
  - WebSocket 数据与乐观更新分离，统一用 `useBiddingWebSocket`、`useBusinessPlanGeneration`。
  - 表单与多步流程提供失败重试与可视化进度。
- 可访问性与国际化：优先保证中文体验，在组件层预留 `aria` 属性与多语言文案文件。

## 本地开发环境
- 依赖：Node 18.17+、PNPM、Docker Desktop、Redis（可选）。
- 初始化：
  1. `pnpm install`；
  2. 复制 `.env.example`→`.env.local`，填入三家模型的 API Key；
  3. 启动 `pnpm dev`（Next.js）与 `pnpm ws`（本地 WebSocket 服务）。
- 常见问题：
  - 若 Docker 构建失败，删除 `node_modules/.pnpm` 并重试。
  - Windows 环境注意 Git 换行符设置 `core.autocrlf=false`。

## 协作规范
- Git：`feature/{module}-{short-desc}`，禁止直接向 `master` 推送；提交遵循 `type(scope): message`。
- Code Review：
  - 后端关注鉴权、成本控制、异常重试。
  - 前端关注延迟处理、错误状态、可用性。
- 质量门禁：PR 必须附带自测结果、核心截图或接口返回；重大改动更新文档并通知运维群。

## 附录
- 详细流程与脚本：[`archive/development-workflow-guide.md`](archive/development-workflow-guide.md)
- 后端接口清单：[`archive/backend-api-guide.md`](archive/backend-api-guide.md)
- 前端组件规范：[`archive/frontend-development-guide.md`](archive/frontend-development-guide.md)
- 本地环境排错：[`archive/local-development-guide.md`](archive/local-development-guide.md)
