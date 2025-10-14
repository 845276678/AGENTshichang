import { prisma } from '@/lib/prisma'
import {
  BusinessPlanSource,
  BusinessPlanSessionStatus,
  CreditTransactionType,
  Prisma
} from '@prisma/client'
import type { BusinessPlanGuide } from './types'
import type { BusinessPlanMetadata } from './types'

const DEFAULT_SESSION_EXPIRES_HOURS = Number(process.env.BUSINESS_PLAN_SESSION_TTL_HOURS ?? 24)
const BUSINESS_PLAN_CREDIT_COST = Number(process.env.BUSINESS_PLAN_CREDIT_COST ?? 500)

export interface CreateSessionInput {
  userId?: string
  ideaId?: string
  source?: BusinessPlanSource
  snapshot: Prisma.JsonValue
  expiresInHours?: number
}

export interface CompleteSessionInput {
  sessionId: string
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
}

export class BusinessPlanSessionService {
  static async createSession(input: CreateSessionInput) {
    const expiresAt = new Date(Date.now() + (input.expiresInHours ?? DEFAULT_SESSION_EXPIRES_HOURS) * 60 * 60 * 1000)

    const result = await prisma.$transaction(async tx => {
      if (input.userId) {
        const user = await tx.user.findUnique({
          where: { id: input.userId },
          select: { credits: true, totalSpent: true }
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        if (user.credits < BUSINESS_PLAN_CREDIT_COST) {
          throw new Error(`积分不足，需要 ${BUSINESS_PLAN_CREDIT_COST} 积分生成创意实现建议`)
        }

        await tx.user.update({
          where: { id: input.userId },
          data: {
            credits: { decrement: BUSINESS_PLAN_CREDIT_COST },
            totalSpent: user.totalSpent + BUSINESS_PLAN_CREDIT_COST
          }
        })

        await tx.creditTransaction.create({
          data: {
            userId: input.userId,
            amount: -BUSINESS_PLAN_CREDIT_COST,
            type: CreditTransactionType.BUSINESS_PLAN_COST,
            description: '生成创意实现建议',
            balanceBefore: user.credits,
            balanceAfter: user.credits - BUSINESS_PLAN_CREDIT_COST,
            relatedId: input.ideaId ?? undefined
          }
        })
      }

      const session = await tx.businessPlanSession.create({
        data: {
          userId: input.userId,
          ideaId: input.ideaId,
          source: input.source ?? BusinessPlanSource.AI_BIDDING,
          status: BusinessPlanSessionStatus.PENDING,
          snapshot: input.snapshot,
          expiresAt
        }
      })

      await tx.businessPlanAudit.create({
        data: {
          sessionId: session.id,
          action: 'SESSION_CREATED',
          payload: input.snapshot,
          createdBy: input.userId ?? 'system'
        }
      })

      return session
    })

    return result
  }

  static async completeSession(input: CompleteSessionInput) {
    const { sessionId, guide, metadata } = input
    const result = await prisma.$transaction(async tx => {
      const session = await tx.businessPlanSession.update({
        where: { id: sessionId },
        data: {
          status: BusinessPlanSessionStatus.COMPLETED,
          updatedAt: new Date()
        }
      })

      // 创建报告（支持匿名会话）
      const report = await tx.businessPlanReport.create({
        data: {
          session: {
            connect: { id: sessionId }
          },
          ...(session.userId ? {
            user: {
              connect: { id: session.userId }
            }
          } : {}),
          guide,
          metadata
        }
      })

      await tx.businessPlanAudit.create({
        data: {
          sessionId,
          action: 'GUIDE_GENERATED',
          payload: { metadata },
          createdBy: session.userId ?? 'system'
        }
      })

      return { session, report }
    })

    return result
  }

  static async getSessionWithReport(sessionId: string) {
    return prisma.businessPlanSession.findUnique({
      where: { id: sessionId },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
  }

  static async getReportById(reportId: string) {
    return prisma.businessPlanReport.findUnique({
      where: { id: reportId },
      include: {
        session: true
      }
    })
  }

  static async deleteSession(sessionId: string) {
    await prisma.businessPlanSession.update({
      where: { id: sessionId },
      data: {
        status: BusinessPlanSessionStatus.FAILED,
        updatedAt: new Date()
      }
    })

    await prisma.businessPlanAudit.create({
      data: {
        sessionId,
        action: 'SESSION_DELETED',
        createdBy: 'system'
      }
    })
  }

  static async recordAudit(entry: { sessionId: string; action: string; createdBy?: string; payload?: Prisma.JsonValue }) {
    await prisma.businessPlanAudit.create({
      data: {
        sessionId: entry.sessionId,
        action: entry.action,
        payload: entry.payload,
        createdBy: entry.createdBy ?? 'system'
      }
    })
  }
}
