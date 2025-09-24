// 调研报告数据库操作服务
import { prisma, handlePrismaError, PaginationResult, buildPaginationResult, calculatePaginationOffset } from '../database'
import { ResearchReport, ReportStatus } from '@/generated/prisma'
import type { Prisma } from '@/generated/prisma'
import UserService from './user.service'

// 调研报告创建数据类型
export interface CreateResearchReportData {
  ideaId: string
  creditsCost: number
}

// 调研报告更新数据类型
export interface UpdateResearchReportData {
  reportData?: any
  summary?: string
  basicAnalysis?: any
  researchMethods?: any
  dataSources?: any
  mvpGuidance?: any
  businessModel?: any
  status?: ReportStatus
  progress?: number
}

// 调研报告查询过滤器
export interface ResearchReportFilters {
  userId?: string
  ideaId?: string
  status?: ReportStatus
  startDate?: Date
  endDate?: Date
}

// 调研报告数据库操作类
export class ResearchReportService {
  // 创建调研报告
  static async create(userId: string, data: CreateResearchReportData): Promise<ResearchReport> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 检查用户积分是否足够
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { credits: true }
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        if (user.credits < data.creditsCost) {
          throw new Error('积分余额不足')
        }

        // 检查创意是否存在
        const idea = await tx.idea.findUnique({
          where: { id: data.ideaId }
        })

        if (!idea) {
          throw new Error('创意不存在')
        }

        // 扣除用户积分
        await UserService.updateCredits(
          userId,
          -data.creditsCost,
          'RESEARCH_COST',
          '生成调研报告',
          data.ideaId
        )

