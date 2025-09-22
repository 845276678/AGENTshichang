## 🎨 前端开发指南 (Next.js + React)

### 📁 前端项目结构

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # 认证相关页面组
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/       # 用户面板页面组
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── projects/
│   │   └── layout.tsx
│   ├── agents/           # Agent市场
│   │   ├── page.tsx      # Agent列表页
│   │   ├── [id]/         # Agent详情页
│   │   └── category/     # 分类页面
│   ├── workshop/         # 创意工作坊
│   │   ├── page.tsx      # 工作坊首页
│   │   ├── projects/     # 项目管理
│   │   └── create/       # 创建项目
│   ├── api/              # API路由
│   ├── globals.css
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/           # 可复用组件
│   ├── ui/              # 基础UI组件
│   ├── forms/           # 表单组件
│   ├── agents/          # Agent相关组件
│   ├── workshop/        # 工作坊组件
│   └── layout/          # 布局组件
├── lib/                 # 工具库
│   ├── auth.ts          # 认证逻辑
│   ├── api.ts           # API客户端
│   ├── db.ts            # 数据库连接
│   ├── utils.ts         # 工具函数
│   └── validations.ts   # 表单验证
├── hooks/               # 自定义Hooks
├── store/               # 状态管理
├── styles/              # 样式文件
└── types/               # TypeScript类型定义
```

### 🔧 前端技术栈

- **框架**: Next.js 14 (App Router)
- **UI库**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **数据获取**: TanStack Query (React Query)
- **认证**: NextAuth.js
- **图标**: Lucide React
- **动画**: Framer Motion

### 📋 前端开发任务清单

#### 🔐 认证系统 (优先级: 高)

**需要开发的页面和组件:**

1. **登录页面** (`/login`)
   ```tsx
   // app/(auth)/login/page.tsx
   - 邮箱/用户名登录
   - 密码登录
   - 记住我选项
   - 忘记密码链接
   - 第三方登录(Google, GitHub)
   - 表单验证和错误处理
   ```

2. **注册页面** (`/register`)
   ```tsx
   // app/(auth)/register/page.tsx
   - 邮箱注册
   - 用户名设置
   - 密码强度验证
   - 邮箱验证流程
   - 用户协议确认
   ```

3. **用户配置文件** (`/profile`)
   ```tsx
   // app/(dashboard)/profile/page.tsx
   - 基本信息编辑
   - 头像上传
   - 密码修改
   - 邮箱绑定/解绑
   - 账户设置
   - 隐私设置
   ```

**认证相关组件:**
```tsx
// components/auth/LoginForm.tsx
// components/auth/RegisterForm.tsx
// components/auth/UserMenu.tsx
// components/auth/ProtectedRoute.tsx
```

#### 🤖 Agent市场模块 (优先级: 高)

**需要开发的页面:**

1. **Agent列表页** (`/agents`)
   ```tsx
   // app/agents/page.tsx
   功能要求:
   - Agent卡片展示 (名称、描述、价格、评分)
   - 分类筛选 (侧边栏或顶部筛选)
   - 搜索功能 (名称、描述、标签)
   - 排序选项 (最新、最热、评分、价格)
   - 分页或无限滚动
   - 收藏功能
   - 快速预览
   ```

2. **Agent详情页** (`/agents/[id]`)
   ```tsx
   // app/agents/[id]/page.tsx
   功能要求:
   - Agent详细信息展示
   - 功能特性说明
   - 使用示例和演示
   - 用户评价列表
   - 相关Agent推荐
   - 购买/使用按钮
   - 分享功能
   - 举报功能
   ```

3. **Agent分类页** (`/agents/category/[slug]`)
   ```tsx
   // app/agents/category/[slug]/page.tsx
   - 分类专属页面
   - 分类介绍
   - 该分类下的Agent列表
   - 分类统计信息
   ```

**Agent相关组件:**
```tsx
// components/agents/AgentCard.tsx        - Agent卡片
// components/agents/AgentGrid.tsx        - Agent网格布局
// components/agents/AgentFilters.tsx     - 筛选器
// components/agents/AgentSearch.tsx      - 搜索组件
// components/agents/AgentPreview.tsx     - 快速预览
// components/agents/AgentRating.tsx      - 评分组件
// components/agents/AgentReviews.tsx     - 评价列表
// components/agents/AgentPurchase.tsx    - 购买组件
```

#### 🎨 创意工作坊模块 (优先级: 中)

**需要开发的页面:**

1. **工作坊首页** (`/workshop`)
   ```tsx
   // app/workshop/page.tsx
   - 我的项目列表
   - 快速创建入口
   - 最近使用的Agent
   - 项目模板推荐
   - 协作邀请通知
   ```

2. **项目创建页** (`/workshop/create`)
   ```tsx
   // app/workshop/create/page.tsx
   - 项目基本信息设置
   - 选择项目类型
   - 选择初始Agent
   - 模板选择
   - 协作者邀请
   ```

3. **项目编辑器** (`/workshop/projects/[id]`)
   ```tsx
   // app/workshop/projects/[id]/page.tsx
   - 多Agent协作界面
   - 实时预览区域
   - 版本历史管理
   - 导出功能
   - 分享和协作
   ```

**工作坊相关组件:**
```tsx
// components/workshop/ProjectCard.tsx     - 项目卡片
// components/workshop/ProjectEditor.tsx   - 项目编辑器
// components/workshop/AgentPanel.tsx      - Agent操作面板
// components/workshop/PreviewArea.tsx     - 预览区域
// components/workshop/VersionHistory.tsx  - 版本历史
// components/workshop/CollaborationPanel.tsx - 协作面板
```

#### 💳 支付和订单模块 (优先级: 中)

**需要开发的页面:**

1. **充值页面** (`/credits/purchase`)
   ```tsx
   // app/credits/purchase/page.tsx
   - 积分套餐选择
   - 支付方式选择
   - 优惠券输入
   - 支付流程
   ```

2. **订单管理** (`/orders`)
   ```tsx
   // app/(dashboard)/orders/page.tsx
   - 订单历史列表
   - 订单详情查看
   - 退款申请
   - 发票下载
   ```

**支付相关组件:**
```tsx
// components/payment/CreditPackages.tsx   - 积分套餐
// components/payment/PaymentMethods.tsx   - 支付方式
// components/payment/OrderSummary.tsx     - 订单摘要
// components/orders/OrderList.tsx         - 订单列表
// components/orders/OrderDetails.tsx      - 订单详情
```

#### 🎛️ 管理后台模块 (优先级: 低)

**需要开发的页面:**

1. **管理员仪表板** (`/admin`)
   ```tsx
   // app/admin/page.tsx
   - 系统统计概览
   - 用户活跃度
   - Agent使用统计
   - 收入统计
   ```

2. **用户管理** (`/admin/users`)
   ```tsx
   // app/admin/users/page.tsx
   - 用户列表
   - 用户详情
   - 用户操作 (封禁、解封)
   - 积分调整
   ```

3. **Agent审核** (`/admin/agents`)
   ```tsx
   // app/admin/agents/page.tsx
   - 待审核Agent列表
   - Agent审核页面
   - 审核历史
   - 批量操作
   ```

### 🎨 UI/UX设计要求

#### 设计系统

1. **颜色方案**
   ```css
   /* 主色调 */
   --primary: #3B82F6;      /* 蓝色 */
   --primary-dark: #1D4ED8;
   --secondary: #10B981;     /* 绿色 */
   --accent: #F59E0B;        /* 橙色 */

   /* 中性色 */
   --gray-50: #F9FAFB;
   --gray-100: #F3F4F6;
   --gray-500: #6B7280;
   --gray-900: #111827;

   /* 状态色 */
   --success: #10B981;
   --warning: #F59E0B;
   --error: #EF4444;
   --info: #3B82F6;
   ```

2. **字体系统**
   ```css
   /* 中文字体 */
   font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

   /* 英文字体 */
   font-family: "Inter", "Helvetica Neue", Arial, sans-serif;

   /* 代码字体 */
   font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
   ```

3. **响应式断点**
   ```css
   /* Tailwind CSS 断点 */
   sm: 640px   /* 手机横屏 */
   md: 768px   /* 平板 */
   lg: 1024px  /* 小桌面 */
   xl: 1280px  /* 大桌面 */
   2xl: 1536px /* 超大桌面 */
   ```

#### 交互设计原则

1. **加载状态**
   - 所有异步操作都要有加载指示器
   - 骨架屏用于列表和卡片加载
   - 按钮加载状态

2. **错误处理**
   - 友好的错误提示
   - 错误边界处理
   - 重试机制

3. **用户反馈**
   - Toast通知
   - 操作确认对话框
   - 进度指示器

### 🔗 状态管理策略

#### Zustand Store 结构

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileData) => Promise<void>;
}

// store/agentStore.ts
interface AgentState {
  agents: Agent[];
  categories: Category[];
  filters: FilterState;
  searchTerm: string;
  setFilters: (filters: FilterState) => void;
  setSearchTerm: (term: string) => void;
  fetchAgents: () => Promise<void>;
}

// store/workshopStore.ts
interface WorkshopState {
  projects: Project[];
  currentProject: Project | null;
  collaborators: User[];
  createProject: (data: ProjectData) => Promise<void>;
  updateProject: (id: string, data: Partial<ProjectData>) => Promise<void>;
}
```

