# AI智能体商城 - 部署指南

## 🚀 快速启动

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目并安装依赖**
```bash
cd D:\ai\AIagentshichang
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
```

3. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 📱 功能使用指南

### 用户功能
- 🏠 **主页浏览** - 查看推荐智能体和分类
- 🔐 **注册登录** - 创建账户和登录系统
- 🤖 **智能体浏览** - 搜索和筛选AI智能体
- 🛒 **购物车** - 添加智能体到购物车
- 💳 **结算购买** - 完成购买流程
- 👤 **个人中心** - 管理个人资料和购买记录

### 管理员功能
- 📊 **管理仪表板** - 查看系统统计数据
- 🤖 **智能体管理** - 审核、编辑、上下架智能体
- 👥 **用户管理** - 用户权限和状态管理
- 📦 **订单管理** - 订单处理和退款

## 🛠️ 技术架构

### 前端技术栈
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form + Zod

### 后端API
- Next.js API Routes
- JWT认证
- bcrypt密码加密
- 中间件保护

### 状态管理
- React Context API
- localStorage持久化

## 🔐 账户说明

### 测试账户
由于使用模拟数据，可以注册任何邮箱进行测试：
- 用户角色：默认为 USER
- 管理员：需要手动修改用户角色为 ADMIN

### 权限级别
- **USER** - 普通用户
- **MODERATOR** - 版主
- **DEVELOPER** - 开发者
- **ADMIN** - 系统管理员

## 📂 项目结构

```
src/
├── app/                    # Next.js 页面
│   ├── admin/             # 管理后台
│   ├── agents/            # 智能体相关页面
│   ├── auth/              # 认证页面
│   ├── cart/              # 购物车
│   ├── checkout/          # 结算页面
│   ├── dashboard/         # 用户仪表板
│   └── api/               # API路由
├── components/            # React组件
│   ├── admin/             # 管理组件
│   ├── auth/              # 认证组件
│   ├── dashboard/         # 仪表板组件
│   ├── layout/            # 布局组件
│   └── ui/                # 基础UI组件
├── contexts/              # React Context
├── hooks/                 # 自定义Hook
├── lib/                   # 工具库
├── types/                 # TypeScript类型
└── styles/               # 样式文件
```

## 🌐 生产部署

### 构建项目
```bash
npm run build
npm start
```

### 部署平台推荐
- **Vercel** (推荐) - Next.js官方平台
- **Netlify** - 静态站点部署
- **Docker** - 容器化部署

### 环境变量配置
生产环境需要配置：
```env
NEXTAUTH_SECRET=production-secret
NEXTAUTH_URL=https://yourdomain.com
JWT_SECRET=production-jwt-secret
DATABASE_URL=your-database-url
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## 🔧 待完善功能

### 数据库集成
- 替换模拟数据为真实数据库
- 推荐使用 PostgreSQL + Prisma

### 支付集成
- Stripe 支付网关
- PayPal 集成
- 微信支付/支付宝

### 邮件系统
- 注册验证邮件
- 密码重置邮件
- 订单通知邮件

### 文件存储
- 头像上传功能
- 智能体图片存储
- AWS S3 或阿里云OSS

## 📞 技术支持

如果遇到问题，请检查：
1. Node.js版本是否符合要求
2. 依赖是否正确安装
3. 环境变量是否配置
4. 端口是否被占用

开发完成时间：2025年9月16日
项目状态：✅ 功能完整，可用于开发和测试