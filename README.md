# AI创意竞价平台

专注于AI创意竞价和AI指导书生成的现代化平台，基于Next.js 14构建。

## 核心功能

🎯 **AI创意竞价**: 智能AI专家团队分析和竞价创意
📚 **AI指导书生成**: 自动生成专业的创意实施指导书
🤖 **多AI服务集成**: 集成DeepSeek、智谱GLM、阿里通义千问

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