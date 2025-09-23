/**
 * Prisma Client 实例
 * 用于数据库操作的全局客户端
 */

import { PrismaClient } from '@/generated/prisma'

// 防止在开发环境下创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma