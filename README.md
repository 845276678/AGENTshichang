## AI Agent 市场（AI Agent Market）

一个面向创意者与开发者的 AI Agent 平台：提交创意、AI 投资者竞价、工作坊指导完善方案，并输出可落地的商业计划与执行建议。

在线体验：`https://aijiayuan.top`

### 目录
- 概览
- 平台功能
- 架构概述
- 主要模块
- 快速开始
- 部署与运维
- 文档索引
- 目录结构（简）
- 版权与联系

---

### 概览
AI Agent 市场提供从创意提交、AI 评估竞价、专业工作坊到商业计划生成的一体化流程，帮助个人或团队快速完成从想法到验证的闭环。

### 平台功能
- 创意竞价与增强：提交想法，AI 竞价评估与补充完善
- 专业工作坊：需求验证、MVP 构建、增长黑客、商业模式等流程化指导（支持匿名体验）
- 商业计划生成：模块化生成报告与可执行建议
- 仪表盘与监控：运行指标、性能监控、告警联动

相关文档：
- `docs/product/platform-features.md`
- `deliverables/03-用户体验设计.md`

### 架构概述
- 前端：Next.js(App Router) + TypeScript + Tailwind + Framer Motion
- 后端接口：Next.js API Routes（/src/app/api/...）
- 数据层：Prisma + PostgreSQL（`prisma/schema.prisma`）
- 监控与运维：Prometheus + Alertmanager + Grafana（参考 `docker/`）

架构说明：
- `docs/architecture/ai-agent-system.md`
- `docs/architecture/ai-agent-system-technical-docs.md`
- `deliverables/01-技术架构设计文档.md`

### 主要模块
- 市场与竞价：`src/components/bidding/*`，`src/app/marketplace`
- 工作坊体系：`src/app/workshops` 与 `src/components/workshop/*`，会话管理 Hook `src/hooks/useWorkshopSession.ts`
- 商业计划生成：`src/lib/business-plan/*` 与页面 `src/app/business-plan`
- 账户与权限：`src/contexts/AuthContext.tsx`，`src/app/auth/*`
- 监控：`src/components/monitoring/*`，`src/app/api/monitoring/*`

### 快速开始
1) 克隆与安装
```bash
git clone <your-repo>
cd AIagentshichang
npm install
```

2) 环境变量与数据库
- 参考 `docs/operations/production-runbook.md`、`docs/guides/deployment/deployment-guide.md`
- 配置数据库连接后执行：
```bash
npx prisma migrate deploy
npx prisma generate
```

3) 本地运行
```bash
npm run dev
```
访问：`http://localhost:3000`

### 部署与运维
- 部署指南：`docs/guides/deployment/deployment-guide.md`
- 生产运行手册：`docs/operations/production-runbook.md`
- 监控告警配置：`docker/prometheus`、`docker/alertmanager`、`docker/grafana`

### 文档索引
- 产品与功能：`docs/product/platform-features.md`
- 架构与技术：
  - `docs/architecture/ai-agent-system.md`
  - `docs/architecture/ai-agent-system-technical-docs.md`
- 开发与部署：
  - `docs/guides/development/development-guide.md`
  - `docs/guides/deployment/deployment-guide.md`
- 数据库：`docs/reference/database-schema.sql`，`prisma/schema.prisma`
- 事件与变更：`docs/incidents/2025-incident-dossier.md`（以及 `docs/incidents/archive/`）
- 对外交付：
  - `deliverables/01-技术架构设计文档.md`
  - `deliverables/02-商业计划书.md`
  - `deliverables/03-用户体验设计.md`

### 目录结构（简）
```
src/
  app/                # Next.js 路由与页面
  components/         # UI 与业务组件
  hooks/              # 自定义 Hook（含工作坊会话）
  lib/                # 业务逻辑与服务（含 business-plan/*）
  types/              # 类型定义
docs/                 # 产品、架构、运维与指南
docker/               # 监控与周边服务配置
prisma/               # 数据模型与迁移
deliverables/         # 对外交付材料
```

### 版权与联系
- 版权：本项目仅供学习与内部演示，未经许可请勿商用。
- 联系方式：在“关于我们”页面查看微信二维码（`/about`），或邮箱 `contact@aiagentmarket.com`。

# AI创意竞价平台

专注于AI创意竞价和AI指导书生成的现代化平台，基于Next.js 14构建。

## 核心功能

🎯 **AI创意竞价**: 智能AI专家团队分析和竞价创意
📚 **AI指导书生成**: 自动生成专业的创意实施指导书
🤖 **多AI服务集成**: 集成DeepSeek、智谱GLM、阿里通义千问

### 🎭 AI创意竞价系统

5位AI专家实时竞价评估您的创意，提供全方位价值分析。

#### 核心特性
- **🚀 实时竞价舞台**: WebSocket实时通信，5位AI专家同时在线
- **📊 动态进度追踪**: 7个阶段智能进度指示(创意输入→AI预热→深度讨论→激烈竞价→补充完善→最终决策→结果展示)
- **💬 专家互动对话**: 支持用户补充创意(最多3次)，AI专家实时响应
- **🔌 断线重连**: 自动检测连接状态，一键重连功能
- **📈 性能优化**: 使用useMemo缓存消息处理，优化大量数据渲染

