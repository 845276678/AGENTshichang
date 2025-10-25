import { NextRequest } from 'next/server'
import {
  authenticateRequest,
  updateUserCredits,
  handleApiError,
  handleApiSuccess
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await authenticateRequest(request)

    const { amount, type, description, relatedId } = await request.json()

    // 验证输入
    if (typeof amount !== 'number') {
      return handleApiError(new Error('积分数量必须是数字'))
    }

    if (!type || !description) {
      return handleApiError(new Error('交易类型和描述不能为空'))
    }

    // 更新积分
    const updatedUser = await updateUserCredits(
      user.id,
      amount,
      type,
      description,
      relatedId
    )

    return handleApiSuccess({
      credits: updatedUser.credits,
      totalSpent: updatedUser.totalSpent,
      totalEarned: updatedUser.totalEarned,
      transaction: {
        amount,
        type,
        description,
        relatedId
      }
    }, amount > 0 ? '积分充值成功' : '积分消费成功')

  } catch (error) {
    return handleApiError(error)
  }
}