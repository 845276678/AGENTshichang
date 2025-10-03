# 生产环境就绪检查报告

## 📋 目录
1. [竞价页面流程与功能](#1-竞价页面流程与功能)
2. [商业计划书页面流程与功能](#2-商业计划书页面流程与功能)
3. [关键问题与修复建议](#3-关键问题与修复建议)
4. [环境配置检查](#4-环境配置检查)
5. [数据库检查](#5-数据库检查)
6. [API安全性检查](#6-api安全性检查)
7. [监控与日志](#7-监控与日志)

---

## 1. 竞价页面流程与功能

### 1.1 完整流程
```
用户访问 → /marketplace/bidding?ideaId=xxx&autoStart=1
         ↓
StageBasedBidding 组件加载
         ↓
UnifiedBiddingStage 建立 WebSocket 连接
         ↓
5个阶段流转：
  ├─ warmup (1分钟) - AI预热，介绍自己
  ├─ discussion (3分钟) - AI深度讨论创意
  ├─ bidding (4分钟) - AI竞价出价
  ├─ prediction (2分钟) - 用户补充创意
  └─ result (2分钟) - 展示结果
         ↓
生成商业计划书按钮 → POST /api/business-plan-session
         ↓
跳转到 /business-plan?sessionId=xxx
```

### 1.2 核心功能清单

#### ✅ 已实现功能
- [x] WebSocket实时连接 (`useBiddingWebSocket`)
- [x] 5个AI人物（老王、艾克斯、小琳、李博、阿伦）
- [x] 5阶段流转（warmup → discussion → bidding → prediction → result）
- [x] AI对话生成（使用 DeepSeek、智谱GLM、通义千问）
- [x] 实时出价显示
- [x] 用户补充创意功能
- [x] 支持AI人物功能
- [x] 成本追踪（`session.cost`）
- [x] 观众计数（`viewerCount`）
- [x] 重连机制
- [x] 阶段进度条显示

#### 🔴 关键配置项
```typescript
// websocket-server.ts:80-86
const phaseDurations = {
  warmup: 1 * 60,      // 1分钟
  discussion: 3 * 60,   // 3分钟
  bidding: 4 * 60,      // 4分钟
  prediction: 2 * 60,   // 2分钟 (用户补充阶段)
  result: 2 * 60        // 2分钟
}
```

### 1.3 WebSocket消息类型
```typescript
// 客户端 → 服务端
- start.bidding: 启动竞价，发送创意内容
- user.supplement: 用户补充创意
- user.reaction: 用户反应
- user.support: 支持某个AI
- user.prediction: 用户预测价格
- heartbeat: 心跳

// 服务端 → 客户端
- session.init: 初始化会话状态
- stage.started: 阶段开始
- timer.update: 倒计时更新
- persona.speech: AI发言
- bid.placed: AI出价
- cost.update: 成本更新
- stage.ended: 会话结束
```

---

## 2. 商业计划书页面流程与功能

### 2.1 完整流程
```
竞价结束后点击"生成商业计划书"
         ↓
POST /api/business-plan-session
  └─ 参数: ideaId, ideaContent, highestBid, winner, aiMessages, currentBids
         ↓
BusinessPlanSessionService.createSession
  ├─ 扣减积分（500积分）
  ├─ 保存快照到 BusinessPlanSession
  └─ 创建 CreditTransaction 记录
         ↓
composeBusinessPlanGuide
  └─ 根据竞价数据生成5阶段指南
         ↓
BusinessPlanSessionService.completeSession
  ├─ 创建 BusinessPlanReport
  └─ 记录 BusinessPlanAudit
         ↓
返回 sessionId 和 businessPlanUrl
         ↓
页面跳转到 /business-plan?sessionId=xxx
         ↓
GET /api/business-plan-session?sessionId=xxx
         ↓
展示 LandingCoachDisplay 组件
  ├─ 章节导航
  ├─ 关键洞察卡片
  ├─ 执行计划
  └─ 导出功能（Markdown/PDF/DOCX）
```

### 2.2 核心功能清单

#### ✅ 已实现功能
- [x] 会话创建与积分扣减
- [x] 竞价快照保存
- [x] 商业计划指南生成（5阶段）
- [x] 报告持久化存储
- [x] 审计日志记录
- [x] 会话过期机制（24小时）
- [x] 按sessionId加载
- [x] 按reportId加载
- [x] Markdown导出
- [x] 分享链接生成

#### ⚠️ 部分实现/需完善
- [⚠️] PDF导出（API存在但未集成渲染服务）
- [⚠️] DOCX导出（API存在但未实现）
- [⚠️] 外部分享权限控制（需要鉴权）
- [⚠️] 会话清理定时任务（30分钟后清理，但没有cron job）

### 2.3 数据库表结构
```prisma
BusinessPlanSession {
  id: String @id
  userId: String? (可选，支持匿名)
  ideaId: String?
  source: BusinessPlanSource (AI_BIDDING | MARKETPLACE | MANUAL)
  status: BusinessPlanSessionStatus (PENDING | COMPLETED | FAILED)
  snapshot: Json (竞价快照数据)
  expiresAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

BusinessPlanReport {
  id: String @id
  sessionId: String (必需)
  userId: String (必需) ⚠️ 修复过的字段
  guide: Json (完整指南内容)
  metadata: Json (元数据)
  createdAt: DateTime
}

BusinessPlanAudit {
  id: String @id
  sessionId: String
  action: String (SESSION_CREATED | GUIDE_GENERATED | SESSION_DELETED)
  payload: Json?
  createdBy: String
  createdAt: DateTime
}
```

---

## 3. 关键问题与修复建议

### 3.1 ✅ 已修复的问题

#### 问题1: 用户补充对话框显示时机
**状态**: ✅ 已修复 (commit d68d3df)
- **原因**: 阶段时长太长（34分钟才到prediction阶段）
- **修复**: 调整阶段时长，总时长从43分钟降到12分钟

#### 问题2: 商业计划书生成失败
**状态**: ✅ 已修复 (commit 3f5f6c1)
- **原因**: `BusinessPlanReport.create()` 缺少必需的 `user` 字段
- **修复**: 添加 `user: { connect: { id: session.userId } }`

#### 问题3: 支付积分余额跟踪错误
**状态**: ✅ 已修复 (commit da76af3)
- **原因**: `balanceBefore` 硬编码为0，未使用事务
- **修复**: 使用事务包装，正确计算余额前后值

### 3.2 🔴 待修复的生产环境问题

#### 问题1: 缺少竞价页面入口路由
**严重程度**: 🔴 高
**文件**: `src/app/bidding/[ideaId]/page.tsx` (不存在)
**问题**: 无法通过 `/bidding/xxx` 访问竞价页面
**当前解决方案**: 使用 `/marketplace/bidding?ideaId=xxx`
**建议**:
```typescript
// 创建 src/app/bidding/[ideaId]/page.tsx
export default function BiddingPage({ params }: { params: { ideaId: string } }) {
  return <StageBasedBidding ideaId={params.ideaId} autoStart={true} />
}
```

#### 问题2: WebSocket连接地址硬编码
**严重程度**: 🔴 高
**文件**: `useBiddingWebSocket.ts`
**问题**: WebSocket URL可能使用 `localhost` 或 `ws://` 而非 `wss://`
**建议**:
```typescript
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host
const wsUrl = `${wsProtocol}//${wsHost}/api/ws/bidding?ideaId=${ideaId}`
```

#### 问题3: AI服务密钥未验证
**严重程度**: 🔴 高
**文件**: `ai-service-manager.ts`
**问题**: 未检查环境变量是否存在，可能导致运行时错误
**建议**:
```typescript
// 启动时验证
function validateAIKeys() {
  const required = ['DEEPSEEK_API_KEY', 'ZHIPU_API_KEY', 'DASHSCOPE_API_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required AI service keys: ${missing.join(', ')}`)
  }
}
```

#### 问题4: 积分不足时没有友好提示
**严重程度**: 🟡 中
**文件**: `session-service.ts:43-44`
**问题**: 抛出错误但前端可能显示为500错误
**建议**:
```typescript
if (user.credits < BUSINESS_PLAN_CREDIT_COST) {
  // 返回特定错误码，前端可以识别并跳转充值页
  throw new Error(`INSUFFICIENT_CREDITS:${BUSINESS_PLAN_CREDIT_COST}`)
}
```

#### 问题5: 会话清理机制未实现
**严重程度**: 🟡 中
**文件**: `websocket-server.ts:388-390`
**问题**: 注释说30分钟后清理，但没有定时任务
**建议**:
```typescript
// 添加定时清理任务
setInterval(() => {
  const now = Date.now()
  activeSessions.forEach((session, ideaId) => {
    if (now - session.startTime.getTime() > 30 * 60 * 1000) {
      activeSessions.delete(ideaId)
    }
  })
}, 5 * 60 * 1000) // 每5分钟清理一次
```

#### 问题6: 错误日志缺少上下文信息
**严重程度**: 🟡 中
**文件**: 多处 `console.error`
**问题**: 生产环境日志难以追踪问题
**建议**: 使用结构化日志
```typescript
logger.error('AI对话生成失败', {
  sessionId: session.id,
  ideaId: session.ideaId,
  phase: session.currentPhase,
  personaId: persona.id,
  error: error.message,
  timestamp: Date.now()
})
```

#### 问题7: 缺少健康检查端点
**严重程度**: 🟡 中
**文件**: 无
**建议**: 添加 `/api/health` 路由
```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    // 检查AI服务（可选）
    return NextResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 })
  }
}
```

---

## 4. 环境配置检查

### 4.1 必需环境变量

#### 🔴 生产环境必需
```bash
# 数据库
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"

# JWT鉴权
JWT_SECRET="[至少32位随机字符串]"

# AI服务商
DEEPSEEK_API_KEY="sk-xxx"
ZHIPU_API_KEY="xxx.xxx"
DASHSCOPE_API_KEY="sk-xxx"

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="[至少32位随机字符串]"
NODE_ENV="production"
```

#### 🟡 可选但建议配置
```bash
# 商业计划书配置
BUSINESS_PLAN_SESSION_TTL_HOURS="24"
BUSINESS_PLAN_CREDIT_COST="500"

# WebSocket配置
NEXT_PUBLIC_WS_HOST="your-domain.com"

# 监控
SENTRY_DSN="https://xxx@sentry.io/xxx"
LOG_LEVEL="info"
```

### 4.2 配置验证清单

- [ ] 所有必需环境变量已设置
- [ ] JWT_SECRET 至少32位且随机生成
- [ ] 数据库URL包含SSL参数 (`?sslmode=require`)
- [ ] AI服务API密钥有效且有足够额度
- [ ] WebSocket地址配置正确（生产环境使用wss://）
- [ ] NODE_ENV 设置为 production

---

## 5. 数据库检查

### 5.1 Schema完整性

#### ✅ 核心表已定义
- [x] User (用户表)
- [x] Idea (创意表)
- [x] CreditTransaction (积分交易)
- [x] BusinessPlanSession (商业计划会话)
- [x] BusinessPlanReport (商业计划报告)
- [x] BusinessPlanAudit (审计日志)
- [x] BiddingSession (竞价会话)
- [x] PriceGuess (价格预测)

### 5.2 必需的Prisma迁移

```bash
# 检查待迁移文件
npx prisma migrate status

# 生产环境执行迁移
npx prisma migrate deploy

# 生成Prisma客户端
npx prisma generate
```

### 5.3 数据库索引检查

#### 🔴 建议添加的索引
```sql
-- 商业计划会话查询优化
CREATE INDEX idx_business_plan_session_user ON "BusinessPlanSession"("userId");
CREATE INDEX idx_business_plan_session_idea ON "BusinessPlanSession"("ideaId");
CREATE INDEX idx_business_plan_session_expires ON "BusinessPlanSession"("expiresAt");

-- 商业计划报告查询优化
CREATE INDEX idx_business_plan_report_session ON "BusinessPlanReport"("sessionId");
CREATE INDEX idx_business_plan_report_user ON "BusinessPlanReport"("userId");

-- 积分交易查询优化
CREATE INDEX idx_credit_transaction_user ON "CreditTransaction"("userId");
CREATE INDEX idx_credit_transaction_created ON "CreditTransaction"("createdAt");

-- 审计日志查询优化
CREATE INDEX idx_business_plan_audit_session ON "BusinessPlanAudit"("sessionId");
CREATE INDEX idx_business_plan_audit_created ON "BusinessPlanAudit"("createdAt");
```

---

## 6. API安全性检查

### 6.1 认证检查

#### ✅ 已实现
- [x] `authenticateRequest()` 函数存在
- [x] POST /api/business-plan-session 需要认证
- [x] JWT token验证

#### 🔴 需要添加
```typescript
// GET /api/business-plan-session 应该验证用户权限
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request) // 添加这行

  // ... 验证用户是否有权访问该sessionId/reportId
  if (session.userId && session.userId !== user.id) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized'
    }, { status: 403 })
  }
}
```

### 6.2 输入验证

#### 🟡 需要加强
```typescript
// POST /api/business-plan-session:78-80
// 当前只检查 ideaContent，需要添加更多验证
if (!body || !body.ideaContent) {
  return NextResponse.json({
    success: false,
    error: '缺少必要的创意内容参数'
  }, { status: 400 })
}

