// 支付管理模块
import { prisma } from './database'

export interface PaymentStats {
  totalOrders: number
  successOrders: number
  successRate: number
  totalAmount: number
  averageOrderValue: number
}

export interface PaymentConfig {
  provider: 'alipay' | 'wechat' | 'stripe'
  apiKey: string
  secretKey: string
  webhookSecret: string
  sandbox: boolean
}

export default class PaymentManager {
  private config: PaymentConfig

  constructor() {
    this.config = {
      provider: (process.env.PAYMENT_PROVIDER as any) || 'alipay',
      apiKey: process.env.PAYMENT_API_KEY || '',
      secretKey: process.env.PAYMENT_SECRET_KEY || '',
      webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
      sandbox: process.env.NODE_ENV !== 'production'
    }
  }

  // 创建支付订单
  async createPaymentOrder(params: {
    userId: string
    amount: number
    currency: string
    description: string
    metadata?: Record<string, any>
  }) {
    try {
      // 创建支付记录
      const payment = await prisma.payment.create({
        data: {
          userId: params.userId,
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          status: 'PENDING',
          provider: this.config.provider,
          metadata: params.metadata || {}
        }
      })

      // 根据支付提供商创建支付链接
      const paymentUrl = await this.createPaymentUrl(payment.id, params.amount, params.description)

      return {
        paymentId: payment.id,
        paymentUrl,
        status: 'PENDING'
      }
    } catch (error) {
      console.error('创建支付订单失败:', error)
      throw new Error('创建支付订单失败')
    }
  }

  // 创建支付URL
  private async createPaymentUrl(paymentId: string, amount: number, description: string): Promise<string> {
    // 这里应该根据不同的支付提供商调用相应的API
    // 现在返回一个模拟的支付URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/payment/${paymentId}?amount=${amount}&description=${encodeURIComponent(description)}`
  }

  // 处理支付回调
  async handlePaymentCallback(paymentId: string, status: 'SUCCESS' | 'FAILED', transactionId?: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      })

      if (!payment) {
        throw new Error('支付记录不存在')
      }

      // 更新支付状态
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
          transactionId,
          completedAt: status === 'SUCCESS' ? new Date() : null
        }
      })

      // 如果支付成功，更新用户积分
      if (status === 'SUCCESS') {
        await this.updateUserCredits(payment.userId, payment.amount)
      }

      return { success: true }
    } catch (error) {
      console.error('处理支付回调失败:', error)
      throw new Error('处理支付回调失败')
    }
  }

  // 更新用户积分
  private async updateUserCredits(userId: string, amount: number) {
    try {
      // 计算积分（1元 = 10积分）
      const credits = Math.floor(amount * 10)

      // 更新用户积分
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits
          }
        }
      })

      // 记录积分交易
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          type: 'PAYMENT',
          description: `充值获得 ${credits} 积分`,
          balanceBefore: 0, // 这里应该查询当前余额
          balanceAfter: credits
        }
      })
    } catch (error) {
      console.error('更新用户积分失败:', error)
      throw new Error('更新用户积分失败')
    }
  }

  // 获取支付统计
  async getPaymentStats(since?: Date): Promise<PaymentStats> {
    try {
      const where = since ? { createdAt: { gte: since } } : {}

      const [totalOrders, successOrders, payments] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.count({ 
          where: { ...where, status: 'COMPLETED' } 
        }),
        prisma.payment.findMany({
          where: { ...where, status: 'COMPLETED' },
          select: { amount: true }
        })
      ])

      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const successRate = totalOrders > 0 ? (successOrders / totalOrders) * 100 : 0
      const averageOrderValue = successOrders > 0 ? totalAmount / successOrders : 0

      return {
        totalOrders,
        successOrders,
        successRate: Math.round(successRate * 100) / 100,
        totalAmount,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      }
    } catch (error) {
      console.error('获取支付统计失败:', error)
      return {
        totalOrders: 0,
        successOrders: 0,
        successRate: 0,
        totalAmount: 0,
        averageOrderValue: 0
      }
    }
  }

  // 验证支付签名
  verifyPaymentSignature(payload: string, signature: string): boolean {
    // 这里应该根据支付提供商验证签名
    // 现在返回true表示验证通过
    return true
  }

  // 获取支付配置
  getConfig(): PaymentConfig {
    return { ...this.config }
  }
}
