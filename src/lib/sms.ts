/**
 * SMS 服务模块
 * 用于发送短信验证码和通知
 */

/**
 * SMS 发送配置
 */
interface SMSConfig {
  provider: 'aliyun' | 'tencent' | 'mock'
  accessKeyId?: string
  accessKeySecret?: string
  signName: string
  templateCode: string
}

/**
 * SMS 发送结果
 */
interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * 默认配置（开发环境使用 mock）
 */
const defaultConfig: SMSConfig = {
  provider: process.env.NODE_ENV === 'production' ? 'aliyun' : 'mock',
  ...(process.env.SMS_ACCESS_KEY_ID && { accessKeyId: process.env.SMS_ACCESS_KEY_ID }),
  ...(process.env.SMS_ACCESS_KEY_SECRET && { accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET }),
  signName: process.env.SMS_SIGN_NAME || 'AI创意协作平台',
  templateCode: process.env.SMS_TEMPLATE_CODE || 'SMS_123456789'
}

/**
 * Mock SMS 服务（开发环境）
 */
class MockSMSService {
  async sendVerificationCode(phone: string, code: string): Promise<SMSResult> {
    console.log(`[Mock SMS] 发送验证码到 ${phone}: ${code}`)
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    }
  }

  async sendNotification(phone: string, message: string): Promise<SMSResult> {
    console.log(`[Mock SMS] 发送通知到 ${phone}: ${message}`)
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    }
  }
}

/**
 * 阿里云 SMS 服务
 */
class AliyunSMSService {
  constructor(_config: SMSConfig) {
    // Store config if needed for future use
  }

  async sendVerificationCode(phone: string, code: string): Promise<SMSResult> {
    try {
      // 这里应该调用阿里云 SMS API
      // 暂时返回 mock 结果
      console.log(`[Aliyun SMS] 发送验证码到 ${phone}: ${code}`)
      return {
        success: true,
        messageId: `aliyun_${Date.now()}`
      }
    } catch (error) {
      console.error('阿里云短信发送失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送失败'
      }
    }
  }

  async sendNotification(phone: string, message: string): Promise<SMSResult> {
    try {
      console.log(`[Aliyun SMS] 发送通知到 ${phone}: ${message}`)
      return {
        success: true,
        messageId: `aliyun_${Date.now()}`
      }
    } catch (error) {
      console.error('阿里云短信发送失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送失败'
      }
    }
  }
}

/**
 * SMS 服务工厂
 */
function createSMSService(config: SMSConfig = defaultConfig) {
  switch (config.provider) {
    case 'aliyun':
      return new AliyunSMSService(config)
    case 'mock':
    default:
      return new MockSMSService()
  }
}

// 导出默认实例
export const smsService = createSMSService()

// 导出类型和工厂函数
export type { SMSConfig, SMSResult }
export { createSMSService, MockSMSService, AliyunSMSService }

/**
 * 发送验证码
 * @param phone 手机号
 * @param code 验证码
 */
export async function sendVerificationCode(phone: string, code: string): Promise<SMSResult> {
  return smsService.sendVerificationCode(phone, code)
}

/**
 * 发送通知
 * @param phone 手机号
 * @param message 消息内容
 */
export async function sendNotification(phone: string, message: string): Promise<SMSResult> {
  return smsService.sendNotification(phone, message)
}

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 验证手机号格式
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}
