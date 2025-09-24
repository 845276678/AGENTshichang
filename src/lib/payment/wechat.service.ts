// 微信支付服务
import crypto from 'crypto'
import axios from 'axios'

interface WechatPayConfig {
  appid: string
  mchid: string
  privateKey: string
  certSerialNo: string
  apiV3Key: string
  notifyUrl: string
}

interface WechatPayRequest {
  appid: string
  mchid: string
  description: string
  out_trade_no: string
  notify_url: string
  amount: {
    total: number
    currency: string
  }
  payer?: {
    openid: string
  }
  scene_info?: {
    payer_client_ip: string
    store_info?: {
      id: string
      name?: string
      area_code?: string
      address?: string
    }
  }
  attach?: string
}

export class WechatPayService {
  private config: WechatPayConfig
  private baseUrl: string

  constructor() {
    this.config = {
      appid: process.env.WECHAT_APPID || '',
      mchid: process.env.WECHAT_MCHID || '',
      privateKey: process.env.WECHAT_PRIVATE_KEY || '',
      certSerialNo: process.env.WECHAT_CERT_SERIAL_NO || '',
      apiV3Key: process.env.WECHAT_API_V3_KEY || '',
      notifyUrl: `${process.env.NEXTAUTH_URL}/api/payments/wechat/notify`
    }

    this.baseUrl = 'https://api.mch.weixin.qq.com'

    if (!this.config.appid || !this.config.mchid || !this.config.privateKey) {
      throw new Error('微信支付配置未完成')
    }
  }

