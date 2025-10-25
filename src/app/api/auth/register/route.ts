import { NextRequest } from 'next/server'
import {
  registerUser,
  handleApiError,
  handleApiSuccess,
  validateEmail,
  validatePassword,
  validateUsername
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, firstName, lastName } = await request.json()

    // 验证输入
    if (!email || !username || !password) {
      return handleApiError(new Error('邮箱、用户名和密码不能为空'))
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return handleApiError(new Error('邮箱格式不正确'))
    }

    // 验证用户名
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return handleApiError(new Error(usernameValidation.message!))
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return handleApiError(new Error(passwordValidation.message!))
    }

    // 执行注册
    const result = await registerUser({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      firstName,
      lastName
    })

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
    }, '注册成功！您已获得2000积分奖励')

  } catch (error) {
    return handleApiError(error)
  }
}