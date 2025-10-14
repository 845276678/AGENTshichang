# 数据库迁移指南

## 📋 迁移内容

本次迁移添加了**Agent预算管理系统**的数据库表。

### 新增表结构

1. **agent_budgets** - Agent预算表
2. **agent_usage_logs** - Agent使用日志表
3. **agent_usage_stats** - Agent使用统计表

---

## 🚀 执行步骤

### 1. 登录Zeabur数据库控制台

1. 打开 https://zeabur.com
2. 进入你的项目 → 选择PostgreSQL
3. 点击 "Connect" → 选择 "Web Console"

### 2. 执行SQL脚本

复制 `prisma/migrations/add_agent_budget.sql` 的全部内容并执行

### 3. 验证成功

```sql
SELECT * FROM agent_budgets WHERE date = CURRENT_DATE;
```

应该看到5个Agent的预算记录。

---

## ✅ 完成后无需重启

代码已经支持新的数据库结构，执行SQL后即可生效。

