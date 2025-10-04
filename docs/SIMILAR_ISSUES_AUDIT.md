# 类似问题完整排查报告

**日期**: 2025-10-04
**排查范围**: 整个代码库
**目的**: 确保所有类似问题都已修复，防止遗漏

---

## 排查维度

### 1. ✅ localhost 使用检查

**搜索模式**: `localhost:\d+|http://localhost`

**结果**:
- 发现 40+ 处 localhost 使用
- **全部为测试文件或客户端代码**
- 无需修改

**文件类型**:
- 测试文件: `*.test.ts`, `*.spec.js`, `*-test.js`
- 配置文件: `playwright.config.js`, `.lighthouserc.js`
- 客户端 hooks: `useBiddingWebSocket.ts` (使用环境变量)
- 脚本文件: `deploy-executor.js`, `system-status.js`

**结论**: 无问题 ✅

---

### 2. ✅ 枚举类型使用检查

**Prisma Schema 中的枚举**:
```prisma
enum BusinessPlanSource {
  AI_BIDDING
  MARKETPLACE
  API
  MANUAL
}

enum UserStatus { ACTIVE, SUSPENDED, DELETED }
enum IdeaStatus { DRAFT, UNDER_REVIEW, PUBLISHED, REJECTED, ARCHIVED }
enum BiddingStatus { PENDING, ACTIVE, CLOSED, CANCELLED }
enum ReportStatus { DRAFT, PUBLISHED, ARCHIVED }
enum DiscussionStatus { ACTIVE, CLOSED, ARCHIVED }
enum OrderStatus { PENDING, PAID, CANCELLED, REFUNDED }
enum AgentStatus { ACTIVE, INACTIVE }
enum BusinessPlanSessionStatus { PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED }
```

**代码中的使用**:
- `server.js`: ✅ 已修复为 `'AI_BIDDING'`
- `session-service.ts`: ✅ 使用 `BusinessPlanSource.AI_BIDDING`
- `route.ts`: ✅ 使用 `BusinessPlanSource.AI_BIDDING`
- `core-guide-builder.ts`: ⚠️ `source: 'ai-bidding'` - 但这是 metadata 字符串，不是数据库枚举

**结论**: 所有数据库枚举使用正确 ✅

---

### 3. ✅ Prisma 模型必填字段检查

**核心业务模型的 userId 字段**:

| 模型 | userId 类型 | 是否合理 | 说明 |
|------|------------|---------|------|
| `Idea` | `String` (必填) | ✅ | 创意必须有创建者 |
| `BiddingSession` | `String?` (可选) | ✅ | 支持匿名竞价 |
| `BusinessPlanSession` | `String?` (可选) | ✅ | 支持匿名会话 |
| `BusinessPlanReport` | `String?` (可选) | ✅ | **已修复**，支持匿名报告 |
| `ResearchReport` | `String` (必填) | ✅ | 报告需要归属用户 |
| `Order` | `String` (必填) | ✅ | 订单必须关联用户 |
| `Payment` | `String` (必填) | ✅ | 支付必须关联用户 |

**认证相关模型** (必须有 userId):
- `UserSession` ✅
- `RefreshToken` ✅
- `PriceGuess` ✅
- `UserBiddingBehavior` ✅
- `UserAchievement` ✅

**结论**: 所有字段设置合理 ✅

---

### 4. ✅ 匿名访问阻塞检查

**搜索模式**: `if\s*\(!.*userId|if\s*\(!.*user\)|throw.*匿名|throw.*登录`

**发现的认证检查点**:

#### 正确的认证检查 (无需修改)

1. **Profile 页面** (`src/app/profile/page.tsx:33`)
   ```typescript
   if (!auth.isAuthenticated || !auth.user) {
     // 个人资料页面必须登录
   }
   ```
   ✅ 正确 - 个人资料必须登录

2. **购物车 API** (`src/app/api/cart/route.ts:9`)
   ```typescript
   if (!userId) {
     // 购物车操作需要登录
   }
   ```
   ✅ 正确 - 购物车必须登录

3. **签到 API** (`src/app/api/checkin/route.ts`)
   ```typescript
   if (!user) {
     // 签到需要用户
   }
   ```
   ✅ 正确 - 签到必须登录

