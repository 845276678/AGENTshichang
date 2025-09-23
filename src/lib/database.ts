// 数据库客户端和操作工具
import { PrismaClient } from '@/generated/prisma'

// 全局类型声明
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// 创建Prisma客户端实例
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

// 在开发环境中避免热重载时创建多个实例
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// 向后兼容性：导出db作为prisma的别名
export const db = prisma

// 数据库连接健康检查
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// 优雅关闭数据库连接
export async function closeDatabaseConnection(): Promise<void> {
  await prisma.$disconnect()
}

// 数据库事务辅助函数
export async function executeTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx)
  })
}

// 软删除相关的辅助类型
export type SoftDeleteModel = {
  deletedAt?: Date | null
}

// 导出Prisma类型
export type {
  User,
  UserRole,
  UserStatus,
  UserLevel,
  Idea,
  IdeaCategory,
  IdeaStatus,
  IdeaVisibility,
  ResearchReport,
  ReportStatus,
  CreditTransaction,
  CreditTransactionType,
  Payment,
  PaymentProvider,
  PaymentStatus,
  UserSession,
  RefreshToken,
  SystemConfig,
  AIUsageStats
} from '@/generated/prisma'

// 数据库默认选择字段（排除敏感信息）
export const userSelectFields = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  bio: true,
  status: true,
  role: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  credits: true,
  level: true,
  totalSpent: true,
  totalEarned: true,
  emailNotifications: true,
  marketingEmails: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  // 排除敏感字段
  passwordHash: false,
}

export const ideaSelectFields = {
  id: true,
  title: true,
  description: true,
  category: true,
  tags: true,
  userId: true,
  isAnonymous: true,
  status: true,
  visibility: true,
  viewCount: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userSelectFields
  }
}

// 数据库错误处理
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// 处理Prisma错误
export function handlePrismaError(error: unknown): never {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string }

    switch (prismaError.code) {
      case 'P2002':
        throw new DatabaseError('数据已存在，请检查唯一性约束', prismaError.code, error)
      case 'P2025':
        throw new DatabaseError('记录未找到', prismaError.code, error)
      case 'P2003':
        throw new DatabaseError('外键约束违反', prismaError.code, error)
      case 'P2014':
        throw new DatabaseError('无效的ID格式', prismaError.code, error)
      default:
        throw new DatabaseError(
          `数据库操作失败: ${prismaError.message}`,
          prismaError.code,
          error
        )
    }
  }

  throw new DatabaseError(
    '未知数据库错误',
    'UNKNOWN',
    error
  )
}

// 分页辅助函数
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function calculatePaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const pages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  }
}

// 搜索和过滤辅助函数
export interface SearchParams {
  query?: string
  category?: string
  status?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}

// 构建搜索条件
export function buildSearchConditions(params: SearchParams) {
  const conditions: any = {}

  if (params.query) {
    conditions.OR = [
      { title: { contains: params.query, mode: 'insensitive' } },
      { description: { contains: params.query, mode: 'insensitive' } }
    ]
  }

  if (params.category) {
    conditions.category = params.category
  }

  if (params.status) {
    conditions.status = params.status
  }

  if (params.userId) {
    conditions.userId = params.userId
  }

  if (params.startDate || params.endDate) {
    conditions.createdAt = {}
    if (params.startDate) {
      conditions.createdAt.gte = params.startDate
    }
    if (params.endDate) {
      conditions.createdAt.lte = params.endDate
    }
  }

  return conditions
}

// 通用排序选项
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

export function buildSortConditions(sorts: SortParams[]) {
  return sorts.reduce((acc, sort) => {
    acc[sort.field] = sort.order
    return acc
  }, {} as Record<string, 'asc' | 'desc'>)
}

// 数据库初始化脚本
export async function initializeDatabase() {
  try {
    console.log('正在初始化数据库...')

    // 检查数据库连接
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error('无法连接到数据库')
    }

    // 创建默认系统配置
    await createDefaultSystemConfigs()

    console.log('数据库初始化完成')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

// 创建默认系统配置
async function createDefaultSystemConfigs() {
  const defaultConfigs = [
    {
      key: 'RESEARCH_REPORT_COST',
      value: '500',
      description: '生成调研报告的积分成本'
    },
    {
      key: 'CREDIT_TO_YUAN_RATE',
      value: '100',
      description: '积分兑换人民币汇率（积分:元）'
    },
    {
      key: 'NEW_USER_BONUS',
      value: '1000',
      description: '新用户注册奖励积分'
    },
    {
      key: 'MAX_DAILY_RESEARCH_REPORTS',
      value: '5',
      description: '每日最大调研报告生成数量'
    }
  ]

  for (const config of defaultConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config
    })
  }
}

// 清理过期数据
export async function cleanupExpiredData() {
  const now = new Date()

  try {
    // 清理过期的会话
    const expiredSessions = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })

    // 清理过期的刷新令牌
    const expiredTokens = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isRevoked: true }
        ]
      }
    })

    console.log(`清理完成: ${expiredSessions.count} 个过期会话, ${expiredTokens.count} 个过期令牌`)

    return {
      sessions: expiredSessions.count,
      tokens: expiredTokens.count
    }
  } catch (error) {
    console.error('清理过期数据失败:', error)
    throw error
  }
}

// 数据库统计信息
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      ideaCount,
      reportCount,
      activeSessionCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.researchReport.count(),
      prisma.userSession.count({
        where: {
          expiresAt: {
            gt: new Date()
          }
        }
      })
    ])

    return {
      users: userCount,
      ideas: ideaCount,
      reports: reportCount,
      activeSessions: activeSessionCount
    }
  } catch (error) {
    console.error('获取数据库统计失败:', error)
    throw error
  }
}

export default prisma