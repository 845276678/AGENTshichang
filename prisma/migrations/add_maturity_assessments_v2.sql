-- CreateTable: maturity_assessments (10分制评估系统)
CREATE TABLE "maturity_assessments" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    -- 评分结果 (10分制)
    "total_score" DOUBLE PRECISION NOT NULL,
    "level" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    -- 5个维度详情 (JSON)
    "dimensions" JSONB NOT NULL,

    -- The Mom Test信号统计 (JSON)
    "valid_signals" JSONB NOT NULL,
    "invalid_signals" JSONB NOT NULL,

    -- 专家共识 (JSON)
    "expert_consensus" JSONB NOT NULL,

    -- 评分原因块 (JSON)
    "scoring_reasons" JSONB NOT NULL,

    -- 薄弱维度列表
    "weak_dimensions" TEXT[],

    -- 工作坊解锁状态
    "workshop_unlocked" BOOLEAN NOT NULL,

    -- 元数据
    "scoring_version" TEXT NOT NULL,

    -- 时间戳
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maturity_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maturity_assessments_idea_id_created_at_idx" ON "maturity_assessments"("idea_id", "created_at");
CREATE INDEX "maturity_assessments_user_id_created_at_idx" ON "maturity_assessments"("user_id", "created_at");
CREATE INDEX "maturity_assessments_session_id_idx" ON "maturity_assessments"("session_id");
CREATE INDEX "maturity_assessments_total_score_idx" ON "maturity_assessments"("total_score");
CREATE INDEX "maturity_assessments_level_idx" ON "maturity_assessments"("level");

-- Comment
COMMENT ON TABLE "maturity_assessments" IS '创意成熟度评估结果表 (10分制) - v2.0';