// 建议添加：
// - 检查 ideaContent 长度（防止过长）
// - 验证 highestBid 是否为合理数字
// - 验证 aiMessages 数组格式
// - 清理 XSS 攻击向量
```

### 6.3 速率限制

#### 🔴 缺失
**问题**: 无速率限制，可能被滥用
**建议**: 使用 `next-rate-limit` 或 Redis
```typescript
import rateLimit from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limitResult = await rateLimit.check(request, {
    uniqueTokenPerInterval: 500,
    interval: 60000 // 1分钟
  })

  if (!limitResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Too many requests'
    }, { status: 429 })
  }

  // ... 正常处理
}
```

---

## 7. 监控与日志

### 7.1 日志级别配置

#### 🔴 当前问题
- 大量 `console.log` 和 `console.error`
- 无结构化日志
- 无日志级别控制

#### 建议方案
```typescript
// src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// 使用示例
logger.info('WebSocket连接建立', {
  ideaId,
  sessionId,
  userId
})
```

### 7.2 关键监控指标

#### 竞价系统
- [ ] WebSocket连接数
- [ ] 活跃会话数 (`activeSessions.size`)
- [ ] 平均会话时长
- [ ] AI服务调用成功率
- [ ] AI服务响应时间
- [ ] 每个会话的AI成本

#### 商业计划书
- [ ] 会话创建成功率
- [ ] 报告生成成功率
- [ ] 平均生成时长
- [ ] 积分扣减成功率
- [ ] 报告下载次数

#### 系统级
- [ ] API响应时间 (p50, p95, p99)
- [ ] 错误率 (4xx, 5xx)
- [ ] 数据库查询时间
- [ ] 数据库连接池使用率

### 7.3 告警规则建议

```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical

  - name: slow_api_response
    condition: api_p95_latency > 3s
    duration: 5m
    severity: warning

  - name: ai_service_failure
    condition: ai_service_success_rate < 90%
    duration: 5m
    severity: critical

  - name: insufficient_credits_spike
    condition: insufficient_credits_errors > 10 per minute
    duration: 5m
    severity: warning

  - name: websocket_connection_failure
    condition: websocket_connection_errors > 5 per minute
    duration: 5m
    severity: critical
