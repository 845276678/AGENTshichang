import { NextRequest, NextResponse } from 'next/server'
import PaymentManager from '@/lib/payment'
import { verifyToken } from '@/lib/jwt'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/errors'

// 获取用户支付记录
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('未提供认证token', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return createErrorResponse('token无效或已过期', 401)
    }

    const userId = decoded.userId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 获取用户支付记录
    const paymentManager = new PaymentManager()
    const result = await paymentManager.getUserPayments(userId, page, limit)

    return createSuccessResponse({
      payments: result.payments,
      pagination: {
        total: result.total,
        page,
        limit,
        hasNext: result.hasNext
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}