import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt:', { email, passwordLength: password?.length })

    // 步骤1：验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: '邮箱和密码不能为空',
        step: 'input_validation'
      })
    }

    // 步骤2：查找用户
    console.log('Looking for user:', email)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        status: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '用户不存在',
        step: 'user_lookup',
        debug: { email, userFound: false }
      })
    }

    console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.passwordHash })

    // 步骤3：检查状态
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        error: '账户已被禁用',
        step: 'status_check',
        debug: { status: user.status }
      })
    }

    // 步骤4：验证密码
    console.log('Verifying password...')
    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        error: '用户密码未设置',
        step: 'password_check',
        debug: { hasPasswordHash: false }
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    console.log('Password verification result:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: '密码错误',
        step: 'password_verification',
        debug: { passwordMatch: false }
      })
    }

    // 如果所有步骤都成功
    return NextResponse.json({
      success: true,
      message: '登录验证成功',
      step: 'completed',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Login test error:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      step: 'exception',
      debug: {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}