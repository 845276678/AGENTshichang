import { NextRequest } from 'next/server'
import {
  loginUser,
  handleApiError,
  handleApiSuccess,
  validateEmail
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 登录API开始处理...')
    
    const { email, password } = await request.json()
    console.log('📧 登录邮箱:', email)

    // 验证输入
    if (!email || !password) {
      console.log('❌ 输入验证失败: 邮箱或密码为空')
      return handleApiError(new Error('邮箱和密码不能为空'))
    }

    if (!validateEmail(email)) {
      console.log('❌ 邮箱格式验证失败:', email)
      return handleApiError(new Error('邮箱格式不正确'))
    }

    console.log('✅ 输入验证通过，开始执行登录...')
    
    // 执行登录
    const result = await loginUser(email, password)
    console.log('✅ 登录成功，用户ID:', result.user.id)

    return handleApiSuccess({
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        credits: result.user.credits,
        level: result.user.level,
        guessAccuracy: result.user.guessAccuracy,
        consecutiveGuesses: result.user.consecutiveGuesses,
        totalSpent: result.user.totalSpent,
        totalEarned: result.user.totalEarned
      },
      token: result.token,
      refreshToken: result.refreshToken
    }, '登录成功')

  } catch (error) {
    console.error('❌ 登录API错误:', error)
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return handleApiError(error)
  }
}