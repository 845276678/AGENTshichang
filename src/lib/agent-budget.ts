/**
 * Agent预算管理系统 - 数据库版本
 *
 * 用途：管理竞价系统中AI Agent的每日出价预算
 * 替代：原先存储在内存Map中的预算数据
 * 优势：
 * - 服务重启后预算不会丢失
 * - 多实例部署时预算统一管理
 * - 可以查询历史预算使用情况
 */

import { prisma } from '@/lib/prisma'

const DAILY_BUDGET_LIMIT = 2000 // 每日预算限额

/**
 * 获取今天的日期字符串（YYYY-MM-DD 00:00:00）
 */
function getTodayDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * 获取或初始化Agent的今日预算
 */
export async function getAgentBudget(agentId: string): Promise<{
  dailyLimit: number
  remainingBudget: number
  totalSpent: number
  bidCount: number
}> {
  const today = getTodayDate()

  // 查询或创建今日预算记录
  let budget = await prisma.agentBudget.findUnique({
    where: {
      agentId_date: {
        agentId,
        date: today
      }
    }
  })

  // 如果今天还没有预算记录，创建一个
  if (!budget) {
    budget = await prisma.agentBudget.create({
      data: {
        agentId,
        date: today,
        dailyLimit: DAILY_BUDGET_LIMIT,
        remainingBudget: DAILY_BUDGET_LIMIT,
        totalSpent: 0,
        bidCount: 0
      }
    })
  }

  return {
    dailyLimit: budget.dailyLimit,
    remainingBudget: budget.remainingBudget,
    totalSpent: budget.totalSpent,
    bidCount: budget.bidCount
  }
}

/**
 * 检查Agent是否有足够预算出价
 */
export async function hasEnoughBudget(agentId: string, amount: number): Promise<boolean> {
  const budget = await getAgentBudget(agentId)
  return budget.remainingBudget >= amount
}

/**
 * 扣除Agent预算（原子操作）
 */
export async function deductAgentBudget(
  agentId: string,
  amount: number
): Promise<{
  success: boolean
  remainingBudget: number
  error?: string
}> {
  const today = getTodayDate()

  try {
    // 使用事务确保原子性
    const result = await prisma.$transaction(async (tx) => {
      // 查询当前预算
      const budget = await tx.agentBudget.findUnique({
        where: {
          agentId_date: {
            agentId,
            date: today
          }
        }
      })

      // 如果不存在，先创建
      if (!budget) {
        const newBudget = await tx.agentBudget.create({
          data: {
            agentId,
            date: today,
            dailyLimit: DAILY_BUDGET_LIMIT,
            remainingBudget: DAILY_BUDGET_LIMIT,
            totalSpent: 0,
            bidCount: 0
          }
        })

        // 检查是否足够
        if (newBudget.remainingBudget < amount) {
          throw new Error('Insufficient budget')
        }

        // 扣除预算
        return await tx.agentBudget.update({
          where: {
            agentId_date: {
              agentId,
              date: today
            }
          },
          data: {
            remainingBudget: newBudget.remainingBudget - amount,
            totalSpent: amount,
            bidCount: 1,
            lastBidAt: new Date()
          }
        })
      }

      // 检查预算是否足够
      if (budget.remainingBudget < amount) {
        throw new Error('Insufficient budget')
      }

      // 扣除预算
      return await tx.agentBudget.update({
        where: {
          agentId_date: {
            agentId,
            date: today
          }
        },
        data: {
          remainingBudget: budget.remainingBudget - amount,
          totalSpent: budget.totalSpent + amount,
          bidCount: budget.bidCount + 1,
          lastBidAt: new Date()
        }
      })
    })

    return {
      success: true,
      remainingBudget: result.remainingBudget
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage === 'Insufficient budget') {
      return {
        success: false,
        remainingBudget: 0,
        error: '预算不足'
      }
    }

    return {
      success: false,
      remainingBudget: 0,
      error: `扣除预算失败: ${errorMessage}`
    }
  }
}

/**
 * 获取Agent剩余预算（快速查询）
 */
export async function getRemainingBudget(agentId: string): Promise<number> {
  const budget = await getAgentBudget(agentId)
  return budget.remainingBudget
}

/**
 * 获取所有Agent的今日预算情况（用于监控）
 */
export async function getAllAgentBudgets(date?: Date): Promise<Array<{
  agentId: string
  dailyLimit: number
  remainingBudget: number
  totalSpent: number
  bidCount: number
  usagePercentage: number
}>> {
  const targetDate = date || getTodayDate()

  const budgets = await prisma.agentBudget.findMany({
    where: {
      date: targetDate
    },
    orderBy: {
      totalSpent: 'desc'
    }
  })

  return budgets.map(budget => ({
    agentId: budget.agentId,
    dailyLimit: budget.dailyLimit,
    remainingBudget: budget.remainingBudget,
    totalSpent: budget.totalSpent,
    bidCount: budget.bidCount,
    usagePercentage: (budget.totalSpent / budget.dailyLimit) * 100
  }))
}

/**
 * 重置Agent预算（管理员功能）
 */
export async function resetAgentBudget(agentId: string, date?: Date): Promise<void> {
  const targetDate = date || getTodayDate()

  await prisma.agentBudget.upsert({
    where: {
      agentId_date: {
        agentId,
        date: targetDate
      }
    },
    update: {
      remainingBudget: DAILY_BUDGET_LIMIT,
      totalSpent: 0,
      bidCount: 0,
      lastBidAt: null
    },
    create: {
      agentId,
      date: targetDate,
      dailyLimit: DAILY_BUDGET_LIMIT,
      remainingBudget: DAILY_BUDGET_LIMIT,
      totalSpent: 0,
      bidCount: 0
    }
  })
}

/**
 * 获取Agent历史预算使用情况（用于分析）
 */
export async function getAgentBudgetHistory(
  agentId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{
  date: Date
  dailyLimit: number
  totalSpent: number
  bidCount: number
  usagePercentage: number
}>> {
  const budgets = await prisma.agentBudget.findMany({
    where: {
      agentId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  return budgets.map(budget => ({
    date: budget.date,
    dailyLimit: budget.dailyLimit,
    totalSpent: budget.totalSpent,
    bidCount: budget.bidCount,
    usagePercentage: (budget.totalSpent / budget.dailyLimit) * 100
  }))
}
