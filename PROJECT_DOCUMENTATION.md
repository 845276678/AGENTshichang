# 🚀 AI创意协作平台 - 完整项目文档

## 📖 目录
- [项目概述](#项目概述)
- [项目状态](#项目状态)
- [技术架构](#技术架构)
- [功能特性](#功能特性)
- [安装部署](#安装部署)
- [API文档](#api文档)
- [数据库设计](#数据库设计)
- [前端组件](#前端组件)
- [配置指南](#配置指南)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

---

## 📊 项目状态

### ✅ 已完成功能

#### 🏗️ 基础架构
- ✅ **项目框架**: Next.js 14.2.5 + TypeScript 完整配置
- ✅ **数据库设计**: Prisma ORM + PostgreSQL 完整数据模型
- ✅ **认证系统**: JWT + NextAuth 用户认证和授权
- ✅ **UI组件库**: Radix UI + Tailwind CSS 完整组件系统
- ✅ **状态管理**: Zustand 全局状态管理
- ✅ **表单处理**: React Hook Form + Zod 验证
- ✅ **动画系统**: Framer Motion 交互动画

#### 🤖 AI服务集成
- ✅ **多AI模型支持**: OpenAI GPT、DeepSeek、智谱GLM、阿里通义、腾讯混元、讯飞星火、百度千帆
- ✅ **AI服务工厂**: 统一AI服务接口和负载均衡
- ✅ **健康监控**: AI服务状态检查和异常处理
- ✅ **智能路由**: 基于服务优先级的智能分发
- ✅ **服务降级**: 百度AI服务已降级为备用，优先使用更稳定的服务

#### 💡 创意协作功能
- ✅ **多层次对话系统**: 6阶段创意迭代流程
- ✅ **AI Agent个性化**: 认知风格、心情状态、竞价策略
- ✅ **创意DNA分析**: 6维度用户创意评估
- ✅ **创意工作坊**: 沉浸式技能训练界面
- ✅ **智能挑战系统**: 个性化任务和奖励机制

#### 🔐 用户和权限系统
- ✅ **多角色支持**: 用户、管理员、版主权限体系
- ✅ **用户等级**: 5级会员体系和升级机制
- ✅ **积分系统**: 注册奖励、任务获得、消费扣除
- ✅ **安全机制**: 密码加密、JWT令牌、权限控制

#### 📱 前端组件
- ✅ **CreativeConversation**: 创意对话组件
- ✅ **AgentPersonalityCard**: AI Agent个性展示
- ✅ **CreativeDNAAnalysis**: 创意DNA匹配系统
- ✅ **CreativeWorkshopInterface**: 工作坊训练界面
- ✅ **CreativeChallengeCard**: 智能挑战卡片
- ✅ **完整UI组件库**: 40+ 可复用组件

#### 🛠️ 开发和部署
- ✅ **Docker容器化**: 生产级多阶段构建配置
- ✅ **CI/CD流水线**: GitHub Actions 完整自动化
- ✅ **Zeabur部署**: 云平台一键部署配置
- ✅ **监控系统**: Prometheus + Grafana 性能监控
- ✅ **健康检查**: 全面的系统状态监控
- ✅ **日志系统**: 结构化日志和错误追踪

### 🚧 待完成功能

#### 💰 支付系统
- ⏳ **支付宝集成**: 订单创建、支付回调、退款处理
- ⏳ **微信支付集成**: 移动端支付、小程序支付
- ⏳ **订单管理**: 订单状态跟踪、发票管理
- ⏳ **钱包系统**: 充值、提现、余额管理

#### 📦 创意商店
- ⏳ **商品展示**: 创意成果商品化展示
- ⏳ **购买流程**: 购物车、下单、支付完整流程
- ⏳ **数字交付**: 创意文件自动交付系统
- ⏳ **评价系统**: 商品评价和推荐算法

#### 📊 数据分析
- ⏳ **用户行为分析**: 用户画像、行为轨迹
- ⏳ **创意质量评估**: AI生成质量评分系统
- ⏳ **市场趋势分析**: 创意类别热度分析
- ⏳ **收益分析**: 用户收益统计和预测

#### 🔔 消息通知
- ⏳ **邮件通知**: 注册确认、订单通知、系统消息
- ⏳ **站内消息**: 实时消息推送系统
- ⏳ **短信通知**: 重要操作短信确认
- ⏳ **推送通知**: 移动端推送消息

#### 🌐 国际化
- ⏳ **多语言支持**: 中文、英文界面
- ⏳ **多货币支持**: 人民币、美元、欧元
- ⏳ **地区适配**: 不同地区功能差异化

#### 📱 移动端
- ⏳ **响应式优化**: 移动端界面适配
- ⏳ **PWA支持**: 离线功能、安装支持
- ⏳ **移动端专属功能**: 语音输入、拍照上传

#### 🔍 搜索和推荐
- ⏳ **全文搜索**: ElasticSearch 集成
- ⏳ **智能推荐**: 基于协同过滤的推荐算法
- ⏳ **标签系统**: 自动标签生成和分类
- ⏳ **相似度计算**: 创意相似度匹配

#### 🎯 高级功能
- ⏳ **批量操作**: 批量导入、导出、处理
- ⏳ **API开放**: 第三方接入SDK
- ⏳ **插件系统**: 扩展功能插件架构
- ⏳ **白标方案**: 品牌定制化部署

### 📈 开发进度

#### 整体进度: 65% 完成

```
核心功能     ████████████████████░░░░░  80%
AI集成       ████████████████████░░░░░  85%
用户系统     ███████████████████░░░░░░  75%
前端界面     ████████████████████░░░░░  85%
后端API      ██████████████████░░░░░░░  70%
数据库       ████████████████████░░░░░  85%
部署配置     ████████████████████████░  95%
测试覆盖     ███████░░░░░░░░░░░░░░░░░░░  35%
文档完整     ████████████████████░░░░░  80%
```

#### 各模块状态
- 🟢 **已完成**: 基础架构、AI服务、创意协作、部署配置
- 🟡 **开发中**: 支付系统、商店功能、数据分析
- 🔴 **待开始**: 移动端优化、国际化、高级功能

### 🎯 下一步计划

#### Phase 1: 核心商业功能 (预计2-3周)
1. **支付系统完善**: 支付宝、微信支付集成
2. **创意商店**: 商品化展示和购买流程
3. **订单管理**: 完整的交易流程

#### Phase 2: 用户体验优化 (预计2周)
1. **消息通知**: 邮件、站内、推送通知
2. **搜索功能**: 全文搜索和智能推荐
3. **移动端优化**: 响应式设计完善

#### Phase 3: 平台增值功能 (预计3-4周)
1. **数据分析**: 用户画像和市场分析
2. **国际化**: 多语言和多货币支持
3. **API开放**: 第三方集成接口

## 🎯 项目概述

### 项目简介
AI创意协作平台是一个革命性的创意交易和协作生态系统。用户可以提交创意想法，AI Agent会进行智能评估、竞价和深度协作，最终形成完整的商业方案。

### 核心价值
- **创意变现**: 让每个想法都有价值回报
- **AI协作**: 与专业AI Agent深度合作优化创意
- **个性化匹配**: 基于创意DNA的科学化匹配系统
- **生态循环**: 从创意分享到AI竞价，从专业改造到商店购买

### 创新特性
- 🧬 **创意DNA分析**: 6维度个性化评估
- 🤖 **AI个性化**: 每个Agent都有独特认知风格
- 💬 **多层次对话**: 6阶段迭代优化流程
- 🎓 **工作坊训练**: 沉浸式创意能力提升
- 🏆 **智能挑战**: 个性化创意任务系统

---

## 🏗️ 技术架构

### 前端技术栈
```
├── Next.js 14.2.5          # React全栈框架
├── TypeScript              # 类型安全
├── Tailwind CSS            # 原子化CSS
├── Framer Motion           # 动画库
├── Radix UI               # 无障碍组件库
├── Zustand                # 状态管理
├── React Hook Form        # 表单处理
└── Lucide React           # 图标库
```

### 后端技术栈
```
├── Next.js API Routes     # 服务端API
├── Prisma ORM            # 数据库ORM
├── PostgreSQL            # 主数据库
├── JWT Authentication    # 身份认证
├── Zod                   # 数据验证
├── bcryptjs             # 密码加密
└── Nodemailer           # 邮件服务
```

### AI服务集成
```
├── OpenAI GPT               # 最稳定，质量最高 (推荐)
├── DeepSeek                 # 国产优秀，性价比高 (推荐)
├── 智谱GLM                  # 逻辑推理，中文优化
├── 阿里通义千问             # 创意评估
├── 腾讯混元                 # 内容优化
├── 科大讯飞星火             # 智能对话
└── 百度千帆大模型           # 备用服务 (已降级)
```

### 第三方服务
```
├── 阿里云OSS            # 文件存储
├── 支付宝支付            # 在线支付
├── 微信支付             # 移动支付
└── SMTP邮件服务         # 邮件通知
```

---

## ✨ 功能特性

### 🔐 用户系统
- **多角色支持**: 普通用户、管理员、版主
- **安全认证**: JWT + 刷新令牌机制
- **用户等级**: 青铜、白银、黄金、铂金、钻石
- **积分体系**: 注册奖励、任务获得、购买充值

### 💡 创意管理
- **创意提交**: 支持9大分类的创意想法
- **智能标签**: 自动生成和用户自定义标签
- **可见性控制**: 公开、私有、不公开模式
- **状态追踪**: 待审核、已通过、已拒绝、已归档

### 🤖 AI Agent系统
- **个性化展示**: 认知风格、性格特质、动态心情
- **专业领域**: 技术、艺术、商业、社会创新
- **竞价策略**: 自适应、保守、激进、机会导向
- **学习成长**: 用户偏好学习、适应速度调节

### 🎨 创意协作功能
#### 多层次对话系统
1. **初始提交** - 用户分享原始创意
2. **AI评估** - 专业角度分析价值
3. **迭代优化** - 多轮对话完善想法
4. **可行性验证** - 技术和商业验证
5. **价值包装** - 形成完整方案
6. **最终定稿** - 产出成熟创意

#### 创意工作坊
- **技术创新坊**: 科技前沿思维训练
- **创意叙事坊**: 故事创作和表达
- **商业建模坊**: 商业模式设计
- **跨域思考坊**: 跨领域融合创新
- **问题解决坊**: 系统性解决方案

#### 智能挑战系统
- **难度分级**: 入门、进阶、困难、专家
- **实时倒计时**: 增强挑战紧迫感
- **奖励机制**: 积分、徽章、解锁功能
- **AI反馈**: 专业评估和改进建议

#### 创意DNA匹配
- **6维度评估**:
  - 思维风格: 逻辑型/直觉型/实验型/整合型
  - 创新类型: 突破性/渐进式/融合型/应用型
  - 协作偏好: 主导/协作/支持/独立
  - 创新领域: 技术/艺术/商业/社会
  - 风险偏好: 保守/平衡/冒险
  - 复杂度偏好: 简单/适中/复杂

### 📊 数据分析
- **健康监控**: 系统、数据库、AI服务状态
- **使用统计**: AI调用次数、成本分析
- **用户画像**: 行为分析、偏好学习
- **效果评估**: 协作成功率、创意质量提升

---

## 🛠️ 安装部署

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 12

### 快速开始
```bash
# 1. 克隆项目
git clone [项目地址]
cd ai-agent-marketplace

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和服务

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

### 生产部署
```bash
# 1. 构建项目
npm run build

# 2. 启动生产服务器
npm start

# 3. 使用PM2管理进程
pm2 start ecosystem.config.js
```

### Docker部署
```bash
# 1. 构建镜像
docker build -t ai-agent-marketplace .

# 2. 运行容器
docker-compose up -d
```

---

## 📡 API文档

### 认证相关
```
POST /api/auth/register     # 用户注册
POST /api/auth/login        # 用户登录
POST /api/auth/logout       # 用户登出
GET  /api/auth/me          # 获取当前用户信息
POST /api/auth/refresh     # 刷新令牌
```

### 用户管理
```
GET    /api/users          # 获取用户列表
GET    /api/users/:id      # 获取用户详情
PUT    /api/users/:id      # 更新用户信息
DELETE /api/users/:id      # 删除用户
```

### 创意管理
```
GET    /api/ideas          # 获取创意列表
POST   /api/ideas          # 创建新创意
GET    /api/ideas/:id      # 获取创意详情
PUT    /api/ideas/:id      # 更新创意信息
DELETE /api/ideas/:id      # 删除创意
```

### AI Agent相关
```
GET    /api/agents         # 获取Agent列表
POST   /api/agents         # 创建新Agent
GET    /api/agents/:id     # 获取Agent详情
PUT    /api/agents/:id     # 更新Agent信息
```

### 创意协作
```
POST   /api/conversations     # 创建对话
GET    /api/conversations/:id # 获取对话详情
POST   /api/messages          # 发送消息
GET    /api/workshops         # 获取工作坊列表
POST   /api/challenges        # 创建挑战
```

### 系统监控
```
GET    /api/health         # 健康检查
GET    /api/admin/stats    # 系统统计
GET    /api/admin/system   # 系统信息
```

---

## 🗃️ 数据库设计

### 核心数据模型

#### 用户表 (User)
```sql
- id: 用户唯一标识
- email: 邮箱地址
- username: 用户名
- passwordHash: 密码哈希
- role: 用户角色 (USER/ADMIN/MODERATOR)
- status: 账户状态 (ACTIVE/INACTIVE/SUSPENDED/BANNED)
- level: 用户等级 (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND)
- credits: 积分余额
- totalSpent: 总消费额
- totalEarned: 总收入额
```

#### 创意表 (Idea)
```sql
- id: 创意唯一标识
- title: 创意标题
- description: 创意描述
- category: 创意分类
- tags: 标签数组
- userId: 创建者ID
- status: 状态 (PENDING/APPROVED/REJECTED/ARCHIVED)
- visibility: 可见性 (PUBLIC/PRIVATE/UNLISTED)
- viewCount: 浏览次数
- likeCount: 点赞数
```

#### AI Agent表 (扩展现有Agent模型)
```sql
- personality: 个性特质JSON
- cognitionStyle: 认知风格JSON
- specialties: 专业领域数组
- thinkingPattern: 思维模式JSON
- collaborationPreference: 协作偏好JSON
- learningProfile: 学习档案JSON
- currentMood: 当前心情JSON
- dailyBudget: 日预算
- biddingStrategy: 竞价策略JSON
```

### 新增数据模型

#### 创意对话表 (CreativeConversation)
```sql
- id: 对话唯一标识
- ideaId: 关联创意ID
- agentId: 关联AgentID
- phase: 当前阶段
- status: 对话状态
- iterationCount: 迭代次数
- qualityScore: 质量评分
```

#### 创意消息表 (CreativeMessage)
```sql
- id: 消息唯一标识
- conversationId: 关联对话ID
- content: 消息内容
- role: 角色 (USER/AGENT/SYSTEM)
- messageType: 消息类型
- metadata: 元数据JSON
- attachments: 附件数组JSON
```

#### 创意工作坊表 (CreativeWorkshop)
```sql
- id: 工作坊唯一标识
- title: 工作坊标题
- description: 描述
- hostAgentId: 主持AgentID
- type: 工作坊类型
- difficulty: 难度等级
- duration: 持续时间
- maxParticipants: 最大参与人数
- currentParticipants: 当前参与人数
- exercises: 练习内容JSON
```

#### 创意挑战表 (CreativeChallenge)
```sql
- id: 挑战唯一标识
- title: 挑战标题
- description: 挑战描述
- creatorAgentId: 创建者AgentID
- difficulty: 难度等级
- timeLimit: 时间限制
- constraints: 约束条件数组
- evaluationCriteria: 评估标准数组
- rewards: 奖励信息JSON
- status: 挑战状态
```

#### 用户创意档案表 (UserCreativeProfile)
```sql
- userId: 用户ID
- creativeDNA: 创意DNA JSON
- learningProgress: 学习进度JSON
- achievements: 成就数组JSON
- preferredAgents: 偏好Agent ID数组
- collaborationHistory: 协作历史JSON
- skillLevels: 技能等级JSON
- creativeMetrics: 创意指标JSON
```

---

## 🎨 前端组件

### 布局组件
- `Layout`: 主布局容器
- `Header`: 顶部导航栏
- `Sidebar`: 侧边栏导航
- `Footer`: 页面底部

### UI基础组件
- `Button`: 按钮组件
- `Card`: 卡片容器
- `Badge`: 标签徽章
- `Progress`: 进度条
- `Tabs`: 选项卡
- `Dialog`: 对话框
- `Toast`: 消息提示

### 业务组件
- `AgentCard`: Agent展示卡片
- `IdeaCard`: 创意展示卡片
- `UserProfile`: 用户资料
- `PaymentForm`: 支付表单

### 创意协作组件
#### CreativeConversation
多层次创意迭代对话组件
```tsx
<CreativeConversation
  conversation={conversation}
  onSendMessage={(content, type) => {}}
  onPhaseTransition={(phase) => {}}
/>
```

#### AgentPersonalityCard
AI Agent个性化展示组件
```tsx
<AgentPersonalityCard
  agent={agent}
  showDetailedView={true}
  onInteract={() => {}}
/>
```

#### CreativeDNAAnalysis
创意DNA科学化匹配组件
```tsx
<CreativeDNAAnalysis
  agents={agents}
  onStartAssessment={() => {}}
  onSelectAgent={(agentId) => {}}
/>
```

#### CreativeWorkshopInterface
沉浸式创意工作坊组件
```tsx
<CreativeWorkshopInterface
  workshop={workshop}
  onSubmitExercise={(exerciseId, submission) => {}}
  onCompleteWorkshop={() => {}}
  currentUserId="user-id"
/>
```

#### CreativeChallengeCard
个性化智能创意挑战组件
```tsx
<CreativeChallengeCard
  challenge={challenge}
  userSubmission={submission}
  onSubmit={(content) => {}}
  onView={() => {}}
/>
```

---

## ⚙️ 配置指南

### 环境变量配置
```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# JWT密钥
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI服务配置
BAIDU_API_KEY="your-baidu-api-key"
BAIDU_SECRET_KEY="your-baidu-secret-key"
ALI_API_KEY="your-ali-api-key"
XUNFEI_APP_ID="your-xunfei-app-id"
TENCENT_SECRET_ID="your-tencent-secret-id"
ZHIPU_API_KEY="your-zhipu-api-key"

# 存储服务配置
OSS_ACCESS_KEY_ID="your-oss-access-key"
OSS_ACCESS_KEY_SECRET="your-oss-secret-key"
OSS_BUCKET="your-bucket-name"

# 支付服务配置
ALIPAY_APP_ID="your-alipay-app-id"
WECHAT_APP_ID="your-wechat-app-id"

# 邮件服务配置
SMTP_HOST="smtp.example.com"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

### AI服务获取指南

#### 推荐服务商（按优先级排序）

1. **OpenAI** (推荐 - 最稳定)
   - 官网: [OpenAI Platform](https://platform.openai.com/)
   - 优势: 质量最高、API稳定、文档完善
   - 费用: 按token计费，性价比合理
   - 获取: 注册 → API Keys → Create new secret key

2. **DeepSeek** (推荐 - 国产优秀)
   - 官网: [DeepSeek开放平台](https://platform.deepseek.com/)
   - 优势: 中文优化、代码能力强、价格便宜
   - 费用: 极低价格，性价比最高
   - 获取: 注册 → API管理 → 创建API Key

3. **智谱AI GLM**
   - 官网: [智谱开放平台](https://open.bigmodel.cn/)
   - 优势: 中文逻辑推理强、数学能力好
   - 获取: 注册 → API管理 → 创建API Key

4. **阿里云通义千问**
   - 官网: [阿里云](https://www.aliyun.com/) → 产品 → 通义千问
   - 优势: 创意评估、内容生成
   - 获取: 开通服务 → 获取API Key

5. **腾讯云混元**
   - 官网: [腾讯云](https://console.cloud.tencent.com/) → 产品 → 混元大模型
   - 优势: 内容优化、多模态
   - 获取: 开通服务 → SecretId + SecretKey

6. **科大讯飞星火**
   - 官网: [讯飞开放平台](https://www.xfyun.cn/) → 控制台 → 星火认知
   - 优势: 语音对话、中文理解
   - 获取: 创建应用 → AppID + APISecret + APIKey

7. **百度千帆** (备用)
   - 官网: [百度智能云](https://cloud.baidu.com/) → 控制台 → 千帆大模型
   - 注意: 已降级为备用服务，建议优先使用上述服务
   - 获取: 创建应用 → API Key + Secret Key

---

## 👨‍💻 开发指南

### 代码规范
- 使用TypeScript强类型
- 遵循ESLint和Prettier配置
- 组件采用函数式编程
- 使用React Hooks管理状态

### 文件结构
```
src/
├── app/                    # Next.js页面路由
│   ├── api/               # API路由
│   ├── auth/              # 认证页面
│   ├── dashboard/         # 用户面板
│   ├── marketplace/       # 创意市场
│   └── demo/              # 功能演示
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── layout/           # 布局组件
│   ├── auth/             # 认证组件
│   ├── dashboard/        # 面板组件
│   └── creative/         # 创意协作组件
├── lib/                  # 工具库
│   ├── auth-middleware.ts # 认证中间件
│   ├── database.ts       # 数据库连接
│   ├── ai-services.ts    # AI服务集成
│   └── utils.ts          # 通用工具
├── types/                # TypeScript类型定义
├── styles/               # 样式文件
└── hooks/                # 自定义Hooks
```

### 开发流程
1. **功能开发**: 在feature分支开发新功能
2. **代码审查**: 提交PR进行代码审查
3. **测试验证**: 运行单元测试和集成测试
4. **部署发布**: 合并到主分支后自动部署

### 测试策略
```bash
# 运行所有测试
npm run test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

### 性能优化
- 使用Next.js图像优化
- 实现组件懒加载
- 合理使用React.memo
- 优化API调用次数

---

## ❓ 常见问题

### Q: 如何配置AI服务？
A: 参考[配置指南](#配置指南)，需要分别在对应平台申请API密钥并配置到环境变量中。

### Q: 数据库迁移失败怎么办？
A: 检查PostgreSQL连接配置，确保数据库服务正常运行，然后执行：
```bash
npx prisma db push --force-reset
```

### Q: 前端组件样式异常？
A: 确保Tailwind CSS配置正确，检查`tailwind.config.js`文件：
```bash
npm run build-css
```

### Q: API调用频率限制？
A: 各AI服务商都有调用频率限制，建议：
- 实现请求缓存机制
- 添加错误重试逻辑
- 监控API使用量

### Q: 如何添加新的AI Agent？
A: 1. 在数据库中创建Agent记录
   2. 配置个性化参数
   3. 实现对应的AI服务调用逻辑

### Q: 部署到生产环境注意事项？
A: - 使用HTTPS协议
   - 配置环境变量
   - 设置数据库连接池
   - 启用日志监控
   - 定期备份数据

---

## 📞 技术支持

### 联系方式
- 📧 技术支持: dev-support@example.com
- 💬 在线客服: [访问地址]
- 📖 文档中心: [访问地址]

### 社区资源
- GitHub仓库: [项目地址]
- 技术博客: [博客地址]
- 开发者社区: [社区地址]

---

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和技术顾问。

---

*最后更新时间: 2024年9月21日*
*文档版本: v2.0.0*
*项目状态: 开发中 (65% 完成)*

---

## 📋 快速检查清单

### 🚀 立即可用功能
- ✅ **本地开发环境**: `npm run dev` 启动开发服务器
- ✅ **创意协作演示**: 访问 `/demo/creative` 查看功能演示
- ✅ **AI服务集成**: 5个主要AI服务提供商已集成
- ✅ **用户认证**: 完整的注册、登录、权限管理
- ✅ **健康监控**: 访问 `/api/health` 查看系统状态

### 🔧 需要配置的服务
- ⚠️ **数据库**: PostgreSQL 连接配置
- ⚠️ **AI API密钥**: 百度、阿里、讯飞等服务密钥
- ⚠️ **邮件服务**: SMTP 邮件发送配置
- ⚠️ **文件存储**: 阿里云OSS 存储配置
- ⚠️ **支付接口**: 支付宝、微信支付配置

### 🏗️ 开发环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 12
- Redis (可选，用于缓存)

### 📦 生产部署选项
1. **Zeabur云部署** (推荐): 一键部署，参考 `ZEABUR_DEPLOYMENT.md`
2. **Docker部署**: 运行 `./deploy.sh` 自动化部署
3. **手动部署**: 参考文档中的安装部署章节