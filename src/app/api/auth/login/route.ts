import { NextRequest } from 'next/server'
import {
  loginUser,
  handleApiError,
  handleApiSuccess,
  validateEmail
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证输入
    if (!email || !password) {
      return handleApiError(new Error('邮箱和密码不能为空'))
    }

    if (!validateEmail(email)) {
      return handleApiError(new Error('邮箱格式不正确'))
    }

    // 执行登录
    const result = await loginUser(email, password)

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
    return handleApiError(error)
  }
}