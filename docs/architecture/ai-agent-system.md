# AI Agent 系统总览

> 本文汇总竞价舞台与商业计划生成两条核心链路，替换 docs/architecture/bidding-page-architecture.md 与 docs/architecture/business-plan-page-architecture.md 的旧版描述。

## 1. 总体结构
- "竞价舞台"：用户提交创意后，由五位 persona AI 进行暖场、讨论、竞价。
- "商业计划"：竞价完成或用户直接进入后，生成多阶段落地方案并产出报告。
- 核心 AI 服务统一由 AIServiceManager/AIServiceFactory调度，当前仅对接 **DeepSeek、智谱 GLM、通义千问**。

`
用户 -> 前端页面 -> Next.js API Route -> AI 服务 (DeepSeek/Zhipu/Qwen)
                            ↘ WebSocket -> 前端实时 UI
                            ↘ Prisma/Postgres 持久化 (商业计划)
`

## 2. 竞价舞台（Bidding）
### 2.1 前端关键组件
- StageBasedBidding 负责创意提交、阶段切换与整体布局。
- UnifiedBiddingStage 呈现五位专家面板、阶段信息与商业计划入口。
- useBiddingWebSocket 订阅 server.js 推送的 i_message、phase_change、i_bid 等事件。

### 2.2 后端主要模块
- POST /api/bidding：创建会话，写入内存的 ctiveSessions，并触发 startAIBiddingDialogue。
- server.js：维护 WebSocket 连接，广播阶段事件与 AI 消息。
- AIServiceManager：根据 persona 选择 DeepSeek/智谱/Qwen，注入 SYSTEM_PROMPTS 和 uildUserPrompt() 拼装的上下文。

### 2.3 Prompt 与 persona
- Persona 定义在 src/lib/ai-service-manager.ts 与 src/lib/ai-persona-system.ts，覆盖技术、商业、体验、营销、投资五种视角。
- uildUserPrompt() 按阶段（暖场/讨论/竞价）附加额外指令，确保回复符合流程。

### 2.4 数据流
`
创意提交 -> POST /api/bidding -> activeSessions -> setTimeout 触发暖场
AI 响应 -> AIServiceManager -> server.js -> WebSocket -> 前端渲染
竞价结束 -> business_report -> 可选触发 POST /api/business-plan-session
`

## 3. 商业计划生成（Business Plan）
### 3.1 会话管理
- BusinessPlanSessionService 负责扣除积分、保存 BusinessPlanSession、写入 BusinessPlanReport。
- API 入口：POST /api/business-plan-session、GET /api/business-plan-session、GET /api/business-plan-report/[id]/export。

### 3.2 内容生成引擎
- StageContentGenerator：根据 BUSINESS_PLAN_STAGES 顺序执行九个阶段，映射到 DeepSeek/智谱/通义。
- PracticalStageGenerator 与 	hree-month-focused-generator：生成更贴地的行动方案，同样使用三家服务。
- 各阶段 prompt 写在对应的 generator 内部，无需依赖 i-prompts.ts。

### 3.3 前端渲染
- BusinessPlanPage / LandingCoachDisplay 读取会话或报告，展示阶段进度、重点摘要与导出入口。
- useBusinessPlanGeneration 负责状态同步，支持从竞价页跳转后的自动加载。

### 3.4 数据持久化
- BusinessPlanSession：保存来源、状态、积分消费等信息。
- BusinessPlanReport：存储生成的 Markdown/JSON 内容与元数据。
- BusinessPlanAudit：记录操作轨迹（创建、生成、导出、删除）。

## 4. AI 服务矩阵
| Provider | 架构位置 | 典型场景 |
|----------|----------|----------|
| DeepSeek (DEEPSEEK) | 竞价 persona：Alex、Ivan；商业计划：创意落地、商业模式、Investor Pitch | 技术、战略、综合复盘 |
| 智谱 GLM (ZHIPU) | 竞价 persona：Beta、Charlie 备份；商业计划：MVP、风险、实施路线 | 中文逻辑性强、结构化输出 |
| 通义千问 (ALI) | 竞价 persona：Delta；商业计划：市场现状、运营、财务 | 市场/数据总结与执行方案 |

> 旧版对接的文心、星火、混元等已经退场，相关模板将集中在 docs/archive/ 以备查（见后续清理步骤）。

## 5. 清理建议
- 本文发布后，可删除 docs/architecture/bidding-page-architecture.md 与 docs/architecture/business-plan-page-architecture.md，避免内容分叉。
- 同时更新 docs/ai-services-integration.md，仅保留现役三家供应商并加入密钥配置指引。
- 若需要历史记录，可将原文迁移至 docs/archive/ 目录（建议保留 Git 历史即可，不再保留文件）。

