-- 添加Agent预算管理表
-- 用途：将竞价Agent的每日预算从内存迁移到数据库
-- 执行方式：在生产数据库中手动执行此SQL

-- 创建agent_budgets表
CREATE TABLE IF NOT EXISTS "agent_budgets" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "daily_limit" INTEGER NOT NULL DEFAULT 2000,
    "remaining_budget" INTEGER NOT NULL,
    "total_spent" INTEGER NOT NULL DEFAULT 0,
    "bid_count" INTEGER NOT NULL DEFAULT 0,
    "last_bid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_budgets_pkey" PRIMARY KEY ("id")
);

-- 创建唯一索引：每个agent每天只有一条预算记录
CREATE UNIQUE INDEX IF NOT EXISTS "agent_budgets_agent_id_date_key" ON "agent_budgets"("agent_id", "date");

-- 创建查询索引
CREATE INDEX IF NOT EXISTS "agent_budgets_agent_id_date_idx" ON "agent_budgets"("agent_id", "date");
CREATE INDEX IF NOT EXISTS "agent_budgets_date_idx" ON "agent_budgets"("date");

-- 创建Agent使用日志表（如果不存在）
CREATE TABLE IF NOT EXISTS "agent_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "agent_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "session_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_usage_logs_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "agent_usage_logs_agent_id_module_created_at_idx" ON "agent_usage_logs"("agent_id", "module", "created_at");
CREATE INDEX IF NOT EXISTS "agent_usage_logs_user_id_agent_id_idx" ON "agent_usage_logs"("user_id", "agent_id");
CREATE INDEX IF NOT EXISTS "agent_usage_logs_created_at_idx" ON "agent_usage_logs"("created_at");

-- 创建Agent使用统计表（如果不存在）
CREATE TABLE IF NOT EXISTS "agent_usage_stats" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_uses" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_usage_stats_pkey" PRIMARY KEY ("id")
);

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS "agent_usage_stats_agent_id_module_date_key" ON "agent_usage_stats"("agent_id", "module", "date");

-- 创建查询索引
CREATE INDEX IF NOT EXISTS "agent_usage_stats_agent_id_module_idx" ON "agent_usage_stats"("agent_id", "module");
CREATE INDEX IF NOT EXISTS "agent_usage_stats_date_idx" ON "agent_usage_stats"("date");

-- 初始化5个竞价Agent的今日预算（可选）
-- 注意：执行前请检查今天是否已有数据
DO $$
DECLARE
    today_date TIMESTAMP;
BEGIN
    today_date := DATE_TRUNC('day', CURRENT_TIMESTAMP);

    -- tech-pioneer-alex
    INSERT INTO "agent_budgets" ("id", "agent_id", "date", "daily_limit", "remaining_budget", "total_spent", "bid_count", "created_at", "updated_at")
    VALUES (
        'agent_budget_' || 'tech-pioneer-alex' || '_' || TO_CHAR(today_date, 'YYYYMMDD'),
        'tech-pioneer-alex',
        today_date,
        2000,
        2000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT ("agent_id", "date") DO NOTHING;

    -- business-guru-beta
    INSERT INTO "agent_budgets" ("id", "agent_id", "date", "daily_limit", "remaining_budget", "total_spent", "bid_count", "created_at", "updated_at")
    VALUES (
        'agent_budget_' || 'business-guru-beta' || '_' || TO_CHAR(today_date, 'YYYYMMDD'),
        'business-guru-beta',
        today_date,
        2000,
        2000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT ("agent_id", "date") DO NOTHING;

    -- innovation-mentor-charlie
    INSERT INTO "agent_budgets" ("id", "agent_id", "date", "daily_limit", "remaining_budget", "total_spent", "bid_count", "created_at", "updated_at")
    VALUES (
        'agent_budget_' || 'innovation-mentor-charlie' || '_' || TO_CHAR(today_date, 'YYYYMMDD'),
        'innovation-mentor-charlie',
        today_date,
        2000,
        2000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT ("agent_id", "date") DO NOTHING;

    -- market-insight-delta
    INSERT INTO "agent_budgets" ("id", "agent_id", "date", "daily_limit", "remaining_budget", "total_spent", "bid_count", "created_at", "updated_at")
    VALUES (
        'agent_budget_' || 'market-insight-delta' || '_' || TO_CHAR(today_date, 'YYYYMMDD'),
        'market-insight-delta',
        today_date,
        2000,
        2000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT ("agent_id", "date") DO NOTHING;

    -- investment-advisor-ivan
    INSERT INTO "agent_budgets" ("id", "agent_id", "date", "daily_limit", "remaining_budget", "total_spent", "bid_count", "created_at", "updated_at")
    VALUES (
        'agent_budget_' || 'investment-advisor-ivan' || '_' || TO_CHAR(today_date, 'YYYYMMDD'),
        'investment-advisor-ivan',
        today_date,
        2000,
        2000,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT ("agent_id", "date") DO NOTHING;

    RAISE NOTICE 'Agent budgets initialized for %', today_date;
END $$;

-- 验证表创建
SELECT
    'agent_budgets' as table_name,
    COUNT(*) as record_count
FROM "agent_budgets"
UNION ALL
SELECT
    'agent_usage_logs' as table_name,
    COUNT(*) as record_count
FROM "agent_usage_logs"
UNION ALL
SELECT
    'agent_usage_stats' as table_name,
    COUNT(*) as record_count
FROM "agent_usage_stats";
