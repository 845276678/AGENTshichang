import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()

    // 获取前几个用户（包含密码字段检查）
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true, // 检查密码哈希字段
        status: true,
        createdAt: true
      }
    })

    // 检查用户是否有密码哈希
    const usersWithPasswordStatus = users.map(user => ({
      ...user,
      hasPassword: !!user.passwordHash,
      passwordHash: user.passwordHash ? '[HIDDEN]' : null // 隐藏实际密码哈希
    }))

    return NextResponse.json({
      success: true,
      data: {
        userCount,
        users: usersWithPasswordStatus,
        databaseConnected: true,
        passwordFieldExists: true
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '数据库连接失败',
      databaseConnected: false
    }, { status: 500 })
  }
}