  // 创建H5支付
  async createH5Payment(params: {
    outTradeNo: string
    amount: number
    description: string
    userId: string
    credits: number
    clientIp: string
  }): Promise<{
    h5Url: string
    prepayId: string
  }> {
    try {
      const request: WechatPayRequest = {
        appid: this.config.appid,
        mchid: this.config.mchid,
        description: params.description,
        out_trade_no: params.outTradeNo,
        notify_url: this.config.notifyUrl,
        amount: {
          total: Math.round(params.amount * 100), // 转换为分
          currency: 'CNY'
        },
        scene_info: {
          payer_client_ip: params.clientIp,
          h5_info: {
            type: 'Wap',
            wap_url: process.env.NEXTAUTH_URL || '',
            wap_name: 'AI创意交易平台'
          }
        } as any,
        attach: JSON.stringify({
          userId: params.userId,
          credits: params.credits,
          type: 'credit_purchase'
        })
      }

      const response = await this.executeRequest('POST', '/v3/pay/transactions/h5', request)

      return {
        h5Url: response.h5_url,
        prepayId: response.prepay_id
      }
    } catch (error) {
      throw new Error(`微信H5支付创建失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 创建Native支付（二维码）
  async createNativePayment(params: {
    outTradeNo: string
    amount: number
    description: string
    userId: string
    credits: number
  }): Promise<{
    codeUrl: string
    prepayId: string
  }> {
    try {
      const request: WechatPayRequest = {
        appid: this.config.appid,
        mchid: this.config.mchid,
        description: params.description,
        out_trade_no: params.outTradeNo,
        notify_url: this.config.notifyUrl,
        amount: {
          total: Math.round(params.amount * 100), // 转换为分
          currency: 'CNY'
        },
        attach: JSON.stringify({
          userId: params.userId,
          credits: params.credits,
          type: 'credit_purchase'
        })
      }

      const response = await this.executeRequest('POST', '/v3/pay/transactions/native', request)

      return {
        codeUrl: response.code_url,
        prepayId: response.prepay_id || ''
      }
    } catch (error) {
      throw new Error(`微信Native支付创建失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 创建JSAPI支付（小程序/公众号）
  async createJSAPIPayment(params: {
    outTradeNo: string
    amount: number
    description: string
    userId: string
    credits: number
    openid: string
  }): Promise<{
    prepayId: string
    paySign: string
    timeStamp: string
    nonceStr: string
    package: string
  }> {
    try {
      const request: WechatPayRequest = {
        appid: this.config.appid,
        mchid: this.config.mchid,
        description: params.description,
        out_trade_no: params.outTradeNo,
        notify_url: this.config.notifyUrl,
        amount: {
          total: Math.round(params.amount * 100),
          currency: 'CNY'
        },
        payer: {
          openid: params.openid
        },
        attach: JSON.stringify({
          userId: params.userId,
          credits: params.credits,
          type: 'credit_purchase'
        })
      }

      const response = await this.executeRequest('POST', '/v3/pay/transactions/jsapi', request)

      // 生成调起支付的参数
      const timeStamp = Math.floor(Date.now() / 1000).toString()
      const nonceStr = this.generateNonceStr()
      const packageStr = `prepay_id=${response.prepay_id}`

      const paySign = this.generateJSAPIPaySign({
        appId: this.config.appid,
        timeStamp,
        nonceStr,
        package: packageStr
      })

      return {
        prepayId: response.prepay_id,
        paySign,
        timeStamp,
        nonceStr,
        package: packageStr
      }
    } catch (error) {
      throw new Error(`微信JSAPI支付创建失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 查询支付状态
  async queryPayment(outTradeNo: string): Promise<{
    status: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR'
    transactionId?: string
    amount?: number
    payTime?: string
  }> {
    try {
      const response = await this.executeRequest(
        'GET',
        `/v3/pay/transactions/out-trade-no/${outTradeNo}`,
        null,
        { mchid: this.config.mchid }
      )

      return {
        status: response.trade_state,
        transactionId: response.transaction_id,
        ...(response.amount?.total && { amount: response.amount.total / 100 }),
        payTime: response.success_time
      }
    } catch (error) {
      throw new Error(`查询微信支付状态失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 申请退款
  async refund(params: {
    outTradeNo: string
    outRefundNo: string
    refundAmount: number
    totalAmount: number
    reason: string
  }): Promise<{
    success: boolean
    refundId?: string
    refundAmount?: number
  }> {
    try {
      const request = {
        out_trade_no: params.outTradeNo,
        out_refund_no: params.outRefundNo,
        reason: params.reason,
        notify_url: `${process.env.NEXTAUTH_URL}/api/payments/wechat/refund-notify`,
        amount: {
          refund: Math.round(params.refundAmount * 100),
          total: Math.round(params.totalAmount * 100),
          currency: 'CNY'
        }
      }

      const response = await this.executeRequest('POST', '/v3/refund/domestic/refunds', request)

      return {
        success: response.status === 'SUCCESS' || response.status === 'PROCESSING',
        refundId: response.refund_id,
        ...(response.amount?.refund && { refundAmount: response.amount.refund / 100 })
      }
    } catch (error) {
      throw new Error(`微信支付退款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 验证回调签名
  verifyNotify(headers: Record<string, string>, body: string): boolean {
    try {
      const timestamp = headers['wechatpay-timestamp']
      const nonce = headers['wechatpay-nonce']
      const signature = headers['wechatpay-signature']
      const serial = headers['wechatpay-serial']

      if (!timestamp || !nonce || !signature || !serial) {
        return false
      }

      const message = `${timestamp}\n${nonce}\n${body}\n`

      // 这里需要使用微信支付的证书来验证签名
      // 实际实现中需要下载并缓存微信支付的证书
      return this.verifySignature(message, signature, serial)
    } catch (error) {
      console.error('验证微信支付回调签名失败:', error)
      return false
    }
  }

  // 解密回调内容
  decryptNotify(ciphertext: string, associatedData: string, _nonce: string): any {
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.config.apiV3Key), Buffer.from(_nonce))
      decipher.setAuthTag(Buffer.from(ciphertext.slice(-32), 'hex'))
      decipher.setAAD(Buffer.from(associatedData))

      let decrypted = decipher.update(ciphertext.slice(0, -32), 'base64', 'utf8')
      decrypted += decipher.final('utf8')

      return JSON.parse(decrypted)
    } catch (error) {
      throw new Error(`解密微信支付回调失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 执行API请求
  private async executeRequest(
    method: 'GET' | 'POST',
    url: string,
    data?: any,
    params?: Record<string, string>
  ): Promise<any> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const nonceStr = this.generateNonceStr()

      const fullUrl = params
        ? `${url}?${new URLSearchParams(params).toString()}`
        : url

      const message = this.buildSignatureMessage(method, fullUrl, timestamp, nonceStr, data)
      const signature = this.sign(message)

      const authorization = this.buildAuthorization(timestamp, nonceStr, signature)

      const config: any = {
        method,
        url: `${this.baseUrl}${fullUrl}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authorization,
          'User-Agent': 'AI-Creative-Platform/1.0'
        },
        data: undefined
      }

      if (data && method === 'POST') {
        config.data = data
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        throw new Error(`微信支付API调用失败: ${errorData?.message || error.message}`)
      }
      throw error
    }
  }

  // 构建签名消息
  private buildSignatureMessage(
    method: string,
    url: string,
    timestamp: string,
    nonceStr: string,
    data?: any
  ): string {
    const body = data ? JSON.stringify(data) : ''
    return `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`
  }

  // 生成签名
  private sign(message: string): string {
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${this.config.privateKey}\n-----END PRIVATE KEY-----`
    return crypto.createSign('RSA-SHA256').update(message).sign(privateKey, 'base64')
  }

  // 构建Authorization头
  private buildAuthorization(timestamp: string, nonceStr: string, signature: string): string {
    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.config.mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.config.certSerialNo}"`
  }

  // 生成随机字符串
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  // 生成JSAPI调起支付签名
  private generateJSAPIPaySign(params: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
  }): string {
    const message = `${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`
    return this.sign(message)
  }

  // 验证签名（需要微信支付证书）
  private verifySignature(_message: string, _signature: string, _serial: string): boolean {
    // 这里需要实现证书验证逻辑
    // 实际使用时需要下载微信支付的平台证书
    console.warn('微信支付签名验证需要平台证书，当前为模拟验证')
    return true
  }

  // 获取支付配置信息
  getConfig() {
    return {
      appid: this.config.appid,
      mchid: this.config.mchid,
      environment: process.env.NODE_ENV === 'production' ? '生产环境' : '沙箱环境'
    }
  }
}

export default WechatPayService