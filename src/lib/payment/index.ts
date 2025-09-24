// 支付服务统一管理
import AlipayService from './alipay.service'
import WechatPayService from './wechat.service'
import { prisma } from '../database'
import UserService from '../services/user.service'

export enum PaymentProvider {
  ALIPAY = 'alipay',
  WECHAT = 'wechat'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentOrder {
  id: string
  userId: string
  provider: PaymentProvider
  outTradeNo: string
  amount: number
  credits: number
  description: string
  status: PaymentStatus
  providerOrderId?: string
  payUrl?: string
  qrCodeUrl?: string
  createdAt: Date
  paidAt?: Date
  expiredAt: Date
}

export interface CreatePaymentParams {
  userId: string
  provider: PaymentProvider
  amount: number
  credits: number
  description?: string
  clientIp?: string
  openid?: string
}

export class PaymentManager {
  private alipayService?: AlipayService
  private wechatService?: WechatPayService

  constructor() {
    try {
      this.alipayService = new AlipayService()
    } catch (error) {
      console.warn('支付宝服务初始化失败:', error)
    }

    try {
      this.wechatService = new WechatPayService()
    } catch (error) {
      console.warn('微信支付服务初始化失败:', error)
    }
  }

  // 创建支付订单
  async createPayment(params: CreatePaymentParams): Promise<PaymentOrder> {
    try {
      // 生成订单号
      const outTradeNo = this.generateTradeNo()
      const expiredAt = new Date(Date.now() + 30 * 60 * 1000) // 30分钟过期

      // 创建数据库记录
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: params.userId,
          provider: params.provider.toUpperCase(),
          outTradeNo,
          amount: params.amount,
          credits: params.credits,
          description: params.description || `充值${params.credits}积分`,
          status: 'PENDING',
          expiredAt
        }
      })

      let paymentResult: any

