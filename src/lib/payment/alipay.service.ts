// 支付宝支付服务
import crypto from 'crypto'
import axios from 'axios'

interface AlipayConfig {
  appId: string
  privateKey: string
  publicKey: string
  gatewayUrl: string
  signType: string
  charset: string
  version: string
}

interface AlipayTradeCreateRequest {
  outTradeNo: string
  totalAmount: string
  subject: string
  body?: string
  timeoutExpress?: string
  productCode: string
  notifyUrl?: string
  returnUrl?: string
  passbackParams?: string
}

export class AlipayService {
  private config: AlipayConfig

  constructor() {
    this.config = {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      gatewayUrl: process.env.NODE_ENV === 'production'
        ? 'https://openapi.alipay.com/gateway.do'
        : 'https://openapi.alipaydev.com/gateway.do',
      signType: 'RSA2',
      charset: 'utf-8',
      version: '1.0'
    }

    if (!this.config.appId || !this.config.privateKey || !this.config.publicKey) {
      throw new Error('支付宝配置未完成')
    }
  }

  // 创建支付订单
  async createPayment(params: {
    outTradeNo: string
    amount: number
    subject: string
    description?: string
    userId: string
    credits: number
    notifyUrl?: string
    returnUrl?: string
  }): Promise<{
    payUrl: string
    qrCode: string
    orderId: string
  }> {
    try {
      const request: AlipayTradeCreateRequest = {
        outTradeNo: params.outTradeNo,
        totalAmount: params.amount.toFixed(2),
        subject: params.subject,
        body: params.description || `充值${params.credits}积分`,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        timeoutExpress: '30m',
        notifyUrl: params.notifyUrl || `${process.env.NEXTAUTH_URL}/api/payments/alipay/notify`,
        returnUrl: params.returnUrl || `${process.env.NEXTAUTH_URL}/dashboard/credits`,
        passbackParams: JSON.stringify({
          userId: params.userId,
          credits: params.credits,
          type: 'credit_purchase'
        })
      }

      const response = await this.executeRequest('alipay.trade.page.pay', request)

      if (response.code !== '10000') {
        throw new Error(`支付宝创建订单失败: ${response.msg}`)
      }

      return {
        payUrl: `${this.config.gatewayUrl}?${this.buildRequestParams('alipay.trade.page.pay', request)}`,
        qrCode: response.qrCode || '',
        orderId: response.tradeNo || params.outTradeNo
      }
    } catch (error) {
      throw new Error(`支付宝支付创建失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 查询支付状态
  async queryPayment(outTradeNo: string): Promise<{
    status: 'WAIT_BUYER_PAY' | 'TRADE_SUCCESS' | 'TRADE_FINISHED' | 'TRADE_CLOSED'
    tradeNo?: string
    amount?: string
    buyerEmail?: string
  }> {
    try {
      const request = {
        outTradeNo
      }

      const response = await this.executeRequest('alipay.trade.query', request)

      if (response.code !== '10000') {
        throw new Error(`查询支付状态失败: ${response.msg}`)
      }

      return {
        status: response.tradeStatus,
        tradeNo: response.tradeNo,
        amount: response.totalAmount,
        buyerEmail: response.buyerLogonId
      }
    } catch (error) {
      throw new Error(`查询支付状态失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 申请退款
  async refund(params: {
    outTradeNo: string
    refundAmount: number
    refundReason: string
    outRequestNo: string
  }): Promise<{
    success: boolean
    refundId?: string
    refundAmount?: string
  }> {
    try {
      const request = {
        outTradeNo: params.outTradeNo,
        refundAmount: params.refundAmount.toFixed(2),
        refundReason: params.refundReason,
        outRequestNo: params.outRequestNo
      }

      const response = await this.executeRequest('alipay.trade.refund', request)

      return {
        success: response.code === '10000',
        refundId: response.tradeNo,
        refundAmount: response.refundFee
      }
    } catch (error) {
      throw new Error(`申请退款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 验证回调签名
  verifyNotify(params: Record<string, string>): boolean {
    try {
      const { sign, sign_type, ...data } = params

      if (sign_type !== this.config.signType) {
        return false
      }

      const signContent = this.buildSignContent(data)
      const expectedSign = this.sign(signContent)

      return sign === expectedSign
    } catch (error) {
      console.error('验证支付宝回调签名失败:', error)
      return false
    }
  }

  // 执行API请求
  private async executeRequest(method: string, bizContent: any): Promise<any> {
    const params = {
      app_id: this.config.appId,
      method,
      charset: this.config.charset,
      sign_type: this.config.signType,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      version: this.config.version,
      biz_content: JSON.stringify(bizContent)
    }

    const sign = this.sign(this.buildSignContent(params))
    const requestParams = { ...params, sign }

    const response = await axios.post(this.config.gatewayUrl, null, {
      params: requestParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    })

    const responseKey = method.replace(/\./g, '_') + '_response'
    return response.data[responseKey] || response.data
  }

  // 构建请求参数字符串
  private buildRequestParams(method: string, bizContent: any): string {
    const params = {
      app_id: this.config.appId,
      method,
      charset: this.config.charset,
      sign_type: this.config.signType,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      version: this.config.version,
      biz_content: JSON.stringify(bizContent)
    }

    const sign = this.sign(this.buildSignContent(params))
    const requestParams = { ...params, sign }

    return Object.entries(requestParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
  }

  // 构建签名内容
  private buildSignContent(params: Record<string, any>): string {
    return Object.keys(params)
      .sort()
      .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .map(key => `${key}=${params[key]}`)
      .join('&')
  }

  // 生成签名
  private sign(content: string): string {
    const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${this.config.privateKey}\n-----END RSA PRIVATE KEY-----`

    return crypto
      .createSign('RSA-SHA256')
      .update(content, 'utf8')
      .sign(privateKey, 'base64')
  }


  // 获取支付配置信息
  getConfig() {
    return {
      appId: this.config.appId,
      gatewayUrl: this.config.gatewayUrl,
      environment: process.env.NODE_ENV === 'production' ? '生产环境' : '沙箱环境'
    }
  }
}

export default AlipayService