```

---

## 8. 部署清单

### 8.1 部署前检查

- [ ] 运行 `npm run build` 确保无构建错误
- [ ] 运行 `npx prisma migrate deploy` 执行数据库迁移
- [ ] 运行 `npx prisma generate` 生成Prisma客户端
- [ ] 验证所有环境变量已配置
- [ ] 验证AI服务API密钥有效
- [ ] 配置SSL证书（WebSocket需要wss://）
- [ ] 配置CORS策略
- [ ] 设置健康检查端点
- [ ] 配置日志输出目录
- [ ] 配置监控和告警

### 8.2 启动命令

```bash
# 生产环境启动
NODE_ENV=production npm run start

# 或使用PM2
pm2 start npm --name "ai-marketplace" -- start

# 或使用Docker
docker-compose up -d
```

### 8.3 回滚计划

1. 保留上一版本的Docker镜像
2. 数据库迁移使用 `prisma migrate` 而非手动SQL（支持回滚）
3. 使用蓝绿部署或金丝雀发布
4. 准备快速回滚脚本

---

## 9. 性能优化建议

### 9.1 前端优化
- [ ] 启用 Next.js 的 ISR (Incremental Static Regeneration)
- [ ] 使用 `React.lazy()` 懒加载大组件（已实现）
- [ ] 优化图片（使用 next/image）
- [ ] 启用 HTTP/2
- [ ] 配置CDN

### 9.2 后端优化
- [ ] 使用数据库连接池
- [ ] 添加Redis缓存层
- [ ] AI响应结果缓存（相同创意内容）
- [ ] 使用消息队列异步处理（如商业计划书生成）
- [ ] 数据库查询优化（使用索引）

### 9.3 WebSocket优化
- [ ] 使用Redis Pub/Sub支持横向扩展
- [ ] 添加心跳机制（已有）
- [ ] 设置合理的超时时间
- [ ] 压缩WebSocket消息

---

## 10. 总结

### ✅ 可以上生产的部分
1. 竞价页面的核心流程（WebSocket通信、AI对话、阶段流转）
2. 商业计划书生成和展示
3. 积分系统
4. 用户认证

### 🔴 必须修复才能上生产
1. **WebSocket连接地址配置** - 需要支持wss://和动态host
2. **AI服务密钥验证** - 启动时检查密钥是否存在
3. **API鉴权完善** - GET接口需要验证用户权限
4. **添加健康检查端点** - 用于负载均衡器探测
5. **日志结构化** - 替换console.log为结构化日志

### 🟡 建议修复（影响用户体验）
1. 积分不足时的友好提示
2. 会话自动清理机制
3. 速率限制
4. 输入验证加强
5. 监控和告警系统

### 📊 预估工作量
- 必须修复项：2-3天
- 建议修复项：3-5天
- 监控和告警系统：3-5天
- **总计：8-13天**

---

## 附录：快速修复脚本

### A.1 环境变量验证脚本
```bash
#!/bin/bash
# scripts/validate-env.sh

