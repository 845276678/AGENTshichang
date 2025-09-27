import { NextRequest } from 'next/server'
import {
  authenticateRequest,
  handleApiError,
  handleApiSuccess
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await authenticateRequest(request)

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // 构建查询条件
    const whereClause: any = {
      userId: user.id
    }

    if (type) {
      whereClause.type = type
    }

    // 查询交易记录
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          balanceBefore: true,
          balanceAfter: true,
          relatedId: true,
          createdAt: true
        }
      }),
      prisma.creditTransaction.count({
        where: whereClause
      })
    ])

    return handleApiSuccess({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}