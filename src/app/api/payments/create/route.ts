import { NextRequest } from 'next/server'
import PaymentManager, { PaymentProvider } from '@/lib/payment'
import { verifyToken } from '@/lib/jwt'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/errors'

// 创建支付订单
export async function POST(request: NextRequest) {
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

    // 解析请求数据
    const { provider, amount, credits, description, clientIp, openid } = await request.json()

    // 验证输入数据
    if (!provider || !amount || !credits) {
      return createErrorResponse('缺少必要参数', 400)
    }

    if (!Object.values(PaymentProvider).includes(provider)) {
      return createErrorResponse('不支持的支付方式', 400)
    }

    if (amount <= 0 || credits <= 0) {
      return createErrorResponse('金额和积分必须大于0', 400)
    }

    // 验证金额和积分的对应关系 (1元 = 100积分)
    const expectedCredits = Math.floor(amount * 100)
    if (Math.abs(credits - expectedCredits) > 10) { // 允许10积分的误差
      return createErrorResponse('金额和积分不匹配', 400)
    }

    // 创建支付订单
    const paymentManager = new PaymentManager()
    const paymentOrder = await paymentManager.createPayment({
      userId,
      provider,
      amount,
      credits,
      description: description || `充值${credits}积分`,
      clientIp: clientIp || request.ip || '127.0.0.1',
      openid
    })

    return createSuccessResponse({
      orderId: paymentOrder.id,
      outTradeNo: paymentOrder.outTradeNo,
      amount: paymentOrder.amount,
      credits: paymentOrder.credits,
      status: paymentOrder.status,
      payUrl: paymentOrder.payUrl,
      qrCodeUrl: paymentOrder.qrCodeUrl,
      expiredAt: paymentOrder.expiredAt
    }, '支付订单创建成功')

  } catch (error) {
    return handleApiError(error)
  }
}

// 查询支付状态
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

    const { searchParams } = new URL(request.url)
    const outTradeNo = searchParams.get('outTradeNo')

    if (!outTradeNo) {
      return createErrorResponse('缺少订单号', 400)
    }

    // 查询支付状态
    const paymentManager = new PaymentManager()
    const paymentOrder = await paymentManager.queryPaymentStatus(outTradeNo)

    // 检查用户权限
    if (paymentOrder.userId !== decoded.userId) {
      return createErrorResponse('无权限访问此订单', 403)
    }

    return createSuccessResponse({
      orderId: paymentOrder.id,
      outTradeNo: paymentOrder.outTradeNo,
      amount: paymentOrder.amount,
      credits: paymentOrder.credits,
      status: paymentOrder.status,
      provider: paymentOrder.provider,
      createdAt: paymentOrder.createdAt,
      paidAt: paymentOrder.paidAt,
      expiredAt: paymentOrder.expiredAt
    })

  } catch (error) {
    return handleApiError(error)
  }
}