#### 竞价流程
1. **创意输入** - 描述您的创意想法(50-500字建议)
2. **AI预热** - 5位专家快速分析创意概况
3. **深度讨论** - 多轮专业对话和质疑
4. **激烈竞价** - 基于分析给出价值评估
5. **补充完善** - 用户根据讨论补充细节
6. **最终决策** - 确定最高出价和获胜专家
7. **结果展示** - 生成详细商业计划报告

#### AI专家团队
- **艾克斯** (技术先锋) - 架构评估、算法优化、技术可行性
- **老王** (商业导师) - 盈利模型、风险评估、商业策略
- **小琳** (创新导师) - 用户体验、品牌故事、情感价值
- **阿伦** (市场洞察) - 传播策略、热点预测、社交营销
- **李博** (投资顾问) - 理论支撑、系统分析、学术验证

#### 技术实现
- **前端**: React + TypeScript + Tailwind CSS
- **实时通信**: WebSocket (ws://localhost:8080 开发环境)
- **状态管理**: 自定义 Hooks (useBiddingWebSocket, useAgentStates)
- **数据传递**: sessionStorage (解决HTTP 431 URL过长问题)
- **性能优化**: useMemo缓存、防抖处理、智能重连

#### 最近优化 (v1.2.0)
1. ✅ **修复HTTP 431错误** - 使用sessionStorage替代URL参数
2. ✅ **进度同步** - 根据WebSocket阶段动态计算进度百分比
3. ✅ **用户补充** - WebSocket实时发送补充内容给AI团队
4. ✅ **断连重试** - 明显警告横幅 + 动画重连按钮
5. ✅ **消息性能** - useMemo缓存处理，减少重复计算
6. ✅ **类型安全** - 移除any类型，使用明确接口
7. ✅ **自动启动** - 防重复触发保护

## 技术特性

- **Next.js 14** App Router架构
- **TypeScript** 类型安全
- **Tailwind CSS** 现代化样式
- **Radix UI** 无障碍组件
- **Framer Motion** 动画效果
- **Zustand** 状态管理
- **React Query** 数据获取
- **React Hook Form** + **Zod** 表单验证

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AIagentshichang
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

### 环境变量配置

复制 `.env.example` 到 `.env.local` 并配置以下必需的环境变量:

#### 必需配置
- **DATABASE_URL**: 数据库连接字符串
- **JWT_SECRET**: JWT密钥
- **NEXTAUTH_SECRET**: NextAuth.js配置

#### AI服务配置 (三选一或全配置)
- **DEEPSEEK_API_KEY**: DeepSeek API密钥
- **ZHIPU_API_KEY**: 智谱GLM API密钥
- **DASHSCOPE_API_KEY**: 阿里通义千问API密钥

#### 可选配置
- **OSS存储配置**: 阿里云OSS文件存储
- **OAUTH配置**: Google/GitHub登录支持

## 项目架构

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API路由
│   │   ├── discussions/   # 创意讨论API
│   │   ├── documents/     # 文档生成API
│   │   └── auth/         # 认证API
│   ├── dashboard/         # 用户仪表板
│   ├── collaboration/     # 创意协作页面
│   └── auth/             # 认证页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── dashboard/        # 仪表板组件
│   ├── auth/            # 认证组件
│   └── layout/          # 布局组件
├── lib/                  # 工具函数和服务
│   ├── ai-services/     # AI服务集成
│   ├── storage/         # 文件存储服务
│   └── auth.ts          # 认证逻辑
├── hooks/               # React Hooks
├── types/              # TypeScript类型定义
└── contexts/           # React上下文
```

## 📄 文档导航
- `商业计划智能生成一体化方案.md`：端到端的一体化方案，汇总智能适配、执行框架与系统设计。
- `智能化商业计划适配框架总结.md`：适配引擎与推荐逻辑的详细解析。
- `5阶段实战商业计划框架完整设计.md`：目标澄清到商业闭环的执行方法论。
- `90天聚焦实战计划详解.md`：三个月技术、需求、商业验证节奏。
- `商业计划生成系统设计文档.md`：生成系统的技术架构与交互设计。
- `商业计划书9个阶段生成详解.md`：九阶段内容生成逻辑与交付物说明。

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## AI服务集成

平台集成了三个主要的AI服务提供商，提供智能的创意分析和指导书生成：

### 🚀 DeepSeek (主力服务)
- **优势**: 性价比最高，技术分析能力强
- **适用**: 技术创意分析、代码逻辑优化
- **配置**: `DEEPSEEK_API_KEY`

### 🧠 智谱GLM (中文优化)
- **优势**: 中文理解能力强，商业逻辑分析专业
- **适用**: 商业模式分析、学术理论探讨
- **配置**: `ZHIPU_API_KEY`

### ☁️ 阿里通义千问 (实时性好)
- **优势**: 实时性好，市场趋势敏感度高
- **适用**: 市场趋势分析、营销策略制定
- **配置**: `DASHSCOPE_API_KEY`

### 负载均衡策略
系统会根据不同的专家类型自动选择最适合的AI服务：
- **技术专家**: DeepSeek → 智谱GLM → 阿里通义
- **商业专家**: 智谱GLM → DeepSeek → 阿里通义
- **趋势专家**: 阿里通义 → 智谱GLM → DeepSeek
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Development**: ESLint, Prettier, TypeScript

## License

This project is licensed under the MIT License.