      // 根据支付方式创建支付
      switch (params.provider) {
        case PaymentProvider.ALIPAY:
          if (!this.alipayService) {
            throw new Error('支付宝服务未配置')
          }

          paymentResult = await this.alipayService.createPayment({
            outTradeNo,
            amount: params.amount,
            subject: params.description || `充值${params.credits}积分`,
            userId: params.userId,
            credits: params.credits
          })

          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              providerOrderId: paymentResult.orderId,
              payUrl: paymentResult.payUrl,
              qrCodeUrl: paymentResult.qrCode
            }
          })
          break

        case PaymentProvider.WECHAT:
          if (!this.wechatService) {
            throw new Error('微信支付服务未配置')
          }

          if (params.openid) {
            // JSAPI支付
            paymentResult = await this.wechatService.createJSAPIPayment({
              outTradeNo,
              amount: params.amount,
              description: params.description || `充值${params.credits}积分`,
              userId: params.userId,
              credits: params.credits,
              openid: params.openid
            })
          } else if (params.clientIp) {
            // H5支付
            paymentResult = await this.wechatService.createH5Payment({
              outTradeNo,
              amount: params.amount,
              description: params.description || `充值${params.credits}积分`,
              userId: params.userId,
              credits: params.credits,
              clientIp: params.clientIp
            })
          } else {
            // Native支付（二维码）
            paymentResult = await this.wechatService.createNativePayment({
              outTradeNo,
              amount: params.amount,
              description: params.description || `充值${params.credits}积分`,
              userId: params.userId,
              credits: params.credits
            })
          }

          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              providerOrderId: paymentResult.prepayId,
              payUrl: paymentResult.h5Url || paymentResult.codeUrl,
              qrCodeUrl: paymentResult.codeUrl
            }
          })
          break

        default:
          throw new Error(`不支持的支付方式: ${params.provider}`)
      }

      // 返回完整的订单信息
      const updatedRecord = await prisma.payment.findUnique({
        where: { id: paymentRecord.id }
      })

      return this.formatPaymentOrder(updatedRecord!)
    } catch (error) {
      throw new Error(`创建支付订单失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 查询支付状态
  async queryPaymentStatus(outTradeNo: string): Promise<PaymentOrder> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { outTradeNo }
      })

      if (!payment) {
        throw new Error('支付订单不存在')
      }

      // 如果已经是成功状态，直接返回
      if (payment.status === 'SUCCESS') {
        return this.formatPaymentOrder(payment)
      }

      let queryResult: any

      // 查询支付提供商的状态
      switch (payment.provider.toLowerCase()) {
        case 'alipay':
          if (!this.alipayService) {
            throw new Error('支付宝服务未配置')
          }
          queryResult = await this.alipayService.queryPayment(outTradeNo)
          break

        case 'wechat':
          if (!this.wechatService) {
            throw new Error('微信支付服务未配置')
          }
          queryResult = await this.wechatService.queryPayment(outTradeNo)
          break

        default:
          throw new Error(`不支持的支付方式: ${payment.provider}`)
      }

      // 更新支付状态
      const updatedPayment = await this.updatePaymentStatus(
        payment.id,
        queryResult.status,
        queryResult.tradeNo || queryResult.transactionId
      )

      return this.formatPaymentOrder(updatedPayment)
    } catch (error) {
      throw new Error(`查询支付状态失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理支付回调
  async handlePaymentNotify(
    provider: PaymentProvider,
    params: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    try {
      let isValid = false
      let outTradeNo = ''
      let status = ''

      switch (provider) {
        case PaymentProvider.ALIPAY:
          if (!this.alipayService) {
            throw new Error('支付宝服务未配置')
          }
          isValid = this.alipayService.verifyNotify(params)
          outTradeNo = params.out_trade_no
          status = params.trade_status
          break

        case PaymentProvider.WECHAT:
          if (!this.wechatService) {
            throw new Error('微信支付服务未配置')
          }
          isValid = this.wechatService.verifyNotify(headers || {}, JSON.stringify(params))

          // 微信支付需要解密resource内容
          if (params.resource) {
            const decrypted = this.wechatService.decryptNotify(
              params.resource.ciphertext,
              params.resource.associated_data,
              params.resource.nonce
            )
            outTradeNo = decrypted.out_trade_no
            status = decrypted.trade_state
          }
          break

        default:
          throw new Error(`不支持的支付方式: ${provider}`)
      }

      if (!isValid) {
        return { success: false, message: '签名验证失败' }
      }

      // 查找支付记录
      const payment = await prisma.payment.findUnique({
        where: { outTradeNo }
      })

      if (!payment) {
        return { success: false, message: '支付订单不存在' }
      }

      // 如果已经处理过，直接返回成功
      if (payment.status === 'SUCCESS') {
        return { success: true, message: '订单已处理' }
      }

      // 更新支付状态
      if (status === 'TRADE_SUCCESS' || status === 'SUCCESS') {
        await this.completePayment(payment.id, payment.userId, payment.credits)
        return { success: true, message: '支付成功' }
      } else {
        await this.updatePaymentStatus(payment.id, status)
        return { success: true, message: '状态已更新' }
      }
    } catch (error) {
      console.error('处理支付回调失败:', error)
      return { success: false, message: error instanceof Error ? error.message : '处理失败' }
    }
  }

  // 申请退款
  async refundPayment(params: {
    outTradeNo: string
    refundAmount: number
    reason: string
    operatorId: string
  }): Promise<{ success: boolean; refundId?: string }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { outTradeNo: params.outTradeNo }
      })

      if (!payment) {
        throw new Error('支付订单不存在')
      }

      if (payment.status !== 'SUCCESS') {
        throw new Error('只有成功的支付才能退款')
      }

      const outRefundNo = this.generateRefundNo()
      let refundResult: any

      switch (payment.provider.toLowerCase()) {
        case 'alipay':
          if (!this.alipayService) {
            throw new Error('支付宝服务未配置')
          }
          refundResult = await this.alipayService.refund({
            outTradeNo: params.outTradeNo,
            refundAmount: params.refundAmount,
            refundReason: params.reason,
            outRequestNo: outRefundNo
          })
          break

        case 'wechat':
          if (!this.wechatService) {
            throw new Error('微信支付服务未配置')
          }
          refundResult = await this.wechatService.refund({
            outTradeNo: params.outTradeNo,
            outRefundNo,
            refundAmount: params.refundAmount,
            totalAmount: payment.amount,
            reason: params.reason
          })
          break

        default:
          throw new Error(`不支持的支付方式: ${payment.provider}`)
      }

      if (refundResult.success) {
        // 记录退款
        await prisma.refund.create({
          data: {
            paymentId: payment.id,
            outRefundNo,
            refundAmount: params.refundAmount,
            reason: params.reason,
            operatorId: params.operatorId,
            status: 'SUCCESS',
            providerRefundId: refundResult.refundId
          }
        })

        // 扣除用户积分
        const refundCredits = Math.floor((params.refundAmount / payment.amount) * payment.credits)
        await UserService.updateCredits(
          payment.userId,
          -refundCredits,
          'REFUND',
          `退款扣除积分: ${params.reason}`,
          payment.id
        )

        return { success: true, refundId: refundResult.refundId }
      } else {
        return { success: false }
      }
    } catch (error) {
      throw new Error(`申请退款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取用户支付记录
  async getUserPayments(userId: string, page: number = 1, limit: number = 20): Promise<{
    payments: PaymentOrder[]
    total: number
    hasNext: boolean
  }> {
    try {
      const offset = (page - 1) * limit

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.payment.count({ where: { userId } })
      ])

      return {
        payments: payments.map(p => this.formatPaymentOrder(p)),
        total,
        hasNext: offset + limit < total
      }
    } catch (error) {
      throw new Error(`获取支付记录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 完成支付
  private async completePayment(paymentId: string, userId: string, credits: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 更新支付状态
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date()
        }
      })

      // 增加用户积分
      await UserService.updateCredits(
        userId,
        credits,
        'PURCHASE',
        `充值积分: ${credits}积分`,
        paymentId
      )
    })
  }

  // 更新支付状态
  private async updatePaymentStatus(
    paymentId: string,
    status: string,
    providerOrderId?: string
  ): Promise<any> {
    const updateData: any = { status: this.mapProviderStatus(status) }

    if (providerOrderId) {
      updateData.providerOrderId = providerOrderId
    }

    if (status === 'TRADE_SUCCESS' || status === 'SUCCESS') {
      updateData.paidAt = new Date()
    }

    return await prisma.payment.update({
      where: { id: paymentId },
      data: updateData
    })
  }

  // 映射支付提供商状态到系统状态
  private mapProviderStatus(providerStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'WAIT_BUYER_PAY': PaymentStatus.PENDING,
      'TRADE_SUCCESS': PaymentStatus.SUCCESS,
      'TRADE_FINISHED': PaymentStatus.SUCCESS,
      'TRADE_CLOSED': PaymentStatus.CANCELLED,
      'SUCCESS': PaymentStatus.SUCCESS,
      'REFUND': PaymentStatus.REFUNDED,
      'NOTPAY': PaymentStatus.PENDING,
      'CLOSED': PaymentStatus.CANCELLED,
      'REVOKED': PaymentStatus.CANCELLED,
      'USERPAYING': PaymentStatus.PENDING,
      'PAYERROR': PaymentStatus.FAILED
    }

    return statusMap[providerStatus] || PaymentStatus.PENDING
  }

  // 生成交易号
  private generateTradeNo(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `AI${timestamp}${random}`.toUpperCase()
  }

  // 生成退款号
  private generateRefundNo(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `RF${timestamp}${random}`.toUpperCase()
  }

  // 格式化支付订单
  private formatPaymentOrder(payment: any): PaymentOrder {
    return {
      id: payment.id,
      userId: payment.userId,
      provider: payment.provider.toLowerCase(),
      outTradeNo: payment.outTradeNo,
      amount: payment.amount,
      credits: payment.credits,
      description: payment.description,
      status: payment.status,
      providerOrderId: payment.providerOrderId,
      payUrl: payment.payUrl,
      qrCodeUrl: payment.qrCodeUrl,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      expiredAt: payment.expiredAt
    }
  }

  // 获取支付统计
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
    totalAmount: number
    totalOrders: number
    successOrders: number
    pendingOrders: number
    successRate: number
    providerStats: Record<string, any>
  }> {
    try {
      const where: any = {}
      if (startDate) {where.createdAt = { gte: startDate }}
      if (endDate) {where.createdAt = { ...where.createdAt, lte: endDate }}

      const [totalStats, successStats, pendingStats, providerStats] = await Promise.all([
        prisma.payment.aggregate({
          where,
          _sum: { amount: true },
          _count: true
        }),
        prisma.payment.aggregate({
          where: { ...where, status: 'SUCCESS' },
          _sum: { amount: true },
          _count: true
        }),
        prisma.payment.count({
          where: { ...where, status: 'PENDING' }
        }),
        prisma.payment.groupBy({
          by: ['provider'],
          where,
          _sum: { amount: true },
          _count: true
        })
      ])

      return {
        totalAmount: totalStats._sum.amount || 0,
        totalOrders: totalStats._count,
        successOrders: successStats._count,
        pendingOrders: pendingStats,
        successRate: totalStats._count > 0 ? (successStats._count / totalStats._count) * 100 : 0,
        providerStats: providerStats.reduce((acc, stat) => {
          acc[stat.provider] = {
            amount: stat._sum.amount || 0,
            count: stat._count
          }
          return acc
        }, {} as Record<string, any>)
      }
    } catch (error) {
      throw new Error(`获取支付统计失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export default PaymentManager