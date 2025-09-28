// 创意数据库操作服务
import { prisma, handlePrismaError, ideaSelectFields, PaginationResult, buildPaginationResult, calculatePaginationOffset } from '../database'
import { Idea, IdeaCategory, IdeaStatus, IdeaVisibility } from '@prisma/client'
import type { Prisma } from '@prisma/client'

// 创意创建数据类型
export interface CreateIdeaData {
  title: string
  description: string
  category: IdeaCategory
  tags?: string[]
  isAnonymous?: boolean
  visibility?: IdeaVisibility
}

// 创意更新数据类型
export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: IdeaCategory
  tags?: string[]
  visibility?: IdeaVisibility
  status?: IdeaStatus
}

// 创意查询过滤器
export interface IdeaFilters {
  search?: string
  category?: IdeaCategory
  status?: IdeaStatus
  visibility?: IdeaVisibility
  userId?: string
  startDate?: Date
  endDate?: Date
}

// 创意排序选项
export interface IdeaSortOptions {
  field: 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'
  order: 'asc' | 'desc'
}

// 创意数据库操作类
export class IdeaService {
  // 创建创意
  static async create(userId: string, data: CreateIdeaData): Promise<Idea> {
    try {
      const idea = await prisma.idea.create({
        data: {
          ...data,
          userId,
          tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || ''),
          isAnonymous: data.isAnonymous || false,
          visibility: data.visibility || 'PUBLIC'
        },
        select: ideaSelectFields
      })

      return idea
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据ID获取创意
  static async findById(id: string, includeUser: boolean = true): Promise<Idea | null> {
    try {
      return await prisma.idea.findUnique({
        where: { id },
        select: {
          ...ideaSelectFields,
          user: includeUser ? { select: ideaSelectFields.user.select } : false
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新创意
  static async update(id: string, userId: string, data: UpdateIdeaData): Promise<Idea> {
    try {
      // 检查创意是否属于当前用户
      const existing = await prisma.idea.findUnique({
        where: { id },
        select: { userId: true }
      })

      if (!existing) {
        throw new Error('创意不存在')
      }

      if (existing.userId !== userId) {
        throw new Error('无权限修改此创意')
      }

      const updateData = { ...data } as any
      if (data.tags && Array.isArray(data.tags)) {
        updateData.tags = data.tags.join(',')
      }

      return await prisma.idea.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        select: ideaSelectFields
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 删除创意
  static async delete(id: string, userId: string): Promise<void> {
    try {
      // 检查创意是否属于当前用户
      const existing = await prisma.idea.findUnique({
        where: { id },
        select: { userId: true }
      })

      if (!existing) {
        throw new Error('创意不存在')
      }

      if (existing.userId !== userId) {
        throw new Error('无权限删除此创意')
      }

      await prisma.idea.delete({
        where: { id }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取创意列表（分页和过滤）
  static async getIdeas(
    page: number = 1,
    limit: number = 20,
    filters: IdeaFilters = {},
    sort: IdeaSortOptions = { field: 'createdAt', order: 'desc' }
  ): Promise<PaginationResult<Idea>> {
    try {
      const where: any = {}

      // 搜索条件
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { tags: { hasSome: [filters.search] } }
        ]
      }

      // 过滤条件
      if (filters.category) {where.category = filters.category}
      if (filters.status) {where.status = filters.status}
      if (filters.visibility) {where.visibility = filters.visibility}
      if (filters.userId) {where.userId = filters.userId}

      // 时间范围过滤
      if (filters.startDate || filters.endDate) {
        where.createdAt = {}
        if (filters.startDate) {where.createdAt.gte = filters.startDate}
        if (filters.endDate) {where.createdAt.lte = filters.endDate}
      }

      const offset = calculatePaginationOffset(page, limit)

      const [ideas, total] = await Promise.all([
        prisma.idea.findMany({
          where,
          select: ideaSelectFields,
          orderBy: { [sort.field]: sort.order },
          skip: offset,
          take: limit
        }),
        prisma.idea.count({ where })
      ])

      return buildPaginationResult(ideas, total, page, limit)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取用户的创意列表
  static async getUserIdeas(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: Omit<IdeaFilters, 'userId'> = {}
  ): Promise<PaginationResult<Idea>> {
    return this.getIdeas(page, limit, { ...filters, userId }, { field: 'createdAt', order: 'desc' })
  }

  // 增加创意浏览量
  static async incrementViewCount(id: string): Promise<void> {
    try {
      await prisma.idea.update({
        where: { id },
        data: {
          viewCount: { increment: 1 }
        }
      })
    } catch (error) {
      // 浏览量更新失败不应该影响主要功能
      console.error('Failed to increment view count:', error)
    }
  }

  // 增加创意点赞数
  static async incrementLikeCount(id: string): Promise<void> {
    try {
      await prisma.idea.update({
        where: { id },
        data: {
          likeCount: { increment: 1 }
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 减少创意点赞数
  static async decrementLikeCount(id: string): Promise<void> {
    try {
      await prisma.idea.update({
        where: { id },
        data: {
          likeCount: { decrement: 1 }
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 审核创意状态
  static async updateStatus(id: string, status: IdeaStatus, _adminId: string): Promise<Idea> {
    try {
      // 检查管理员权限（在实际实现中）
      // const admin = await UserService.findById(adminId)
      // if (!admin || admin.role !== 'ADMIN') {
      //   throw new Error('无权限执行此操作')
      // }

      return await prisma.idea.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
        },
        select: ideaSelectFields
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取热门创意
  static async getPopularIdeas(limit: number = 10): Promise<Idea[]> {
    try {
      return await prisma.idea.findMany({
        where: {
          status: 'APPROVED',
          visibility: 'PUBLIC'
        },
        select: ideaSelectFields,
        orderBy: [
          { likeCount: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取最新创意
  static async getLatestIdeas(limit: number = 10): Promise<Idea[]> {
    try {
      return await prisma.idea.findMany({
        where: {
          status: 'APPROVED',
          visibility: 'PUBLIC'
        },
        select: ideaSelectFields,
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取相关创意（基于分类和标签）
  static async getRelatedIdeas(ideaId: string, limit: number = 5): Promise<Idea[]> {
    try {
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        select: { category: true, tags: true }
      })

      if (!idea) {return []}

      return await prisma.idea.findMany({
        where: {
          AND: [
            { id: { not: ideaId } },
            { status: 'APPROVED' },
            { visibility: 'PUBLIC' },
            {
              OR: [
                { category: idea.category },
                { tags: { contains: idea.tags } }
              ]
            }
          ]
        },
        select: ideaSelectFields,
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 搜索创意
  static async searchIdeas(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginationResult<Idea>> {
    try {
      const where = ({
        AND: [
          { status: IdeaStatus.APPROVED },
          { visibility: IdeaVisibility.PUBLIC },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { description: { contains: query, mode: 'insensitive' as const } },
              { tags: { hasSome: [query] } }
            ]
          }
        ]
      }) as Prisma.IdeaWhereInput

      const offset = calculatePaginationOffset(page, limit)

      const orderByClauses: Prisma.IdeaOrderByWithRelationInput[] = [
        { likeCount: 'desc' as Prisma.SortOrder },
        { viewCount: 'desc' as Prisma.SortOrder },
        { createdAt: 'desc' as Prisma.SortOrder }
      ]

      const [ideas, total] = await Promise.all([
        prisma.idea.findMany({
          where,
          select: ideaSelectFields,
          orderBy: orderByClauses,
          skip: offset,
          take: limit
        }),
        prisma.idea.count({ where })
      ])

      return buildPaginationResult(ideas, total, page, limit)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取创意统计信息
  static async getIdeaStats(ideaId: string) {
    try {
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        select: {
          viewCount: true,
          likeCount: true,
          createdAt: true,
          _count: {
            select: {
              researchReports: true
            }
          }
        }
      })

      if (!idea) {
        throw new Error('创意不存在')
      }

      return {
        viewCount: idea.viewCount,
        likeCount: idea.likeCount,
        reportsCount: idea._count.researchReports,
        daysOld: Math.floor((Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 批量更新创意状态
  static async batchUpdateStatus(
    ideaIds: string[],
    status: IdeaStatus,
    _adminId: string
  ): Promise<number> {
    try {
      const result = await prisma.idea.updateMany({
        where: { id: { in: ideaIds } },
        data: {
          status,
          updatedAt: new Date()
        }
      })

      return result.count
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取分类统计
  static async getCategoryStats(): Promise<{ category: IdeaCategory; count: number }[]> {
    try {
      const stats = await prisma.idea.groupBy({
        by: ['category'],
        where: {
          status: 'APPROVED',
          visibility: 'PUBLIC'
        },
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      })

      return stats.map(stat => ({
        category: stat.category,
        count: stat._count.category
      }))
    } catch (error) {
      handlePrismaError(error)
    }
  }
}

export default IdeaService