### 📱 移动端适配

1. **响应式设计**
   - 移动优先的设计原则
   - 触摸友好的交互元素
   - 合适的字体大小和间距

2. **性能优化**
   - 图片懒加载
   - 代码分割
   - 虚拟滚动

3. **PWA支持**
   - Service Worker
   - 离线缓存
   - 添加到主屏幕

### 🧪 测试策略

1. **单元测试** (Jest + Testing Library)
   ```typescript
   // __tests__/components/AgentCard.test.tsx
   // __tests__/hooks/useAuth.test.ts
   // __tests__/utils/formatters.test.ts
   ```

2. **集成测试** (Cypress)
   ```typescript
   // cypress/e2e/auth-flow.cy.ts
   // cypress/e2e/agent-purchase.cy.ts
   // cypress/e2e/workshop-creation.cy.ts
   ```

3. **可访问性测试**
   - ARIA标签
   - 键盘导航
   - 屏幕阅读器支持

### 📦 前端开发步骤

#### 阶段1: 项目初始化和基础设施 (1-2周)

```bash
# 1. 创建Next.js项目
npx create-next-app@latest aijiayuan-frontend --typescript --tailwind --eslint --app

# 2. 安装核心依赖
npm install @next-auth/prisma-adapter
npm install @prisma/client prisma
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form @hookform/resolvers
npm install zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react
npm install framer-motion

# 3. 安装开发依赖
npm install -D @types/node
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress
npm install -D prettier eslint-config-prettier
```

#### 阶段2: 核心组件开发 (2-3周)

1. **设置设计系统**
   - 配置Tailwind CSS主题
   - 创建基础UI组件库
   - 设置字体和图标

2. **认证系统**
   - NextAuth.js配置
   - 登录/注册表单
   - 用户菜单和导航

3. **布局系统**
   - 响应式导航栏
   - 侧边栏布局
   - 页脚组件

#### 阶段3: 核心功能开发 (4-6周)

1. **Agent市场** (2周)
   - Agent列表和搜索
   - Agent详情页
   - 筛选和排序

2. **创意工作坊** (2周)
   - 项目管理界面
   - 基础编辑器
   - 文件上传

3. **支付系统** (1-2周)
   - 积分充值页面
   - 订单管理
   - 支付集成

#### 阶段4: 高级功能和优化 (2-3周)

1. **高级功能**
   - 实时协作
   - 消息通知
   - 文件管理

2. **性能优化**
   - 代码分割
   - 图片优化
   - 缓存策略

3. **测试和部署**
   - 单元测试
   - E2E测试
   - 生产部署
