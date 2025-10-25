import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { email, username, password, firstName, lastName } = await request.json()

    console.log('注册测试开始:', { email, username })

    // 步骤1: 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: existingUser.email === email ? '邮箱已被注册' : '用户名已被占用',
        step: 'check_existing',
        debug: {
          existingUser: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            status: existingUser.status
          }
        }
      })
    }

    // 步骤2: 创建密码哈希
    const hashedPassword = await hashPassword(password)
    console.log('密码哈希成功')

    // 步骤3: 创建用户
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        credits: 10000,
      }
    })

    console.log('用户创建成功:', user.id)

    // 步骤4: 创建积分交易记录
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

    console.log('积分交易记录创建成功')

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          credits: user.credits
        }
      }
    })

  } catch (error: any) {
    console.error('注册测试错误:', error)
    return NextResponse.json({
      success: false,
      error: '注册失败',
      step: 'exception',
      debug: {
        errorMessage: error.message,
        errorStack: error.stack
      }
    })
  }
}