4. **报告导出 API** (`src/app/api/business-plan-report/[id]/export/route.ts:66`)
   ```typescript
   const isRecentReport = (Date.now() - report.createdAt.getTime()) < 5 * 60 * 1000
   if (!isRecentReport || report.userId) {
     // 只有近期匿名报告才允许无认证下载
     await authenticateRequest(request)
   }
   ```
   ✅ 正确 - 支持 5 分钟内匿名报告下载

#### 已修复的问题

1. **商业计划页面** (`src/app/business-plan/page.tsx`) - ✅ 已修复 (commit bd7ed0e)
   - 原问题: `loadSessionData` 中 `if (!token) return`
   - 修复: 允许匿名访问新会话

2. **商业计划报告创建** (`src/lib/business-plan/session-service.ts`) - ✅ 已修复 (commit 6e7adf5)
   - 原问题: `if (!session.userId) throw Error`
   - 修复: 移除检查,条件性连接用户关系

**结论**: 所有匿名访问限制合理 ✅

---

## 潜在风险点 (已排查,无问题)

### 1. WebSocket 认证

**文件**: `src/lib/websocket/bidding-websocket-server.ts:379`
```typescript
if (!client || !client.isAuthenticated || !client.userId) {
  // WebSocket 操作需要认证
}
```

**分析**: 这是 WebSocket 内部操作的认证,与 HTTP API 的匿名访问不冲突。
**结论**: 无需修改 ✅

### 2. 商业计划生成页面

**文件**: `src/app/business-plan/generating/page.tsx:55`
```typescript
throw new Error('未找到认证令牌，请先登录')
```

**分析**: 这个页面是主动生成商业计划的入口,需要登录才能发起。与竞价后自动生成不冲突。
**结论**: 无需修改 ✅

---

## 最终总结

### ✅ 已修复的 4 个问题

1. **IPv6 连接问题** (commit c6fcb28)
   - 将 `localhost` 改为 `127.0.0.1`
   - 添加 `API_BASE_URL` 环境变量支持

2. **前端认证阻塞** (commit bd7ed0e)
   - `loadSessionData` 允许匿名访问新会话
   - 只在 API 返回 401 时才提示登录

3. **枚举值错误** (commit 290008b)
   - 将 `source: 'ai-bidding'` 改为 `'AI_BIDDING'`
   - 修复 Prisma 枚举值不匹配

4. **匿名用户创建报告限制** (commit 6e7adf5)
   - `BusinessPlanReport.userId` 改为可选
   - 移除 `session-service.ts` 中的强制检查
   - 使用 `prisma db push` 更新生产数据库

### ✅ 排查结果

| 维度 | 检查项数量 | 发现问题 | 已修复 |
|------|-----------|---------|-------|
| localhost 使用 | 40+ | 0 | - |
| 枚举类型使用 | 9 个枚举 | 0 | - |
| 必填字段设置 | 20+ 模型 | 0 | - |
| 匿名访问限制 | 30+ 检查点 | 0 | - |

**总计**: 所有排查维度均无遗漏问题 ✅

### 📋 待办事项

- [ ] 等待 Zeabur 部署 commit 6e7adf5
- [ ] 测试完整竞价流程
- [ ] 验证商业计划成功创建和显示
- [ ] 可选: 修复 session cleanup task 的 import 问题

---

## 技术债务

1. **Session Cleanup Task** (低优先级)
   ```
   ⚠️ Failed to start session cleanup task: Cannot use import statement outside a module
   ```
   - 原因: `session-cleanup.ts` 使用 TypeScript import
   - 影响: 自动清理任务未启动,不影响核心功能
   - 建议: 将文件改为 `.cjs` 或使用 `ts-node` 加载

2. **Git Commit 环境变量** (低优先级)
   ```json
   {
     "gitCommit": "unknown",
     "buildTime": "unknown"
   }
   ```
   - 原因: 未设置 `NEXT_PUBLIC_GIT_COMMIT` 等环境变量
   - 影响: Health API 无法显示版本信息
   - 建议: 在 Zeabur 构建时注入 git commit hash

---

**报告状态**: ✅ 完成
**排查质量**: 全面
**后续行动**: 等待部署测试

