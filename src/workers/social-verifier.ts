/**
 * 社交账号验证Worker
 *
 * 验证社交媒体账号Cookie是否有效
 */

import { Job } from 'bullmq'
import { BaseWorker } from './base-worker'
import { VerifyJobData } from '@/lib/queue/queue-manager'
import { prisma } from '@/lib/prisma'
import { SocialAccountStatus, SocialPlatform } from '@prisma/client'

export interface VerifyResult {
  accountId: string
  platform: string
  isValid: boolean
  accountInfo?: {
    username?: string
    nickname?: string
    avatar?: string
    followerCount?: number
  }
  error?: string
}

export class VerifyWorker extends BaseWorker<VerifyJobData, VerifyResult> {
  constructor() {
    super('social:verify', 'VerifyWorker')
  }

  protected async processJobInternal(
    job: Job<VerifyJobData, VerifyResult>
  ): Promise<VerifyResult> {
    const { accountId, platform, userId } = job.data

    this.log(`Starting account verification`, { accountId, platform })

    try {
      // 1. 获取账号信息
      const account = await prisma.socialAccount.findUnique({
        where: {
          id: accountId,
          userId
        }
      })

      if (!account) {
        throw new Error(`Account ${accountId} not found`)
      }

      // 2. 验证Cookie有效性
      await this.updateProgress(job, 30)

      const verifyResult = await this.verifyCookie(
        platform as SocialPlatform,
        account.cookieCipher
      )

      await this.updateProgress(job, 70)

      // 3. 更新账号状态
      const newStatus = verifyResult.isValid
        ? SocialAccountStatus.ACTIVE
        : SocialAccountStatus.COOKIE_EXPIRED

      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          status: newStatus,
          lastVerifiedAt: new Date(),
          cookieExpiresAt: verifyResult.isValid
            ? this.calculateCookieExpiry(platform as SocialPlatform)
            : new Date(),
          metadata: verifyResult.accountInfo
            ? {
                ...account.metadata,
                accountInfo: verifyResult.accountInfo
              }
            : account.metadata
        }
      })

      await this.updateProgress(job, 100)

      this.log(`Account verification completed`, {
        accountId,
        platform,
        isValid: verifyResult.isValid
      })

      return {
        accountId,
        platform,
        isValid: verifyResult.isValid,
        accountInfo: verifyResult.accountInfo
      }

    } catch (error: any) {
      this.logError(`Account verification failed`, error, { accountId, platform })

      // 标记账号为验证失败
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          status: SocialAccountStatus.VERIFICATION_FAILED,
          lastVerifiedAt: new Date()
        }
      }).catch(err => {
        this.logError('Failed to update account status', err, { accountId })
      })

      return {
        accountId,
        platform,
        isValid: false,
        error: error.message
      }
    }
  }

  /**
   * 验证Cookie有效性
   *
   * TODO: 后续阶段实现具体的验证逻辑
   * - 解密cookieCipher
   * - 使用Playwright加载Cookie并访问平台
   * - 检查登录状态
   * - 获取账号信息
   */
  private async verifyCookie(
    platform: SocialPlatform,
    cookieCipher: string
  ): Promise<{
    isValid: boolean
    accountInfo?: VerifyResult['accountInfo']
  }> {
    // 阶段1占位实现 - 仅模拟验证
    // 阶段2将实现真实的Cookie验证逻辑

    this.log(`[PLACEHOLDER] Simulating cookie verification for ${platform}`)

    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // 模拟90%的Cookie有效率
    const isValid = Math.random() < 0.9

    if (isValid) {
      return {
        isValid: true,
        accountInfo: {
          username: `user_${Date.now()}`,
          nickname: `Mock User ${platform}`,
          avatar: `https://avatar.example.com/${Date.now()}.jpg`,
          followerCount: Math.floor(Math.random() * 10000)
        }
      }
    } else {
      return {
        isValid: false
      }
    }
  }

  /**
   * 计算Cookie过期时间
   */
  private calculateCookieExpiry(platform: SocialPlatform): Date {
    // 不同平台的Cookie有效期不同
    const expiryDays: Record<SocialPlatform, number> = {
      [SocialPlatform.DOUYIN]: 30,
      [SocialPlatform.XIAOHONGSHU]: 30,
      [SocialPlatform.BILIBILI]: 30,
      [SocialPlatform.WEIBO]: 30,
      [SocialPlatform.TIKTOK]: 30
    }

    const days = expiryDays[platform] || 30
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    return expiryDate
  }
}

// 导出Worker实例
export const verifyWorker = new VerifyWorker()
