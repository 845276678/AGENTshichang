import { NextRequest } from 'next/server'
import {
  authenticateRequest,
  handleApiError,
  handleApiSuccess
} from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await authenticateRequest(request)

    return handleApiSuccess({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      credits: user.credits,
      level: user.level,
      totalSpent: user.totalSpent,
      totalEarned: user.totalEarned,
      guessAccuracy: user.guessAccuracy,
      consecutiveGuesses: user.consecutiveGuesses,
      bestStreak: user.bestStreak,
      favoriteAgent: user.favoriteAgent,
      status: user.status,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    })

  } catch (error) {
    return handleApiError(error)
  }
}