# Zeabur部署检查与调试指南

**项目**: AI创意家园
**部署平台**: Zeabur
**版本**: 1.0

---

## 目录

1. [访问Zeabur Dashboard](#1-访问zeabur-dashboard)
2. [检查部署状态](#2-检查部署状态)
3. [查看构建日志](#3-查看构建日志)
4. [查看运行时日志](#4-查看运行时日志)
5. [检查环境变量](#5-检查环境变量)
6. [常见问题排查](#6-常见问题排查)
7. [回滚到上一版本](#7-回滚到上一版本)
8. [手动触发重新部署](#8-手动触发重新部署)

---

## 1. 访问Zeabur Dashboard

### 登录步骤
1. 访问 https://zeabur.com
2. 使用GitHub账号登录
3. 选择项目: `AI创意家园` 或 `AIagentshichang`

### 关键页面
- **Deployments** - 部署历史和状态
- **Logs** - 应用日志
- **Environment** - 环境变量
- **Settings** - 项目设置
- **Metrics** - 性能指标

---

## 2. 检查部署状态

### 步骤
1. Dashboard → Deployments
2. 查看最新部署记录
3. 检查状态指示器

### 状态说明

#### ✅ Success (成功)
- 绿色勾号
- 服务正在运行
- 构建和启动都成功

#### ❌ Failed (失败)
- 红色叉号
- 构建或启动失败
- 需要查看日志

#### 🟡 Building (构建中)
- 黄色进度条
- 正在执行构建
- 等待完成

#### ⚪ Queued (排队中)
- 等待开始
- 通常很快开始

### 检查要点
- 最新部署时间
- 部署触发来源(GitHub commit)
- 构建耗时
- 部署状态

---

## 3. 查看构建日志

### 访问路径
Dashboard → Deployments → 点击具体部署 → Build Logs

### 关键信息

#### 成功的构建日志示例
```
#1 [internal] load build definition
#2 [internal] load .dockerignore
#3 [internal] load metadata
#4 [stage-0] FROM node:18-alpine
#5 WORKDIR /app
#6 COPY package*.json ./
#7 RUN npm ci
#8 RUN npm run db:generate
#9 COPY . .
#10 RUN npm run build
#11 EXPOSE 3000
#12 CMD ["npm", "start"]
✅ Build completed successfully
```

#### 常见错误模式

##### 错误1: npm ci 失败
```
npm ERR! Cannot read property 'match' of undefined
npm ERR! A complete log of this run can be found in...
```
**原因**: package-lock.json与package.json不同步
**解决**: 本地重新`npm install`并提交

##### 错误2: TypeScript编译错误
```
Type error: Expected unicode escape
  > Build failed because of TypeScript errors.
```
**原因**: 代码语法错误或类型错误
**解决**: 本地运行`npm run build`修复

##### 错误3: Prisma生成失败
```
Error: Prisma Client could not be generated
```
**原因**: schema.prisma错误或数据库连接问题
**解决**: 检查schema和DATABASE_URL

##### 错误4: 依赖安装超时
```
npm ERR! network timeout
```
**原因**: 网络问题或npm源问题
**解决**: 重新触发部署

---

## 4. 查看运行时日志

### 访问路径
Dashboard → Logs → Real-time logs

### 日志过滤
```
# 仅显示错误
Filter: level=error

# 特定时间范围
Last 1 hour / Last 24 hours

# 搜索关键词
Search: "Database" / "WebSocket" / "Auth"
```

### 正常启动日志
```
> ai-agent-marketplace@0.1.0 start
> node server.js

Validating environment configuration...
✅ Environment validation successful
Server starting on port 3000
✅ Database connection established
✅ WebSocket server started
✅ Application ready
```

### 异常日志示例

#### 数据库连接失败
```
❌ Database connection failed
Error: getaddrinfo ENOTFOUND postgres
  at GetAddrInfoReqWrap.onlookup
```
**原因**: DATABASE_URL错误或数据库服务未启动
**解决**: 检查环境变量和数据库服务

#### 环境变量缺失
```
❌ Environment validation failed:
- JWT_SECRET is required
- DEEPSEEK_API_KEY is required
```
**原因**: 必需的环境变量未设置
**解决**: 在Zeabur添加缺失的环境变量

#### 端口占用
```
Error: listen EADDRINUSE: address already in use :::3000
```
**原因**: 端口冲突(不太可能在Zeabur)
**解决**: 重启服务

#### 内存不足
```
<--- JS stacktrace --->
FATAL ERROR: Ineffective mark-compacts near heap limit
```
**原因**: 应用内存超限
**解决**: 升级Zeabur计划或优化代码

---

## 5. 检查环境变量

### 访问路径
Dashboard → Environment → Variables

### 必需变量清单

#### 数据库
- ✅ `DATABASE_URL` - PostgreSQL连接字符串
  - 格式: `postgresql://user:pass@host:5432/db?sslmode=require`
  - 来源: Zeabur自动生成或手动配置

#### 认证
- ✅ `JWT_SECRET` - JWT签名密钥
  - 要求: >= 32字符
  - 生成: `openssl rand -base64 32`

- ✅ `NEXTAUTH_SECRET` - NextAuth密钥
  - 要求: >= 32字符
  - 生成: `openssl rand -base64 32`

#### AI服务 (至少一个)
- ✅ `DEEPSEEK_API_KEY` - DeepSeek API密钥
- ✅ `ZHIPU_API_KEY` - 智谱GLM API密钥
- ✅ `DASHSCOPE_API_KEY` - 通义千问 API密钥

#### 可选变量
- `REDIS_URL` - Redis连接字符串(可选)
- `NEXT_PUBLIC_WS_HOST` - WebSocket主机(默认使用当前域名)
- `NODE_ENV` - 环境(Zeabur自动设为`production`)
- `ANTHROPIC_LOG` - 日志级别(建议`error`)

### 检查方法

#### 1. 通过Dashboard
- 逐个检查每个变量是否存在
- 注意: Zeabur隐藏变量值,只显示变量名

#### 2. 通过健康检查API (服务运行时)
```bash
curl https://aijiayuan.top/api/health | jq .checks.environment
```

预期输出:
```json
{
  "status": "healthy",
  "variables": {
    "DATABASE_URL": "set",
    "JWT_SECRET": "set",
    "AI_SERVICES": "3/3"
  }
}
```

---

## 6. 常见问题排查

### 问题1: 502 Bad Gateway

**症状**: 所有请求返回502

**可能原因**:
1. 应用未启动
2. 应用启动时崩溃
3. 健康检查失败

**排查步骤**:
1. 查看运行时日志 → 是否有启动错误
2. 查看最新部署 → 构建是否成功
3. 检查环境变量 → 是否完整
4. 查看Metrics → CPU/内存是否正常

**解决方案**:
- 如果构建失败: 查看构建日志,修复代码
- 如果启动失败: 查看运行时日志,修复配置
- 如果健康检查失败: 检查`/api/health`实现

### 问题2: 503 Service Unavailable

**症状**: 间歇性503错误

**可能原因**:
1. 服务正在重启
2. 健康检查不稳定
3. 资源不足

**排查步骤**:
1. Metrics → 查看CPU/内存使用率
2. Logs → 查找OOM或崩溃
3. Deployments → 检查是否频繁重启

**解决方案**:
- 优化应用性能
- 升级Zeabur计划
- 实施缓存策略

### 问题3: Database Connection Error

**症状**: 应用日志显示数据库连接失败

**可能原因**:
1. DATABASE_URL错误
2. 数据库服务未启动
3. 网络连接问题

**排查步骤**:
1. Environment → 检查DATABASE_URL
2. Zeabur PostgreSQL服务 → 检查状态
3. 测试连接:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

**解决方案**:
- 重新生成DATABASE_URL
- 重启PostgreSQL服务
- 检查SSL模式设置

### 问题4: Build Timeout

**症状**: 构建超过10分钟被终止

**可能原因**:
1. 依赖安装慢
2. 构建脚本卡住
3. 网络问题

**排查步骤**:
1. 构建日志 → 找到卡住的步骤
2. package.json → 检查依赖数量
3. 本地测试构建时间

**解决方案**:
- 优化依赖(移除不必要的包)
- 使用`.dockerignore`减少上下文
- 使用npm ci代替npm install

---

## 7. 回滚到上一版本

### 通过Zeabur Dashboard

1. Dashboard → Deployments
2. 找到最后一个成功的部署
3. 点击 "Redeploy"
4. 确认重新部署

### 通过Git回滚

```bash
# 1. 查看提交历史
git log --oneline -10

# 2. 回滚到特定提交
git revert <commit-hash>

# 3. 推送触发重新部署
git push origin master
```

### 紧急回滚
如果问题严重,需要快速恢复:

```bash
# 硬回滚到上一个提交(谨慎使用!)
git reset --hard HEAD~1
git push --force origin master
```

**警告**: 强制推送会丢失历史,仅在紧急情况使用

---

## 8. 手动触发重新部署

### 方法1: 通过Dashboard
1. Dashboard → Deployments
2. 点击 "Redeploy" 按钮
3. 选择要部署的分支
4. 确认

### 方法2: 通过Git推送
```bash
# 空提交触发部署
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### 方法3: 通过Zeabur CLI (如已安装)
```bash
zeabur deploy
```

---

## 调试技巧

### 1. 启用详细日志
在环境变量中添加:
```
DEBUG=*
LOG_LEVEL=debug
```

### 2. 本地复现生产环境
```bash
# 使用生产环境变量
cp .env.production .env.local

# 使用生产构建
npm run build
npm start
```

### 3. 使用Zeabur CLI
```bash
# 安装CLI
npm install -g @zeabur/cli

# 登录
zeabur login

# 查看日志
zeabur logs --tail 100 --follow

# 重新部署
zeabur deploy
```

---

## 监控和告警

### 推荐工具
1. **Sentry** - 错误追踪
2. **DataDog** - APM和日志
3. **UptimeRobot** - 可用性监控
4. **Better Stack** - 日志聚合

### 健康检查端点
```
GET https://aijiayuan.top/api/health
```

应定期检查此端点(每1-5分钟)

---

## 相关文档

- `docs/ENVIRONMENT_CHECK_GUIDE.md` - 三层环境检查
- `docs/PRODUCTION_TESTING_PLAN.md` - 生产测试计划
- `docs/DEPLOYMENT_ISSUE_2025-10-04.md` - 当前502问题
- `scripts/production-check.sh` - 自动检查脚本

---

## 联系方式

**Zeabur支持**:
- 文档: https://zeabur.com/docs
- Discord: https://discord.gg/zeabur
- Email: support@zeabur.com

**紧急联系**:
- [填写团队联系方式]

---

**文档版本**: 1.0
**最后更新**: 2025-10-04
**维护人**: Claude Code Assistant
