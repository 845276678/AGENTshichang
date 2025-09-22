// 用户数据库操作
import { prisma, handlePrismaError, userSelectFields, PaginationResult, buildPaginationResult, calculatePaginationOffset } from '../database'
import { User, UserRole, UserStatus, UserLevel } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

// 用户创建数据类型
export interface CreateUserData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

// 用户更新数据类型
export interface UpdateUserData {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  bio?: string
  emailNotifications?: boolean
  marketingEmails?: boolean
}

// 用户查询选项
export interface UserQueryOptions {
  includeStats?: boolean
  includeRecentActivity?: boolean
}

// 用户数据库操作类
export class UserService {
  // 创建用户
  static async create(userData: CreateUserData): Promise<User> {
    try {
      // 检查邮箱和用户名是否已存在
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email.toLowerCase() },
            { username: userData.username.toLowerCase() }
          ]
        }
      })

      if (existing) {
        throw new Error(
          existing.email === userData.email.toLowerCase()
            ? '邮箱已被使用'
            : '用户名已被使用'
        )
      }

      // 加密密码
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          username: userData.username.toLowerCase(),
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          // 新用户默认赠送1000积分
          credits: 1000,
          // 创建注册奖励记录
          creditTransactions: {
            create: {
              amount: 1000,
              type: 'REGISTER_BONUS',
              description: '新用户注册奖励',
              balanceBefore: 0,
              balanceAfter: 1000
            }
          }
        },
        select: userSelectFields
      })

      return user
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据ID查找用户
  static async findById(id: string, options: UserQueryOptions = {}): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          ...userSelectFields,
          ...(options.includeStats && {
            _count: {
              select: {
                ideas: true,
                researchReports: true,
                creditTransactions: true
              }
            }
          })
        }
      })

      return user
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: userSelectFields
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        select: userSelectFields
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 根据邮箱/用户名/手机号查找用户（用于登录）
  static async findByIdentifier(identifier: string): Promise<(User & { passwordHash: string }) | null> {
    try {
      return await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() },
            { phone: identifier }
          ]
        },
        select: {
          ...userSelectFields,
          passwordHash: true
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新用户信息
  static async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        select: userSelectFields
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新密码
  static async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 12)

      await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 验证密码
  static async verifyPassword(user: User & { passwordHash: string }, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.passwordHash)
    } catch (error) {
      return false
    }
  }

  // 更新最后登录时间
  static async updateLastLogin(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 更新用户积分
  static async updateCredits(
    userId: string,
    amount: number,
    type: 'PURCHASE' | 'RESEARCH_COST' | 'REFUND' | 'ADMIN_ADJUSTMENT',
    description?: string,
    relatedId?: string
  ): Promise<User> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 获取当前用户积分
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { credits: true }
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        const balanceBefore = user.credits
        const balanceAfter = balanceBefore + amount

        // 检查积分是否足够（如果是扣减操作）
        if (amount < 0 && balanceAfter < 0) {
          throw new Error('积分余额不足')
        }

        // 更新用户积分
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            credits: balanceAfter,
            ...(amount > 0 && { totalEarned: { increment: amount } }),
            ...(amount < 0 && { totalSpent: { increment: Math.abs(amount) } }),
            updatedAt: new Date()
          },
          select: userSelectFields
        })

        // 创建积分交易记录
        await tx.creditTransaction.create({
          data: {
            userId,
            amount,
            type,
            description: description || `积分${amount > 0 ? '增加' : '消费'}`,
            relatedId,
            balanceBefore,
            balanceAfter
          }
        })

        return updatedUser
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 检查用户存在性
  static async checkExistence(email: string, username?: string): Promise<{
    emailExists: boolean
    usernameExists: boolean
  }> {
    try {
      const conditions = [
        { email: email.toLowerCase() }
      ]

      if (username) {
        conditions.push({ username: username.toLowerCase() })
      }

      const users = await prisma.user.findMany({
        where: { OR: conditions },
        select: { email: true, username: true }
      })

      return {
        emailExists: users.some(u => u.email === email.toLowerCase()),
        usernameExists: username ? users.some(u => u.username === username.toLowerCase()) : false
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取用户列表（分页）
  static async getUsers(
    page: number = 1,
    limit: number = 20,
    filters: {
      search?: string
      status?: UserStatus
      role?: UserRole
      level?: UserLevel
    } = {}
  ): Promise<PaginationResult<User>> {
    try {
      const where: any = {}

      // 搜索条件
      if (filters.search) {
        where.OR = [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // 过滤条件
      if (filters.status) {where.status = filters.status}
      if (filters.role) {where.role = filters.role}
      if (filters.level) {where.level = filters.level}

      const offset = calculatePaginationOffset(page, limit)

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: userSelectFields,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ])

      return buildPaginationResult(users, total, page, limit)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 删除用户（软删除）
  static async delete(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          updatedAt: new Date()
        }
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 获取用户统计信息
  static async getUserStats(userId: string) {
    try {
      const stats = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          credits: true,
          totalSpent: true,
          totalEarned: true,
          level: true,
          _count: {
            select: {
              ideas: true,
              researchReports: { where: { status: 'COMPLETED' } },
              creditTransactions: true
            }
          }
        }
      })

      if (!stats) {
        throw new Error('用户不存在')
      }

      return {
        currentCredits: stats.credits,
        totalSpent: stats.totalSpent,
        totalEarned: stats.totalEarned,
        level: stats.level,
        ideasCount: stats._count.ideas,
        completedReports: stats._count.researchReports,
        transactionsCount: stats._count.creditTransactions
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  // 升级用户等级
  static async upgradeUserLevel(userId: string): Promise<UserLevel | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalSpent: true, level: true }
      })

      if (!user) {return null}

      // 等级升级规则
      let newLevel: UserLevel | null = null

      if (user.totalSpent >= 100000 && user.level !== 'DIAMOND') {
        newLevel = 'DIAMOND'
      } else if (user.totalSpent >= 50000 && user.level === 'GOLD') {
        newLevel = 'PLATINUM'
      } else if (user.totalSpent >= 20000 && user.level === 'SILVER') {
        newLevel = 'GOLD'
      } else if (user.totalSpent >= 5000 && user.level === 'BRONZE') {
        newLevel = 'SILVER'
      }

      if (newLevel && newLevel !== user.level) {
        await prisma.user.update({
          where: { id: userId },
          data: { level: newLevel }
        })
        return newLevel
      }

      return null
    } catch (error) {
      handlePrismaError(error)
    }
  }
}

export default UserService