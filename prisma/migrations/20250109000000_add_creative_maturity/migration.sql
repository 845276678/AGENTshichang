-- CreateTable
CREATE TABLE "creative_maturity_advice" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT,
    "maturity_score" DOUBLE PRECISION NOT NULL,
    "maturity_level" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "expert_advice" JSONB NOT NULL,
    "weak_dimensions" TEXT[],
    "expert_consensus" JSONB NOT NULL,
    "valid_signals" JSONB NOT NULL,
    "invalid_signals" JSONB NOT NULL,
    "scoring_reasons" JSONB NOT NULL,
    "verification_data" JSONB,
    "verification_links" JSONB,
    "verified_at" TIMESTAMP(3),
    "scoring_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "extended_until" TIMESTAMP(3),

    CONSTRAINT "creative_maturity_advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_weight_config" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCanary" BOOLEAN NOT NULL DEFAULT false,
    "canaryPercentage" INTEGER NOT NULL DEFAULT 0,
    "target_customer" DOUBLE PRECISION NOT NULL,
    "demand_scenario" DOUBLE PRECISION NOT NULL,
    "core_value" DOUBLE PRECISION NOT NULL,
    "business_model" DOUBLE PRECISION NOT NULL,
    "credibility" DOUBLE PRECISION NOT NULL,
    "thresholdLowMax" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "thresholdMidMin" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "thresholdMidMax" DOUBLE PRECISION NOT NULL DEFAULT 7.0,
    "thresholdHighMin" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "calibration_set_size" INTEGER,
    "calibration_accuracy" DOUBLE PRECISION,

    CONSTRAINT "scoring_weight_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_order" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),

    CONSTRAINT "verification_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_draft" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creative_maturity_advice_idea_id_created_at_idx" ON "creative_maturity_advice"("idea_id", "created_at");

-- CreateIndex
CREATE INDEX "creative_maturity_advice_expires_at_idx" ON "creative_maturity_advice"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_weight_config_version_key" ON "scoring_weight_config"("version");

-- CreateIndex
CREATE INDEX "verification_order_idea_id_idx" ON "verification_order"("idea_id");

-- CreateIndex
CREATE INDEX "verification_order_user_id_idx" ON "verification_order"("user_id");

-- CreateIndex
CREATE INDEX "questionnaire_draft_idea_id_user_id_idx" ON "questionnaire_draft"("idea_id", "user_id");

-- CreateIndex
CREATE INDEX "questionnaire_draft_expires_at_idx" ON "questionnaire_draft"("expires_at");