        // 创建调研报告
        const report = await tx.researchReport.create({
          data: {
            ideaId: data.ideaId,
            userId,
            creditsCost: data.creditsCost,
            status: 'GENERATING',
            progress: 0,
            reportData: {}
          },
          include: {
            idea: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        })

        return report
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据ID获取调研报告
  static async findById(id: string, includeRelations: boolean = true): Promise<ResearchReport | null> {
    try {
      const query: Prisma.ResearchReportFindUniqueArgs = {
        where: { id }
      }

      if (includeRelations) {
        query.include = {
          idea: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              tags: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true
            }
          }
        }
      }

      return await prisma.researchReport.findUnique(query)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新调研报告
  static async update(id: string, data: UpdateResearchReportData): Promise<ResearchReport> {
    try {
      const updateData: any = { ...data }

      // 如果状态更新为完成，设置完成时间
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date()
        updateData.progress = 100
      } else if (data.status === 'FAILED') {
        updateData.progress = 0
      }

      return await prisma.researchReport.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          idea: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新报告进度
  static async updateProgress(id: string, progress: number): Promise<void> {
    try {
      await prisma.researchReport.update({
        where: { id },
        data: {
          progress: Math.min(100, Math.max(0, progress)),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取调研报告列表（分页和过滤）
  static async getReports(
    page: number = 1,
    limit: number = 20,
    filters: ResearchReportFilters = {}
  ): Promise<PaginationResult<ResearchReport>> {
    try {
      const where: any = {}

      // 过滤条件
      if (filters.userId) {where.userId = filters.userId}
      if (filters.ideaId) {where.ideaId = filters.ideaId}
      if (filters.status) {where.status = filters.status}

      // 时间范围过滤
      if (filters.startDate || filters.endDate) {
        where.createdAt = {}
        if (filters.startDate) {where.createdAt.gte = filters.startDate}
        if (filters.endDate) {where.createdAt.lte = filters.endDate}
      }

      const offset = calculatePaginationOffset(page, limit)

      const [reports, total] = await Promise.all([
        prisma.researchReport.findMany({
          where,
          include: {
            idea: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.researchReport.count({ where })
      ])

      return buildPaginationResult(reports, total, page, limit)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取用户的调研报告
  static async getUserReports(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: ReportStatus
  ): Promise<PaginationResult<ResearchReport>> {
    const filters: ResearchReportFilters = { userId }
    if (status) {filters.status = status}

    return this.getReports(page, limit, filters)
  }

  // 获取创意的调研报告
  static async getIdeaReports(
    ideaId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<ResearchReport>> {
    return this.getReports(page, limit, { ideaId })
  }

  // 删除调研报告
  static async delete(id: string, userId: string): Promise<void> {
    try {
      // 检查报告是否属于当前用户
      const report = await prisma.researchReport.findUnique({
        where: { id },
        select: { userId: true, status: true, creditsCost: true }
      })

      if (!report) {
        throw new Error('调研报告不存在')
      }

      if (report.userId !== userId) {
        throw new Error('无权限删除此报告')
      }

      // 如果报告正在生成中，可以退款
      if (report.status === 'GENERATING') {
        await UserService.updateCredits(
          userId,
          report.creditsCost,
          'REFUND',
          '取消调研报告生成',
          id
        )
      }

      await prisma.researchReport.delete({
        where: { id }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 取消调研报告生成
  static async cancel(id: string, userId: string): Promise<ResearchReport> {
    try {
      const report = await prisma.researchReport.findUnique({
        where: { id },
        select: { userId: true, status: true, creditsCost: true }
      })

      if (!report) {
        throw new Error('调研报告不存在')
      }

      if (report.userId !== userId) {
        throw new Error('无权限取消此报告')
      }

      if (report.status !== 'GENERATING') {
        throw new Error('无法取消已完成或失败的报告')
      }

      // 退还积分
      await UserService.updateCredits(
        userId,
        report.creditsCost,
        'REFUND',
        '取消调研报告生成',
        id
      )

      // 更新报告状态
      return await this.update(id, {
        status: 'CANCELLED',
        progress: 0
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取调研报告统计信息
  static async getReportStats(userId?: string) {
    try {
      const where = userId ? { userId } : {}

      const [
        totalReports,
        completedReports,
        generatingReports,
        failedReports,
        totalCreditsSpent
      ] = await Promise.all([
        prisma.researchReport.count({ where }),
        prisma.researchReport.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.researchReport.count({ where: { ...where, status: 'GENERATING' } }),
        prisma.researchReport.count({ where: { ...where, status: 'FAILED' } }),
        prisma.researchReport.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { creditsCost: true }
        })
      ])

      return {
        total: totalReports,
        completed: completedReports,
        generating: generatingReports,
        failed: failedReports,
        totalCreditsSpent: totalCreditsSpent._sum.creditsCost || 0,
        successRate: totalReports > 0 ? (completedReports / totalReports * 100).toFixed(2) : '0'
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取最近的调研报告
  static async getRecentReports(limit: number = 10): Promise<ResearchReport[]> {
    try {
      return await prisma.researchReport.findMany({
        where: {
          status: 'COMPLETED'
        },
        include: {
          idea: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: limit
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 批量更新报告状态
  static async batchUpdateStatus(
    reportIds: string[],
    status: ReportStatus
  ): Promise<number> {
    try {
      const updateData: any = { status, updatedAt: new Date() }

      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
        updateData.progress = 100
      } else if (status === 'FAILED') {
        updateData.progress = 0
      }

      const result = await prisma.researchReport.updateMany({
        where: { id: { in: reportIds } },
        data: updateData
      })

      return result.count
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 检查用户是否已为某个创意生成过报告
  static async hasUserGeneratedReport(userId: string, ideaId: string): Promise<boolean> {
    try {
      const count = await prisma.researchReport.count({
        where: {
          userId,
          ideaId,
          status: {
            in: ['COMPLETED', 'GENERATING']
          }
        }
      })

      return count > 0
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取生成中的报告列表（用于恢复生成任务）
  static async getGeneratingReports(): Promise<ResearchReport[]> {
    try {
      return await prisma.researchReport.findMany({
        where: {
          status: 'GENERATING',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时内的生成任务
          }
        },
        include: {
          idea: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 存储AI分析结果
  static async saveAnalysisResult(
    reportId: string,
    stage: 'basicAnalysis' | 'researchMethods' | 'dataSources' | 'mvpGuidance' | 'businessModel',
    result: any
  ): Promise<void> {
    try {
      const updateData = {
        [stage]: result,
        updatedAt: new Date()
      }

      await prisma.researchReport.update({
        where: { id: reportId },
        data: updateData
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取报告的完整内容
  static async getReportContent(id: string): Promise<any> {
    try {
      const report = await prisma.researchReport.findUnique({
        where: { id },
        select: {
          id: true,
          reportData: true,
          summary: true,
          basicAnalysis: true,
          researchMethods: true,
          dataSources: true,
          mvpGuidance: true,
          businessModel: true,
          status: true,
          progress: true,
          creditsCost: true,
          createdAt: true,
          completedAt: true,
          idea: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              tags: true
            }
          }
        }
      })

      if (!report) {
        throw new Error('调研报告不存在')
      }

      return report
    } catch (error) {
      handlePrismaError(error)
    }
  }
}

export default ResearchReportService