required_vars=(
  "DATABASE_URL"
  "JWT_SECRET"
  "DEEPSEEK_API_KEY"
  "ZHIPU_API_KEY"
  "DASHSCOPE_API_KEY"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
)

missing=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing+=("$var")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
else
  echo "✅ All required environment variables are set"
  exit 0
fi
```

### A.2 数据库健康检查脚本
```typescript
// scripts/check-db-health.ts
import { prisma } from '@/lib/database'

async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection: OK')

    const userCount = await prisma.user.count()
    console.log(`✅ User count: ${userCount}`)

    const sessionCount = await prisma.businessPlanSession.count()
    console.log(`✅ Business plan sessions: ${sessionCount}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    process.exit(1)
  }
}

checkDatabaseHealth()
```

### A.3 生产环境部署检查清单
```markdown
## 部署日检查清单

### 部署前
- [ ] 代码已合并到 main/master 分支
- [ ] 所有测试通过
- [ ] 数据库迁移文件已生成
- [ ] 环境变量已配置
- [ ] API密钥已验证

### 部署中
- [ ] 停止旧版本服务
- [ ] 执行数据库迁移
- [ ] 启动新版本服务
- [ ] 健康检查通过
- [ ] WebSocket连接正常

### 部署后
- [ ] 监控5分钟无异常
- [ ] 手动测试关键流程
- [ ] 检查错误日志
- [ ] 验证AI服务调用
- [ ] 通知团队部署完成

### 回滚触发条件
- [ ] 错误率超过5%
- [ ] 响应时间超过5秒
- [ ] 数据库连接失败
- [ ] AI服务全部失败
- [ ] WebSocket无法连接
```
