# 🚀 快速启动指南

## 一键启动（推荐）

### Windows用户
```bash
# 双击运行或在命令行执行
start-local.bat
```

### macOS/Linux用户
```bash
# 一键启动本地开发环境
./start-local.sh
```

## 手动启动

### 1. 安装依赖
```bash
npm install --legacy-peer-deps
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 配置数据库连接
# DATABASE_URL="postgresql://postgres:123456@localhost:5432/ai_marketplace"
```

### 3. 初始化数据库
```bash
# 生成Prisma客户端并推送数据库架构
npm run setup:local
```

### 4. 启动开发服务器
```bash
# 启动应用（端口4000）
npm run dev

# 或使用3000端口
npm run dev:3000
```

## 🌐 访问地址

- **应用主页**: http://localhost:4000
- **API健康检查**: http://localhost:4000/api/health
- **数据库管理**: http://localhost:5555 (运行 `npm run db:studio`)

## 🛠️ 常用命令

```bash
# 开发相关
npm run dev                # 启动开发服务器
npm run type-check         # TypeScript类型检查
npm run lint              # 代码检查
npm run format            # 代码格式化

# 数据库相关
npm run db:studio         # 打开数据库管理界面
npm run db:push           # 推送数据库架构
npm run db:reset          # 重置数据库（删除所有数据）

# 健康检查
npm run health            # 检查应用状态
./verify-local.sh         # 验证本地环境
```

## 🔧 故障排除

### 数据库连接问题
```bash
# 检查PostgreSQL是否运行
pg_isready -h localhost -p 5432

# 使用Docker启动数据库
docker run --name postgres-ai \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=ai_marketplace \
  -p 5432:5432 -d postgres:14
```

### 端口冲突
```bash
# 使用不同端口启动
npm run dev:3000
```

### 依赖问题
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📋 环境要求

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12 (或 Docker)
- **npm** >= 8.0.0

## 🎯 快速验证

启动后运行验证脚本：
```bash
./verify-local.sh
```

应该看到所有检查项都显示 ✅ 正常。

## 📖 详细文档

- [完整开发指南](docs/LOCAL_DEVELOPMENT_GUIDE.md)
- [项目文档](PROJECT_DOCUMENTATION.md)
- [API文档](docs/BACKEND_API_GUIDE.md)
- [前端开发指南](docs/FRONTEND_DEVELOPMENT_GUIDE.md)