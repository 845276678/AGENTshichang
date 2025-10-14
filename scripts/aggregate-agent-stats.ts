/**
 * Agent使用统计聚合脚本
 * 每日18:00运行，聚合当天的使用数据到统计表
 *
 * 使用方法：
 * - 手动执行：npm run aggregate-agent-stats
 * - 定时任务：配置cron job在18:00执行
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function aggregateAgentStats() {
  console.log('开始聚合Agent使用统计...')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    // 获取今日所有使用日志
    const logs = await prisma.agentUsageLog.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        agentId: true,
        module: true,
        userId: true
      }
    })

    console.log(`今日共有 ${logs.length} 条使用记录`)

    // 按 agentId + module 分组统计
    const statsMap = new Map<string, {
      agentId: string
      module: string
      totalUses: number
      uniqueUsers: Set<string>
    }>()

    for (const log of logs) {
      const key = `${log.agentId}:${log.module}`

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          agentId: log.agentId,
          module: log.module,
          totalUses: 0,
          uniqueUsers: new Set()
        })
      }

      const stats = statsMap.get(key)!
      stats.totalUses++

      if (log.userId) {
        stats.uniqueUsers.add(log.userId)
      }
    }

    // 批量写入或更新统计数据
    let updatedCount = 0
    let createdCount = 0

    for (const [_, stats] of statsMap) {
      const existing = await prisma.agentUsageStats.findUnique({
        where: {
          agentId_module_date: {
            agentId: stats.agentId,
            module: stats.module,
            date: today
          }
        }
      })

      if (existing) {
        // 更新现有记录
        await prisma.agentUsageStats.update({
          where: {
            id: existing.id
          },
          data: {
            totalUses: stats.totalUses,
            uniqueUsers: stats.uniqueUsers.size
          }
        })
        updatedCount++
      } else {
        // 创建新记录
        await prisma.agentUsageStats.create({
          data: {
            agentId: stats.agentId,
            module: stats.module,
            date: today,
            totalUses: stats.totalUses,
            uniqueUsers: stats.uniqueUsers.size
          }
        })
        createdCount++
      }
    }

    console.log(`聚合完成！创建 ${createdCount} 条新记录，更新 ${updatedCount} 条记录`)
    console.log(`统计详情：`)

    for (const [_, stats] of statsMap) {
      console.log(`  - ${stats.agentId} (${stats.module}): ${stats.totalUses} 次使用，${stats.uniqueUsers.size} 个唯一用户`)
    }

  } catch (error) {
    console.error('聚合失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行聚合
aggregateAgentStats()
  .then(() => {
    console.log('聚合任务完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('聚合任务失败:', error)
    process.exit(1)
  })
