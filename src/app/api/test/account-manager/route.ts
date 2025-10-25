import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()

    if (action === 'create_test_account') {
      // 创建测试账户
      const hashedPassword = await hashPassword(password)

      // 先删除如果存在
      await prisma.user.deleteMany({
        where: { email }
      })

      // 创建新用户
      const user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0],
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          credits: 10000,
          status: 'ACTIVE'
        }
      })

      // 创建积分交易记录
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: 10000,
          type: 'REGISTER_BONUS',
          description: '注册奖励',
          balanceBefore: 0,
          balanceAfter: 10000
        }
      })

      return NextResponse.json({
        success: true,
        message: '测试账户创建成功',
        data: {
          email: user.email,
          username: user.username,
          credits: user.credits
        }
      })
    }

    if (action === 'reset_password') {
      // 重置密码
      const hashedPassword = await hashPassword(password)

      const user = await prisma.user.update({
        where: { email },
        data: { passwordHash: hashedPassword }
      })

      return NextResponse.json({
        success: true,
        message: '密码重置成功',
        data: { email: user.email }
      })
    }

    return NextResponse.json({
      success: false,
      error: '无效的操作'
    })

  } catch (error: any) {
    console.error('账户管理错误:', error)
    return NextResponse.json({
      success: false,
      error: '操作失败',
      debug: error.message
    })
  }
}