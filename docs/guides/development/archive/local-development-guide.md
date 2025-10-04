# 🚀 本地开发环境启动指南

## 📋 前置要求

### 必需软件
- **Node.js** >= 18.0.0 ([下载地址](https://nodejs.org/))
- **npm** >= 8.0.0 (随Node.js安装)
- **Git** ([下载地址](https://git-scm.com/))
- **PostgreSQL** >= 12 ([下载地址](https://www.postgresql.org/download/))

### 可选软件
- **Redis** (用于缓存，提升性能)
- **pgAdmin** (PostgreSQL可视化管理工具)

---

## 🔧 第一步：环境准备

### 1. 数据库准备

#### Windows用户：
```bash
# 安装PostgreSQL后，创建数据库
psql -U postgres
CREATE DATABASE ai_marketplace;
\q
```

#### macOS用户：
```bash
# 使用Homebrew安装
brew install postgresql
brew services start postgresql

# 创建数据库
createdb ai_marketplace
```

#### Docker用户：
```bash
# 快速启动PostgreSQL容器
docker run --name postgres-ai \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=ai_marketplace \
  -p 5432:5432 \
  -d postgres:14
```

### 2. 项目克隆和依赖安装

```bash
# 克隆项目（如果还没有）
git clone <项目地址>
cd ai-agent-marketplace

# 安装依赖
npm install --legacy-peer-deps
```

---

## ⚙️ 第二步：环境配置

### 1. 创建环境变量文件

```bash
# 复制环境变量模板
cp .env.example .env.local
```

### 2. 配置数据库连接

编辑 `.env.local` 文件，设置数据库连接：

```env
# 基础数据库配置（必需）
DATABASE_URL="postgresql://postgres:123456@localhost:5432/ai_marketplace?schema=public"

# JWT密钥（必需）
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# NextAuth配置（必需）
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"

# 开发环境标识
NODE_ENV="development"
```

### 3. AI服务配置（可选，用于完整功能）

根据需要配置AI服务API密钥：

```env
# 🔥 推荐：OpenAI（质量最高）
OPENAI_API_KEY="sk-your-openai-api-key"

# 🔥 推荐：DeepSeek（性价比最高）
DEEPSEEK_API_KEY="your-deepseek-api-key"

# 智谱GLM（中文优化）
ZHIPU_API_KEY="your-zhipu-api-key.secret"

# 阿里通义千问
DASHSCOPE_API_KEY="your-dashscope-api-key"

# 其他服务（可选）
BAIDU_API_KEY="your-baidu-api-key"
BAIDU_SECRET_KEY="your-baidu-secret-key"
XUNFEI_APP_ID="your-xunfei-app-id"
XUNFEI_API_KEY="your-xunfei-api-key"
XUNFEI_API_SECRET="your-xunfei-secret"
```

---

## 🗄️ 第三步：数据库初始化

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库架构（开发环境）
npx prisma db push

# 可选：查看数据库（可视化界面）
npx prisma studio
```

---

## 🚀 第四步：启动开发服务器

### 方式一：直接启动（推荐）

```bash
# 启动开发服务器
npm run dev
```

### 方式二：分步启动（调试用）

```bash
# 终端1：启动数据库（如果使用Docker）
docker start postgres-ai

# 终端2：启动应用
npm run dev

# 终端3：启动Prisma Studio（可选）
npx prisma studio
```

---

## 🌐 第五步：验证启动

### 1. 检查应用状态

打开浏览器访问：
- **应用主页**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **数据库管理**: http://localhost:5555 (Prisma Studio)

### 2. 快速功能测试

```bash
# 测试数据库连接
curl http://localhost:3000/api/health

# 应该返回类似：
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-..."
}
```

---

## 🔍 故障排除

### 常见问题解决

#### 1. 数据库连接失败
```bash
# 检查PostgreSQL是否运行
pg_isready -h localhost -p 5432

# 如果使用Docker
docker ps | grep postgres
```

#### 2. 端口冲突
```bash
# 检查端口占用
netstat -an | grep 3000

# 修改端口（package.json）
"dev": "next dev --port 4000"
```

#### 3. 依赖安装问题
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 4. Prisma生成失败
```bash
# 重新生成客户端
npx prisma generate --force

# 重置数据库（警告：会删除数据）
npx prisma db push --force-reset
```

---

## 🧪 开发工具和命令

### 开发常用命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint

# 代码检查并修复
npm run lint:fix

# 运行测试
npm run test

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### 数据库管理命令

```bash
# 查看当前数据库状态
npx prisma db status

# 生成Prisma客户端
npx prisma generate

# 推送架构到数据库
npx prisma db push

# 重置数据库
npx prisma db push --force-reset

# 启动可视化管理界面
npx prisma studio

# 生成并应用迁移
npx prisma migrate dev --name init
```

---

## 📁 开发文件结构

```
ai-agent-marketplace/
├── src/
│   ├── app/                    # Next.js 13+ 路由
│   │   ├── api/               # API端点
│   │   ├── auth/              # 认证页面
│   │   ├── dashboard/         # 用户面板
│   │   └── demo/              # 功能演示
│   ├── components/            # React组件
│   │   ├── ui/               # 基础UI组件
│   │   ├── auth/             # 认证组件
│   │   └── creative/         # 创意协作组件
│   ├── lib/                  # 工具库
│   ├── types/                # TypeScript类型
│   └── styles/               # 样式文件
├── prisma/                   # 数据库相关
│   ├── schema.prisma         # 数据库架构
│   └── migrations/           # 迁移文件
├── public/                   # 静态资源
├── .env.local               # 环境变量（本地）
├── .env.example             # 环境变量模板
└── package.json             # 项目配置
```

---

## 🎯 快速开始检查清单

### ✅ 必须完成的步骤

- [ ] **安装Node.js** (>= 18.0.0)
- [ ] **安装PostgreSQL** 并创建数据库
- [ ] **克隆项目** 并安装依赖
- [ ] **配置环境变量** (.env.local)
- [ ] **初始化数据库** (prisma generate && db push)
- [ ] **启动开发服务器** (npm run dev)
- [ ] **验证功能** (访问 http://localhost:3000)

### 🔧 可选配置

- [ ] **Redis缓存** (提升性能)
- [ ] **AI服务密钥** (完整AI功能)
- [ ] **邮件服务** (注册验证)
- [ ] **文件存储** (头像上传)

---

## 📞 获取帮助

### 问题排查步骤

1. **检查日志输出** - 查看终端错误信息
2. **验证环境配置** - 确认 .env.local 文件
3. **重启服务** - 停止并重新启动开发服务器
4. **清理缓存** - 删除 .next 文件夹
5. **查看文档** - 参考完整项目文档

### 常用调试命令

```bash
# 查看详细错误信息
npm run dev -- --verbose

# 检查环境变量
node -e "console.log(process.env.DATABASE_URL)"

# 测试数据库连接
npx prisma db status

# 查看应用日志
tail -f logs/app.log
```

---

## 🎉 启动成功！

当你看到以下信息时，表示启动成功：

```bash
✓ Ready in 2.3s
✓ Local:        http://localhost:3000
✓ Network:      http://192.168.1.xxx:3000

Database connected successfully
AI services initialized
Development server running...
```

现在可以开始开发了！访问 http://localhost:3000 查看应用。

---

## 🚀 下一步

1. **浏览功能演示**: 访问 `/demo` 路径查看各种功能
2. **创建测试账户**: 注册一个测试用户
3. **查看API文档**: 访问 `/api` 了解接口
4. **开始开发**: 参考项目文档进行功能开发

祝你开发愉快！🎯