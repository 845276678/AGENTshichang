#!/usr/bin/env node
/**
 * 数据库迁移脚本
 * 用途：自动执行Agent预算管理系统的数据库迁移
 * 使用：node scripts/migrate-agent-budget.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始执行Agent预算系统数据库迁移...\n')

  try {
    // 1. 检查数据库连接
    console.log('1. 检查数据库连接...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('   ✅ 数据库连接成功')

    // 2. 检查表是否已存在
    console.log('\n2. 检查表结构...')
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('agent_budgets', 'agent_usage_logs', 'agent_usage_stats')
    `

    const existingTables = tables.map(t => t.table_name)
    console.log(`   现有表: ${existingTables.join(', ') || '无'}`)

    // 3. 创建agent_budgets表
    if (!existingTables.includes('agent_budgets')) {
      console.log('\n3. 创建agent_budgets表...')
      await prisma.$executeRaw`
        CREATE TABLE "agent_budgets" (
          "id" TEXT NOT NULL,
          "agent_id" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "daily_limit" INTEGER NOT NULL DEFAULT 2000,
          "remaining_budget" INTEGER NOT NULL,
          "total_spent" INTEGER NOT NULL DEFAULT 0,
          "bid_count" INTEGER NOT NULL DEFAULT 0,
          "last_bid_at" TIMESTAMP(3),
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "agent_budgets_pkey" PRIMARY KEY ("id")
        )
      `

      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "agent_budgets_agent_id_date_key" ON "agent_budgets"("agent_id", "date")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_budgets_agent_id_date_idx" ON "agent_budgets"("agent_id", "date")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_budgets_date_idx" ON "agent_budgets"("date")
      `

      console.log('   ✅ agent_budgets表创建成功')
    } else {
      console.log('   ℹ️ agent_budgets表已存在，跳过创建')
    }

    // 4. 创建agent_usage_logs表
    if (!existingTables.includes('agent_usage_logs')) {
      console.log('\n4. 创建agent_usage_logs表...')
      await prisma.$executeRaw`
        CREATE TABLE "agent_usage_logs" (
          "id" TEXT NOT NULL,
          "user_id" TEXT,
          "agent_id" TEXT NOT NULL,
          "module" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "session_id" TEXT,
          "metadata" JSONB,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "agent_usage_logs_pkey" PRIMARY KEY ("id")
        )
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_usage_logs_agent_id_module_created_at_idx" ON "agent_usage_logs"("agent_id", "module", "created_at")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_usage_logs_user_id_agent_id_idx" ON "agent_usage_logs"("user_id", "agent_id")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_usage_logs_created_at_idx" ON "agent_usage_logs"("created_at")
      `

      console.log('   ✅ agent_usage_logs表创建成功')
    } else {
      console.log('   ℹ️ agent_usage_logs表已存在，跳过创建')
    }

    // 5. 创建agent_usage_stats表
    if (!existingTables.includes('agent_usage_stats')) {
      console.log('\n5. 创建agent_usage_stats表...')
      await prisma.$executeRaw`
        CREATE TABLE "agent_usage_stats" (
          "id" TEXT NOT NULL,
          "agent_id" TEXT NOT NULL,
          "module" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "total_uses" INTEGER NOT NULL DEFAULT 0,
          "unique_users" INTEGER NOT NULL DEFAULT 0,
          "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "agent_usage_stats_pkey" PRIMARY KEY ("id")
        )
      `

      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "agent_usage_stats_agent_id_module_date_key" ON "agent_usage_stats"("agent_id", "module", "date")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_usage_stats_agent_id_module_idx" ON "agent_usage_stats"("agent_id", "module")
      `

      await prisma.$executeRaw`
        CREATE INDEX "agent_usage_stats_date_idx" ON "agent_usage_stats"("date")
      `

      console.log('   ✅ agent_usage_stats表创建成功')
    } else {
      console.log('   ℹ️ agent_usage_stats表已存在，跳过创建')
    }

    // 6. 初始化今日预算
    console.log('\n6. 初始化Agent今日预算...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const agents = [
      'tech-pioneer-alex',
      'business-guru-beta',
      'innovation-mentor-charlie',
      'market-insight-delta',
      'investment-advisor-ivan'
    ]

    let initializedCount = 0

    for (const agentId of agents) {
      const existing = await prisma.$queryRaw`
        SELECT id FROM agent_budgets
        WHERE agent_id = ${agentId} AND date = ${today}
      `

      if (existing.length === 0) {
        const budgetId = `agent_budget_${agentId}_${today.toISOString().split('T')[0].replace(/-/g, '')}`

        await prisma.$executeRaw`
          INSERT INTO agent_budgets (
            id, agent_id, date, daily_limit, remaining_budget,
            total_spent, bid_count, created_at, updated_at
          ) VALUES (
            ${budgetId}, ${agentId}, ${today}, 2000, 2000,
            0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
        initializedCount++
      }
    }

    console.log(`   ✅ 初始化了 ${initializedCount} 个Agent的今日预算`)

    // 7. 验证迁移结果
    console.log('\n7. 验证迁移结果...')
    const budgetRecords = await prisma.$queryRaw`
      SELECT agent_id, daily_limit, remaining_budget, total_spent, bid_count
      FROM agent_budgets
      WHERE date = ${today}
      ORDER BY agent_id
    `

    console.log('\n📊 今日Agent预算情况:')
    console.table(budgetRecords)

    console.log('\n🎉 数据库迁移完成！')
    console.log('\n✅ 系统现在使用数据库存储Agent预算')
    console.log('✅ 服务重启后预算不会丢失')
    console.log('✅ 多实例部署时预算统一管理')
    console.log('✅ 可查询历史预算使用情况')

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message)
    console.error('\n🔧 可能的解决方案:')
    console.error('1. 检查DATABASE_URL配置是否正确')
    console.error('2. 确认数据库连接是否正常')
    console.error('3. 检查数据库用户是否有DDL权限')
    console.error('4. 尝试手动执行 prisma/migrations/add_agent_budget.sql')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)