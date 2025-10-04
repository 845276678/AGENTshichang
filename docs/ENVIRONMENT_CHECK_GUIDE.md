# 三层环境检查流程文档

**项目**: AI创意家园 (AIagentshichang)
**检查层级**: 本地开发 → Zeabur部署 → 生产环境
**版本**: 1.0
**更新日期**: 2025-10-04

---

## 目录

1. [本地环境检查](#1-本地环境检查)
2. [Zeabur部署检查](#2-zeabur部署检查)
3. [生产环境检查](#3-生产环境检查)
4. [快速检查脚本](#4-快速检查脚本)
5. [问题排查指南](#5-问题排查指南)

---

## 1. 本地环境检查

### 1.1 环境配置检查

#### 检查清单
- [ ] Node.js版本 >= 18.17.0
- [ ] npm/pnpm已安装
- [ ] PostgreSQL数据库运行中
- [ ] Redis运行中(可选)
- [ ] 环境变量配置完整

#### 执行命令
```bash
# 1. 检查Node版本
node --version
# 预期: v18.17.0 或更高

# 2. 检查包管理器
npm --version
# 或
pnpm --version

# 3. 检查环境变量
cat .env.local | grep -v "^#" | grep -v "^$"
# 确保包含:
# - DATABASE_URL
# - JWT_SECRET
# - NEXTAUTH_SECRET
# - DEEPSEEK_API_KEY
# - ZHIPU_API_KEY
# - DASHSCOPE_API_KEY

# 4. 验证环境变量
npm run validate-env
# 或手动运行
node -e "require('./src/lib/validate-env').validateOrThrow()"
```

#### 预期结果
```
✅ Node.js: v18.17.0 或更高
✅ 环境变量: 全部已设置
✅ 数据库连接: 正常
✅ AI服务: 3/3配置
```

### 1.2 依赖安装检查

#### 执行命令
```bash
# 1. 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 2. 检查依赖完整性
npm list --depth=0

# 3. 检查安全漏洞
npm audit

# 4. 生成Prisma Client
npm run db:generate
```

#### 预期结果
```
✅ 依赖安装完成: 638 packages
✅ 无高危漏洞
✅ Prisma Client生成成功
```

### 1.3 代码质量检查

#### 执行命令
```bash
# 1. TypeScript类型检查
npm run typecheck
# 或
npx tsc --noEmit

# 2. 检查代码规范(如有配置)
npm run lint

# 3. 检查换行符问题
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l $'\r' {} \;
# 预期: 无输出(没有CRLF)

# 4. 检查UTF-8 BOM
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sh -c 'if head -c 3 "$1" | grep -q $'"'"'\xEF\xBB\xBF'"'"'; then echo "$1"; fi' _ {} \;
# 预期: 无输出(没有BOM)

# 5. 检查重复代码
# 使用jscpd或其他工具(可选)
```

#### 预期结果
```
✅ TypeScript编译无错误
✅ 代码规范检查通过
✅ 无Windows换行符(CRLF)
✅ 无UTF-8 BOM字符
```

### 1.4 数据库检查

#### 执行命令
```bash
# 1. 检查数据库连接
npm run db:test-connection
# 或手动检查
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e))"

# 2. 检查数据库迁移状态
npx prisma migrate status

# 3. 应用迁移(如需要)
npx prisma migrate deploy

# 4. 检查数据库模式
npx prisma db pull --print
```

#### 预期结果
```
✅ 数据库连接成功
✅ 所有迁移已应用
✅ 模式与Prisma schema一致
```

### 1.5 本地构建检查

#### 执行命令
```bash
# 1. 清理构建缓存
rm -rf .next

# 2. 执行生产构建
npm run build

# 3. 检查构建输出
ls -lh .next

# 4. 检查构建产物
cat .next/build-manifest.json | head -20
```

#### 预期结果
```
✅ 构建成功完成
✅ .next目录已生成
✅ 无构建错误或警告
✅ 静态文件已生成
```

### 1.6 本地服务启动检查

#### 执行命令
```bash
# 1. 启动开发服务器
npm run dev
# 在另一个终端执行以下检查

# 2. 检查健康端点
curl http://localhost:3000/api/health

# 3. 检查主页
curl -I http://localhost:3000/

# 4. 检查WebSocket状态
curl http://localhost:3000/api/websocket-status

# 5. 启动生产服务器(可选)
npm run build && npm start
```

#### 预期结果
```json
// /api/health 响应
{
  "status": "healthy",
  "checks": {
    "database": {"status": "healthy"},
    "aiServices": {"status": "healthy", "message": "3/3 services configured"},
    "environment": {"status": "healthy"}
  }
}
```

### 1.7 本地功能测试

#### 测试清单
- [ ] 用户注册/登录
- [ ] 创意创建
- [ ] AI竞价启动
- [ ] WebSocket连接
- [ ] 商业计划生成
- [ ] 文档导出

#### 执行命令
```bash
# 打开浏览器测试
open http://localhost:3000

# 或使用curl测试API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'
```

---

## 2. Zeabur部署检查

### 2.1 部署前检查

#### 检查清单
- [ ] 本地构建成功
- [ ] 所有测试通过
- [ ] 代码已提交到GitHub
- [ ] 分支正确(通常是main/master)
- [ ] 环境变量已在Zeabur配置

#### 执行命令
```bash
# 1. 检查Git状态
git status
# 预期: nothing to commit, working tree clean

# 2. 检查当前分支
git branch --show-current
# 预期: master 或 main

# 3. 确保代码已推送
git log origin/master..HEAD
# 预期: 无输出(没有未推送的提交)

# 4. 查看最近提交
git log --oneline -5
```

#### 预期结果
```
✅ 工作区干净
✅ 在正确分支
✅ 所有提交已推送
✅ 提交历史正常
```

### 2.2 Zeabur环境变量检查

#### 检查清单
访问 Zeabur Dashboard → 项目 → 环境变量

**必需变量**:
- [ ] `DATABASE_URL` - PostgreSQL连接字符串
- [ ] `JWT_SECRET` - JWT密钥(>=32字符)
- [ ] `NEXTAUTH_SECRET` - NextAuth密钥
- [ ] `DEEPSEEK_API_KEY` - DeepSeek API密钥
- [ ] `ZHIPU_API_KEY` - 智谱API密钥
- [ ] `DASHSCOPE_API_KEY` - 通义千问API密钥

**可选变量**:
- [ ] `REDIS_URL` - Redis连接字符串
- [ ] `NEXT_PUBLIC_WS_HOST` - WebSocket主机(生产域名)
- [ ] `NODE_ENV=production`
- [ ] `ANTHROPIC_LOG=error` - 日志级别

#### 验证方法
```bash
# 通过Zeabur CLI检查(如已安装)
zeabur env list

# 或通过API检查
curl -H "Authorization: Bearer YOUR_ZEABUR_TOKEN" \
  https://gateway.zeabur.com/api/v1/projects/YOUR_PROJECT_ID/environments
```

### 2.3 部署触发检查

#### 执行命令
```bash
# 1. 推送代码触发部署
git push origin master

# 2. 检查GitHub Actions(如有配置)
# 访问: https://github.com/YOUR_USERNAME/AIagentshichang/actions

# 3. 监控Zeabur部署日志
# 访问: Zeabur Dashboard → 项目 → Deployments
```

#### 预期结果
```
✅ Git推送成功
✅ Zeabur检测到新提交
✅ 部署任务已创建
✅ 构建开始执行
```

### 2.4 部署过程监控

#### 监控清单
- [ ] 构建阶段 - npm install
- [ ] 构建阶段 - prisma generate
- [ ] 构建阶段 - npm run build
- [ ] 部署阶段 - 创建容器
- [ ] 部署阶段 - 启动服务
- [ ] 健康检查 - 服务就绪

#### Zeabur部署日志关键信息
```bash
# 正常部署日志示例:
#13 DONE 34.7s  # npm install完成
#14 DONE 4.7s   # prisma generate完成
#16 DONE 45.2s  # npm run build完成
✅ Deployment succeeded
🚀 Service is live at https://your-domain.zeabur.app
```

#### 异常检测
```bash
# 如果看到以下错误:
❌ "Expected unicode escape" - 换行符问题
❌ "Module not found" - 依赖问题
❌ "Prisma Client not generated" - Prisma问题
❌ "Database connection failed" - 数据库配置问题
```

### 2.5 部署完成验证

#### 执行命令
```bash
# 1. 检查部署状态
curl -I https://your-domain.zeabur.app

# 2. 检查健康端点
curl https://your-domain.zeabur.app/api/health

# 3. 检查版本信息(如有)
curl https://your-domain.zeabur.app/api/version

# 4. 检查部署时间
# 通过uptime字段判断
curl -s https://your-domain.zeabur.app/api/health | jq .uptime
# 如果uptime很小(几秒到几分钟),说明刚部署
```

#### 预期结果
```
✅ HTTP 200 OK
✅ 健康检查通过
✅ uptime接近0(新部署)
✅ 服务正常响应
```

### 2.6 Zeabur特定检查

#### 检查清单
- [ ] 域名配置正确
- [ ] SSL证书有效
- [ ] 日志正常输出
- [ ] 资源使用正常
- [ ] 自动扩展配置(如启用)

#### 执行命令
```bash
# 1. 检查SSL证书
curl -vI https://your-domain.zeabur.app 2>&1 | grep -A 5 "SSL certificate"

# 2. 检查响应头
curl -I https://your-domain.zeabur.app
# 查找 X-Zeabur-* 头部

# 3. 检查WebSocket支持
curl -I https://your-domain.zeabur.app \
  -H "Upgrade: websocket" \
  -H "Connection: Upgrade"

# 4. 查看Zeabur日志
# Zeabur Dashboard → Logs
```

#### 预期结果
```
✅ SSL/TLS: 有效
✅ X-Zeabur-Request-Id: 存在
✅ WebSocket升级: 支持
✅ 日志输出: 正常
```

---

## 3. 生产环境检查

### 3.1 服务可用性检查

#### 执行命令
```bash
# 1. 基础可用性
curl -I https://aijiayuan.top/

# 2. API健康检查
curl -s https://aijiayuan.top/api/health | jq .

# 3. WebSocket服务
curl -s https://aijiayuan.top/api/websocket-status | jq .

# 4. 核心页面检查
for page in / /marketplace /business-plan; do
  echo -n "$page: "
  curl -s -o /dev/null -w "%{http_code}\n" "https://aijiayuan.top$page"
done
```

#### 预期结果
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T...",
  "uptime": 123.45,
  "responseTime": 2,
  "checks": {
    "database": {"status": "healthy", "latency": 2},
    "aiServices": {"status": "healthy", "message": "3/3 services configured"},
    "environment": {"status": "healthy"}
  }
}
```

### 3.2 性能指标检查

#### 执行命令
```bash
# 1. API响应时间
time curl -s https://aijiayuan.top/api/health > /dev/null

# 2. 页面加载时间
time curl -s https://aijiayuan.top/ > /dev/null

# 3. 数据库查询延迟
curl -s https://aijiayuan.top/api/health | jq '.checks.database.latency'

# 4. 使用Apache Bench进行压力测试(可选)
ab -n 100 -c 10 https://aijiayuan.top/api/health
```

#### 性能基准
```
✅ API响应: < 100ms
✅ 数据库延迟: < 50ms
✅ 页面加载: < 2s
✅ 并发处理: > 50 req/s
```

### 3.3 安全配置检查

#### 执行命令
```bash
# 1. 检查安全头部
curl -I https://aijiayuan.top/ | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)"

# 2. 检查CORS配置
curl -I https://aijiayuan.top/api/health \
  -H "Origin: https://evil.com"

# 3. 检查SSL配置
nmap --script ssl-enum-ciphers -p 443 aijiayuan.top

# 4. 使用在线工具
# https://securityheaders.com/?q=https://aijiayuan.top
# https://www.ssllabs.com/ssltest/analyze.html?d=aijiayuan.top
```

#### 预期结果
```
✅ HSTS已启用: max-age=31536000
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ X-XSS-Protection: 1; mode=block
✅ SSL等级: A或A+
```

### 3.4 功能完整性检查

#### 测试场景

##### 场景1: 用户认证流程
```bash
# 1. 注册新用户
curl -X POST https://aijiayuan.top/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'

# 2. 登录
TOKEN=$(curl -s -X POST https://aijiayuan.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }' | jq -r .token)

# 3. 验证Token
curl -s https://aijiayuan.top/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

##### 场景2: AI竞价流程(需浏览器)
```javascript
// 在浏览器控制台执行
const testBidding = async () => {
  // 1. 创建创意
  const idea = await fetch('/api/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '测试创意',
      description: '这是一个测试创意',
      category: 'TECHNOLOGY'
    })
  }).then(r => r.json());

  console.log('创意创建:', idea);

  // 2. 连接WebSocket
  const ws = new WebSocket(`wss://aijiayuan.top/api/bidding/${idea.ideaId}`);

  ws.onopen = () => console.log('WebSocket已连接');
  ws.onmessage = (e) => console.log('收到消息:', JSON.parse(e.data));
  ws.onerror = (e) => console.error('WebSocket错误:', e);
};

testBidding();
```

##### 场景3: 商业计划生成(验证认证时序修复)
```bash
# 1. 创建会话(模拟竞价完成)
SESSION_ID="test-session-$(date +%s)"

# 2. 立即访问(5分钟内,应该免认证成功)
curl -s "https://aijiayuan.top/api/business-plan-session?sessionId=$SESSION_ID"
# 预期: 200 OK (而非401)

# 3. 等待6分钟后访问(应该要求认证)
sleep 360
curl -s "https://aijiayuan.top/api/business-plan-session?sessionId=$SESSION_ID"
# 预期: 401 Unauthorized
```

### 3.5 数据一致性检查

#### 执行命令
```bash
# 1. 检查数据库连接池
# 通过健康检查API的数据库延迟判断

# 2. 检查Redis连接(如使用)
curl -s https://aijiayuan.top/api/cache/status

# 3. 检查会话存储
curl -s https://aijiayuan.top/api/websocket-status | jq '.activeConnections'

# 4. 检查数据完整性(需数据库访问)
# 在服务器执行或通过管理API
```

### 3.6 监控和日志检查

#### 检查清单
- [ ] 错误日志无异常堆积
- [ ] 访问日志正常记录
- [ ] 性能指标在阈值内
- [ ] 告警系统正常工作

#### 执行命令
```bash
# 1. 检查错误率
# 如使用Sentry等工具,查看错误面板

# 2. 检查服务器日志
# Zeabur Dashboard → Logs → Filter: ERROR

# 3. 检查访问模式
# 查看access logs,识别异常流量

# 4. 模拟告警
# 触发一个已知错误,验证告警系统
```

### 3.7 备份和恢复检查

#### 检查清单
- [ ] 数据库自动备份运行
- [ ] 备份文件可访问
- [ ] 恢复流程已测试
- [ ] RTO/RPO符合要求

#### 执行命令
```bash
# 1. 检查最近备份
# PostgreSQL: 查看Zeabur数据库备份

# 2. 验证备份完整性(在测试环境)
# 恢复最近备份到测试数据库

# 3. 记录备份信息
echo "最后备份时间: $(date)"
echo "备份大小: XXX MB"
echo "备份位置: Zeabur自动备份"
```

---

## 4. 快速检查脚本

### 4.1 本地快速检查

```bash
#!/bin/bash
# local-check.sh

echo "=== 本地环境快速检查 ==="
echo ""

# 1. Node版本
echo "Node版本:"
node --version

# 2. 环境变量
echo -e "\n环境变量:"
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"

# 3. 依赖
echo -e "\n依赖状态:"
[ -d node_modules ] && echo "✅ node_modules exists" || echo "❌ node_modules missing"

# 4. 构建测试
echo -e "\n执行构建测试..."
npm run build > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"

# 5. 类型检查
echo -e "\n类型检查..."
npm run typecheck > /dev/null 2>&1 && echo "✅ Type check passed" || echo "❌ Type check failed"

# 6. 换行符检查
echo -e "\n换行符检查..."
CRLF_COUNT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l $'\r' {} \; | wc -l)
[ "$CRLF_COUNT" -eq 0 ] && echo "✅ No CRLF found" || echo "❌ Found $CRLF_COUNT files with CRLF"

echo -e "\n=== 检查完成 ==="
```

### 4.2 Zeabur部署检查

```bash
#!/bin/bash
# zeabur-check.sh

DOMAIN="https://your-domain.zeabur.app"

echo "=== Zeabur部署检查 ==="
echo "域名: $DOMAIN"
echo ""

# 1. 服务可用性
echo "1. 服务可用性:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN")
[ "$STATUS" = "200" ] && echo "✅ Service is up ($STATUS)" || echo "❌ Service error ($STATUS)"

# 2. 健康检查
echo -e "\n2. 健康检查:"
HEALTH=$(curl -s "$DOMAIN/api/health" | jq -r '.status')
[ "$HEALTH" = "healthy" ] && echo "✅ Health check passed" || echo "❌ Health check failed: $HEALTH"

# 3. 数据库
echo -e "\n3. 数据库:"
DB_STATUS=$(curl -s "$DOMAIN/api/health" | jq -r '.checks.database.status')
[ "$DB_STATUS" = "healthy" ] && echo "✅ Database healthy" || echo "❌ Database issue: $DB_STATUS"

# 4. AI服务
echo -e "\n4. AI服务:"
AI_STATUS=$(curl -s "$DOMAIN/api/health" | jq -r '.checks.aiServices.status')
[ "$AI_STATUS" = "healthy" ] && echo "✅ AI services ready" || echo "❌ AI services issue: $AI_STATUS"

# 5. WebSocket
echo -e "\n5. WebSocket:"
WS_STATUS=$(curl -s "$DOMAIN/api/websocket-status" | jq -r '.websocketServerRunning')
[ "$WS_STATUS" = "true" ] && echo "✅ WebSocket running" || echo "❌ WebSocket not running"

echo -e "\n=== 检查完成 ==="
```

### 4.3 生产环境全面检查

```bash
#!/bin/bash
# production-check.sh

DOMAIN="https://aijiayuan.top"

echo "=== 生产环境全面检查 ==="
echo "域名: $DOMAIN"
echo "时间: $(date)"
echo ""

# 1. 服务状态
echo "1. 服务状态:"
curl -s "$DOMAIN/api/health" | jq '{status: .status, uptime: .uptime, responseTime: .responseTime}'

# 2. 核心页面
echo -e "\n2. 核心页面:"
for page in / /marketplace /business-plan; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$page")
  [ "$code" = "200" ] && echo "✅ $page: $code" || echo "❌ $page: $code"
done

# 3. API端点
echo -e "\n3. API端点:"
for endpoint in /api/health /api/websocket-status; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$endpoint")
  [ "$code" = "200" ] && echo "✅ $endpoint: $code" || echo "❌ $endpoint: $code"
done

# 4. 安全头部
echo -e "\n4. 安全头部:"
curl -sI "$DOMAIN" | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options)" | sed 's/^/  /'

# 5. 性能测试
echo -e "\n5. 响应时间:"
for i in {1..5}; do
  time=$(curl -s -w "%{time_total}" -o /dev/null "$DOMAIN/api/health")
  echo "  尝试 $i: ${time}s"
done

# 6. WebSocket测试
echo -e "\n6. WebSocket状态:"
curl -s "$DOMAIN/api/websocket-status" | jq '{running: .websocketServerRunning, connections: .activeConnections}'

echo -e "\n=== 检查完成 ==="
```

### 4.4 完整流程检查

```bash
#!/bin/bash
# full-pipeline-check.sh

echo "========================================"
echo "  完整流程检查 - 本地到生产"
echo "========================================"
echo ""

# 第一步: 本地检查
echo "📍 第一步: 本地环境检查"
echo "----------------------------------------"
./local-check.sh
echo ""

# 第二步: 代码质量
echo "📍 第二步: 代码质量检查"
echo "----------------------------------------"
echo "换行符检查..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l $'\r' {} \; && echo "❌ 发现CRLF" || echo "✅ 无CRLF"
echo "BOM检查..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sh -c 'head -c 3 "$1" | grep -q $'"'"'\xEF\xBB\xBF'"'"' && echo "$1"' _ {} \; && echo "❌ 发现BOM" || echo "✅ 无BOM"
echo ""

# 第三步: Git状态
echo "📍 第三步: Git状态检查"
echo "----------------------------------------"
git status --short
UNPUSHED=$(git log origin/$(git branch --show-current)..HEAD --oneline | wc -l)
echo "未推送提交: $UNPUSHED"
[ "$UNPUSHED" -eq 0 ] && echo "✅ 所有提交已推送" || echo "⚠️ 有 $UNPUSHED 个未推送提交"
echo ""

# 第四步: Zeabur部署检查
echo "📍 第四步: Zeabur部署检查"
echo "----------------------------------------"
read -p "已推送到GitHub并等待部署完成? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./zeabur-check.sh
fi
echo ""

# 第五步: 生产环境检查
echo "📍 第五步: 生产环境检查"
echo "----------------------------------------"
./production-check.sh
echo ""

echo "========================================"
echo "  检查完成"
echo "========================================"
```

---

## 5. 问题排查指南

### 5.1 本地构建失败

#### 问题: Expected unicode escape
**原因**: Windows换行符(CRLF)问题

**排查**:
```bash
# 查找CRLF文件
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l $'\r' {} \;
```

**解决**:
```bash
# 转换为LF
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\r$//' {} \;

# 或使用dos2unix
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec dos2unix {} \;
```

#### 问题: Module not found
**原因**: 依赖未安装或版本不匹配

**排查**:
```bash
# 检查package-lock.json
cat package-lock.json | jq '.packages["node_modules/缺失的包"]'
```

**解决**:
```bash
# 重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 问题: Prisma Client未生成
**原因**: Prisma generate未执行

**排查**:
```bash
# 检查Prisma Client
ls -la node_modules/@prisma/client
```

**解决**:
```bash
npm run db:generate
```

### 5.2 Zeabur部署失败

#### 问题: 构建超时
**原因**: 依赖安装时间过长或网络问题

**解决**:
- 优化package.json,移除不必要的依赖
- 使用npm ci替代npm install
- 检查Zeabur区域设置

#### 问题: 环境变量未设置
**原因**: Zeabur环境变量配置缺失

**排查**:
```bash
# 在Zeabur中添加临时调试
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
```

**解决**:
- Zeabur Dashboard → 环境变量 → 添加缺失的变量
- 重新部署

#### 问题: 数据库连接失败
**原因**: DATABASE_URL格式错误或数据库未就绪

**排查**:
```bash
# 测试连接字符串
node -e "const { PrismaClient } = require('@prisma/client'); new PrismaClient().\$connect().then(() => console.log('OK')).catch(e => console.error(e))"
```

**解决**:
- 检查DATABASE_URL格式
- 确认Zeabur PostgreSQL服务运行中
- 检查网络连接白名单

### 5.3 生产环境问题

#### 问题: 503 Service Unavailable
**原因**: 服务崩溃或正在重启

**排查**:
```bash
# 检查服务状态
curl -I https://aijiayuan.top/

# 查看Zeabur日志
# Dashboard → Logs
```

**解决**:
- 检查应用日志找出崩溃原因
- 验证健康检查端点
- 重启服务

#### 问题: WebSocket连接失败
**原因**: WebSocket配置或防火墙问题

**排查**:
```javascript
// 在浏览器控制台
const ws = new WebSocket('wss://aijiayuan.top/api/bidding/test');
ws.onerror = (e) => console.error(e);
```

**解决**:
- 检查NEXT_PUBLIC_WS_HOST配置
- 验证WebSocket升级头部
- 检查Zeabur WebSocket支持

#### 问题: 认证时序问题复现
**原因**: 5分钟宽限期未生效

**排查**:
```bash
# 检查代码是否部署
curl -s https://aijiayuan.top/api/business-plan-session?sessionId=new-session

# 查看响应头确认部署时间
curl -I https://aijiayuan.top/ | grep -i etag
```

**解决**:
- 确认最新代码已部署
- 检查uptime重置
- 验证修复逻辑

### 5.4 性能问题

#### 问题: 响应时间过长
**原因**: 数据库查询慢、AI API超时等

**排查**:
```bash
# 逐个API测试
time curl -s https://aijiayuan.top/api/health > /dev/null
time curl -s https://aijiayuan.top/api/websocket-status > /dev/null

# 检查数据库延迟
curl -s https://aijiayuan.top/api/health | jq '.checks.database.latency'
```

**解决**:
- 优化数据库索引
- 添加缓存层(Redis)
- 实施CDN
- 优化AI API调用

#### 问题: 内存泄漏
**原因**: WebSocket连接未清理、事件监听器未移除等

**排查**:
```bash
# 监控资源使用
# Zeabur Dashboard → Metrics → Memory

# 检查活跃连接
curl -s https://aijiayuan.top/api/websocket-status | jq '.activeConnections'
```

**解决**:
- 实施连接超时
- 清理事件监听器
- 定期重启服务

---

## 6. 检查频率建议

### 6.1 开发阶段
- **本地检查**: 每次提交前
- **代码质量**: 每次推送前
- **构建测试**: 每日1次

### 6.2 部署阶段
- **Zeabur检查**: 每次部署后
- **环境变量**: 每次配置变更后
- **日志监控**: 部署后15分钟

### 6.3 生产阶段
- **健康检查**: 每5分钟(自动)
- **性能检查**: 每小时1次
- **安全审计**: 每周1次
- **完整检查**: 每日1次

---

## 7. 检查结果记录模板

```markdown
# 环境检查记录

**日期**: YYYY-MM-DD
**检查人**: ___________
**检查类型**: [ ] 本地 [ ] Zeabur [ ] 生产

## 检查结果

### 本地环境
- [ ] 环境配置
- [ ] 依赖安装
- [ ] 代码质量
- [ ] 数据库
- [ ] 本地构建
- [ ] 本地服务

### Zeabur部署
- [ ] 部署前检查
- [ ] 环境变量
- [ ] 部署过程
- [ ] 部署验证

### 生产环境
- [ ] 服务可用性
- [ ] 性能指标
- [ ] 安全配置
- [ ] 功能完整性
- [ ] 数据一致性
- [ ] 监控日志

## 发现的问题

1. **问题描述**: ___________
   - 严重程度: [ ] 高 [ ] 中 [ ] 低
   - 状态: [ ] 待修复 [ ] 已修复
   - 负责人: ___________

## 下一步行动

- [ ] ___________
- [ ] ___________
- [ ] ___________

## 备注

___________
```

---

## 附录

### A. 相关命令速查

```bash
# 本地
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run typecheck    # 类型检查
npm run db:generate  # 生成Prisma Client

# Git
git status           # 检查状态
git push origin master  # 推送到GitHub

# 测试
curl -I URL          # 检查HTTP头
curl -s URL | jq .   # JSON格式化输出
time curl URL        # 测试响应时间

# Zeabur
zeabur deploy        # 手动部署(如有CLI)
zeabur logs          # 查看日志(如有CLI)
```

### B. 关键文件位置

```
.env.local                          # 本地环境变量
.gitattributes                      # Git换行符配置
prisma/schema.prisma                # 数据库模式
src/lib/validate-env.ts             # 环境验证
src/app/api/health/route.ts         # 健康检查
src/app/api/websocket-status/route.ts  # WebSocket状态
docs/PRODUCTION_TESTING_PLAN.md     # 测试计划
```

### C. 联系方式

- **技术支持**: [填写]
- **部署平台**: Zeabur Dashboard
- **代码仓库**: GitHub
- **监控平台**: [填写]

---

**文档版本**: 1.0
**最后更新**: 2025-10-04
**维护人**: Claude Code Assistant
