# 数据库迁移指南 - Maturity Assessments v2.0

## 迁移概述

本次迁移添加了创意成熟度评估系统v2.0的数据库支持（10分制评分体系）。

## 迁移文件

- **文件**: `prisma/migrations/add_maturity_assessments_v2.sql`
- **表名**: `maturity_assessments`
- **添加时间**: 2025-01-15

## 执行步骤

### 1. 生产环境迁移（推荐方法）

由于Prisma检测到schema drift，建议手动执行SQL迁移：

```bash
# 1. 连接到生产数据库
psql $DATABASE_URL

# 2. 执行迁移SQL
\i prisma/migrations/add_maturity_assessments_v2.sql

# 3. 验证表已创建
\d maturity_assessments

# 4. 查看索引
\di+ maturity_assessments*

# 5. 退出
\q
```

### 2. 验证迁移成功

```bash
# 运行生产环境测试
cd tests/production
ts-node test-maturity-api.ts
```

### 3. Prisma Client 更新

```bash
# 生成新的Prisma Client
npx prisma generate

# 验证类型
npx prisma validate
```

## 表结构

```sql
CREATE TABLE "maturity_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,      -- 1.0-10.0
    "level" TEXT NOT NULL,                         -- LOW/GRAY_LOW/MEDIUM/GRAY_HIGH/HIGH
    "confidence" DOUBLE PRECISION NOT NULL,        -- 0.5-1.0
    "dimensions" JSONB NOT NULL,                   -- 5个维度详情
    "valid_signals" JSONB NOT NULL,                -- 有效信号统计
    "invalid_signals" JSONB NOT NULL,              -- 无效信号统计
    "expert_consensus" JSONB NOT NULL,             -- 专家共识
    "scoring_reasons" JSONB NOT NULL,              -- 评分原因
    "weak_dimensions" TEXT[],                      -- 薄弱维度列表
    "workshop_unlocked" BOOLEAN NOT NULL,          -- 工作坊解锁状态
    "scoring_version" TEXT NOT NULL,               -- 评分版本号
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

## 索引

```sql
-- 创意历史查询索引
CREATE INDEX "maturity_assessments_idea_id_created_at_idx"
  ON "maturity_assessments"("idea_id", "created_at");

-- 用户历史查询索引
CREATE INDEX "maturity_assessments_user_id_created_at_idx"
  ON "maturity_assessments"("user_id", "created_at");

-- 会话查询索引
CREATE INDEX "maturity_assessments_session_id_idx"
  ON "maturity_assessments"("session_id");

-- 分数排序索引
CREATE INDEX "maturity_assessments_total_score_idx"
  ON "maturity_assessments"("total_score");

-- 等级查询索引
CREATE INDEX "maturity_assessments_level_idx"
  ON "maturity_assessments"("level");
```

## 数据清理策略

系统会自动清理超过30天的评估记录：

```typescript
// 手动触发清理（仅管理员）
await cleanupOldAssessments(30); // 清理30天前的记录
```

## API端点

迁移完成后，以下API将可用：

1. **POST /api/maturity/assess**
   - 评估创意成熟度并保存到数据库

2. **GET /api/maturity/history**
   - 查询评估历史记录
   - 参数: `ideaId`, `userId`, `sessionId`, `limit`

3. **GET /api/maturity/stats**
   - 查询统计数据（总数、解锁率、平均分、等级分布）

## 回滚方案

如果需要回滚迁移：

```sql
-- 删除表
DROP TABLE IF EXISTS "maturity_assessments";

-- 删除索引会自动删除
```

## 监控指标

迁移后需要监控：

1. **数据库性能**
   - 查询延迟（应 <100ms）
   - 索引命中率（应 >95%）

2. **数据质量**
   - 每日新增评估数
   - 解锁率趋势
   - 平均分分布

3. **存储空间**
   - 表大小增长
   - 30天清理效果

## 故障排查

### 问题1: 表已存在

```sql
-- 检查表是否已存在
SELECT * FROM pg_tables WHERE tablename = 'maturity_assessments';

-- 如果存在，跳过迁移
```

### 问题2: 权限不足

```sql
-- 检查当前用户权限
SELECT current_user, session_user;

-- 授予权限（由DBA执行）
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### 问题3: Prisma Client 版本不匹配

```bash
# 重新生成 Prisma Client
rm -rf node_modules/.prisma
npx prisma generate

# 重新安装依赖
npm install
```

## 联系支持

如有问题，请联系：
- 开发团队: dev@example.com
- Slack频道: #database-migrations

---

**迁移状态**: ⏳ 待执行
**最后更新**: 2025-01-15
**负责人**: Claude Code
