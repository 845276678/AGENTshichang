/**
 * Cookie加密/解密工具
 *
 * 用于安全存储社交账号Cookie
 * TODO: 阶段2集成KMS密钥管理服务
 */

import crypto from 'crypto'

// 从环境变量获取加密密钥
const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY || 'default-32-char-key-replace-me!!'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * 加密Cookie数据
 */
export function encryptCookie(cookieData: string): string {
  try {
    // 生成随机IV
    const iv = crypto.randomBytes(IV_LENGTH)

    // 创建加密器
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    )

    // 加密数据
    let encrypted = cipher.update(cookieData, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // 获取认证标签
    const authTag = cipher.getAuthTag()

    // 组合: IV + authTag + encrypted
    const result = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64')

    return result

  } catch (error) {
    console.error('[CookieCipher] Encryption error:', error)
    throw new Error('Failed to encrypt cookie')
  }
}

/**
 * 解密Cookie数据
 */
export function decryptCookie(encryptedData: string): string {
  try {
    // 解码base64
    const buffer = Buffer.from(encryptedData, 'base64')

    // 提取IV、authTag和加密数据
    const iv = buffer.subarray(0, IV_LENGTH)
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    // 创建解密器
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    )

    // 设置认证标签
    decipher.setAuthTag(authTag)

    // 解密数据
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted

  } catch (error) {
    console.error('[CookieCipher] Decryption error:', error)
    throw new Error('Failed to decrypt cookie')
  }
}

/**
 * 验证加密密钥是否配置
 */
export function isEncryptionConfigured(): boolean {
  return ENCRYPTION_KEY !== 'default-32-char-key-replace-me!!'
}

/**
 * 生成随机加密密钥（用于初始化）
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
